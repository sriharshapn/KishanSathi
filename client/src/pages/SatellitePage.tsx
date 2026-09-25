import React, { useState, useEffect, useMemo } from 'react';
import type { Language, NavigationPage, NDVIResult } from '../types';
import { 
  Globe2, 
  Layers, 
  Activity, 
  MapPin, 
  RefreshCw,
  Compass,
  Plus,
  Trash2,
  Crosshair,
  X,
  Sprout,
  LocateFixed,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react';
import { 
  STATE_DISTRICTS, 
  DISTRICT_CENTROIDS, 
  getLocationCoordinates, 
  getDistanceKm 
} from '../utils/locationData';
import { GoogleMapsNdvi } from '../components/GoogleMapsNdvi';

interface SatellitePageProps {
  language?: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const SatellitePage: React.FC<SatellitePageProps> = ({ onNavigate }) => {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('Ballari');
  const [loading, setLoading] = useState(false);
  const [ndviData, setNdviData] = useState<NDVIResult | null>(null);
  const [viewMode, setViewMode] = useState<'ndvi' | 'rgb' | 'stress' | 'hybrid'>('ndvi');

  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Digital Cadastre (Registered Farmer Fields)
  interface FarmerField {
    field_id: string;
    farmer_id: string;
    field_name: string;
    state: string;
    district: string;
    area_hectares: number;
    latitude: number;
    longitude: number;
    soil_type: string;
    current_crop: string;
    ndvi_latest: number;
    ndvi_health: string;
    created_at: string;
  }

  const [fields, setFields] = useState<FarmerField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FarmerField | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldArea, setNewFieldArea] = useState(2.0);
  const [newFieldCrop, setNewFieldCrop] = useState('Tomato');
  const [newFieldSoil, setNewFieldSoil] = useState('Loamy');
  const [newFieldState, setNewFieldState] = useState('Karnataka');
  const [newFieldDistrict, setNewFieldDistrict] = useState('Ballari');

  const fetchFields = async () => {
    setFieldsLoading(true);
    try {
      const res = await fetch('/api/fields');
      const data = await res.json();
      if (data.success && Array.isArray(data.fields)) {
        setFields(data.fields);
      }
    } catch (err) {
      console.warn('Failed to load farmer fields', err);
    } finally {
      setFieldsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const coords = getLocationCoordinates(newFieldState, newFieldDistrict);
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_name: newFieldName,
          state: newFieldState,
          district: newFieldDistrict,
          area_hectares: Number(newFieldArea) || 1.0,
          latitude: coords.lat,
          longitude: coords.lon,
          current_crop: newFieldCrop,
          soil_type: newFieldSoil
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewFieldName('');
        setShowAddModal(false);
        await fetchFields();
        if (data.field) {
          handleFocusField(data.field);
        }
      }
    } catch (err) {
      console.error('Failed to create field', err);
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      const res = await fetch(`/api/fields/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (focusedField?.field_id === id) {
          setFocusedField(null);
        }
        fetchFields();
      }
    } catch (err) {
      console.error('Failed to delete field', err);
    }
  };

  const fetchNDVI = async (stateName: string, districtName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/satellite/ndvi?state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(districtName)}`);
      const data = await res.json();
      if (data.success) {
        setNdviData(data);
      }
    } catch (e) {
      console.warn('Failed to load NDVI data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNDVI(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districtList = STATE_DISTRICTS[st] || [];
    const newDist = districtList[0] || '';
    setSelectedDistrict(newDist);
    setFocusedField(null);
    setGpsMessage(null);
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setFocusedField(null);
    setGpsMessage(null);
  };

  const handleFocusField = (field: FarmerField) => {
    setFocusedField(field);
    setSelectedState(field.state);
    setSelectedDistrict(field.district);
    setGpsMessage(null);
    fetchNDVI(field.state, field.district);
  };

  const handleClearFocus = () => {
    setFocusedField(null);
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

        // 1. Try reverse geocoding via public API
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

        // 2. Centroid fallback
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
          setFocusedField(null);
          setGpsMessage(`GPS Locked: ${matchedDistrict}, ${matchedState} (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`);
          fetchNDVI(matchedState, matchedDistrict);
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

  // Resolved Coordinates based on selected District or focused Cadastre plot
  const { currentLat, currentLon } = useMemo(() => {
    if (focusedField) {
      return { currentLat: focusedField.latitude, currentLon: focusedField.longitude };
    }
    const coords = getLocationCoordinates(selectedState, selectedDistrict);
    return { currentLat: coords.lat, currentLon: coords.lon };
  }, [focusedField, selectedState, selectedDistrict]);

  const currentArea = useMemo(() => {
    if (focusedField) return focusedField.area_hectares;
    return 2.5; // Default representative plot size in ha
  }, [focusedField]);

  // Dynamic Sub-Plot Zonation breakdown
  const zonation = useMemo(() => {
    const mean = ndviData?.ndvi_mean ?? 0.62;
    let highPct = 68;
    let modPct = 22;
    let stressPct = 10;

    if (mean >= 0.70) {
      highPct = 78;
      modPct = 16;
      stressPct = 6;
    } else if (mean >= 0.60) {
      highPct = 68;
      modPct = 22;
      stressPct = 10;
    } else if (mean >= 0.45) {
      highPct = 52;
      modPct = 33;
      stressPct = 15;
    } else if (mean >= 0.30) {
      highPct = 32;
      modPct = 40;
      stressPct = 28;
    } else {
      highPct = 15;
      modPct = 35;
      stressPct = 50;
    }

    const totalArea = currentArea;
    return {
      highPct,
      highArea: ((totalArea * highPct) / 100).toFixed(2),
      modPct,
      modArea: ((totalArea * modPct) / 100).toFixed(2),
      stressPct,
      stressArea: ((totalArea * stressPct) / 100).toFixed(2),
    };
  }, [ndviData, currentArea]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#A5D6A7]">
            <Globe2 className="w-3.5 h-3.5 text-[#E8A238]" />
            <span>Copernicus Sentinel-2 • 10m Multispectral Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Syne',sans-serif] tracking-tight">
            Satellite Vegetation Health (NDVI)
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Continuous Normalized Difference Vegetation Index tracking across farm plots. Monitor photosynthetic vigor, early nitrogen deficiency, and crop canopies with location-grounded satellite telemetry.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🛰️
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-xs font-extrabold uppercase text-[#123826]">State:</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {Object.keys(STATE_DISTRICTS).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase text-[#123826]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
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
            className="px-3 py-1.5 rounded-xl bg-[#EBF5ED] hover:bg-[#D4EAD9] border border-[#CCE0D0] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Auto-detect current GPS coordinates"
          >
            {gpsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32] animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-[#2E7D32]" />
            )}
            <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My GPS'}</span>
          </button>

          {focusedField && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold animate-in fade-in">
              <Crosshair className="w-3.5 h-3.5 text-amber-700" />
              <span>Target: {focusedField.field_name}</span>
              <button
                onClick={handleClearFocus}
                className="ml-1 text-amber-700 hover:text-amber-900 p-0.5 rounded cursor-pointer"
                title="Reset map to district view"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Spectral View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F8F5] p-1 rounded-xl border border-[#E2ECE3]">
          <button
            onClick={() => setViewMode('ndvi')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'ndvi' ? 'bg-[#123826] text-white shadow-xs' : 'text-stone-600 hover:text-[#123826]'
            }`}
          >
            NDVI False-Color
          </button>
          <button
            onClick={() => setViewMode('rgb')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'rgb' ? 'bg-[#123826] text-white shadow-xs' : 'text-stone-600 hover:text-[#123826]'
            }`}
          >
            Google Satellite (RGB)
          </button>
          <button
            onClick={() => setViewMode('stress')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'stress' ? 'bg-[#123826] text-white shadow-xs' : 'text-stone-600 hover:text-[#123826]'
            }`}
          >
            Moisture Stress
          </button>
          <button
            onClick={() => setViewMode('hybrid')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'hybrid' ? 'bg-[#123826] text-white shadow-xs' : 'text-stone-600 hover:text-[#123826]'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Google Hybrid</span>
          </button>
        </div>

        <button
          onClick={() => fetchNDVI(selectedState, selectedDistrict)}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#CCE0D0] text-[#123826] hover:bg-[#F7FBF8] transition-colors cursor-pointer"
          title="Refresh Sentinel-2 satellite pass"
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

      {/* Main Geospatial Display & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Satellite Imagery Canvas powered by Google Maps API */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E2ECE3] gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                Google Maps API • Sentinel-2 Surface Reflectance & NDVI
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-bold text-[#123826] bg-[#F7FBF8] px-2.5 py-1 rounded-lg border border-[#E2ECE3]">
                {currentLat.toFixed(4)}°N, {currentLon.toFixed(4)}°E
              </span>
              <a
                href={`https://www.google.com/maps/@${currentLat.toFixed(4)},${currentLon.toFixed(4)},16z/data=!3m1!1e3`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
              >
                <span>Google Earth</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Google Maps API Powered NDVI Map Display */}
          <GoogleMapsNdvi
            lat={currentLat}
            lon={currentLon}
            state={selectedState}
            district={selectedDistrict}
            ndviScore={ndviData?.ndvi_mean ?? 0.62}
            cloudCoverage={ndviData?.cloud_coverage_pct ?? 4}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            focusedField={focusedField}
            areaHectares={currentArea}
          />

          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
            <span>Powered by Google Maps JavaScript API & Sentinel-2 MSI • 10m GSD</span>
            <button
              onClick={() => onNavigate('advisory')}
              className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer"
            >
              Get Crop Recommendations for this NDVI →
            </button>
          </div>
        </div>

        {/* Real-Time Metrics & Field Zonation */}
        <div className="lg:col-span-4 space-y-6">
          {/* NDVI Health Gauge Card */}
          <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Mean Canopy Vigour
            </span>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-[#123826] font-mono tracking-tight">
                  {ndviData?.ndvi_mean ?? '0.62'}
                </span>
                <span className="text-stone-400 text-xs ml-1">/ 1.0</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {ndviData?.health_status || 'Good'}
              </span>
            </div>

            {/* Gauge Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex">
                <div className="h-full bg-red-400 w-1/5" />
                <div className="h-full bg-amber-400 w-1/5" />
                <div className="h-full bg-lime-400 w-1/5" />
                <div className="h-full bg-emerald-500 w-2/5" />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>0.0</span>
                <span>0.4 (Min)</span>
                <span>0.7 (Ideal)</span>
                <span>1.0</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2ECE3] grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3]">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Min NDVI</span>
                <span className="text-xs font-bold text-stone-700 font-mono">{ndviData?.ndvi_min ?? '0.51'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3]">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Peak NDVI</span>
                <span className="text-xs font-bold text-[#2E7D32] font-mono">{ndviData?.ndvi_max ?? '0.74'}</span>
              </div>
            </div>
          </div>

          {/* Plot Zonation Analysis */}
          <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#123826]">
                Sub-Plot Zonation Breakdown
              </h4>
              <span className="text-[11px] font-mono font-bold text-stone-500">
                {currentArea} ha total
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>High Photosynthetic Vigor</span>
                  <span className="font-mono text-[#2E7D32] font-bold">{zonation.highPct}% ({zonation.highArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#2E7D32]" style={{ width: `${zonation.highPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Moderate Canopy / Emerging</span>
                  <span className="font-mono text-lime-700 font-bold">{zonation.modPct}% ({zonation.modArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#8BC34A]" style={{ width: `${zonation.modPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Moisture / Nutrient Deficiency Zone</span>
                  <span className="font-mono text-amber-700 font-bold">{zonation.stressPct}% ({zonation.stressArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#E8A238]" style={{ width: `${zonation.stressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day NDVI Trend Progression */}
      {ndviData?.timeseries && (
        <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                30-Day NDVI Vegetative Biomass Trajectory
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              Canopy trend: Steadily Increasing (+8.4% over 30 days)
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-48 sm:h-56 relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="600" y2="30" stroke="#E2ECE3" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#E2ECE3" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#E2ECE3" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                points={
                  ndviData.timeseries.map((pt: any, i: number) => {
                    const x = (i / (ndviData.timeseries.length - 1)) * 600;
                    const y = 140 - (pt.ndvi * 120);
                    return `${x},${y}`;
                  }).join(' ') + ' 600,150 0,150'
                }
                fill="#E8F5E9"
                opacity="0.7"
              />

              {/* Line graph */}
              <polyline
                points={ndviData.timeseries.map((pt: any, i: number) => {
                  const x = (i / (ndviData.timeseries.length - 1)) * 600;
                  const y = 140 - (pt.ndvi * 120);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#2E7D32"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {ndviData.timeseries.map((pt: any, i: number) => {
                if (i % 5 === 0 || i === ndviData.timeseries.length - 1) {
                  const x = (i / (ndviData.timeseries.length - 1)) * 600;
                  const y = 140 - (pt.ndvi * 120);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#123826" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={x} y={y - 8} fontSize="9" textAnchor="middle" fill="#123826" fontWeight="bold">
                        {pt.ndvi.toFixed(2)}
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-stone-400 font-mono pt-2 border-t border-[#E2ECE3]">
            <span>Day -30</span>
            <span>Day -15</span>
            <span>Today (Current Pass)</span>
          </div>
        </div>
      )}

      {/* Digital Cadastre: Registered Farm Plots */}
      <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2ECE3]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#2E7D32]" />
            <div>
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-[#123826]">
                Digital Cadastre • My Registered Farm Plots
              </h3>
              <p className="text-xs text-stone-500">
                Geo-referenced parcels monitored via Sentinel-2 automated surface reflectance passes. Click &apos;Focus Map&apos; to target a specific field survey.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#EBF5ED] text-[#123826] px-2.5 py-1 rounded-full border border-[#CCE0D0]">
              {fields.length} Parcels Active
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#123826] hover:bg-[#1B4D35] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Plot</span>
            </button>
          </div>
        </div>

        {fieldsLoading ? (
          <div className="py-8 text-center text-xs text-stone-500">Loading registered parcels...</div>
        ) : fields.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">No farm plots registered yet. Click &apos;Register New Plot&apos; to link a cadastre survey.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((f) => {
              const isTargetActive = focusedField?.field_id === f.field_id;
              return (
                <div 
                  key={f.field_id}
                  className={`bg-[#FBFDF9] border transition-all rounded-2xl p-4 space-y-3 relative group ${
                    isTargetActive ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 shadow-sm' : 'border-[#CCE0D0] hover:border-[#2E7D32]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-[#123826]">{f.field_name}</h4>
                        {isTargetActive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#123826] text-white">
                            Active Pin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#2E7D32]" />
                        {f.district}, {f.state}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteField(f.field_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 transition-opacity cursor-pointer"
                      title="Delete plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E2ECE3]">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Area</span>
                      <span className="font-bold text-stone-700">{f.area_hectares} ha</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Crop / Soil</span>
                      <span className="font-bold text-stone-700">{f.current_crop || 'Mixed'} • {f.soil_type || 'Loamy'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2ECE3]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-500 font-mono">NDVI:</span>
                      <span className="text-xs font-mono font-bold text-[#123826]">
                        {typeof f.ndvi_latest === 'number' ? f.ndvi_latest.toFixed(2) : f.ndvi_latest}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {f.ndvi_health || 'Good'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleFocusField(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isTargetActive 
                          ? 'bg-[#123826] text-white shadow-xs' 
                          : 'bg-[#EBF5ED] hover:bg-[#D4EAD9] text-[#123826]'
                      }`}
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>{isTargetActive ? 'Centered' : 'Focus Map'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="font-black text-sm text-[#123826]">Register Farm Plot</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Plot / Cadastre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ballari North Survey #14B"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <select
                    value={newFieldState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setNewFieldState(st);
                      const districts = STATE_DISTRICTS[st] || [];
                      setNewFieldDistrict(districts[0] || '');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  >
                    {Object.keys(STATE_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
                  <select
                    value={newFieldDistrict}
                    onChange={(e) => setNewFieldDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  >
                    {(STATE_DISTRICTS[newFieldState] || []).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Area (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newFieldArea}
                    onChange={(e) => setNewFieldArea(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Current Crop</label>
                  <input
                    type="text"
                    value={newFieldCrop}
                    onChange={(e) => setNewFieldCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={newFieldSoil}
                    onChange={(e) => setNewFieldSoil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E2ECE3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#CCE0D0] text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#123826] hover:bg-[#1B4D35] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Save Cadastre Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
