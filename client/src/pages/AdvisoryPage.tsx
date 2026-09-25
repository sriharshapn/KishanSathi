import React, { useState } from 'react';
import type { Language, NavigationPage, AdvisoryResult } from '../types';
import { 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Award,
  Sun,
  MapPin,
  CheckCircle2,
  History,
  PhoneCall,
  X,
  Copy,
  Check
} from 'lucide-react';

interface AdvisoryPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const AdvisoryPage: React.FC<AdvisoryPageProps> = ({ language, onNavigate }) => {
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Ballari');
  const [crop, setCrop] = useState('Tomato');
  const [soilType, setSoilType] = useState('Loamy');
  const [season, setSeason] = useState('Kharif 2026');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History & IVR Telephony
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [ivrOpen, setIvrOpen] = useState(false);
  const [ivrData, setIvrData] = useState<any>(null);
  const [ivrLoading, setIvrLoading] = useState(false);
  const [copiedIvr, setCopiedIvr] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/advisory/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryItems(data.history);
      }
    } catch (err) {
      console.warn('Failed to load advisory history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = () => {
    setHistoryOpen(true);
    fetchHistory();
  };

  const handleLoadFromHistory = (item: any) => {
    if (item.advisory) {
      setResult(item.advisory);
      if (item.state) setState(item.state);
      if (item.district) setDistrict(item.district);
      if (item.crop) setCrop(item.crop);
      if (item.soil_type) setSoilType(item.soil_type);
      if (item.season) setSeason(item.season);
    }
    setHistoryOpen(false);
  };

  const handleOpenIvr = async () => {
    setIvrOpen(true);
    setIvrLoading(true);
    try {
      const res = await fetch(`/api/ivr/advisory?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&language=${language}`);
      const data = await res.json();
      if (data.success) {
        setIvrData(data);
      }
    } catch (err) {
      console.warn('Failed to load IVR data', err);
    } finally {
      setIvrLoading(false);
    }
  };

  const handleCopyIvr = () => {
    if (ivrData?.ivr_script) {
      navigator.clipboard.writeText(ivrData.ivr_script);
      setCopiedIvr(true);
      setTimeout(() => setCopiedIvr(false), 2000);
    }
  };

  const states = [
    'Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 
    'Andhra Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 
    'Madhya Pradesh', 'Haryana', 'Telangana'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, district, crop, soilType, season, language })
      });
      const data = await res.json();
      if (data.success && data.advisory) {
        setResult(data.advisory);
      } else {
        setError(data.error || 'Failed to generate advisory.');
      }
    } catch (err: any) {
      setError('Network error: Unable to reach AgriMate AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Run on first load if no result
  React.useEffect(() => {
    handleGenerate();
  }, []);

  const getRegenColor = (score: string) => {
    switch (score?.toUpperCase()) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B': return 'bg-green-100 text-green-800 border-green-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#A5D6A7]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
            <span>Gemini 2.0 Flash • Precision Agro-Advisory Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Syne',sans-serif] tracking-tight">
            AI Regenerative Crop Advisory
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Real-time, hyper-local guidance harmonizing satellite NDVI vegetative health, 7-day micro-weather forecasts, and soil health chemistry for Indian growers.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🌱
        </div>
      </div>

      {/* Field Configuration Bar */}
      <div className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E2ECE3]">
          <MapPin className="w-4 h-4 text-[#2E7D32]" />
          <h2 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
            Configure Field & Agro-Climatic Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">District / Region</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Ballari, Kolar"
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Current / Prior Crop</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Cotton"
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="Loamy">Mixed Loamy Soil</option>
              <option value="Black Cotton">Black Cotton Soil (Regur)</option>
              <option value="Red Soil">Red Sandy Soil</option>
              <option value="Alluvial">Alluvial River Basin</option>
              <option value="Laterite">Laterite Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="Kharif 2026">Kharif Season (Monsoon)</option>
              <option value="Rabi 2026-27">Rabi Season (Winter)</option>
              <option value="Zaid 2026">Zaid Season (Summer)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2ECE3]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Digital Public Good standard • Zero vendor lock-in</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenHistory}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#CCE0D0] hover:bg-[#F7FBF8] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Advisory History</span>
            </button>
            <button
              type="button"
              onClick={handleOpenIvr}
              className="px-3.5 py-2 rounded-xl bg-[#EBF5ED] border border-[#CCE0D0] hover:bg-[#D4EAD9] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Kisan Call Centre IVR</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#123826] hover:bg-[#1B4D35] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Advisory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
                  <span>Generate Advisory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5ED] text-[#2E7D32] flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">7-Day Microclimate</span>
                <p className="text-xs font-semibold text-[#123826] mt-0.5 leading-snug">
                  {result.weather_summary}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">Sentinel-2 NDVI Score</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-black text-[#123826] font-mono">
                    {result.ndvi_score}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Vegetative Canopy
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">Regenerative Target</span>
                <p className="text-xs font-semibold text-[#123826] mt-0.5 leading-snug">
                  Soil organic carbon build-up + 25% lower nitrogen runoff
                </p>
              </div>
            </div>
          </div>

          {/* Current Field Assessment */}
          <div className="p-5 rounded-2xl bg-[#F7FBF8] border border-[#CCE0D0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#123826] mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Current Field Health Assessment</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {result.current_field_assessment}
            </p>
          </div>

          {/* 3 Regenerative Crop Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-black text-[#123826] font-['Syne',sans-serif]">
                  Regenerative Crop Recommendations
                </h3>
                <p className="text-xs text-stone-500">
                  Ranked by agro-climatic suitability, soil enrichment potential, and market viability.
                </p>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Check Mandi Rates</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.crop_recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs hover:shadow-md hover:border-[#2E7D32] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3]">
                          {rec.icon || '🌾'}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-[#123826]">{rec.crop}</h4>
                          <span className="text-[11px] text-stone-500 font-medium">{rec.variety}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRegenColor(rec.regenerative_score)}`}>
                        Regen {rec.regenerative_score}
                      </span>
                    </div>

                    {/* Suitability Score Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                        <span>Suitability Match</span>
                        <span className="font-mono text-[#2E7D32]">{rec.suitability_score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EBF5ED] overflow-hidden">
                        <div 
                          className="h-full bg-[#2E7D32] rounded-full transition-all" 
                          style={{ width: `${rec.suitability_score}%` }} 
                        />
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed bg-[#F7FBF8] p-2.5 rounded-xl border border-[#E2ECE3]">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2ECE3] grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">Water</span>
                      <span className="text-[11px] font-bold text-[#123826] capitalize">{rec.water_need}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">Yield</span>
                      <span className="text-[11px] font-bold text-[#123826] font-mono">{rec.expected_yield_qtl_per_ha} q/ha</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">APMC Est.</span>
                      <span className="text-[11px] font-bold text-[#2E7D32] font-mono">₹{rec.market_price_inr_per_qtl}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Irrigation & Pest Alert Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2 mb-2 text-blue-900">
                <Droplets className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">7-Day Irrigation Schedule</h4>
              </div>
              <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                {result.irrigation_advice}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2 mb-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Pest & Pathogen Early Warning</h4>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                {result.pest_disease_warning}
              </p>
            </div>
          </div>

          {/* Farming Calendar Milestones */}
          {result.farming_calendar && result.farming_calendar.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E2ECE3]">
                <Calendar className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                  Seasonal Execution Calendar
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.farming_calendar.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.icon || '🌱'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#2E7D32]">
                        Day +{item.days_from_now}
                      </span>
                    </div>
                    <strong className="text-xs text-[#123826] block font-bold">{item.milestone}</strong>
                    <p className="text-[11px] text-stone-600 leading-snug">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="font-black text-sm text-[#123826]">Past Advisory Consultations</h3>
              </div>
              <button 
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-stone-500">Loading history records...</div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">No past advisories found in database.</div>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#FBFDF9] border border-[#CCE0D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#123826]">{item.district}, {item.state}</span>
                        <span className="text-[10px] bg-[#EBF5ED] text-[#2E7D32] px-2 py-0.5 rounded-full font-bold">
                          {item.season}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Crop: <strong>{item.crop || 'Open field'}</strong></span>
                      <span>Soil: <strong>{item.soil_type || 'Loamy'}</strong></span>
                      <span>NDVI: <strong>{item.ndvi_score ? Number(item.ndvi_score).toFixed(2) : '0.62'}</strong></span>
                    </div>

                    {item.advisory?.crop_recommendations && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.advisory.crop_recommendations.map((c: any, i: number) => (
                          <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                            {c.icon || '🌾'} {c.crop} ({c.regenerative_score})
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleLoadFromHistory(item)}
                        className="px-3 py-1 bg-[#123826] text-white rounded-lg text-xs font-bold hover:bg-[#1B4D35] cursor-pointer transition-colors"
                      >
                        Load Into Advisory Console
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IVR Voice Telephony Modal */}
      {ivrOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#2E7D32]" />
                <div>
                  <h3 className="font-black text-sm text-[#123826]">Kisan Call Centre (1800-180-1551)</h3>
                  <p className="text-[11px] text-stone-500">Automated IVR Telephony Speech Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setIvrOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ivrLoading ? (
              <div className="py-12 text-center text-xs text-stone-500">Synthesizing telephony voice script...</div>
            ) : ivrData ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0A1F14] text-[#A5D6A7] font-mono text-xs leading-relaxed border border-[#16422D]">
                  <p className="text-[10px] text-stone-400 mb-1 uppercase tracking-wider font-bold">Generated Voice Script ({ivrData.language.toUpperCase()}):</p>
                  <p className="whitespace-pre-wrap">{ivrData.ivr_script}</p>
                </div>

                <div className="space-y-1 text-[11px] text-stone-500">
                  <p><strong>Provider:</strong> {ivrData.telephony_provider}</p>
                  <p><strong>Encoding:</strong> {ivrData.audio_format}</p>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E2ECE3]">
                  <button
                    onClick={handleCopyIvr}
                    className="px-3.5 py-1.5 rounded-xl bg-[#123826] text-white text-xs font-bold hover:bg-[#1B4D35] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedIvr ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIvr ? 'Copied Script' : 'Copy Audio Script'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500">Failed to generate IVR script.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
