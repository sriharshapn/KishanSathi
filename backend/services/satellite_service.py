from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from typing import Optional

import structlog

logger = structlog.get_logger()

_ee_initialized: bool = False
_ee_available: bool = False


def _try_init_ee() -> bool:
    global _ee_initialized, _ee_available
    if _ee_initialized:
        return _ee_available
    _ee_initialized = True
    try:
        import ee
        from config import settings
        if settings.EE_PROJECT:
            ee.Initialize(project=settings.EE_PROJECT)
        else:
            ee.Initialize()
        _ee_available = True
        logger.info("earth_engine_initialized")
    except Exception as exc:
        _ee_available = False
        logger.warning("earth_engine_unavailable", error=str(exc))
    return _ee_available


def _classify_ndvi(ndvi: float) -> str:
    if ndvi >= 0.6:
        return "Excellent"
    elif ndvi >= 0.4:
        return "Good"
    elif ndvi >= 0.2:
        return "Moderate"
    else:
        return "Poor"


def _mock_ndvi(seed: Optional[float] = None) -> dict:
    rng = random.Random(seed)
    mean = round(rng.uniform(0.35, 0.75), 4)
    spread = round(rng.uniform(0.05, 0.15), 4)
    ndvi_min = round(max(0.0, mean - spread), 4)
    ndvi_max = round(min(1.0, mean + spread), 4)
    return {
        "ndvi_mean": mean,
        "ndvi_min": ndvi_min,
        "ndvi_max": ndvi_max,
        "health_status": _classify_ndvi(mean),
        "source": "demo-data",
        "acquired_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }


def _ee_ndvi(latitude: float, longitude: float, buffer_meters: int = 500) -> dict:
    import ee

    point = ee.Geometry.Point([longitude, latitude])
    region = point.buffer(buffer_meters)

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(
            (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d"),
            datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        )
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("system:time_start", False)
    )

    image = collection.first()
    nir = image.select("B8")
    red = image.select("B4")
    ndvi_image = nir.subtract(red).divide(nir.add(red)).rename("NDVI")

    stats = ndvi_image.reduceRegion(
        reducer=ee.Reducer.mean().combine(
            reducer2=ee.Reducer.minMax(), sharedInputs=True
        ),
        geometry=region,
        scale=10,
        maxPixels=1e9,
    ).getInfo()

    ndvi_mean = round(stats.get("NDVI_mean", 0.5), 4)
    ndvi_min = round(stats.get("NDVI_min", 0.3), 4)
    ndvi_max = round(stats.get("NDVI_max", 0.7), 4)

    return {
        "ndvi_mean": ndvi_mean,
        "ndvi_min": ndvi_min,
        "ndvi_max": ndvi_max,
        "health_status": _classify_ndvi(ndvi_mean),
        "source": "sentinel-2",
        "acquired_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }


def get_ndvi(latitude: float, longitude: float, buffer_meters: int = 500) -> dict:
    if _try_init_ee():
        try:
            return _ee_ndvi(latitude, longitude, buffer_meters)
        except Exception as exc:
            logger.warning("ee_ndvi_failed", error=str(exc))
    seed = latitude * 1000 + longitude
    return _mock_ndvi(seed=seed)


def get_ndvi_timeseries(
    latitude: float, longitude: float, days: int = 30
) -> list[dict]:
    if _try_init_ee():
        try:
            return _ee_timeseries(latitude, longitude, days)
        except Exception as exc:
            logger.warning("ee_timeseries_failed", error=str(exc))
    return _mock_timeseries(latitude, longitude, days)


def _ee_timeseries(latitude: float, longitude: float, days: int) -> list[dict]:
    import ee

    point = ee.Geometry.Point([longitude, latitude])
    region = point.buffer(500)
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d"))
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("system:time_start")
    )

    def compute_ndvi(img):
        nir = img.select("B8")
        red = img.select("B4")
        ndvi = nir.subtract(red).divide(nir.add(red)).rename("NDVI")
        mean = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=region, scale=10
        )
        return img.set("ndvi_mean", mean.get("NDVI"))

    results = collection.map(compute_ndvi).aggregate_array("ndvi_mean").getInfo()
    dates = collection.aggregate_array("system:time_start").getInfo()

    series = []
    for ts, ndvi in zip(dates, results):
        if ndvi is not None:
            date_str = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).strftime(
                "%Y-%m-%d"
            )
            series.append({"date": date_str, "ndvi": round(ndvi, 4)})
    return series


def _mock_timeseries(latitude: float, longitude: float, days: int) -> list[dict]:
    rng = random.Random(latitude * 1000 + longitude)
    base_ndvi = rng.uniform(0.4, 0.65)
    series = []
    today = datetime.now(timezone.utc)
    step = max(1, days // 10)
    for i in range(0, days, step):
        date = (today - timedelta(days=days - i)).strftime("%Y-%m-%d")
        variation = rng.uniform(-0.05, 0.05)
        ndvi = round(min(1.0, max(0.0, base_ndvi + variation)), 4)
        series.append({"date": date, "ndvi": ndvi})
    return series
