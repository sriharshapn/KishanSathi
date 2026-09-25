import React, { useState, useRef } from 'react';
import type { Language, NavigationPage, DiagnosisResult } from '../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Leaf, 
  RefreshCw, 
  Pill, 
  PhoneCall,
  X,
  History
} from 'lucide-react';

interface DiagnosePageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const DiagnosePage: React.FC<DiagnosePageProps> = ({ language, onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Past Disease Scan Reports
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch('/api/disease/reports');
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        setReports(data.reports);
      }
    } catch (err) {
      console.warn('Failed to load disease reports', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleOpenReports = () => {
    setReportsOpen(true);
    fetchReports();
  };

  const handleLoadReport = (rep: any) => {
    if (rep.diagnosis) {
      setResult(rep.diagnosis);
    }
    setReportsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // One-click demo samples for hackathon presentation!
  const loadDemoSample = async (sampleName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Draw realistic botanical leaf with concentric pathogen lesions
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Natural garden green background
        ctx.fillStyle = '#2D4428';
        ctx.fillRect(0, 0, 480, 360);

        // Leaf Body polygon
        ctx.fillStyle = '#476930';
        ctx.beginPath();
        ctx.moveTo(80, 180);
        ctx.bezierCurveTo(120, 60, 360, 60, 420, 180);
        ctx.bezierCurveTo(360, 300, 120, 300, 80, 180);
        ctx.fill();

        // Main Leaf Vein
        ctx.strokeStyle = '#5E8842';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, 180);
        ctx.lineTo(410, 180);
        ctx.stroke();

        // Secondary Veins
        ctx.lineWidth = 1.5;
        for (let i = 120; i < 380; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 180);
          ctx.lineTo(i + 30, 110);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(i, 180);
          ctx.lineTo(i + 30, 250);
          ctx.stroke();
        }

        // Chlorotic Halo (Yellowing margin around infection)
        ctx.fillStyle = '#C8B238';
        ctx.beginPath();
        ctx.arc(260, 150, 48, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Necrotic Lesion (Target-board pattern)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(260, 150, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5C2E0B';
        ctx.beginPath();
        ctx.arc(260, 150, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2B1405';
        ctx.beginPath();
        ctx.arc(260, 150, 9, 0, Math.PI * 2);
        ctx.fill();

        // Botanical Telemetry Tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 320, 480, 40);
        ctx.fillStyle = '#A5D6A7';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`SPECIMEN: ${sampleName.toUpperCase()}`, 16, 345);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.fillText('AGRIMATE FIELD SENSOR v2.4', 310, 345);
      }
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('image', file);
        formData.append('language', language);

        const res = await fetch('/api/disease/diagnose', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.diagnosis) {
          setResult(data.diagnosis);
        } else {
          setError(data.error || 'Diagnostic inference failed.');
        }
        setLoading(false);
      }, 'image/png');
    } catch (err: any) {
      setError('Failed to run diagnosis demo.');
      setLoading(false);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('language', language);

      const res = await fetch('/api/disease/diagnose', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.diagnosis) {
        setResult(data.diagnosis);
      } else {
        setError(data.error || 'Failed to analyze leaf image.');
      }
    } catch (err: any) {
      setError('Network error: Unable to reach AgriMate Vision service.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#A5D6A7]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
            <span>Gemini Vision AI • Plant Pathology Diagnostic System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Syne',sans-serif] tracking-tight">
            Instant Crop Disease Diagnosis
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Snap or upload a photo of infected leaves, stems, or fruits. AgriMate detects plant pathogens with dual organic & chemical remedy recommendations.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🔬
        </div>
      </div>

      {/* Upload & Demo Quick Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Container */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                Upload Plant Leaf Photo
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenReports}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#CCE0D0] hover:bg-[#F7FBF8] text-[#123826] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <History className="w-3 h-3 text-[#2E7D32]" />
                <span>Past Scans</span>
              </button>
              {selectedFile && (
                <button
                  onClick={clearSelection}
                  className="text-stone-400 hover:text-stone-700 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] ${
              previewUrl 
                ? 'border-[#2E7D32]/50 bg-[#F7FBF8]' 
                : 'border-[#CCE0D0] hover:border-[#2E7D32] hover:bg-[#F7FBF8]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="relative group max-h-64 overflow-hidden rounded-xl">
                <img 
                  src={previewUrl} 
                  alt="Crop preview" 
                  className="max-h-60 object-contain rounded-xl shadow-xs" 
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-black/40 text-white font-bold text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl"
                >
                  Click to replace photo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF5ED] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#123826]">
                    Drag and drop your leaf photo here, or click to browse
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Supports JPG, PNG, WEBP up to 10MB • Clear natural lighting recommended
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-500">
              {selectedFile ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` : 'No file selected'}
            </span>

            <button
              onClick={handleDiagnose}
              disabled={!selectedFile || loading}
              className="px-6 py-2.5 rounded-xl bg-[#123826] hover:bg-[#1B4D35] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
                  <span>Diagnose Disease Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Pitch Demo Samples */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E2ECE3]">
              <Sparkles className="w-4 h-4 text-[#E8A238]" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                One-Click Hackathon Demo Cases
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Test instant diagnostic evaluation on real crop diseases without having to take a field photograph:
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Tomato Early Blight', crop: 'Tomato (Solanum lycopersicum)', tag: 'Fungal Pathogen', icon: '🍅' },
                { name: 'Paddy Rice Blast', crop: 'Paddy (Oryza sativa)', tag: 'Magnaporthe oryzae', icon: '🍚' },
                { name: 'Onion Purple Blotch', crop: 'Onion (Allium cepa)', tag: 'Alternaria porri', icon: '🧅' },
                { name: 'Cotton Leaf Curl Virus', crop: 'Cotton (Gossypium)', tag: 'Whitefly Vector', icon: '☁️' }
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadDemoSample(sample.name)}
                  disabled={loading}
                  className="w-full p-3 rounded-2xl bg-[#F7FBF8] hover:bg-[#EBF5ED] border border-[#E2ECE3] hover:border-[#2E7D32] text-left transition-all flex items-center justify-between cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sample.icon}</span>
                    <div>
                      <strong className="text-xs text-[#123826] block group-hover:text-[#2E7D32] transition-colors">
                        {sample.name}
                      </strong>
                      <span className="text-[10px] text-stone-500">{sample.crop}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#CCE0D0] text-[#123826]">
                    Simulate
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#FFE0A3] text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Kisan Safety Principle:</strong> All diagnostic chemical formulations specify statutory withholding periods prior to harvest.
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnosis Report Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Banner Summary */}
          <div className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5ED] text-[#2E7D32] flex items-center justify-center text-2xl shrink-0">
                🌿
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">Identified Botanical Specimen</span>
                <h3 className="text-lg font-black text-[#123826]">{result.crop_identified}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                result.overall_health === 'healthy' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : result.overall_health === 'stressed'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                Condition: {result.overall_health.toUpperCase()}
              </span>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-300">
                Action: {result.urgency.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Primary Diagnoses Cards */}
          {result.diagnoses.map((diag, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-[#CCE0D0] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2ECE3] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#123826] font-['Syne',sans-serif]">
                      {diag.disease_name}
                    </h3>
                    <span className="text-xs text-stone-500 font-mono">({diag.disease_name_en})</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{diag.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="block text-[9px] uppercase font-bold text-stone-400">AI Confidence</span>
                    <span className="text-sm font-black text-[#2E7D32] font-mono">
                      {Math.round(diag.confidence * 100)}%
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                    diag.severity === 'severe'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : diag.severity === 'moderate'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {diag.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Treatment Protocols Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Organic Treatment */}
                <div className="p-5 rounded-2xl bg-[#F7FBF8] border border-[#CCE0D0] space-y-3">
                  <div className="flex items-center gap-2 text-[#2E7D32]">
                    <Leaf className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Certified Organic & Bio-Remedies
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {diag.organic_treatment.map((step, i) => (
                      <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Treatment */}
                <div className="p-5 rounded-2xl bg-[#FFFBF5] border border-[#FFE8C2] space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Pill className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Statutory Precision Chemical Dosage
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#FFE0A3]">
                      <span className="text-stone-500">Recommended Chemical:</span>
                      <strong className="text-stone-800 font-mono">{diag.chemical_treatment.product}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#FFE0A3]">
                      <span className="text-stone-500">Dilution Dosage:</span>
                      <strong className="text-stone-800 font-mono">{diag.chemical_treatment.dosage}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Application Interval:</span>
                      <strong className="text-stone-800 font-mono">{diag.chemical_treatment.frequency}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prevention Tips */}
              {diag.prevention && diag.prevention.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Long-Term Preventive Farm Hygiene
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {diag.prevention.map((tip, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-stone-50 text-stone-700 text-xs border border-stone-200">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Escalation Box */}
          <div className="p-5 rounded-3xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 text-[#E8A238]" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Need On-Field Agricultural Officer Verification?</h4>
                <p className="text-xs text-emerald-200/80">
                  Connect with your nearest Krishi Vigyan Kendra (KVK) Agronomist or call 1800-180-1551.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 rounded-xl bg-white text-[#123826] text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
            >
              Contact KVK Officer
            </button>
          </div>
        </div>
      )}

      {/* Past Reports Modal */}
      {reportsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="font-black text-sm text-[#123826]">Past Pathology Scans & Lab Diagnoses</h3>
              </div>
              <button 
                onClick={() => setReportsOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {reportsLoading ? (
                <div className="py-12 text-center text-xs text-stone-500">Loading scan reports...</div>
              ) : reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">No past diagnostic scans found in database.</div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-[#FBFDF9] border border-[#CCE0D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#123826]">{rep.crop_identified}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          rep.severity === 'severe' ? 'bg-red-100 text-red-800' :
                          rep.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {rep.disease_name} • {rep.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Confidence: <strong>{rep.confidence ? `${Math.round(rep.confidence * 100)}%` : '85%'}</strong></span>
                      <span>Health: <strong>{rep.overall_health || 'stressed'}</strong></span>
                      <span>Image: <strong>{rep.image_name || 'crop_sample.png'}</strong></span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleLoadReport(rep)}
                        className="px-3 py-1 bg-[#123826] text-white rounded-lg text-xs font-bold hover:bg-[#1B4D35] cursor-pointer transition-colors"
                      >
                        Load Diagnosis & Remedies
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
