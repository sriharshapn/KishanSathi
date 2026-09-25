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
  Map as MapIcon,
  Landmark,
  Search,
  ShieldCheck,
  CheckCircle2,
  Database
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
  const [viewMode, setViewMode] = useState<'ndvi' | 'rgb' | 'stress' | 'hybrid' | 'earth3d'>('ndvi');

  // Google Earth Engine (GEE) API state (@google/earthengine)
  const [geeData, setGeeData] = useState<any | null>(null);
  const [showGeeScriptModal, setShowGeeScriptModal] = useState(false);

  // Govt Plot Cadastre (AgriStack, ISRO Bhuvan, State Land Records)
  const [surveyInput, setSurveyInput] = useState('142/2A');
  const [talukInput, setTalukInput] = useState('Ballari');
  const [villageInput, setVillageInput] = useState('Kudatini');
  const [govPlotResult, setGovPlotResult] = useState<any | null>(null);
  const [govPlotLoading, setGovPlotLoading] = useState(false);
  const [govPlotError, setGovPlotError] = useState<string | null>(null);
  const [showGovApisModal, setShowGovApisModal] = useState(false);
  const [govApisList, setGovApisList] = useState<any[]>([]);

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
      const coords = getLocationCoordinates(stateName, districtName);
      const [ndviRes, geeRes] = await Promise.allSettled([
        fetch(`/api/satellite/ndvi?state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(districtName)}`).then(r => r.json()),
        fetch('/api/earthengine/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: coords.lat,
            lon: coords.lon,
            state: stateName,
            district: districtName
          })
        }).then(r => r.json())
      ]);

      if (ndviRes.status === 'fulfilled' && ndviRes.value.success) {
        setNdviData(ndviRes.value);
      }
      if (geeRes.status === 'fulfilled' && geeRes.value.success) {
        setGeeData(geeRes.value);
      }
    } catch (e) {
      console.warn('Failed to load satellite / Earth Engine data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGovApis = async () => {
    try {
      const res = await fetch('/api/cadastre/apis');
      const data = await res.json();
      if (data.success && Array.isArray(data.apis)) {
        setGovApisList(data.apis);
      }
    } catch (err) {
      console.warn('Failed to load gov apis list', err);
    }
  };

  useEffect(() => {
    fetchGovApis();
  }, []);

  const handleSearchGovPlot = async (e?: React.FormEvent, customSurvey?: string) => {
    if (e) e.preventDefault();
    const querySurvey = customSurvey || surveyInput;
    if (!querySurvey.trim()) return;
    setGovPlotLoading(true);
    setGovPlotError(null);
    try {
      const res = await fetch('/api/cadastre/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          taluk: talukInput || selectedDistrict,
          village: villageInput || 'Central Village',
          survey_number: querySurvey.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.record) {
        setGovPlotResult(data.record);
        if (data.record.geospatial?.boundary_polygon) {
          fetch('/api/earthengine/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: data.record.geospatial.centroid.latitude,
              lon: data.record.geospatial.centroid.longitude,
              state: selectedState,
              district: selectedDistrict,
              crop: data.record.digital_crop_survey?.sown_crop,
              polygon: data.record.geospatial.boundary_polygon
            })
          }).then(r => r.json()).then(res => {
            if (res.success) setGeeData(res);
          }).catch(console.warn);
        }
      } else {
        setGovPlotError(data.error || 'No government cadastral record found for this survey number.');
      }
    } catch (err: any) {
      setGovPlotError(err?.message || 'Error querying government plot cadastre portal');
    } finally {
      setGovPlotLoading(false);
    }
  };

  const handleImportGovPlotToFields = async () => {
    if (!govPlotResult) return;
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_name: `${govPlotResult.tenure.owner_name} (Survey #${govPlotResult.official_plot_id.survey_number})`,
          state: govPlotResult.location.state,
          district: govPlotResult.location.district,
          area_hectares: govPlotResult.geospatial.area_hectares,
          latitude: govPlotResult.geospatial.centroid.latitude,
          longitude: govPlotResult.geospatial.centroid.longitude,
          current_crop: govPlotResult.digital_crop_survey.sown_crop,
          soil_type: govPlotResult.soil_health_card.soil_type
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchFields();
        setGpsMessage(`Linked Gov Plot (${govPlotResult.official_plot_id.agristack_plot_id}) to your registered farm plots!`);
      }
    } catch (err) {
      console.warn('Failed to import gov plot', err);
    }
  };

  useEffect(() => {
    fetchNDVI(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  // Custom Polygon Adjustment state
  const [customAdjustedArea, setCustomAdjustedArea] = useState<number | null>(null);
  const [customAdjustedPolygon, setCustomAdjustedPolygon] = useState<{ lat: number; lng: number }[] | null>(null);

  const handlePolygonAdjust = (coords: { lat: number; lng: number }[], areaHa: number) => {
    setCustomAdjustedArea(areaHa);
    setCustomAdjustedPolygon(coords);
    if (focusedField) {
      setFocusedField(prev => prev ? { ...prev, area_hectares: areaHa } : null);
      setFields(prev => prev.map(f => f.field_id === focusedField.field_id ? { ...f, area_hectares: areaHa } : f));
    }
  };

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districtList = STATE_DISTRICTS[st] || [];
    const newDist = districtList[0] || '';
    setSelectedDistrict(newDist);
    setFocusedField(null);
    setGovPlotResult(null);
    setCustomAdjustedArea(null);
    setCustomAdjustedPolygon(null);
    setTalukInput(newDist);
    setVillageInput('Central Village');
    setGpsMessage(null);
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setFocusedField(null);
    setGovPlotResult(null);
    setCustomAdjustedArea(null);
    setCustomAdjustedPolygon(null);
    setTalukInput(dist);
    setVillageInput('Central Village');
    setGpsMessage(null);
  };

  const handleFocusField = (field: FarmerField) => {
    setFocusedField(field);
    setSelectedState(field.state);
    setSelectedDistrict(field.district);
    setCustomAdjustedArea(null);
    setCustomAdjustedPolygon(null);
    setGpsMessage(null);
    fetchNDVI(field.state, field.district);
  };

  const handleClearFocus = () => {
    setFocusedField(null);
    setGovPlotResult(null);
    setCustomAdjustedArea(null);
    setCustomAdjustedPolygon(null);
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
    if (govPlotResult?.geospatial?.centroid &&
        govPlotResult.query?.state?.toLowerCase() === selectedState.toLowerCase() &&
        govPlotResult.query?.district?.toLowerCase() === selectedDistrict.toLowerCase()) {
      return {
        currentLat: govPlotResult.geospatial.centroid.latitude || govPlotResult.geospatial.centroid.lat,
        currentLon: govPlotResult.geospatial.centroid.longitude || govPlotResult.geospatial.centroid.lng
      };
    }
    const coords = getLocationCoordinates(selectedState, selectedDistrict);
    return { currentLat: coords.lat, currentLon: coords.lon };
  }, [focusedField, govPlotResult, selectedState, selectedDistrict]);

  const currentArea = useMemo(() => {
    if (customAdjustedArea !== null) return customAdjustedArea;
    if (focusedField) return focusedField.area_hectares;
    return 2.5; // Default representative plot size in ha
  }, [customAdjustedArea, focusedField]);

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
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8 md:py-12 space-y-8 text-[#022113] font-['Open_Sans',sans-serif]">
      {/* Header Banner (Pic 1 & 2 Aesthetic) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Crisp White Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F2EB] border border-[#022113]/8 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#546C18]">
              <Globe2 className="w-3.5 h-3.5 text-[#546C18]" strokeWidth={2} />
              <span>Copernicus Sentinel-2 • 10m Multispectral Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
              Sentinel-2 <span className="text-[#546C18]">Vegetation Canopy (NDVI)</span>
            </h1>
            <p className="text-[#4A5568] text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
              Continuous Normalized Difference Vegetation Index tracking across farm plots. Monitor photosynthetic vigor, early nitrogen deficiency, and crop canopies with location-grounded satellite telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#022113]/8">
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              10m Ground Resolution
            </span>
            <span className="text-[#718096]">•</span>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              5-Day Revisit Orbit
            </span>
            <span className="text-[#718096]">•</span>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              Surface Reflectance Level-2A
            </span>
          </div>
        </div>

        {/* Right Card: Rich Olive Card */}
        <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113]">
                Orbit Synchronized
              </span>
              <span className="text-xs font-mono text-white/80">ESA / Copernicus</span>
            </div>
            <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-white pt-2">
              Optical Remote Sensing
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              Direct red & near-infrared band ratio calculations (B4 & B8) for instantaneous chlorophyll absorption assessment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] block">Global Spectral Index</span>
            <span className="text-2xl font-black font-['Montserrat',sans-serif] text-white block">NDVI: 0.62</span>
            <span className="text-[11px] text-white/70 block">Healthy vegetative canopy detected</span>
          </div>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#59701E]" strokeWidth={2} />
            <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">State:</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-[#F8FAF6] border border-[#E5EAD7] rounded-full px-3 py-1.5 text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#59701E]"
            >
              {Object.keys(STATE_DISTRICTS).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-[#F8FAF6] border border-[#E5EAD7] rounded-full px-3 py-1.5 text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#59701E]"
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
            className="px-3.5 py-1.5 rounded-full bg-[#F0F4EC] hover:bg-[#DFEB38] text-[#022113] border border-[#E5EAD7] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS coordinates"
          >
            {gpsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#59701E] animate-spin" strokeWidth={2} />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
            )}
            <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My GPS'}</span>
          </button>

          {focusedField && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold font-['Montserrat',sans-serif]">
              <Crosshair className="w-3.5 h-3.5 text-amber-700" strokeWidth={2} />
              <span>Target: {focusedField.field_name}</span>
              <button
                onClick={handleClearFocus}
                className="ml-1 text-amber-700 hover:text-black p-0.5 rounded cursor-pointer transition-colors"
                title="Reset map to district view"
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          )}

          {customAdjustedArea && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold font-['Montserrat',sans-serif] animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adjusted: {customAdjustedArea} ha</span>
              <button
                onClick={() => { setCustomAdjustedArea(null); setCustomAdjustedPolygon(null); }}
                className="ml-1 text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                title="Reset custom boundary"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Spectral View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F0F4EC] p-1 rounded-full border border-[#E5EAD7] font-['Montserrat',sans-serif] text-xs">
          <button
            onClick={() => setViewMode('ndvi')}
            className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer font-bold ${
              viewMode === 'ndvi' ? 'bg-[#546C18] text-[#DFEB38] shadow-xs' : 'text-[#59701E] hover:text-[#546C18]'
            }`}
          >
            NDVI
          </button>
          <button
            onClick={() => setViewMode('rgb')}
            className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer font-bold ${
              viewMode === 'rgb' ? 'bg-[#546C18] text-[#DFEB38] shadow-xs' : 'text-[#59701E] hover:text-[#546C18]'
            }`}
          >
            RGB Earth
          </button>
          <button
            onClick={() => setViewMode('stress')}
            className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer font-bold ${
              viewMode === 'stress' ? 'bg-[#546C18] text-[#DFEB38] shadow-xs' : 'text-[#59701E] hover:text-[#546C18]'
            }`}
          >
            Stress
          </button>
          <button
            onClick={() => setViewMode('hybrid')}
            className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer flex items-center gap-1 font-bold ${
              viewMode === 'hybrid' ? 'bg-[#546C18] text-[#DFEB38] shadow-xs' : 'text-[#59701E] hover:text-[#546C18]'
            }`}
          >
            <MapIcon className="w-3 h-3" strokeWidth={2} />
            <span>Hybrid</span>
          </button>
          <button
            onClick={() => setViewMode('earth3d')}
            className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer flex items-center gap-1 font-bold ${
              viewMode === 'earth3d' ? 'bg-[#546C18] text-[#DFEB38] shadow-xs' : 'text-[#59701E] hover:text-[#546C18]'
            }`}
            title="Google Earth 3D Topography perspective"
          >
            <Globe2 className="w-3 h-3" strokeWidth={2} />
            <span>Earth 3D</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGeeScriptModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#F0F4EC] hover:bg-[#E5EAD7] border border-[#022113]/8 text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Inspect Google Earth Engine (GEE) Python/JS API Pipeline"
          >
            <Database className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
            <span>GEE Script</span>
          </button>

          <button
            onClick={() => fetchNDVI(selectedState, selectedDistrict)}
            disabled={loading}
            className="p-2 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] transition-colors cursor-pointer shadow-xs"
            title="Refresh Sentinel-2 satellite pass"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* GPS Locked Status Notice */}
      {gpsMessage && (
        <div className="px-4 py-3 rounded-[1.5rem] bg-[#DFEB38]/20 border border-[#59701E]/30 text-[#022113] text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#59701E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#59701E]"></span>
            </span>
            <span>{gpsMessage}</span>
          </div>
          <button 
            onClick={() => setGpsMessage(null)}
            className="text-[#59701E] hover:text-[#022113] text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Geospatial Display & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Satellite Imagery Canvas powered by Google Maps API */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#022113]/8 gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#59701E]" strokeWidth={2} />
              <h3 className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">
                Google Maps API • Sentinel-2 Surface Reflectance & NDVI
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#022113] bg-[#F0F2EB] px-3 py-1 rounded-full border border-[#022113]/8">
                {currentLat.toFixed(4)}°N, {currentLon.toFixed(4)}°E
              </span>
              <a
                href={`https://www.google.com/maps/@${currentLat.toFixed(4)},${currentLon.toFixed(4)},16z/data=!3m1!1e3`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-['Montserrat',sans-serif] font-bold text-[#59701E] hover:text-[#022113] flex items-center gap-1 transition-colors"
              >
                <span>Google Earth</span>
                <ExternalLink className="w-3 h-3" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Google Maps API Powered NDVI Map Display */}
          <GoogleMapsNdvi
            key={`ndvi_map_${selectedState}_${selectedDistrict}_${currentLat.toFixed(4)}_${currentLon.toFixed(4)}_${focusedField?.field_id || 'unfocused'}`}
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
            customGovPolygon={customAdjustedPolygon || govPlotResult?.geospatial?.boundary_polygon}
            govPlotRecord={govPlotResult}
            onPolygonAdjust={handlePolygonAdjust}
          />

          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[#718096] gap-2">
            <span>Powered by Google Maps API & Google Earth Engine • Sentinel-2 MSI 10m GSD</span>
            <button
              onClick={() => onNavigate('advisory')}
              className="text-xs font-bold font-['Montserrat',sans-serif] text-[#59701E] hover:text-[#022113] hover:underline cursor-pointer"
            >
              Get Crop Recommendations for this NDVI →
            </button>
          </div>
        </div>

        {/* Real-Time Metrics & Field Zonation */}
        <div className="lg:col-span-4 space-y-6">
          {/* NDVI Health Gauge Card */}
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-4">
            <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">
              Mean Canopy Vigour
            </span>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-bold font-['Montserrat',sans-serif] text-[#022113] tracking-tight">
                  {ndviData?.ndvi_mean ?? '0.62'}
                </span>
                <span className="text-[#718096] text-xs ml-1 font-mono">/ 1.0</span>
              </div>
              <span className="text-xs font-bold font-['Montserrat',sans-serif] px-3.5 py-1 rounded-full bg-[#DFEB38] text-[#022113] shadow-xs">
                {ndviData?.health_status || 'Good'}
              </span>
            </div>

            {/* Gauge Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-[#F0F2EB] overflow-hidden flex">
                <div className="h-full bg-red-500 w-1/5" />
                <div className="h-full bg-amber-500 w-1/5" />
                <div className="h-full bg-[#DFEB38] w-1/5" />
                <div className="h-full bg-[#59701E] w-2/5" />
              </div>
              <div className="flex justify-between text-[10px] text-[#718096] font-mono">
                <span>0.0</span>
                <span>0.4 (Min)</span>
                <span>0.7 (Ideal)</span>
                <span>1.0</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#022113]/8 grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-[1.5rem] bg-[#F0F2EB] border border-[#022113]/8">
                <span className="block text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">Min NDVI</span>
                <span className="text-xs font-bold text-[#022113] font-['Montserrat',sans-serif]">{ndviData?.ndvi_min ?? '0.51'}</span>
              </div>
              <div className="p-3.5 rounded-[1.5rem] bg-[#F0F2EB] border border-[#022113]/8">
                <span className="block text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">Peak NDVI</span>
                <span className="text-xs font-bold text-[#59701E] font-['Montserrat',sans-serif]">{ndviData?.ndvi_max ?? '0.74'}</span>
              </div>
            </div>
          </div>

          {/* Plot Zonation Analysis */}
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">
                Sub-Plot Zonation Breakdown
              </h4>
              <span className="text-[11px] font-mono text-[#718096]">
                {currentArea} ha total
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-[#022113] mb-1 font-medium">
                  <span>High Photosynthetic Vigor</span>
                  <span className="font-bold text-[#59701E]">{zonation.highPct}% ({zonation.highArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F2EB] overflow-hidden">
                  <div className="h-full bg-[#59701E]" style={{ width: `${zonation.highPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#022113] mb-1 font-medium">
                  <span>Moderate Canopy / Emerging</span>
                  <span className="font-bold text-[#59701E]">{zonation.modPct}% ({zonation.modArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F2EB] overflow-hidden">
                  <div className="h-full bg-[#99B348]" style={{ width: `${zonation.modPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#022113] mb-1 font-medium">
                  <span>Moisture / Nutrient Deficit</span>
                  <span className="font-bold text-amber-700">{zonation.stressPct}% ({zonation.stressArea} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F2EB] overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${zonation.stressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day NDVI Trend Progression */}
      {ndviData?.timeseries && (
        <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#59701E]" strokeWidth={2} />
              <h3 className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">
                30-Day NDVI Vegetative Biomass Trajectory
              </h3>
            </div>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#59701E]">
              Canopy trend: Steadily Increasing (+8.4% over 30 days)
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-48 sm:h-56 relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="600" y2="30" stroke="#022113" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#022113" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#022113" strokeOpacity="0.08" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                points={
                  ndviData.timeseries.map((pt: any, i: number) => {
                    const x = (i / (ndviData.timeseries.length - 1)) * 600;
                    const y = 140 - (pt.ndvi * 120);
                    return `${x},${y}`;
                  }).join(' ') + ' 600,150 0,150'
                }
                fill="rgba(89, 112, 30, 0.12)"
              />

              {/* Line graph */}
              <polyline
                points={ndviData.timeseries.map((pt: any, i: number) => {
                  const x = (i / (ndviData.timeseries.length - 1)) * 600;
                  const y = 140 - (pt.ndvi * 120);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#59701E"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {ndviData.timeseries.map((pt: any, i: number) => {
                if (i % 5 === 0 || i === ndviData.timeseries.length - 1) {
                  const x = (i / (ndviData.timeseries.length - 1)) * 600;
                  const y = 140 - (pt.ndvi * 120);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#DFEB38" stroke="#022113" strokeWidth="1.5" />
                      <text x={x} y={y - 8} fontSize="9" textAnchor="middle" fill="#59701E" fontFamily="monospace">
                        {pt.ndvi.toFixed(2)}
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#718096] font-mono pt-2 border-t border-[#022113]/8">
            <span>Day -30</span>
            <span>Day -15</span>
            <span>Today (Current Pass)</span>
          </div>
        </div>
      )}

      {/* Official Indian Government Cadastre & Plot Registry (AgriStack, ISRO Bhuvan, State RoR) */}
      <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#022113]/8">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#F0F2EB] text-[#59701E] border border-[#022113]/8">
              <Landmark className="w-5 h-5 text-[#59701E]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
                  Official Govt Plot Data • AgriStack & State Land Records
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider bg-[#F0F2EB] text-[#59701E] border border-[#022113]/8">
                  Gov Portals
                </span>
              </div>
              <p className="text-xs text-[#4A5568] font-normal">
                Direct lookup across AgriStack (DoA&FW), ISRO Bhuvan OGC Cadastral Layers, State RoR (Bhoomi, MahaBhulekh, UP Bhulekh, PLRS), and Soil Health Card.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGovApisModal(true)}
              className="px-4 py-2 rounded-full bg-[#F0F2EB] hover:bg-[#E5EAD7] border border-[#022113]/8 text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
              <span>Connected Govt APIs ({govApisList.length || 5})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSearchGovPlot(undefined, '142/2A')}
              className="px-4 py-2 rounded-full bg-[#DFEB38] text-[#022113] hover:bg-[#d0df2a] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Sample Survey #142/2A</span>
            </button>
          </div>
        </div>

        {/* Survey Query Bar */}
        <form onSubmit={handleSearchGovPlot} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-5 rounded-[2rem] bg-[#F0F2EB] border border-[#022113]/8">
          <div>
            <label className="block text-[11px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">State / RoR</label>
            <input
              type="text"
              readOnly
              value={selectedState}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#022113]/8 text-[#022113] font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">District</label>
            <input
              type="text"
              readOnly
              value={selectedDistrict}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#022113]/8 text-[#022113] font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Taluk / Tehsil</label>
            <input
              type="text"
              value={talukInput}
              onChange={(e) => setTalukInput(e.target.value)}
              placeholder="e.g. Ballari"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#022113]/8 text-[#022113] placeholder-[#889988] font-medium focus:outline-none focus:border-[#59701E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Village</label>
            <input
              type="text"
              value={villageInput}
              onChange={(e) => setVillageInput(e.target.value)}
              placeholder="e.g. Kudatini"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#022113]/8 text-[#022113] placeholder-[#889988] font-medium focus:outline-none focus:border-[#59701E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Survey No.</label>
            <input
              type="text"
              value={surveyInput}
              onChange={(e) => setSurveyInput(e.target.value)}
              placeholder="e.g. 142/2A"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#022113]/8 text-[#022113] placeholder-[#889988] font-medium focus:outline-none focus:border-[#59701E]"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={govPlotLoading}
              className="w-full py-2.5 px-4 rounded-full bg-[#DFEB38] text-[#022113] hover:bg-[#d0df2a] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {govPlotLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  <span>Querying...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Fetch Plot</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {govPlotError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
            <span>{govPlotError}</span>
            <button onClick={() => setGovPlotError(null)} className="font-mono underline cursor-pointer text-xs">Dismiss</button>
          </div>
        )}

        {govPlotResult && (
          <div className="bg-[#F0F2EB] border border-[#022113]/8 rounded-[2.5rem] p-6 sm:p-8 space-y-5 shadow-xl animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#022113]/8">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white border border-[#022113]/8 text-[#59701E]">
                  <ShieldCheck className="w-4 h-4 text-[#59701E]" strokeWidth={2} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-[#022113] font-['Montserrat',sans-serif]">
                      {govPlotResult.official_plot_id.system_name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase bg-[#DFEB38] text-[#022113]">
                      Verified Cadastre
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59701E] font-mono">
                    AgriStack ID: <span className="text-[#022113] font-semibold">{govPlotResult.official_plot_id.agristack_plot_id}</span> • Survey #{govPlotResult.official_plot_id.survey_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleImportGovPlotToFields}
                  className="px-4 py-2 rounded-full bg-[#DFEB38] text-[#022113] hover:bg-[#d0df2a] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Copy this verified cadastral parcel into My Registered Farm Plots"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Link to My Plots</span>
                </button>
                <a
                  href={govPlotResult.official_plot_id.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white hover:bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1"
                >
                  <span>Portal Record</span>
                  <ExternalLink className="w-3 h-3 text-[#59701E]" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Cadastral Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Land Ownership & Tenure */}
              <div className="p-5 rounded-[2rem] bg-white border border-[#022113]/8 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] block">Patta / Khata Holder</span>
                <span className="text-xs font-bold text-[#022113] block font-['Montserrat',sans-serif]">{govPlotResult.tenure.owner_name}</span>
                <span className="text-[11px] text-[#4A5568] block">Khata #{govPlotResult.tenure.khata_number} • {govPlotResult.tenure.land_classification}</span>
                <span className="text-[10px] text-[#59701E] font-semibold block">Status: {govPlotResult.tenure.tenure_type}</span>
              </div>

              {/* Geospatial Extent */}
              <div className="p-5 rounded-[2rem] bg-white border border-[#022113]/8 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] block">Cadastral Boundary Extent</span>
                <span className="text-xs font-bold text-[#022113] font-['Montserrat',sans-serif] block">
                  {govPlotResult.geospatial.area_hectares} ha ({govPlotResult.geospatial.area_acres} Acres)
                </span>
                <span className="text-[11px] text-[#4A5568] block">
                  Centroid: {govPlotResult.geospatial.centroid.latitude}°N, {govPlotResult.geospatial.centroid.longitude}°E
                </span>
                <span className="text-[10px] text-[#718096] block">
                  Boundary Vertices: {govPlotResult.geospatial.boundary_polygon?.length || 5} points plotted
                </span>
              </div>

              {/* Digital Crop Survey (DCS) */}
              <div className="p-5 rounded-[2rem] bg-white border border-[#022113]/8 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] block">Digital Crop Survey</span>
                <span className="text-xs font-bold text-[#022113] block font-['Montserrat',sans-serif]">
                  {govPlotResult.digital_crop_survey.sown_crop} ({govPlotResult.digital_crop_survey.crop_variety})
                </span>
                <span className="text-[11px] text-[#4A5568] block">
                  Season: {govPlotResult.digital_crop_survey.season} • Sown: {govPlotResult.digital_crop_survey.sowing_date}
                </span>
                <span className="text-[10px] text-[#59701E] font-semibold block">
                  Status: {govPlotResult.digital_crop_survey.verification_status}
                </span>
              </div>

              {/* Soil Health Card Certified Values */}
              <div className="p-5 rounded-[2rem] bg-white border border-[#022113]/8 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] block">Soil Health Card Portal</span>
                <span className="text-xs font-bold text-[#022113] block font-['Montserrat',sans-serif]">
                  {govPlotResult.soil_health_card.soil_type} (pH {govPlotResult.soil_health_card.ph})
                </span>
                <span className="text-[11px] text-[#4A5568] block">
                  N: {govPlotResult.soil_health_card.nitrogen_kg_ha} • P: {govPlotResult.soil_health_card.phosphorus_kg_ha} • K: {govPlotResult.soil_health_card.potassium_kg_ha}
                </span>
                <span className="text-[10px] text-[#718096] block">
                  Card No: {govPlotResult.soil_health_card.sample_id}
                </span>
              </div>
            </div>

            {/* Cadastre Action Ribbon */}
            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[#59701E] border-t border-[#022113]/8 gap-2">
              <span className="flex items-center gap-1.5 text-[#59701E] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Boundary Polygon plotted on Google Maps & Google Earth</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('earth3d')}
                  className="text-xs text-[#022113] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Globe2 className="w-3 h-3" strokeWidth={2} />
                  <span>Inspect in Google Earth 3D →</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Digital Cadastre: Registered Farm Plots */}
      <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#022113]/8">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#F0F2EB] text-[#59701E] border border-[#022113]/8">
              <Compass className="w-5 h-5 text-[#59701E]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
                Digital Cadastre • My Registered Farm Plots
              </h3>
              <p className="text-xs text-[#4A5568] font-normal">
                Geo-referenced parcels monitored via Sentinel-2 automated surface reflectance passes. Click &apos;Focus Map&apos; to target a specific field survey.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-['Montserrat',sans-serif] bg-[#F0F2EB] text-[#59701E] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
              {fields.length} Parcels Active
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#DFEB38] text-[#022113] hover:bg-[#d0df2a] text-xs font-bold font-['Montserrat',sans-serif] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Register New Plot</span>
            </button>
          </div>
        </div>

        {fieldsLoading ? (
          <div className="py-8 text-center text-xs font-mono text-[#59701E]">Loading registered parcels...</div>
        ) : fields.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#59701E]">No farm plots registered yet. Click &apos;Register New Plot&apos; to link a cadastre survey.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {fields.map((f) => {
              const isTargetActive = focusedField?.field_id === f.field_id;
              return (
                <div 
                  key={f.field_id}
                  className={`bg-[#F0F2EB] border transition-all rounded-[2.2rem] p-6 space-y-3 relative group shadow-sm hover:shadow-md ${
                    isTargetActive ? 'border-[#59701E] ring-2 ring-[#DFEB38]/50 shadow-md' : 'border-[#022113]/8 hover:border-[#59701E]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-[#022113] font-['Montserrat',sans-serif]">{f.field_name}</h4>
                        {isTargetActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-['Montserrat',sans-serif] uppercase bg-[#DFEB38] text-[#022113]">
                            Active Pin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#59701E] flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-[#59701E]" strokeWidth={2} />
                        {f.district}, {f.state}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteField(f.field_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#718096] hover:text-red-600 transition-all cursor-pointer"
                      title="Delete plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#022113]/8">
                    <div>
                      <span className="text-[#59701E] block text-[10px] font-bold font-['Montserrat',sans-serif] uppercase">Area</span>
                      <span className="font-bold text-[#022113] font-['Montserrat',sans-serif]">{f.area_hectares} ha</span>
                    </div>
                    <div>
                      <span className="text-[#59701E] block text-[10px] font-bold font-['Montserrat',sans-serif] uppercase">Crop / Soil</span>
                      <span className="text-[#022113]">{f.current_crop || 'Mixed'} • {f.soil_type || 'Loamy'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#022113]/8">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[10px] text-[#59701E]">NDVI:</span>
                      <span className="text-xs font-bold text-[#022113]">
                        {typeof f.ndvi_latest === 'number' ? f.ndvi_latest.toFixed(2) : f.ndvi_latest}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DFEB38] text-[#022113] font-bold font-['Montserrat',sans-serif]">
                        {f.ndvi_health || 'Good'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleFocusField(f)}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                        isTargetActive 
                          ? 'bg-[#546C18] text-[#DFEB38]' 
                          : 'bg-white hover:bg-[#DFEB38] text-[#022113] border border-[#022113]/8 shadow-xs'
                      }`}
                    >
                      <Crosshair className="w-3 h-3" strokeWidth={2} />
                      <span>{isTargetActive ? 'Centered' : 'Focus'}</span>
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
        <div className="fixed inset-0 z-50 bg-[#022113]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 max-w-md w-full p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#59701E]" />
                <h3 className="font-bold text-base text-[#022113] font-['Montserrat',sans-serif]">Register Farm Plot</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#F0F2EB] text-[#718096] hover:text-[#022113] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Plot / Cadastre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ballari North Survey #14B"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">State</label>
                  <select
                    value={newFieldState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setNewFieldState(st);
                      const districts = STATE_DISTRICTS[st] || [];
                      setNewFieldDistrict(districts[0] || '');
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                  >
                    {Object.keys(STATE_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">District</label>
                  <select
                    value={newFieldDistrict}
                    onChange={(e) => setNewFieldDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                  >
                    {(STATE_DISTRICTS[newFieldState] || []).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Area (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newFieldArea}
                    onChange={(e) => setNewFieldArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Current Crop</label>
                  <input
                    type="text"
                    value={newFieldCrop}
                    onChange={(e) => setNewFieldCrop(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={newFieldSoil}
                    onChange={(e) => setNewFieldSoil(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] focus:outline-none focus:border-[#59701E]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#022113]/8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-[#022113]/8 text-xs font-bold font-['Montserrat',sans-serif] text-[#718096] hover:bg-[#F0F2EB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] cursor-pointer transition-colors shadow-xs"
                >
                  Save Cadastre Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connected Government APIs Directory Modal */}
      {showGovApisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022113]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 shadow-2xl max-w-3xl w-full p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#F0F2EB] text-[#022113] border border-[#022113]/8">
                  <Landmark className="w-5 h-5 text-[#59701E]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#022113] font-['Montserrat',sans-serif]">
                    Connected Government Agricultural & Cadastral APIs
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Official Indian Government systems integrated for farmer land records, digital crop surveys, and cadastral spatial data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGovApisModal(false)}
                className="p-1.5 text-[#718096] hover:text-[#022113] rounded-full hover:bg-[#F0F2EB] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {(govApisList.length > 0 ? govApisList : [
                {
                  id: "agristack",
                  system_name: "AgriStack (Department of Agriculture & Farmers Welfare)",
                  official_portal: "https://agristack.gov.in",
                  api_endpoint: "https://api.agristack.gov.in/v1/cadastral/village-boundary",
                  auth_type: "OAuth2 / Farmer Consent Manager (UFSI)",
                  description: "Central Digital Public Infrastructure for agriculture. Geo-referenced village cadastral boundary layers, Unified Farmer ID (UFID), and Digital Crop Survey (DCS).",
                  coverage: "National (Pan-India rolled out across states)"
                },
                {
                  id: "isro_bhuvan",
                  system_name: "ISRO Bhuvan Geo-Portal (NRSC / ISRO)",
                  official_portal: "https://bhuvan.nrsc.gov.in",
                  api_endpoint: "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
                  auth_type: "Open OGC WMS/WFS / Free Public API Key",
                  description: "Indian Space Research Organisation open geospatial services. Provides cadastral boundary vector layers, soil texture, land degradation, and water bodies.",
                  coverage: "Pan-India OGC WMS standard spatial overlays"
                },
                {
                  id: "data_gov_soil",
                  system_name: "Open Government Data (OGD) & Soil Health Card",
                  official_portal: "https://soilhealth.dac.gov.in",
                  api_endpoint: "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
                  auth_type: "API Key (Data.gov.in Registered Gateway)",
                  description: "National Soil Health Card Portal providing macronutrient and micronutrient metrics (N, P, K, pH, EC, Organic Carbon) linked to cadastral survey numbers.",
                  coverage: "All agricultural districts across 28 states & 8 UTs"
                },
                {
                  id: "bharat_maps",
                  system_name: "Bharat Maps (National Informatics Centre - NIC)",
                  official_portal: "https://bharatmaps.gov.in",
                  api_endpoint: "https://bharatmaps.gov.in/geoserver/wms",
                  auth_type: "Government NSDI Standards / NIC Open API",
                  description: "Multi-layered GIS platform hosted by NIC containing administrative boundaries, revenue village boundaries, and cadastral survey polygons.",
                  coverage: "National Spatial Data Infrastructure (NSDI)"
                },
                {
                  id: "state_ror_bhoomi",
                  system_name: "State Record of Rights (RoR) Portals (Bhoomi, MahaBhulekh, UP Bhulekh, PLRS)",
                  official_portal: "https://bhoomilims.karnataka.gov.in",
                  api_endpoint: "https://landrecords.karnataka.gov.in/service4/api/survey/geometry",
                  auth_type: "State Land Records Gateway / Dishaank OGC Services",
                  description: "Authoritative state revenue records providing Khata, Hissa, Pahani (RTC), ownership tenure, mutation history, and surveyed parcel boundary coordinates.",
                  coverage: "State specific (Karnataka Bhoomi, Maharashtra MahaBhulekh 7/12, UP Bhulekh, Punjab PLRS)"
                }
              ]).map((api) => (
                <div key={api.id} className="p-5 rounded-[2rem] bg-[#F0F2EB] border border-[#022113]/8 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#59701E]"></span>
                      <h4 className="font-bold text-xs text-[#022113] font-['Montserrat',sans-serif]">{api.system_name}</h4>
                    </div>
                    <a
                      href={api.official_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold font-['Montserrat',sans-serif] text-[#59701E] hover:underline flex items-center gap-1"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-[#4A5568]">{api.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#022113]/8">
                    <div>
                      <span className="text-[#718096] block text-[10px] uppercase font-bold font-['Montserrat',sans-serif]">API Endpoint / Standard</span>
                      <span className="font-mono text-[#022113] break-all">{api.api_endpoint}</span>
                    </div>
                    <div>
                      <span className="text-[#718096] block text-[10px] uppercase font-bold font-['Montserrat',sans-serif]">Authentication / Protocol</span>
                      <span className="font-mono text-[#59701E] font-bold">{api.auth_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end border-t border-[#022113]/8">
              <button
                type="button"
                onClick={() => setShowGovApisModal(false)}
                className="px-5 py-2.5 rounded-full bg-[#DFEB38] text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider hover:bg-[#d0df2a] cursor-pointer shadow-sm"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Earth Engine (GEE) Code Editor Script Modal */}
      {showGeeScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022113]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 shadow-2xl max-w-4xl w-full p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#F0F2EB] text-[#022113] border border-[#022113]/8">
                  <Database className="w-5 h-5 text-[#59701E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#022113] font-['Montserrat',sans-serif]">
                      Google Earth Engine (GEE) API Pipeline Script
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DFEB38] text-[#022113]">
                      @google/earthengine v1.7.45
                    </span>
                  </div>
                  <p className="text-xs text-[#718096]">
                    Official Google Earth Engine JavaScript script configured for <span className="font-bold text-[#022113]">{selectedDistrict}, {selectedState}</span> using Copernicus Sentinel-2 Level-2A (COPERNICUS/S2_SR_HARMONIZED).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGeeScriptModal(false)}
                className="p-1.5 text-[#718096] hover:text-[#022113] rounded-full hover:bg-[#F0F2EB] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-[1.5rem] bg-[#F0F2EB] border border-[#022113]/8">
                <span className="text-[10px] uppercase font-bold text-[#718096] block font-['Montserrat',sans-serif]">Dataset</span>
                <span className="text-xs font-mono font-bold text-[#022113]">COPERNICUS/S2_SR_HARMONIZED</span>
              </div>
              <div className="p-4 rounded-[1.5rem] bg-[#F0F2EB] border border-[#022113]/8">
                <span className="text-[10px] uppercase font-bold text-[#718096] block font-['Montserrat',sans-serif]">Spatial Resolution</span>
                <span className="text-xs font-mono font-bold text-[#022113]">10m GSD (B4 Red & B8 NIR)</span>
              </div>
              <div className="p-4 rounded-[1.5rem] bg-[#F0F2EB] border border-[#022113]/8">
                <span className="text-[10px] uppercase font-bold text-[#718096] block font-['Montserrat',sans-serif]">Official GEE Repo</span>
                <a 
                  href="https://github.com/google/earthengine-api"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-[#59701E] hover:underline flex items-center gap-1 font-['Montserrat',sans-serif]"
                >
                  <span>github.com/google/earthengine-api</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#022113] font-['Montserrat',sans-serif]">Executable GEE Code (Ready to Run)</span>
                <button
                  onClick={() => {
                    if (geeData?.code_editor_script) {
                      navigator.clipboard.writeText(geeData.code_editor_script);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] transition-colors cursor-pointer shadow-xs"
                >
                  Copy Script
                </button>
              </div>

              <pre className="p-5 rounded-[2rem] bg-[#F0F2EB] text-[#022113] font-mono text-[11px] overflow-x-auto max-h-72 border border-[#022113]/10 select-all leading-relaxed">
                {geeData?.code_editor_script || `// Load Copernicus Sentinel-2 MSI Harmonized\nvar point = ee.Geometry.Point([${currentLon.toFixed(5)}, ${currentLat.toFixed(5)}]);\nvar s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')\n  .filterBounds(point)\n  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));\nvar composite = s2.median();\nvar ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');\nMap.centerObject(point, 15);\nMap.addLayer(ndvi, {min: 0, max: 0.8, palette: ['red', 'yellow', 'green']}, 'NDVI');`}
              </pre>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between border-t border-[#022113]/8 gap-2">
              <span className="text-xs text-[#022113]/70 font-['Open_Sans',sans-serif]">
                You can paste this script directly into the Google Earth Engine Code Editor.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://code.earthengine.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#546C18] hover:bg-[#435713] text-white text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Open in Earth Engine Code Editor</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#DFEB38]" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowGeeScriptModal(false)}
                  className="px-4 py-2.5 rounded-full border border-[#022113]/8 text-[#718096] text-xs font-bold font-['Montserrat',sans-serif] hover:bg-[#F0F2EB] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
