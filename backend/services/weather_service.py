from __future__ import annotations

import time
from typing import Any

import httpx
import structlog

logger = structlog.get_logger()

_cache: dict[str, tuple[float, Any]] = {}
_CACHE_TTL_SECONDS = 3 * 60 * 60

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

WEATHER_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "windspeed_10m_max",
    "weathercode",
]

WMO_CODES: dict[int, str] = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Heavy drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 99: "Thunderstorm with hail",
}


def _wmo_description(code: int) -> str:
    return WMO_CODES.get(code, f"Weather code {code}")


def _cache_key(lat: float, lon: float) -> str:
    return f"{round(lat, 2)}_{round(lon, 2)}"


def _get_cached(key: str) -> Any | None:
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < _CACHE_TTL_SECONDS:
            return data
        del _cache[key]
    return None


def _set_cache(key: str, data: Any) -> None:
    _cache[key] = (time.time(), data)


def _build_summary(daily: dict) -> str:
    lines: list[str] = []
    dates = daily.get("time", [])
    for i, date in enumerate(dates[:7]):
        tmax = daily["temperature_2m_max"][i]
        tmin = daily["temperature_2m_min"][i]
        rain = daily["precipitation_sum"][i]
        code = daily["weathercode"][i]
        desc = _wmo_description(int(code))
        lines.append(f"{date}: {desc}, {tmin:.0f}-{tmax:.0f}C, Rain {rain:.1f}mm")
    return " | ".join(lines)


async def get_weather(lat: float, lon: float) -> dict:
    key = _cache_key(lat, lon)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join(WEATHER_VARIABLES),
        "timezone": "Asia/Kolkata",
        "forecast_days": 7,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(OPEN_METEO_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()

        daily = data.get("daily", {})
        summary = _build_summary(daily)
        result = {
            "latitude": lat,
            "longitude": lon,
            "timezone": data.get("timezone", "Asia/Kolkata"),
            "daily": daily,
            "summary": summary,
            "source": "open-meteo",
        }
        _set_cache(key, result)
        logger.info("weather_fetched", lat=lat, lon=lon)
        return result

    except Exception as exc:
        logger.warning("weather_fetch_failed", error=str(exc))
        return {
            "latitude": lat,
            "longitude": lon,
            "daily": {},
            "summary": "Weather data temporarily unavailable. Typical conditions for region apply.",
            "source": "fallback",
        }
