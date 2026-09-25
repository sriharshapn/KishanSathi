import React, { useState, useEffect, useMemo } from 'react';
import type { Language, NavigationPage, WeatherData } from '../types';
import { 
  MapPin, 
  RefreshCw, 
  LocateFixed, 
  ChevronRight, 
  Droplets, 
  Sprout
} from 'lucide-react';
import { 
  STATE_DISTRICTS, 
  DISTRICT_CENTROIDS, 
  getLocationCoordinates, 
  getDistanceKm 
} from '../utils/locationData';

interface WeatherDashboardPageProps {
  language?: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const WeatherDashboardPage: React.FC<WeatherDashboardPageProps> = ({ onNavigate }) => {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru Urban');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const fetchWeather = async (stateName: string, districtName: string, customLat?: number, customLon?: number) => {
    setLoading(true);
    try {
      let url = `/api/weather?state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(districtName)}`;
      if (typeof customLat === 'number' && typeof customLon === 'number') {
        url += `&lat=${customLat}&lon=${customLon}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.weather) {
        setWeatherData(data.weather);
      }
    } catch (e) {
      console.warn('Failed to load weather data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districtList = STATE_DISTRICTS[st] || [];
    const newDist = districtList[0] || '';
    setSelectedDistrict(newDist);
    setGpsMessage(null);
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setGpsMessage(null);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        let matchedState = '';
        let matchedDistrict = '';

        // 1. Try reverse geocoding via free public API
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (response.ok) {
            const data = await response.json();
            const foundState = Object.keys(STATE_DISTRICTS).find(s => 
              data.principalSubdivision && data.principalSubdivision.toLowerCase().includes(s.toLowerCase())
            );
            if (foundState) {
              matchedState = foundState;
              const districtList = STATE_DISTRICTS[foundState];
              const foundDistrict = districtList.find(d => 
                (data.city && data.city.toLowerCase().includes(d.toLowerCase())) ||
                (data.locality && data.locality.toLowerCase().includes(d.toLowerCase()))
              );
              if (foundDistrict) {
                matchedDistrict = foundDistrict;
              }
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding fallback to centroid mapping:', err);
        }

        // 2. Nearest centroid fallback
        if (!matchedState || !matchedDistrict) {
          let minDist = Infinity;
          for (const c of DISTRICT_CENTROIDS) {
            const dist = getDistanceKm(lat, lon, c.lat, c.lon);
            if (dist < minDist) {
              minDist = dist;
              matchedState = c.state;
              matchedDistrict = c.district;
            }
          }
        }

        if (matchedState && matchedDistrict) {
          setSelectedState(matchedState);
          setSelectedDistrict(matchedDistrict);
          setGpsMessage(`GPS Locked: ${matchedDistrict}, ${matchedState} (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`);
          fetchWeather(matchedState, matchedDistrict, lat, lon);
        } else {
          alert('Could not pinpoint nearest agricultural district for your GPS coordinates.');
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        let errMsg = 'Failed to acquire GPS location.';
        if (err.code === 1) errMsg = 'Location permission was denied. Please allow location access in your browser.';
        else if (err.code === 2) errMsg = 'GPS position unavailable. Please choose your state & district manually.';
        alert(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Convert Celsius to Fahrenheit if user toggled
  const toDisplayTemp = (tempC: number) => {
    if (isFahrenheit) {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const unitSymbol = isFahrenheit ? '°F' : '°C';

  // Fallback defaults matching real Bengaluru meteorological profile
  const cur = weatherData?.current || {
    temperature: 22,
    apparent_temperature: 23,
    condition: "Mostly cloudy",
    icon: "cloudy",
    temp_max: 27,
    temp_min: 21,
    humidity: 86,
    dew_point: 20,
    pressure: 1011,
    pressure_trend: "Rising slowly",
    wind_speed: 10,
    wind_gust: 41,
    wind_direction: 260,
    wind_cardinal: "W",
    wind_force: "Force: 2 (Light Breeze)",
    visibility_km: 6,
    visibility_status: "Good",
    aqi: 27,
    aqi_status: "Good",
    uv_index: 7,
    uv_status: "High",
    sunrise: "06:08 AM",
    sunset: "06:14 PM",
    sun_hours: "12hrs 5mins",
    updated_at: "08:00 AM"
  };

  const forecast = weatherData?.forecast_7day || [
    { date: "2026-09-25", day_name: "Today", temp_max: 27, temp_min: 21, precip_prob: 100, condition: "Showers", icon: "rain" },
    { date: "2026-09-26", day_name: "Sat 26", temp_max: 29, temp_min: 20, precip_prob: 23, condition: "Partly cloudy", icon: "partly-cloudy" },
    { date: "2026-09-27", day_name: "Sun 27", temp_max: 29, temp_min: 21, precip_prob: 29, condition: "Partly cloudy", icon: "partly-cloudy" },
    { date: "2026-09-28", day_name: "Mon 28", temp_max: 30, temp_min: 22, precip_prob: 78, condition: "Partly cloudy", icon: "partly-cloudy" },
    { date: "2026-09-29", day_name: "Tue 29", temp_max: 29, temp_min: 21, precip_prob: 81, condition: "Thunderstorms", icon: "thunderstorm" },
    { date: "2026-09-30", day_name: "Wed 30", temp_max: 29, temp_min: 21, precip_prob: 79, condition: "Rain", icon: "rain" },
    { date: "2026-10-01", day_name: "Thu 1", temp_max: 28, temp_min: 20, precip_prob: 85, condition: "Partly cloudy", icon: "partly-cloudy" },
  ];

  const hourly = weatherData?.hourly_trend || [
    { time_label: "9 AM", temp: 23, precip_prob: 2 },
    { time_label: "12 PM", temp: 26, precip_prob: 16 },
    { time_label: "3 PM", temp: 27, precip_prob: 47 },
    { time_label: "6 PM", temp: 24, precip_prob: 32 },
    { time_label: "9 PM", temp: 23, precip_prob: 15 },
    { time_label: "12 AM", temp: 22, precip_prob: 8 },
    { time_label: "3 AM", temp: 21, precip_prob: 4 },
    { time_label: "6 AM", temp: 21, precip_prob: 2 }
  ];

  const coords = useMemo(() => {
    if (weatherData?.coords) return weatherData.coords;
    return getLocationCoordinates(selectedState, selectedDistrict);
  }, [weatherData, selectedState, selectedDistrict]);

  // SVG Hourly Curve Calculation
  const hourlySvgPoints = useMemo(() => {
    const temps = hourly.map(h => toDisplayTemp(h.temp));
    const minT = Math.min(...temps) - 2;
    const maxT = Math.max(...temps) + 2;
    const range = Math.max(1, maxT - minT);

    const pts = hourly.map((h, i) => {
      const x = 30 + (i * (540 / 7));
      const val = toDisplayTemp(h.temp);
      const y = 85 - (((val - minT) / range) * 55);
      return { x, y, val, label: h.time_label, precip: h.precip_prob };
    });

    const dPath = pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = a[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
    }, "");

    const areaPath = `${dPath} L ${pts[pts.length - 1].x},110 L ${pts[0].x},110 Z`;

    return { pts, dPath, areaPath };
  }, [hourly, isFahrenheit]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Location Bar & Region Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-[#123826] font-extrabold">{selectedDistrict}, {selectedState}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">|</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-2.5 py-1 text-xs font-bold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {Object.keys(STATE_DISTRICTS).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-2.5 py-1 text-xs font-bold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {(STATE_DISTRICTS[selectedState] || []).map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="px-3 py-1 rounded-xl bg-[#EBF5ED] hover:bg-[#D4EAD9] border border-[#CCE0D0] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Auto-detect current GPS coordinates"
          >
            {gpsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32] animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-[#2E7D32]" />
            )}
            <span>{gpsLoading ? 'Acquiring...' : 'Use My GPS'}</span>
          </button>
        </div>

        <button
          onClick={() => fetchWeather(selectedState, selectedDistrict)}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#CCE0D0] text-[#123826] hover:bg-[#F7FBF8] transition-colors cursor-pointer"
          title="Refresh forecast pass"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* GPS Locked Status Notice */}
      {gpsMessage && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{gpsMessage}</span>
          </div>
          <button 
            onClick={() => setGpsMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN DASHBOARD GRID (Matching the screenshot layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Main Weather Hero & Hourly Curve (55% width) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E2ECE9] p-6 shadow-xs space-y-6">
          {/* Header Row: City, Time, and F/C Toggle */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 font-['Syne',sans-serif]">
                {selectedDistrict}, {selectedState.substring(0, 2)} {cur.updated_at}
              </h2>
              <p className="text-[11px] text-stone-400 font-medium">Updated a few minutes ago</p>
            </div>

            {/* Fahrenheit / Celsius Switcher */}
            <div className="flex items-center bg-[#F0F4F8] p-0.5 rounded-xl border border-[#E2E8F0]">
              <button
                onClick={() => setIsFahrenheit(true)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isFahrenheit ? 'bg-[#475569] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                °F
              </button>
              <button
                onClick={() => setIsFahrenheit(false)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isFahrenheit ? 'bg-[#475569] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                °C
              </button>
            </div>
          </div>

          {/* Current Weather Hero */}
          <div className="flex items-center gap-6 pt-2">
            {/* 3D-styled Soft Weather Artwork */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100" fill="none">
                {/* Sun */}
                <circle cx="68" cy="36" r="22" fill="#FBBF24" />
                <circle cx="68" cy="36" r="25" fill="#FDE68A" opacity="0.4" />
                {/* Cloud */}
                <path 
                  d="M26 68 C20 68 15 63 15 57 C15 52 19 47 24 46 C26 38 33 32 41 32 C49 32 56 37 58 44 C61 44 65 47 65 51 C69 51 73 55 73 59 C73 64 69 68 64 68 Z" 
                  fill="url(#cloudGrad)"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                />
                <defs>
                  <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#DCE7F5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight font-['Syne',sans-serif]">
                  {toDisplayTemp(cur.temperature)}{unitSymbol}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-800 mt-1">
                {cur.condition}
              </div>
              <div className="text-xs font-semibold text-stone-500 font-mono">
                H {toDisplayTemp(cur.temp_max)}° L {toDisplayTemp(cur.temp_min)}°
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Carousel Row */}
          <div className="pt-2 border-t border-[#F0F4F8] relative">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {forecast.slice(0, 7).map((day, i) => (
                <div 
                  key={day.date}
                  className={`p-2 rounded-2xl transition-all ${
                    i === 0 ? 'bg-[#F4F9F5] border border-[#CCE0D0]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className={`text-[11px] block font-bold truncate ${i === 0 ? 'text-[#123826]' : 'text-stone-700'}`}>
                    {day.day_name}
                  </span>
                  
                  {/* Weather Mini Icon */}
                  <div className="my-2 flex justify-center text-lg">
                    {day.icon.includes('rain') ? (
                      <span title={day.condition}>🌧️</span>
                    ) : day.icon.includes('thunder') ? (
                      <span title={day.condition}>⛈️</span>
                    ) : day.icon.includes('clear') ? (
                      <span title={day.condition}>☀️</span>
                    ) : (
                      <span title={day.condition}>⛅</span>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-stone-800 font-mono">
                    {toDisplayTemp(day.temp_max)}° <span className="text-stone-400 font-normal">{toDisplayTemp(day.temp_min)}°</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-stone-200 hidden sm:flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Hourly Temperature & Precipitation Smooth Graph */}
          <div className="pt-2 border-t border-[#F0F4F8] space-y-2">
            <div className="w-full h-32 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tempFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#FED7AA" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area Under Curve */}
                <path d={hourlySvgPoints.areaPath} fill="url(#tempFill)" />

                {/* Smooth Curve */}
                <path d={hourlySvgPoints.dPath} fill="none" stroke="#F97316" strokeWidth="2.5" />

                {/* Data Points and Temp Labels */}
                {hourlySvgPoints.pts.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="3" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
                    <text 
                      x={p.x} 
                      y={p.y - 8} 
                      textAnchor="middle" 
                      fill="#475569" 
                      fontSize="11" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                    >
                      {p.val}°
                    </text>
                  </g>
                ))}

                {/* Base Axis Line */}
                <line x1="20" y1="105" x2="580" y2="105" stroke="#E2E8F0" strokeWidth="1" />
              </svg>
            </div>

            {/* Precipitation % and Hour Labels */}
            <div className="grid grid-cols-8 text-center pt-1">
              {hourly.map((h, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="text-[10px] text-sky-600 font-bold flex items-center justify-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5 text-sky-500 fill-sky-400" />
                    <span>{h.precip_prob}%</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono font-medium block">
                    {h.time_label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-stone-400 font-mono flex items-center justify-between">
              <span>AgriMate Micro-Weather • High-Resolution NWP</span>
              <span>Coordinates: {coords.lat.toFixed(2)}°N, {coords.lon.toFixed(2)}°E</span>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Metric Stack (Visibility, Pressure, AQI, UV) (30% width) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Tile 1: Visibility */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500">Visibility</span>
              <div className="text-2xl font-black text-stone-900 font-['Syne',sans-serif]">
                {cur.visibility_km} <span className="text-xs font-bold text-stone-400 font-sans">km</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                {cur.visibility_status}
              </span>
            </div>

            {/* Horizontal Layered Green Bars */}
            <div className="space-y-1 w-14 flex flex-col items-center">
              <div className="h-1 bg-emerald-500 rounded-full w-4" />
              <div className="h-1 bg-emerald-500 rounded-full w-7" />
              <div className="h-1 bg-emerald-500 rounded-full w-10" />
              <div className="h-1.5 bg-emerald-600 rounded-full w-14" />
            </div>
          </div>

          {/* Tile 2: Pressure */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500">Pressure</span>
              <div className="text-2xl font-black text-stone-900 font-['Syne',sans-serif]">
                {cur.pressure} <span className="text-xs font-bold text-stone-400 font-sans">mb</span>
              </div>
              <span className="text-xs font-semibold text-stone-500 block">
                {cur.pressure_trend}
              </span>
            </div>

            {/* Pressure Barometer Wave with Dot */}
            <div className="w-16 h-10 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 70 40">
                <path d="M 5,25 Q 25,10 45,22 T 65,18" fill="none" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="20" r="4.5" fill="#818CF8" />
              </svg>
            </div>
          </div>

          {/* Tile 3: Air Quality (AQI) */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500">AQI</span>
              <div className="text-2xl font-black text-stone-900 font-['Syne',sans-serif]">
                {cur.aqi}
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                {cur.aqi_status}
              </span>
            </div>

            {/* Circular Gauge Arc */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="18" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <circle 
                  cx="25" 
                  cy="25" 
                  r="18" 
                  fill="none" 
                  stroke="#22C55E" 
                  strokeWidth="4" 
                  strokeDasharray="113" 
                  strokeDashoffset="75" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 right-4" />
            </div>
          </div>

          {/* Tile 4: UV Index */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500">UV</span>
              <div className="text-2xl font-black text-stone-900 font-['Syne',sans-serif]">
                {cur.uv_index}
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
                {cur.uv_status}
              </span>
            </div>

            {/* Multi-color UV Arc Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="18" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <circle 
                  cx="25" 
                  cy="25" 
                  r="18" 
                  fill="none" 
                  stroke="#EAB308" 
                  strokeWidth="4" 
                  strokeDasharray="113" 
                  strokeDashoffset="45" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="w-3 h-3 rounded-full bg-amber-500 absolute top-1 right-2 border-2 border-white shadow-xs" />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Wind, Humidity, Mini-Map, Sun Hours (35% width) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Tile 1: Wind */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <span>Wind</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Compass Rose Dial */}
              <div className="relative w-16 h-16 rounded-full border border-stone-200 bg-[#F8FAFC] flex items-center justify-center shadow-inner">
                <span className="absolute top-0.5 text-[8px] font-bold text-stone-400">N</span>
                <span className="absolute bottom-0.5 text-[8px] font-bold text-stone-400">S</span>
                <span className="absolute left-1 text-[8px] font-bold text-stone-400">W</span>
                <span className="absolute right-1 text-[8px] font-bold text-stone-400">E</span>
                
                {/* Wind Vector Pointer */}
                <div 
                  className="w-10 h-10 flex items-center justify-center transition-transform duration-700"
                  style={{ transform: `rotate(${cur.wind_direction}deg)` }}
                >
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-[18px] border-b-sky-500 -mt-2 drop-shadow-xs" />
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-xs font-bold text-stone-800">
                  <span className="text-base font-black font-['Syne',sans-serif]">{cur.wind_speed}</span> km/h
                  <span className="block text-[10px] text-stone-400 font-normal">Wind Speed</span>
                </div>
                <div className="text-xs font-bold text-stone-800 pt-1 border-t border-stone-100">
                  <span className="text-sm font-black font-['Syne',sans-serif]">{cur.wind_gust}</span> km/h
                  <span className="block text-[10px] text-stone-400 font-normal">Wind Gust</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-xl text-center">
              {cur.wind_force}
            </div>
          </div>

          {/* Tile 2: Humidity */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <span>Humidity</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Vertical Moisture Bars */}
              <div className="flex items-end gap-1.5 h-14">
                {[65, 80, 85, 90, 86, 75, 70, 60].map((h, idx) => (
                  <div key={idx} className="w-2 bg-[#E2E8F0] rounded-full h-full relative overflow-hidden">
                    <div 
                      className="w-full bg-sky-400 rounded-full absolute bottom-0"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right">
                <div className="text-3xl font-black text-stone-900 font-['Syne',sans-serif]">
                  {cur.humidity}%
                </div>
                <span className="text-xs font-bold text-sky-700 block">
                  Humid
                </span>
                <span className="text-xs font-mono font-medium text-stone-500 block pt-0.5">
                  {toDisplayTemp(cur.dew_point)}° Dew point
                </span>
              </div>
            </div>
          </div>

          {/* Tile 3: Mini-Map */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-4 shadow-xs space-y-3">
            <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-stone-200 bg-[#E2E8F0]">
              <iframe
                title="Mini Weather Map"
                width="100%"
                height="100%"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coords.lon - 0.05).toFixed(4)}%2C${(coords.lat - 0.03).toFixed(4)}%2C${(coords.lon + 0.05).toFixed(4)}%2C${(coords.lat + 0.03).toFixed(4)}&layer=mapnik&marker=${coords.lat.toFixed(4)}%2C${coords.lon.toFixed(4)}`}
              />

              {/* Pin badge overlay */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-stone-200 text-[10px] font-bold text-[#123826] shadow-xs flex items-center gap-1">
                <span>📍 {selectedDistrict.split(' ')[0]}</span>
                <span>{toDisplayTemp(cur.temperature)}°</span>
              </div>

              {/* Larger map button */}
              <button
                onClick={() => onNavigate('satellite')}
                className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🗺️ Larger Map</span>
              </button>
            </div>
          </div>

          {/* Tile 4: Sun Hours */}
          <div className="bg-white rounded-3xl border border-[#E2ECE9] p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-stone-700 block">Sun hours</span>
            
            {/* Parabolic Sun Arc */}
            <div className="relative w-full h-16 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 70">
                {/* Horizon Line */}
                <line x1="10" y1="60" x2="190" y2="60" stroke="#CBD5E1" strokeDasharray="3 3" />
                {/* Arc */}
                <path d="M 20,60 Q 100,0 180,60" fill="none" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" />
                {/* Sun Marker on Arc */}
                <circle cx="50" cy="36" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
                <circle cx="50" cy="36" r="8" fill="#FDE68A" opacity="0.4" />
                <text x="100" y="45" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {cur.sun_hours}
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100 font-mono">
              <div>
                <span className="font-bold text-stone-800 block">{cur.sunrise}</span>
                <span className="text-stone-400 text-[9px] uppercase">Sunrise</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-800 block">{cur.sunset}</span>
                <span className="text-stone-400 text-[9px] uppercase">Sunset</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FARMER ACTIONABLE AGRO-METEOROLOGY ADVISORY CARD */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-[#A5D6A7]" />
          <h3 className="font-black text-base sm:text-lg font-['Syne',sans-serif]">
            Precision Farming Weather Advisories for {selectedDistrict}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
            <div className="text-xs font-bold text-[#E8A238] flex items-center gap-1.5">
              <span>🌾 Spraying & Crop Protection</span>
            </div>
            <p className="text-xs text-emerald-50/90 leading-relaxed">
              {weatherData?.agri_advisory?.spraying || "Favorable: Wind is light (10 km/h). Safe for foliar application until 2 PM."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
            <div className="text-xs font-bold text-[#A5D6A7] flex items-center gap-1.5">
              <span>💧 Irrigation Scheduling</span>
            </div>
            <p className="text-xs text-emerald-50/90 leading-relaxed">
              {weatherData?.agri_advisory?.irrigation || "Delay overhead irrigation: shower probability anticipated this afternoon."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
            <div className="text-xs font-bold text-[#FFE0A3] flex items-center gap-1.5">
              <span>☀️ Harvest & Sun Drying</span>
            </div>
            <p className="text-xs text-emerald-50/90 leading-relaxed">
              {weatherData?.agri_advisory?.harvesting || "Good window for picking and shaded sorting; keep tarpaulins ready."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
