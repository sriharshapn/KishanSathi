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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/ld+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kisansathi-ngsi-ld-entities-${new Date().toISOString().split('T')[0]}.jsonld`;
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
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8 md:py-12 space-y-8 font-['Open_Sans',sans-serif] text-[#022113]">
      {/* Header Banner (Pic 1 & 2 Aesthetic) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Crisp White Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F2EB] border border-[#022113]/8 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#546C18]">
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#546C18]" />
              ) : (
                <Network className="w-3.5 h-3.5 text-[#546C18]" />
              )}
              <span>Digital Public Good (DPG) • Interoperable National Mesh</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#022113] font-['Montserrat',sans-serif] tracking-tight">
              Inter-State <span className="text-[#546C18]">Agro-Data Mesh</span>
            </h1>
            <p className="text-[#4A5568] text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
              Federated network enabling Indian states to share crop models, Sentinel-2 NDVI vegetative indicators, and pathogen alerts to fortify national food security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#022113]/8">
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              NGSI-LD Standards
            </span>
            <span className="text-[#718096]">•</span>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              Smart Data Models
            </span>
            <span className="text-[#718096]">•</span>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              28 States & 8 UTs Node Network
            </span>
          </div>
        </div>

        {/* Right Card: Rich Olive Card */}
        <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113]">
                DPG Mesh v1.0
              </span>
              <span className="text-xs font-mono text-white/80">Federated</span>
            </div>
            <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-white pt-2">
              Sovereign Interoperability
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              State and central agricultural systems interchange telemetry under open protocols without central vendor lock-in.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] block">Network Throughput</span>
            <span className="text-2xl font-black font-['Montserrat',sans-serif] text-white block">248,000+ Queries/hr</span>
            <span className="text-[11px] text-white/70 block">Zero downtime across active regional nodes</span>
          </div>
        </div>
      </div>

      {/* National Overview KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">Connected Farmers</span>
          <div className="flex items-center gap-2.5 mt-2">
            <Users className="w-5 h-5 text-[#546C18]" />
            <span className="text-xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif]">
              {data?.stats?.total_farmers?.toLocaleString() || '284,750'}
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">Across 8 federated states</span>
        </div>

        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">Advisories Today</span>
          <div className="flex items-center gap-2.5 mt-2">
            <Sprout className="w-5 h-5 text-[#546C18]" />
            <span className="text-xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif]">
              {data?.stats?.advisories_today?.toLocaleString() || '18,420'}
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">Real-time inference</span>
        </div>

        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">Active Alerts</span>
          <div className="flex items-center gap-2.5 mt-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span className="text-xl sm:text-3xl font-black text-rose-700 font-['Montserrat',sans-serif]">
              {data?.stats?.disease_reports_week || '63'}
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">Flagged for containment</span>
        </div>

        <div className="bg-[#546C18] text-white rounded-[2.2rem] p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38]">National Mean NDVI</span>
          <div className="flex items-center gap-2.5 mt-2">
            <Globe2 className="w-5 h-5 text-[#DFEB38]" />
            <span className="text-xl sm:text-3xl font-black text-[#DFEB38] font-['Montserrat',sans-serif]">
              {data?.stats?.avg_ndvi || '0.612'}
            </span>
          </div>
          <span className="text-[11px] text-white/80 font-medium mt-1.5 block font-normal">Healthy canopy index</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2.5 pb-2">
        <button
          onClick={() => setSelectedTab('states')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'states'
              ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
              : 'bg-[#F0F4EC] text-[#022113] hover:bg-[#E2ECE3] border border-[#E5EAD7]'
          }`}
        >
          State-Wise Indicators
        </button>
        <button
          onClick={() => setSelectedTab('diseases')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'diseases'
              ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
              : 'bg-[#F0F4EC] text-[#022113] hover:bg-[#E2ECE3] border border-[#E5EAD7]'
          }`}
        >
          Disease Surveillance
        </button>
        <button
          onClick={() => setSelectedTab('api')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'api'
              ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
              : 'bg-[#F0F4EC] text-[#022113] hover:bg-[#E2ECE3] border border-[#E5EAD7]'
          }`}
        >
          NGSI-LD Open Public API
        </button>
      </div>

      {/* Tab 1: State-Wise Telemetry Table */}
      {selectedTab === 'states' && (
        <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAD7]">
            <h3 className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
              Participating State Agriculture Departments
            </h3>
            <span className="text-xs font-mono text-[#59701E] font-bold">Federated Synchronized Feeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EAD7] text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">
                  <th className="py-3 px-3">State Node</th>
                  <th className="py-3 px-3">Dominant Crop</th>
                  <th className="py-3 px-3">Sentinel-2 NDVI</th>
                  <th className="py-3 px-3">Health Status</th>
                  <th className="py-3 px-3">Active Growers</th>
                  <th className="py-3 px-3">Weekly Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAD7]">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(data?.district_data || [
                  { state: 'Karnataka', dominant_crop: 'Tomato / Maize', ndvi_mean: 0.62, health_status: 'Excellent', farmers_count: 48200, disease_alerts: 4 },
                  { state: 'Maharashtra', dominant_crop: 'Onion / Soybean', ndvi_mean: 0.58, health_status: 'Good', farmers_count: 52100, disease_alerts: 3 },
                  { state: 'Punjab', dominant_crop: 'Wheat / Paddy', ndvi_mean: 0.71, health_status: 'Excellent', farmers_count: 36400, disease_alerts: 6 },
                  { state: 'Tamil Nadu', dominant_crop: 'Paddy / Banana', ndvi_mean: 0.65, health_status: 'Excellent', farmers_count: 41800, disease_alerts: 5 },
                  { state: 'Andhra Pradesh', dominant_crop: 'Chilli / Cotton', ndvi_mean: 0.60, health_status: 'Good', farmers_count: 38900, disease_alerts: 2 },
                  { state: 'Gujarat', dominant_crop: 'Groundnut / Cotton', ndvi_mean: 0.52, health_status: 'Moderate', farmers_count: 29500, disease_alerts: 1 }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ]).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-[#F8FAF6] transition-colors">
                    <td className="py-3.5 px-3 font-bold text-[#022113] font-['Montserrat',sans-serif] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#59701E]" />
                      <span>{row.state}</span>
                    </td>
                    <td className="py-3.5 px-3 text-[#022113]/70 font-medium">{row.dominant_crop}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#022113]">{row.ndvi_mean}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider bg-[#DFEB38]/40 text-[#022113] border border-[#DFEB38]">
                        {row.health_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#022113]/70">{row.farmers_count.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] ${
                        row.disease_alerts > 4 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-[#F0F4EC] text-[#022113] border border-[#E5EAD7]'
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
        <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
              Coordinated Pathogen Early Warning Feed
            </h3>
            <span className="text-xs font-mono font-bold text-[#546C18]">Inter-State Protocol Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(data?.disease_alerts || [
              { district: 'Ballari', state: 'Karnataka', disease: 'Yellow Rust', severity: 'moderate', reports: 8 },
              { district: 'Nashik', state: 'Maharashtra', disease: 'Powdery Mildew', severity: 'mild', reports: 5 },
              { district: 'Ludhiana', state: 'Punjab', disease: 'Stem Borer', severity: 'severe', reports: 14 },
              { district: 'Guntur', state: 'Andhra Pradesh', disease: 'Leaf Blight', severity: 'moderate', reports: 7 }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ]).map((alert: any, idx: number) => (
              <div key={idx} className="p-6 rounded-[2rem] bg-[#F0F2EB] border border-[#022113]/8 space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#022113] font-['Montserrat',sans-serif]">{alert.disease}</h4>
                    <span className="text-xs font-mono text-[#022113]/60">{alert.district}, {alert.state}</span>
                  </div>
                  <span className={`text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
                    alert.severity === 'severe'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-[#022113]/70 font-normal leading-relaxed">
                  {alert.reports} verified farmer reports collected this week via Gemini Vision diagnostic scans.
                </p>
                <div className="pt-3 flex items-center justify-between text-xs font-mono text-[#022113]/60 border-t border-[#022113]/8">
                  <span>Containment Radius: 25 km</span>
                  <button
                    onClick={() => onNavigate('diagnose')}
                    className="text-[#022113] hover:text-[#546C18] flex items-center gap-1 cursor-pointer font-bold font-['Montserrat',sans-serif] uppercase tracking-wider"
                  >
                    <span>Run Diagnostic</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#546C18]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: NGSI-LD Open Public API */}
      {selectedTab === 'api' && (
        <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAD7]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#59701E]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
                ETSI NGSI-LD & Schema.org Compliant Linked Data Entity
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-1 rounded-full text-[#022113] font-bold">
              GET /api/interop/ngsi-ld/v1/entities
            </span>
          </div>

          <p className="text-xs text-[#022113]/70 leading-relaxed font-normal">
            State agricultural universities, extension departments (KVKs), and digital public infrastructures can ingest and query Kisan Setu entities without vendor lock-in.
          </p>

          <pre className="p-5 rounded-2xl bg-[#F0F2EB] text-[#022113] font-mono text-xs overflow-x-auto leading-relaxed border border-[#022113]/10">
            {JSON.stringify(ngsiLdExample, null, 2)}
          </pre>

          <div className="pt-2 flex items-center justify-between text-xs text-[#022113]/60 flex-wrap gap-2">
            <span>License: Open Data Commons Attribution License (ODC-By)</span>
            <button
              onClick={handleExportNgsiLd}
              className="px-5 py-2.5 rounded-full bg-[#DFEB38] text-[#022113] font-black text-xs font-['Montserrat',sans-serif] uppercase tracking-wider hover:bg-[#c9d42f] transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_4px_16px_rgba(223,235,56,0.4)]"
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
