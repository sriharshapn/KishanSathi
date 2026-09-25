import React, { useState, useEffect } from 'react';
import type { Language, NavigationPage } from '../types';
import { 
  Network, 
  AlertTriangle, 
  Globe2, 
  FileCode, 
  Download,
  Users,
  Sprout,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface GovDashboardPageProps {
  language?: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const GovDashboardPage: React.FC<GovDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'states' | 'diseases' | 'api'>('states');

  useEffect(() => {
    async function loadGovData() {
      try {
        const res = await fetch('/api/gov/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.warn('Could not load gov dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadGovData();
  }, []);

  const handleExportNgsiLd = async () => {
    try {
      const res = await fetch('/api/interop/ngsi-ld/v1/entities');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/ld+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agrimate-ngsi-ld-entities-${new Date().toISOString().split('T')[0]}.jsonld`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const ngsiLdExample = {
    "@context": [
      "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
      "https://schema.org"
    ],
    "id": "urn:ngsi-ld:AgriParcel:IN-KA-BLR-0204",
    "type": "AgriParcel",
    "cropStatus": {
      "type": "Property",
      "value": "Vegetative",
      "observedAt": "2026-09-24T00:00:00Z"
    },
    "soilHealth": {
      "type": "Property",
      "value": { "type": "Loamy", "organicCarbon": "0.72%" }
    },
    "sentinelNDVI": {
      "type": "Property",
      "value": 0.62,
      "dataset": "Copernicus-Sentinel-2"
    },
    "location": {
      "type": "GeoProperty",
      "value": {
        "type": "Point",
        "coordinates": [76.92, 15.14]
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#A5D6A7]">
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E8A238]" />
            ) : (
              <Network className="w-3.5 h-3.5 text-[#E8A238]" />
            )}
            <span>Digital Public Good (DPG) • Interoperable National Mesh</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Syne',sans-serif] tracking-tight">
            Inter-State Agricultural Data Exchange
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Federated network enabling Indian states to share crop models, Sentinel-2 NDVI vegetative indicators, and pathogen alerts to fortify national food security.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🏛️
        </div>
      </div>

      {/* National Overview KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-stone-500">Connected Farmers</span>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-xl sm:text-2xl font-black text-[#123826] font-mono">
              {data?.stats?.total_farmers?.toLocaleString() || '284,750'}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Across 8 federated states</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-stone-500">Advisories Today</span>
          <div className="flex items-center gap-2 mt-1">
            <Sprout className="w-4 h-4 text-[#E8A238]" />
            <span className="text-xl sm:text-2xl font-black text-[#123826] font-mono">
              {data?.stats?.advisories_today?.toLocaleString() || '18,420'}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Real-time localized inference</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-stone-500">Active Disease Alerts</span>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xl sm:text-2xl font-black text-red-600 font-mono">
              {data?.stats?.disease_reports_week || '63'}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Flagged for containment</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCE0D0] p-4 shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-stone-500">National Mean NDVI</span>
          <div className="flex items-center gap-2 mt-1">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xl sm:text-2xl font-black text-[#123826] font-mono">
              {data?.stats?.avg_ndvi || '0.612'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Healthy canopy index</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#CCE0D0] pb-2">
        <button
          onClick={() => setSelectedTab('states')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTab === 'states'
              ? 'bg-[#123826] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#123826] hover:bg-[#F4F8F5]'
          }`}
        >
          State-Wise Agriculture Indicators
        </button>
        <button
          onClick={() => setSelectedTab('diseases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTab === 'diseases'
              ? 'bg-[#123826] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#123826] hover:bg-[#F4F8F5]'
          }`}
        >
          Cross-State Disease Surveillance
        </button>
        <button
          onClick={() => setSelectedTab('api')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTab === 'api'
              ? 'bg-[#123826] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#123826] hover:bg-[#F4F8F5]'
          }`}
        >
          NGSI-LD Open Public API
        </button>
      </div>

      {/* Tab 1: State-Wise Telemetry Table */}
      {selectedTab === 'states' && (
        <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
              Participating State Agriculture Departments
            </h3>
            <span className="text-xs text-stone-500 font-medium">Federated Synchronized Feeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2ECE3] text-[10px] uppercase font-bold text-stone-500">
                  <th className="py-2.5 px-3">State Node</th>
                  <th className="py-2.5 px-3">Dominant Crop</th>
                  <th className="py-2.5 px-3">Sentinel-2 NDVI</th>
                  <th className="py-2.5 px-3">Health Status</th>
                  <th className="py-2.5 px-3">Active Growers</th>
                  <th className="py-2.5 px-3">Weekly Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE3]">
                {(data?.district_data || [
                  { state: 'Karnataka', dominant_crop: 'Tomato / Maize', ndvi_mean: 0.62, health_status: 'Excellent', farmers_count: 48200, disease_alerts: 4 },
                  { state: 'Maharashtra', dominant_crop: 'Onion / Soybean', ndvi_mean: 0.58, health_status: 'Good', farmers_count: 52100, disease_alerts: 3 },
                  { state: 'Punjab', dominant_crop: 'Wheat / Paddy', ndvi_mean: 0.71, health_status: 'Excellent', farmers_count: 36400, disease_alerts: 6 },
                  { state: 'Tamil Nadu', dominant_crop: 'Paddy / Banana', ndvi_mean: 0.65, health_status: 'Excellent', farmers_count: 41800, disease_alerts: 5 },
                  { state: 'Andhra Pradesh', dominant_crop: 'Chilli / Cotton', ndvi_mean: 0.60, health_status: 'Good', farmers_count: 38900, disease_alerts: 2 },
                  { state: 'Gujarat', dominant_crop: 'Groundnut / Cotton', ndvi_mean: 0.52, health_status: 'Moderate', farmers_count: 29500, disease_alerts: 1 }
                ]).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-[#F7FBF8] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#123826] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                      <span>{row.state}</span>
                    </td>
                    <td className="py-3 px-3 text-stone-700">{row.dominant_crop}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#123826]">{row.ndvi_mean}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {row.health_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700">{row.farmers_count.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        row.disease_alerts > 4 ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {row.disease_alerts} alerts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Cross-State Disease Surveillance */}
      {selectedTab === 'diseases' && (
        <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
              Coordinated Pathogen Early Warning Feed
            </h3>
            <span className="text-xs font-bold text-[#2E7D32]">Inter-State Protocol Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.disease_alerts || [
              { district: 'Ballari', state: 'Karnataka', disease: 'Yellow Rust', severity: 'moderate', reports: 8 },
              { district: 'Nashik', state: 'Maharashtra', disease: 'Powdery Mildew', severity: 'mild', reports: 5 },
              { district: 'Ludhiana', state: 'Punjab', disease: 'Stem Borer', severity: 'severe', reports: 14 },
              { district: 'Guntur', state: 'Andhra Pradesh', disease: 'Leaf Blight', severity: 'moderate', reports: 7 }
            ]).map((alert: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F7FBF8] border border-[#CCE0D0] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#123826]">{alert.disease}</h4>
                    <span className="text-xs text-stone-500">{alert.district}, {alert.state}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    alert.severity === 'severe'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {alert.reports} verified farmer reports collected this week via Gemini Vision diagnostic scans.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#2E7D32] font-semibold">
                  <span>Containment Radius: 25 km</span>
                  <button
                    onClick={() => onNavigate('diagnose')}
                    className="hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Run Field Diagnostic</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: NGSI-LD Open Public API */}
      {selectedTab === 'api' && (
        <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                ETSI NGSI-LD & Schema.org Compliant Linked Data Entity
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
              GET /api/interop/ngsi-ld/v1/entities
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            State agricultural universities, extension departments (KVKs), and digital public infrastructures can ingest and query AgriMate entities without vendor lock-in.
          </p>

          <pre className="p-4 rounded-2xl bg-[#0A1F14] text-[#A5D6A7] font-mono text-xs overflow-x-auto leading-relaxed border border-[#16422D]">
            {JSON.stringify(ngsiLdExample, null, 2)}
          </pre>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
            <span>License: Open Data Commons Attribution License (ODC-By)</span>
            <button
              onClick={handleExportNgsiLd}
              className="px-3 py-1.5 rounded-xl bg-[#123826] text-white font-bold text-xs hover:bg-[#1B4D35] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Open Model (JSON-LD)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
