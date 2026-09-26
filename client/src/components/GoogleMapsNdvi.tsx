import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Globe2, 
  MapPin, 
  Crosshair, 
  Check, 
  ExternalLink,
  Satellite,
  Edit3,
  RotateCcw,
  Move,
  CheckCircle2
} from 'lucide-react';

export interface GoogleMapsNdviProps {
  lat: number;
  lon: number;
  state: string;
  district: string;
  ndviScore: number;
  cloudCoverage?: number;
  viewMode: 'ndvi' | 'rgb' | 'stress' | 'hybrid' | 'earth3d';
  onViewModeChange: (mode: 'ndvi' | 'rgb' | 'stress' | 'hybrid' | 'earth3d') => void;
  focusedField?: {
    field_id: string;
    field_name: string;
    area_hectares: number;
    current_crop: string;
    soil_type: string;
    ndvi_latest?: number;
    boundary_coords?: { lat: number; lng: number }[];
  } | null;
  areaHectares?: number;
  customGovPolygon?: { lat: number; lng: number }[] | null;
  govPlotRecord?: {
    agristack_plot_id?: string;
    survey_number?: string;
    tenure_type?: string;
    verified_crop?: string;
  } | null;
  onPolygonAdjust?: (coords: { lat: number; lng: number }[], areaHa: number) => void;
}

export function computeGeodesicPolygonArea(coords: { lat: number; lng?: number; lon?: number }[]): { sqMeters: number; hectares: number; acres: number } {
  if (!coords || coords.length < 3) {
    return { sqMeters: 0, hectares: 0, acres: 0 };
  }
  const cleanCoords = coords.map(c => ({ lat: c.lat, lng: c.lng ?? c.lon ?? 0 }));

  const R = 6378137;
  const centroidLat = cleanCoords.reduce((acc, c) => acc + c.lat, 0) / cleanCoords.length;
  const latRad = (centroidLat * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  const metersCoords = cleanCoords.map(c => ({
    x: (c.lng * Math.PI / 180) * R * cosLat,
    y: (c.lat * Math.PI / 180) * R
  }));

  let area = 0;
  for (let i = 0; i < metersCoords.length; i++) {
    const j = (i + 1) % metersCoords.length;
    area += metersCoords[i].x * metersCoords[j].y;
    area -= metersCoords[j].x * metersCoords[i].y;
  }
  const sqMeters = Math.abs(area) / 2;
  const hectares = Math.round((sqMeters / 10000) * 100) / 100;
  const acres = Math.round(hectares * 2.47105 * 100) / 100;
  return { sqMeters: Math.round(sqMeters), hectares: Math.max(0.01, hectares), acres: Math.max(0.02, acres) };
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function EarthEngineNdviLayer({ lat, lon, enabled }: { lat: number; lon: number; enabled: boolean }) {
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!enabled) { setTileUrl(null); return; }
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/earthengine/ndvi-tiles?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.tileUrl) {
          setTileUrl(data.tileUrl);
        }
      })
      .catch(() => {});
  }, [lat, lon, enabled]);
  
  if (!tileUrl) return null;
  return <TileLayer url={tileUrl} opacity={0.7} />;
}

export const GoogleMapsNdvi: React.FC<GoogleMapsNdviProps> = ({
  lat,
  lon,
  state,
  district,
  ndviScore,
  cloudCoverage = 4,
  viewMode,
  onViewModeChange,
  focusedField,
  areaHectares = 2.5,
  customGovPolygon,
  govPlotRecord,
  onPolygonAdjust
}) => {
  const [isEditingPolygon, setIsEditingPolygon] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const mapRef = useRef<L.Map>(null);

  const defaultTargetCoords = useMemo(() => {
    if (customGovPolygon && customGovPolygon.length >= 3) {
      return customGovPolygon;
    }
    if (focusedField?.boundary_coords && focusedField.boundary_coords.length >= 3) {
      return focusedField.boundary_coords;
    }
    const latSpan = Math.max(0.0012, Math.sqrt((areaHectares * 10000) / 111000000) * 1.1);
    const lonSpan = Math.max(0.0015, Math.sqrt((areaHectares * 10000) / 100000000) * 1.2);
    return [
      { lat: lat - latSpan * 0.6, lng: lon - lonSpan * 0.7 },
      { lat: lat + latSpan * 0.6, lng: lon - lonSpan * 0.6 },
      { lat: lat + latSpan * 0.7, lng: lon + lonSpan * 0.7 },
      { lat: lat - latSpan * 0.5, lng: lon + lonSpan * 0.6 },
    ];
  }, [lat, lon, areaHectares, customGovPolygon, focusedField]);

  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }[]>(defaultTargetCoords);
  const [currentAreaHa, setCurrentAreaHa] = useState<number>(areaHectares);

  useEffect(() => {
    setActiveCoords(defaultTargetCoords);
    const metrics = computeGeodesicPolygonArea(defaultTargetCoords);
    setCurrentAreaHa(metrics.hectares || areaHectares);
    setIsEditingPolygon(false);
  }, [defaultTargetCoords]);

  const parcelGeometries = useMemo(() => {
    const latSpan = Math.max(0.0012, Math.sqrt((areaHectares * 10000) / 111000000) * 1.1);
    const lonSpan = Math.max(0.0015, Math.sqrt((areaHectares * 10000) / 100000000) * 1.2);

    return [
      {
        id: 'P-101', name: `${district} West Plot 1`, crop: 'Paddy', area: 1.8,
        ndvi: Math.min(0.85, Math.max(0.35, ndviScore + 0.08)),
        coords: [
          { lat: lat + latSpan * 0.4, lng: lon - lonSpan * 1.8 },
          { lat: lat + latSpan * 1.6, lng: lon - lonSpan * 1.7 },
          { lat: lat + latSpan * 1.4, lng: lon - lonSpan * 0.4 },
          { lat: lat + latSpan * 0.2, lng: lon - lonSpan * 0.5 },
        ]
      },
      {
        id: 'P-102', name: `${district} North Ridge`, crop: 'Maize', area: 2.2,
        ndvi: Math.min(0.85, Math.max(0.30, ndviScore - 0.06)),
        coords: [
          { lat: lat + latSpan * 0.3, lng: lon + lonSpan * 0.3 },
          { lat: lat + latSpan * 1.5, lng: lon + lonSpan * 0.4 },
          { lat: lat + latSpan * 1.4, lng: lon + lonSpan * 1.8 },
          { lat: lat + latSpan * 0.2, lng: lon + lonSpan * 1.7 },
        ]
      },
      {
        id: 'P-103', name: `${district} Canal Side Plot`, crop: 'Chickpea', area: 1.5,
        ndvi: Math.min(0.85, Math.max(0.32, ndviScore - 0.12)),
        coords: [
          { lat: lat - latSpan * 1.6, lng: lon - lonSpan * 1.7 },
          { lat: lat - latSpan * 0.3, lng: lon - lonSpan * 1.6 },
          { lat: lat - latSpan * 0.4, lng: lon - lonSpan * 0.3 },
          { lat: lat - latSpan * 1.7, lng: lon - lonSpan * 0.4 },
        ]
      },
      {
        id: 'P-TARGET',
        name: focusedField ? focusedField.field_name : `${district} Survey Field (Plot #${Math.abs(Math.round(lat * 100 + lon * 10)) % 800 + 100})`,
        crop: focusedField ? focusedField.current_crop : 'Tomato',
        area: currentAreaHa,
        ndvi: ndviScore,
        isTarget: true,
        coords: activeCoords
      },
      {
        id: 'P-105', name: `${district} South Orchard`, crop: 'Sunflower', area: 2.7,
        ndvi: Math.min(0.85, Math.max(0.28, ndviScore + 0.04)),
        coords: [
          { lat: lat - latSpan * 1.5, lng: lon + lonSpan * 0.3 },
          { lat: lat - latSpan * 0.3, lng: lon + lonSpan * 0.4 },
          { lat: lat - latSpan * 0.4, lng: lon + lonSpan * 1.7 },
          { lat: lat - latSpan * 1.6, lng: lon + lonSpan * 1.6 },
        ]
      }
    ];
  }, [lat, lon, district, ndviScore, areaHectares, focusedField, currentAreaHa, activeCoords]);

  const getParcelStyle = (parcelNdvi: number, isTarget: boolean) => {
    if (viewMode === 'rgb') {
      return {
        fillColor: '#FFFFFF',
        fillOpacity: 0.05,
        strokeColor: isTarget ? '#FDE047' : '#FFFFFF',
        strokeWeight: isTarget ? 3.5 : 1.5,
        strokeOpacity: 0.95
      };
    }

    if (viewMode === 'stress') {
      if (parcelNdvi < 0.40) {
        return { fillColor: '#DC2626', fillOpacity: 0.65, strokeColor: '#EF4444', strokeWeight: isTarget ? 3.5 : 1.5, strokeOpacity: 0.9 };
      } else if (parcelNdvi < 0.55) {
        return { fillColor: '#F59E0B', fillOpacity: 0.60, strokeColor: '#FBBF24', strokeWeight: isTarget ? 3.5 : 1.5, strokeOpacity: 0.9 };
      } else {
        return { fillColor: '#10B981', fillOpacity: 0.45, strokeColor: '#34D399', strokeWeight: isTarget ? 3.5 : 1.5, strokeOpacity: 0.9 };
      }
    }

    if (parcelNdvi >= 0.60) {
      return { fillColor: '#1B5E20', fillOpacity: 0.60, strokeColor: isTarget ? '#FDE047' : '#81C784', strokeWeight: isTarget ? 3.5 : 2, strokeOpacity: 1 };
    } else if (parcelNdvi >= 0.45) {
      return { fillColor: '#4CAF50', fillOpacity: 0.55, strokeColor: isTarget ? '#FDE047' : '#A5D6A7', strokeWeight: isTarget ? 3.5 : 2, strokeOpacity: 1 };
    } else if (parcelNdvi >= 0.35) {
      return { fillColor: '#E8A238', fillOpacity: 0.60, strokeColor: isTarget ? '#FDE047' : '#FCD34D', strokeWeight: isTarget ? 3.5 : 2, strokeOpacity: 1 };
    } else {
      return { fillColor: '#DC2626', fillOpacity: 0.65, strokeColor: isTarget ? '#FDE047' : '#F87171', strokeWeight: isTarget ? 3.5 : 2, strokeOpacity: 1 };
    }
  };

  const scaleBoundary = useCallback((factor: number) => {
    if (activeCoords.length < 3) return;
    const centerLat = activeCoords.reduce((sum, c) => sum + c.lat, 0) / activeCoords.length;
    const centerLng = activeCoords.reduce((sum, c) => sum + c.lng, 0) / activeCoords.length;
    const newCoords = activeCoords.map(c => ({
      lat: centerLat + (c.lat - centerLat) * factor,
      lng: centerLng + (c.lng - centerLng) * factor
    }));
    setActiveCoords(newCoords);
    const metrics = computeGeodesicPolygonArea(newCoords);
    setCurrentAreaHa(metrics.hectares);
  }, [activeCoords]);

  const rotateBoundary = useCallback((degrees: number) => {
    if (activeCoords.length < 3) return;
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const centerLat = activeCoords.reduce((sum, c) => sum + c.lat, 0) / activeCoords.length;
    const centerLng = activeCoords.reduce((sum, c) => sum + c.lng, 0) / activeCoords.length;
    const newCoords = activeCoords.map(c => {
      const dLat = c.lat - centerLat;
      const dLng = c.lng - centerLng;
      return {
        lat: centerLat + (dLat * cos - dLng * sin),
        lng: centerLng + (dLat * sin + dLng * cos)
      };
    });
    setActiveCoords(newCoords);
    const metrics = computeGeodesicPolygonArea(newCoords);
    setCurrentAreaHa(metrics.hectares);
  }, [activeCoords]);

  const resetBoundary = useCallback(() => {
    setActiveCoords(defaultTargetCoords);
    const metrics = computeGeodesicPolygonArea(defaultTargetCoords);
    setCurrentAreaHa(metrics.hectares || areaHectares);
  }, [defaultTargetCoords, areaHectares]);

  const saveBoundary = useCallback(() => {
    setIsEditingPolygon(false);
    if (onPolygonAdjust) {
      onPolygonAdjust(activeCoords, currentAreaHa);
    }
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 4000);
  }, [activeCoords, currentAreaHa, onPolygonAdjust]);

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 16, { animate: true });
    }
  };

  const showEeNdvi = viewMode === 'ndvi' || viewMode === 'hybrid';
  const mapKey = `leaflet_map_${viewMode}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#08080A] shadow-inner">
      <style>{`.leaflet-container { background: #08080A !important; z-index: 1; }`}</style>
      
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#0F0F12]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-white/[0.08] shadow-xl pointer-events-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#546C18]/20 text-[#DFEB38] flex items-center justify-center shrink-0 border border-[#546C18]/40">
              <MapPin className="w-3.5 h-3.5 text-[#DFEB38]" />
            </div>
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1.5 leading-none">
                <span>{focusedField ? focusedField.field_name : `${district}, ${state}`}</span>
                {govPlotRecord && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Cadastre #{govPlotRecord.survey_number || '142/2A'}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                <span>{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</span>
                <span>•</span>
                <span className="text-[#FDE047] font-bold">{currentAreaHa} ha ({(currentAreaHa * 2.471).toFixed(2)} ac)</span>
                <span>•</span>
                <span className="text-emerald-400">Cloud: {cloudCoverage}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditingPolygon(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isEditingPolygon
                  ? 'bg-[#546C18] text-white ring-2 ring-[#546C18]/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title={isEditingPolygon ? 'Finish polygon editing' : 'Adjust Field Boundary Polygon'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingPolygon ? 'Editing Boundary' : 'Adjust Boundary'}</span>
              {isEditingPolygon && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={recenterMap}
              className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Recenter Map on Field"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <a
              href={`https://www.google.com/maps/@${lat},${lon},16z/data=!3m1!1e3`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-md"
              title="Open in Google Earth / Full Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {isEditingPolygon && (
          <div className="bg-[#123826]/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl border border-[#FDE047]/40 shadow-2xl pointer-events-auto flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FDE047] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5" />
                <span>Adjusting Boundary:</span>
              </span>
              <span className="text-xs font-mono font-extrabold bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 text-emerald-300">
                {currentAreaHa} ha / {(currentAreaHa * 2.471).toFixed(2)} acres
              </span>
              <span className="text-[11px] text-stone-300 hidden md:inline">
                (Use quick controls to adjust boundary)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scaleBoundary(0.95)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer transition-colors"
                title="Shrink Boundary by 5%"
              >
                -5% Size
              </button>
              <button
                type="button"
                onClick={() => scaleBoundary(1.05)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer transition-colors"
                title="Expand Boundary by 5%"
              >
                +5% Size
              </button>
              <button
                type="button"
                onClick={() => rotateBoundary(15)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer transition-colors"
                title="Rotate Boundary 15° clockwise"
              >
                ↺ 15°
              </button>
              <button
                type="button"
                onClick={resetBoundary}
                className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                title="Reset to original boundary"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={saveBoundary}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md transition-colors flex items-center gap-1"
                title="Save Adjusted Boundary"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {showSaveToast && (
          <div className="bg-emerald-700/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-emerald-400/50 shadow-xl pointer-events-auto flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Field boundary updated: {currentAreaHa} ha ({(currentAreaHa * 2.471).toFixed(2)} acres) saved successfully.</span>
          </div>
        )}
      </div>

      <div className="relative w-full h-[400px] sm:h-[480px]">
        {viewMode === 'earth3d' ? (
          <div className="relative w-full h-full bg-[#08080A] overflow-hidden">
            <iframe
              key={`earth3d_${lat.toFixed(4)}_${lon.toFixed(4)}_${district}_${state}`}
              title={`Google Earth 3D - ${district}, ${state}`}
              src={`https://earth.google.com/web/@${lat.toFixed(6)},${lon.toFixed(6)},450a,1200d,35y,45h,60t,0r`}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
            />
            <div className="absolute top-16 right-3 bg-[#0F0F12]/90 backdrop-blur-md text-white text-[11px] p-3 rounded-xl border border-white/[0.08] shadow-xl space-y-1.5 pointer-events-auto max-w-xs z-[1000]">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                <span>Google Earth 3D Topography</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Camera: 450m AMSL • 60° Oblique Perspective
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Dataset: COPERNICUS/S2_SR_HARMONIZED
              </div>
              <div className="pt-1 flex gap-2">
                <a
                  href={`https://earth.google.com/web/@${lat.toFixed(6)},${lon.toFixed(6)},500a,800d,35y,0h,45t,0r`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded text-[10px] font-medium flex items-center gap-1 transition-colors border border-white/[0.08]"
                >
                  <span>Open Full 3D</span>
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                </a>
                <a
                  href={`https://code.earthengine.google.com/?scriptPath=users/google/earthengine-api:templates/landsat`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 rounded text-[10px] font-medium flex items-center gap-1 transition-colors border border-white/[0.08]"
                >
                  <span>GEE Catalog</span>
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <MapContainer
            key={mapKey}
            center={[lat, lon]}
            zoom={16}
            ref={mapRef}
            className="w-full h-full"
            zoomControl={true}
            attributionControl={false}
          >
            <MapController center={[lat, lon]} zoom={16} />
            
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            
            {viewMode === 'hybrid' && (
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
            )}
            
            <EarthEngineNdviLayer lat={lat} lon={lon} enabled={showEeNdvi} />

            {customGovPolygon && customGovPolygon.length >= 3 && (
              <Polygon
                positions={customGovPolygon.map(c => [c.lat, c.lng])}
                pathOptions={{ color: '#FDE047', weight: 4, opacity: 1, fillColor: '#1B5E20', fillOpacity: 0.65 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'monospace, sans-serif', padding: '8px', maxWidth: '250px', background: '#0F0F12', color: '#F4F4F5', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#34D399', letterSpacing: '-0.01em' }}>Official Cadastre Plot</div>
                    <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '3px' }}>AgriStack ID: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{govPlotRecord?.agristack_plot_id || 'IN-AGRI-PLOT'}</span></div>
                    <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '3px' }}>Survey No: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{govPlotRecord?.survey_number || '142/2A'}</span></div>
                    <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '3px' }}>Tenure: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{govPlotRecord?.tenure_type || 'Certified Patta'}</span></div>
                    <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '4px' }}>DCS Crop: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{govPlotRecord?.verified_crop || 'Verified Crop'}</span></div>
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      ISRO Bhuvan & State RoR Validated
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )}

            {parcelGeometries.map(parcel => {
              const isTarget = !!parcel.isTarget;
              const style = getParcelStyle(parcel.ndvi, isTarget);
              const coords = isTarget ? activeCoords : parcel.coords;
              const positions: [number, number][] = coords.map(c => [c.lat, c.lng]);
              
              return (
                <Polygon
                  key={parcel.id}
                  positions={positions}
                  pathOptions={{
                    color: isTarget ? (isEditingPolygon ? '#FDE047' : '#FDE047') : style.strokeColor,
                    weight: isTarget ? (isEditingPolygon ? 4.5 : 3.5) : style.strokeWeight,
                    opacity: isTarget ? 1 : style.strokeOpacity,
                    fillColor: isTarget ? (isEditingPolygon ? '#FACC15' : style.fillColor) : style.fillColor,
                    fillOpacity: isTarget ? (isEditingPolygon ? 0.35 : style.fillOpacity) : style.fillOpacity,
                    dashArray: isTarget && isEditingPolygon ? '8 4' : undefined
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'monospace, sans-serif', padding: '8px', maxWidth: '240px', background: '#0F0F12', color: '#F4F4F5', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>{parcel.name}</div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '3px' }}>Crop: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{parcel.crop}</span> ({parcel.area} ha)</div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '4px' }}>Sentinel-2 NDVI: <span style={{ fontWeight: 700, color: parcel.ndvi >= 0.6 ? '#34D399' : parcel.ndvi >= 0.4 ? '#FBBF24' : '#F87171' }}>{parcel.ndvi.toFixed(3)}</span></div>
                      <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', background: parcel.ndvi >= 0.6 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: parcel.ndvi >= 0.6 ? '#34D399' : '#FBBF24', border: `1px solid ${parcel.ndvi >= 0.6 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {parcel.ndvi >= 0.6 ? 'Optimal Canopy Vigor' : parcel.ndvi >= 0.4 ? 'Moderate Canopy Vigor' : 'Moisture Deficit'}
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
            
            <CircleMarker center={[lat, lon]} radius={6}
              pathOptions={{ fillColor: '#FDE047', fillOpacity: 1, color: '#123826', weight: 2.5 }}
            />
          </MapContainer>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        <div className="bg-[#0F0F12]/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-white/[0.08] text-[11px] text-zinc-300 font-medium shadow-lg pointer-events-auto flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/[0.08]">
            <Satellite className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span className="hidden sm:inline font-mono uppercase text-xs tracking-wider text-zinc-400">Satellite</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap font-mono text-xs">
            <button
              onClick={() => onViewModeChange('ndvi')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === 'ndvi' ? 'bg-white/10 text-white border border-white/[0.15]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              NDVI
            </button>
            <button
              onClick={() => onViewModeChange('rgb')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === 'rgb' ? 'bg-white/10 text-white border border-white/[0.15]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              RGB Earth
            </button>
            <button
              onClick={() => onViewModeChange('stress')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === 'stress' ? 'bg-white/10 text-white border border-white/[0.15]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Stress
            </button>
            <button
              onClick={() => onViewModeChange('hybrid')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === 'hybrid' ? 'bg-white/10 text-white border border-white/[0.15]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => onViewModeChange('earth3d')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 ${
                viewMode === 'earth3d' ? 'bg-white/10 text-white border border-white/[0.15]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Globe2 className="w-3 h-3 text-blue-400" strokeWidth={1.5} />
              <span>Earth 3D</span>
            </button>
          </div>
        </div>

        <div className="bg-[#0F0F12]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/[0.08] text-xs shadow-lg pointer-events-auto space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>NDVI Scale</span>
            <span className="text-emerald-400 font-mono font-bold">Field: {ndviScore.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
              <span>&lt;0.3</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400 ml-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A238]"></span>
              <span>0.3-0.5</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400 ml-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></span>
              <span>0.5-0.6</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400 ml-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]"></span>
              <span>0.6-1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsNdvi;
