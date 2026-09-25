import React, { useState, useEffect } from 'react';
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
  Sprout
} from 'lucide-react';

interface SatellitePageProps {
  language?: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const SatellitePage: React.FC<SatellitePageProps> = ({ onNavigate }) => {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('Ballari');
  const [loading, setLoading] = useState(false);
  const [ndviData, setNdviData] = useState<NDVIResult | null>(null);
  const [viewMode, setViewMode] = useState<'ndvi' | 'rgb' | 'stress'>('ndvi');

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
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_name: newFieldName,
          state: newFieldState,
          district: newFieldDistrict,
          area_hectares: Number(newFieldArea) || 1.0,
          current_crop: newFieldCrop,
          soil_type: newFieldSoil
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewFieldName('');
        setShowAddModal(false);
        fetchFields();
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
        fetchFields();
      }
    } catch (err) {
      console.error('Failed to delete field', err);
    }
  };

  const states = [
    { name: 'Karnataka', district: 'Ballari', lat: 15.14, lon: 76.92 },
    { name: 'Maharashtra', district: 'Nashik', lat: 19.99, lon: 73.79 },
    { name: 'Punjab', district: 'Ludhiana', lat: 30.90, lon: 75.85 },
    { name: 'Tamil Nadu', district: 'Thanjavur', lat: 10.78, lon: 79.13 },
    { name: 'Andhra Pradesh', district: 'Guntur', lat: 16.30, lon: 80.44 },
    { name: 'Gujarat', district: 'Rajkot', lat: 22.30, lon: 70.80 },
    { name: 'Madhya Pradesh', district: 'Indore', lat: 22.71, lon: 75.85 },
    { name: 'Uttar Pradesh', district: 'Agra', lat: 27.17, lon: 78.00 }
  ];

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
    const found = states.find(s => s.name === st);
    if (found) {
      setSelectedState(found.name);
      setSelectedDistrict(found.district);
    }
  };

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
            Continuous Normalized Difference Vegetation Index tracking across farm plots. Monitor photosynthetic vigor, early nitrogen deficiency, and crop canopies.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🛰️
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-xs font-extrabold uppercase text-[#123826]">Region:</span>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
          >
            {states.map(s => (
              <option key={s.name} value={s.name}>{s.name} ({s.district})</option>
            ))}
          </select>
        </div>

        {/* Spectral View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-[#F4F8F5] p-1 rounded-xl border border-[#E2ECE3]">
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
            True Color (RGB)
          </button>
          <button
            onClick={() => setViewMode('stress')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'stress' ? 'bg-[#123826] text-white shadow-xs' : 'text-stone-600 hover:text-[#123826]'
            }`}
          >
            Stress Map
          </button>
        </div>

        <button
          onClick={() => fetchNDVI(selectedState, selectedDistrict)}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#CCE0D0] text-[#123826] hover:bg-[#F7FBF8] transition-colors cursor-pointer"
          title="Refresh satellite pass"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Geospatial Display & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Satellite Imagery Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                Sentinel-2 Surface Reflectance Composite
              </h3>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Coordinates: {states.find(s => s.name === selectedState)?.lat}°N, {states.find(s => s.name === selectedState)?.lon}°E
            </span>
          </div>

          {/* Graphical Satellite Simulation Map */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#CCE0D0] bg-[#1a2f23] flex items-center justify-center shadow-inner">
            {/* SVG Visual Simulated Farm Polygons */}
            <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ndviGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#4CAF50" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#8BC34A" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="stressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.7" />
                </linearGradient>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Field Boundaries with realistic NDVI Colors */}
              {viewMode === 'ndvi' && (
                <>
                  <polygon points="50,60 280,40 310,210 80,240" fill="url(#ndviGrad)" stroke="#A5D6A7" strokeWidth="2" />
                  <polygon points="320,40 560,70 530,230 300,200" fill="#2E7D32" fillOpacity="0.85" stroke="#A5D6A7" strokeWidth="2" />
                  <polygon points="580,80 750,90 730,260 550,240" fill="#4CAF50" fillOpacity="0.7" stroke="#A5D6A7" strokeWidth="2" />
                  <polygon points="90,260 310,230 290,440 60,420" fill="#8BC34A" fillOpacity="0.75" stroke="#A5D6A7" strokeWidth="2" />
                  <polygon points="330,220 540,250 510,460 300,430" fill="#2E7D32" fillOpacity="0.9" stroke="#A5D6A7" strokeWidth="2" />
                  <polygon points="560,260 740,280 710,470 530,450" fill="#E8A238" fillOpacity="0.6" stroke="#FFE0A3" strokeWidth="2" />
                </>
              )}

              {viewMode === 'rgb' && (
                <>
                  <polygon points="50,60 280,40 310,210 80,240" fill="#3A5F2D" stroke="#688F5A" strokeWidth="2" />
                  <polygon points="320,40 560,70 530,230 300,200" fill="#2D4D22" stroke="#688F5A" strokeWidth="2" />
                  <polygon points="580,80 750,90 730,260 550,240" fill="#4E7037" stroke="#688F5A" strokeWidth="2" />
                  <polygon points="90,260 310,230 290,440 60,420" fill="#5A7D42" stroke="#688F5A" strokeWidth="2" />
                  <polygon points="330,220 540,250 510,460 300,430" fill="#2B4720" stroke="#688F5A" strokeWidth="2" />
                  <polygon points="560,260 740,280 710,470 530,450" fill="#827B49" stroke="#A89E68" strokeWidth="2" />
                </>
              )}

              {viewMode === 'stress' && (
                <>
                  <polygon points="50,60 280,40 310,210 80,240" fill="#10B981" fillOpacity="0.5" stroke="#34D399" strokeWidth="2" />
                  <polygon points="320,40 560,70 530,230 300,200" fill="#10B981" fillOpacity="0.6" stroke="#34D399" strokeWidth="2" />
                  <polygon points="580,80 750,90 730,260 550,240" fill="#F59E0B" fillOpacity="0.7" stroke="#FBBF24" strokeWidth="2" />
                  <polygon points="90,260 310,230 290,440 60,420" fill="#10B981" fillOpacity="0.5" stroke="#34D399" strokeWidth="2" />
                  <polygon points="330,220 540,250 510,460 300,430" fill="#10B981" fillOpacity="0.8" stroke="#34D399" strokeWidth="2" />
                  <polygon points="560,260 740,280 710,470 530,450" fill="url(#stressGrad)" stroke="#F87171" strokeWidth="2" />
                </>
              )}

              {/* Distance Rings & Target Crosshair */}
              <circle cx="420" cy="235" r="45" fill="none" stroke="rgba(232, 162, 56, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="420" cy="235" r="90" fill="none" stroke="rgba(232, 162, 56, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="410" y1="235" x2="430" y2="235" stroke="#E8A238" strokeWidth="2" />
              <line x1="420" y1="225" x2="420" y2="245" stroke="#E8A238" strokeWidth="2" />

              {/* Pin Centroid */}
              <circle cx="420" cy="235" r="6" fill="#E8A238" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="432" y="222" width="130" height="24" rx="6" fill="rgba(18, 56, 38, 0.85)" stroke="#CCE0D0" strokeWidth="1" />
              <text x="440" y="238" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">Plot #204 (2.0 ha)</text>

              {/* Scale Bar */}
              <line x1="30" y1="465" x2="130" y2="465" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="30" y1="460" x2="30" y2="470" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="130" y1="460" x2="130" y2="470" stroke="#FFFFFF" strokeWidth="2" />
              <text x="45" y="458" fill="#FFFFFF" fontSize="10" fontFamily="monospace">250 METERS</text>
            </svg>

            {/* Inset HUD Overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] p-2.5 rounded-xl border border-white/10 space-y-1">
              <div>Region: <span className="font-bold text-[#A5D6A7]">{selectedDistrict}, {selectedState}</span></div>
              <div>Cloud Coverage: <span className="font-mono text-emerald-300">{ndviData?.cloud_coverage_pct || 4}%</span></div>
              <div>Ground Resolution: <span className="font-mono">10m / Pixel</span></div>
            </div>

            {/* Legend Inset */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-[#CCE0D0] text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">NDVI Color Index</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-3 h-3 rounded-full bg-[#2E7D32]" />
                <span>0.6 - 1.0 (Dense/Excellent)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-3 h-3 rounded-full bg-[#8BC34A]" />
                <span>0.4 - 0.6 (Moderate/Healthy)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-3 h-3 rounded-full bg-[#E8A238]" />
                <span>0.2 - 0.4 (Sparse/Stressed)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
            <span>Sensor: Multispectral Instrument (MSI) Sentinel-2A/B</span>
            <button
              onClick={() => onNavigate('advisory')}
              className="text-xs font-bold text-[#2E7D32] hover:underline"
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
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#123826]">
              Sub-Plot Zonation Breakdown
            </h4>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>High Photosynthetic Vigor</span>
                  <span className="font-mono text-[#2E7D32] font-bold">68% (1.36 ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#2E7D32] w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Moderate Canopy / Emerging</span>
                  <span className="font-mono text-lime-700 font-bold">22% (0.44 ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#8BC34A] w-[22%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Moisture / Nutrient Deficiency Zone</span>
                  <span className="font-mono text-amber-700 font-bold">10% (0.20 ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#E8A238] w-[10%]" />
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
                  ndviData.timeseries.map((pt, i) => {
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
                points={ndviData.timeseries.map((pt, i) => {
                  const x = (i / (ndviData.timeseries.length - 1)) * 600;
                  const y = 140 - (pt.ndvi * 120);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#2E7D32"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {ndviData.timeseries.map((pt, i) => {
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
                Geo-referenced parcels monitored via Sentinel-2 automated surface reflectance passes.
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
            {fields.map((f) => (
              <div 
                key={f.field_id}
                className="bg-[#FBFDF9] border border-[#CCE0D0] hover:border-[#2E7D32] transition-all rounded-2xl p-4 space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#123826]">{f.field_name}</h4>
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
                    onClick={() => {
                      setSelectedState(f.state);
                      setSelectedDistrict(f.district);
                      fetchNDVI(f.state, f.district);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#EBF5ED] hover:bg-[#D4EAD9] text-[#123826] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Focus Map</span>
                  </button>
                </div>
              </div>
            ))}
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
                      setNewFieldState(e.target.value);
                      const found = states.find(s => s.name === e.target.value);
                      if (found) setNewFieldDistrict(found.district);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  >
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newFieldDistrict}
                    onChange={(e) => setNewFieldDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CCE0D0] focus:outline-none focus:border-[#2E7D32]"
                  />
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
