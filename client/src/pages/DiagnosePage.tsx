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
  History,
  MapPin
} from 'lucide-react';

export interface DemoCase {
  key: string;
  name: string;
  crop: string;
  latin: string;
  location: string;
  farmer: string;
  tag: string;
  severity: 'moderate' | 'severe';
  icon: string;
  description: string;
}

export const DEMO_CASES: DemoCase[] = [
  {
    key: 'tomato_early_blight',
    name: 'Tomato Early Blight',
    crop: 'Tomato (Solanum lycopersicum)',
    latin: 'Alternaria solani',
    location: 'Ballari & Kolar, Karnataka',
    farmer: 'Ramesh Gowda (3.5 ac)',
    tag: 'Target-Board Rings',
    severity: 'moderate',
    icon: '🍅',
    description: 'Concentric necrotic rings on lower foliage after post-monsoon humidity.'
  },
  {
    key: 'paddy_rice_blast',
    name: 'Paddy Rice Blast',
    crop: 'Paddy (Oryza sativa)',
    latin: 'Magnaporthe oryzae',
    location: 'Thanjavur Delta, Tamil Nadu',
    farmer: 'S. Murugesan (5 ac Kuruvai)',
    tag: 'Spindle Eye Spots',
    severity: 'severe',
    icon: '🌾',
    description: 'Acute spindle/diamond ash-gray eye spots threatening panicle neck breakage.'
  },
  {
    key: 'chilli_leaf_curl',
    name: 'Chilli Leaf Curl & Murda',
    crop: 'Chilli (Capsicum annuum)',
    latin: 'Begomovirus + Thrips Complex',
    location: 'Guntur, AP & Byadgi, KA',
    farmer: 'Venkat Reddy (4 ac Byadgi)',
    tag: 'Upward Boat Cupping',
    severity: 'severe',
    icon: '🌶️',
    description: 'Severe upward boat-cupping and apical clustering vectored by whiteflies/thrips.'
  },
  {
    key: 'wheat_yellow_rust',
    name: 'Wheat Yellow / Stripe Rust',
    crop: 'Wheat (Triticum aestivum)',
    latin: 'Puccinia striiformis',
    location: 'Ludhiana, PB & Karnal, HR',
    farmer: 'Harpreet Singh (8 ac PBW-725)',
    tag: 'Linear Orange Stripes',
    severity: 'severe',
    icon: '🍞',
    description: 'Parallel vertical stripe arrays of bright yellow-orange powdery urediniospores.'
  },
  {
    key: 'onion_purple_blotch',
    name: 'Onion Purple Blotch',
    crop: 'Onion (Allium cepa)',
    latin: 'Alternaria porri',
    location: 'Lasalgaon & Nashik, Maharashtra',
    farmer: 'Dnyaneshwar Shinde (2.5 ac)',
    tag: 'Sunken Violet Blotch',
    severity: 'moderate',
    icon: '🧅',
    description: 'Sunken elliptical purplish-violet spots on tubular scapes reducing bulb life.'
  },
  {
    key: 'cotton_bacterial_blight',
    name: 'Cotton Angular Leaf Spot',
    crop: 'Bt-Cotton (Gossypium)',
    latin: 'Xanthomonas pv. malvacearum',
    location: 'Wardha, MH & Rajkot, Gujarat',
    farmer: 'Pravin Patil (6 ac Bt-Cotton)',
    tag: 'Vein-Bounded Angular',
    severity: 'moderate',
    icon: '☁️',
    description: 'Vein-delimited dark polygonal water-soaked lesions risking blackarm stem cankers.'
  }
];

function drawSpecimenCanvas(ctx: CanvasRenderingContext2D, demo: DemoCase) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Background - rich agricultural soil/canopy dark tone
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#152417');
  bgGrad.addColorStop(1, '#0C160E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid/coordinate overlay simulating field diagnostic camera
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 40; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 40; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw Specific Botanical Morphology & Pathogen Lesions
  if (demo.key === 'tomato_early_blight') {
    // Tomato Leaflet with serrated lobes
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);
    
    // Main Leaflet Body
    ctx.fillStyle = '#3E6627';
    ctx.beginPath();
    ctx.moveTo(-160, 0);
    ctx.bezierCurveTo(-110, -80, -20, -110, 80, -60);
    ctx.lineTo(130, -80);
    ctx.lineTo(110, -40);
    ctx.bezierCurveTo(150, -30, 180, -10, 200, 0);
    ctx.bezierCurveTo(180, 10, 150, 30, 110, 40);
    ctx.lineTo(130, 80);
    ctx.lineTo(80, 60);
    ctx.bezierCurveTo(-20, 110, -110, 80, -160, 0);
    ctx.closePath();
    ctx.fill();

    // Leaf vein structure
    ctx.strokeStyle = '#5B8C3E';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-160, 0);
    ctx.lineTo(195, 0);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    for (let x = -100; x < 150; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 28, -45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 28, 45);
      ctx.stroke();
    }

    // Primary Target-board concentric lesion
    const drawTargetSpot = (cx: number, cy: number, r: number) => {
      ctx.fillStyle = 'rgba(212, 198, 56, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6E3A18';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#945524';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4B220B';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1D0B03';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    };

    drawTargetSpot(40, -15, 46);
    drawTargetSpot(-70, 30, 24);
    drawTargetSpot(120, 20, 16);

    ctx.restore();
  } else if (demo.key === 'paddy_rice_blast') {
    // Rice blade diagonal
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);
    ctx.rotate(-0.35);

    // Rice blade
    ctx.fillStyle = '#397838';
    ctx.beginPath();
    ctx.moveTo(-220, -32);
    ctx.lineTo(220, -18);
    ctx.lineTo(250, 0);
    ctx.lineTo(220, 18);
    ctx.lineTo(-220, 32);
    ctx.closePath();
    ctx.fill();

    // Fine parallel venation lines
    ctx.strokeStyle = '#4FA14D';
    ctx.lineWidth = 1;
    for (let y = -25; y <= 25; y += 7) {
      ctx.beginPath();
      ctx.moveTo(-220, y);
      ctx.lineTo(220, y * 0.7);
      ctx.stroke();
    }

    // Midrib vein
    ctx.strokeStyle = '#68B866';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-220, 0);
    ctx.lineTo(240, 0);
    ctx.stroke();

    // Classic Spindle/Diamond shaped lesions (ash gray center + brown margin)
    const drawBlastSpindle = (cx: number, cy: number, wSpan: number, hSpan: number) => {
      ctx.fillStyle = '#873216';
      ctx.beginPath();
      ctx.moveTo(cx - wSpan, cy);
      ctx.lineTo(cx, cy - hSpan);
      ctx.lineTo(cx + wSpan, cy);
      ctx.lineTo(cx, cy + hSpan);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#B45722';
      ctx.beginPath();
      ctx.moveTo(cx - wSpan * 0.75, cy);
      ctx.lineTo(cx, cy - hSpan * 0.75);
      ctx.lineTo(cx + wSpan * 0.75, cy);
      ctx.lineTo(cx, cy + hSpan * 0.75);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#CCD2CA';
      ctx.beginPath();
      ctx.moveTo(cx - wSpan * 0.5, cy);
      ctx.lineTo(cx, cy - hSpan * 0.5);
      ctx.lineTo(cx + wSpan * 0.5, cy);
      ctx.lineTo(cx, cy + hSpan * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3A180E';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBlastSpindle(30, -2, 52, 16);
    drawBlastSpindle(-80, 8, 36, 12);
    drawBlastSpindle(130, -5, 28, 9);

    ctx.restore();
  } else if (demo.key === 'chilli_leaf_curl') {
    // Upward-cupped distorted chilli leaf
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);

    // Puckered distorted leaf body (boat/cup shaped)
    ctx.fillStyle = '#497330';
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.bezierCurveTo(-110, -70, 0, -85, 140, -40);
    ctx.bezierCurveTo(180, -20, 190, 0, 190, 0);
    ctx.bezierCurveTo(190, 0, 180, 20, 140, 40);
    ctx.bezierCurveTo(0, 85, -110, 70, -150, 0);
    ctx.closePath();
    ctx.fill();

    // Inner cupped highlights simulating curling
    ctx.fillStyle = '#6E963D';
    ctx.beginPath();
    ctx.moveTo(-110, 0);
    ctx.bezierCurveTo(-60, -45, 40, -45, 120, -15);
    ctx.bezierCurveTo(120, 15, -60, 45, -110, 0);
    ctx.fill();

    // Puckered chlorotic yellowing patches
    ctx.fillStyle = 'rgba(215, 222, 92, 0.45)';
    ctx.beginPath();
    ctx.arc(-20, -15, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(45, 12, 22, 0, Math.PI * 2);
    ctx.fill();

    // Main curled vein
    ctx.strokeStyle = '#8EBA4D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.quadraticCurveTo(0, -15, 185, 0);
    ctx.stroke();

    // Thrips / whitefly vector micro-specks (chlorotic flecking)
    ctx.fillStyle = '#FFF88A';
    for (let i = 0; i < 45; i++) {
      const rx = (Math.sin(i * 99) * 110) + 10;
      const ry = (Math.cos(i * 47) * 35);
      ctx.fillRect(rx, ry, 2, 2);
    }

    ctx.restore();
  } else if (demo.key === 'wheat_yellow_rust') {
    // Narrow wheat leaf with parallel stripes of bright yellow-orange pustules
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);

    // Wheat leaf blade
    ctx.fillStyle = '#557F37';
    ctx.fillRect(-85, -155, 170, 310);

    // Parallel venation lines
    ctx.strokeStyle = '#689647';
    ctx.lineWidth = 1.5;
    for (let x = -75; x <= 75; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, -155);
      ctx.lineTo(x, 155);
      ctx.stroke();
    }

    // 4 Distinct Parallel linear stripes of bright yellow-orange rust pustules
    const stripeX = [-45, -15, 15, 45];
    stripeX.forEach((sx, sIdx) => {
      for (let y = -140; y <= 140; y += 10) {
        if ((sIdx * 3 + y) % 7 === 0) continue;
        const pustuleWidth = 5;
        const pustuleHeight = 7;
        ctx.fillStyle = (y % 2 === 0) ? '#F59E0B' : '#E87D04';
        ctx.beginPath();
        ctx.ellipse(sx, y, pustuleWidth / 2, pustuleHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(sx, y - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  } else if (demo.key === 'onion_purple_blotch') {
    // Hollow tubular onion scape with sunken elliptical purple-violet blotch
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);

    // Tubular scape (cylindrical gradient)
    const scapeGrad = ctx.createLinearGradient(0, -55, 0, 55);
    scapeGrad.addColorStop(0, '#1E4A28');
    scapeGrad.addColorStop(0.3, '#3B7A48');
    scapeGrad.addColorStop(0.5, '#4E965D');
    scapeGrad.addColorStop(0.8, '#32683E');
    scapeGrad.addColorStop(1, '#1A3F22');

    ctx.fillStyle = scapeGrad;
    ctx.beginPath();
    ctx.roundRect(-210, -50, 420, 100, 20);
    ctx.fill();

    // Large sunken elliptical purple blotch
    ctx.fillStyle = 'rgba(217, 208, 67, 0.85)';
    ctx.beginPath();
    ctx.ellipse(20, 0, 75, 34, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#783A1E';
    ctx.beginPath();
    ctx.ellipse(20, 0, 60, 26, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5B2C6F';
    ctx.beginPath();
    ctx.ellipse(20, 0, 46, 19, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3E194D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(20, 0, 32, 13, -0.05, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#260B31';
    ctx.beginPath();
    ctx.ellipse(20, 0, 16, 7, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (demo.key === 'cotton_bacterial_blight') {
    // 3-lobed broad palmate cotton leaf with vein-delimited angular polygonal lesions
    ctx.save();
    ctx.translate(w / 2, h / 2 - 15);

    // Palmate 3-lobed cotton leaf outline
    ctx.fillStyle = '#36612E';
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.bezierCurveTo(-50, 120, -140, 90, -170, 30);
    ctx.lineTo(-190, -30);
    ctx.bezierCurveTo(-140, -40, -90, -20, -60, -50);
    ctx.lineTo(0, -165);
    ctx.lineTo(60, -50);
    ctx.bezierCurveTo(90, -20, 140, -40, 190, -30);
    ctx.bezierCurveTo(170, 30, 140, 90, 50, 120);
    ctx.closePath();
    ctx.fill();

    // Palmate Main Ribs
    ctx.strokeStyle = '#5B8C4C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(0, -155);
    ctx.moveTo(0, 140);
    ctx.lineTo(-180, -25);
    ctx.moveTo(0, 140);
    ctx.lineTo(180, -25);
    ctx.stroke();

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#4A753E';
    for (let a = -100; a <= 100; a += 40) {
      ctx.beginPath();
      ctx.moveTo(0, a);
      ctx.lineTo(-70, a - 25);
      ctx.moveTo(0, a);
      ctx.lineTo(70, a - 25);
      ctx.stroke();
    }

    const drawAngularLesion = (coords: number[][]) => {
      ctx.fillStyle = 'rgba(75, 105, 52, 0.8)';
      ctx.beginPath();
      ctx.moveTo(coords[0][0], coords[0][1]);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i][0], coords[i][1]);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#261408';
      ctx.beginPath();
      ctx.moveTo(coords[0][0] * 0.9, coords[0][1] * 0.9);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i][0] * 0.9, coords[i][1] * 0.9);
      }
      ctx.closePath();
      ctx.fill();
    };

    drawAngularLesion([[-25, -40], [-55, -55], [-45, -80], [-18, -65]]);
    drawAngularLesion([[15, -20], [50, -35], [60, -60], [20, -50]]);
    drawAngularLesion([[-30, 20], [-65, 10], [-55, 38], [-20, 45]]);
    drawAngularLesion([[25, 30], [60, 20], [70, 50], [30, 55]]);

    ctx.restore();
  }

  // Bottom Telemetry Metadata Bar
  ctx.fillStyle = 'rgba(10, 20, 12, 0.92)';
  ctx.fillRect(0, h - 52, w, 52);
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - 52);
  ctx.lineTo(w, h - 52);
  ctx.stroke();

  ctx.fillStyle = '#A5D6A7';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`SPECIMEN: ${demo.name.toUpperCase()} (${demo.latin})`, 16, h - 32);

  ctx.fillStyle = '#E8A238';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`LOC: ${demo.location.toUpperCase()}`, 16, h - 16);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '9px monospace';
  ctx.fillText(`FARMER: ${demo.farmer.toUpperCase()}`, w - 210, h - 32);
  ctx.fillStyle = '#78909C';
  ctx.fillText('AGRIMATE FIELD SENSOR v2.4 • VIS-NIR', w - 210, h - 16);
}

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
  const [activeDemoCase, setActiveDemoCase] = useState<DemoCase | null>(null);
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
      setActiveDemoCase(null);
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
      setActiveDemoCase(null);
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
      setActiveDemoCase(null);
    }
  };

  // One-click demo samples for hackathon presentation!
  const loadDemoSample = async (demo: DemoCase) => {
    setActiveDemoCase(demo);
    setLoading(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawSpecimenCanvas(ctx, demo);
      }
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${demo.key}_specimen.png`, { type: 'image/png' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('image', file);
        formData.append('language', language);
        formData.append('sampleName', demo.key);

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
      if (activeDemoCase) {
        formData.append('sampleName', activeDemoCase.key);
      }

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
    setActiveDemoCase(null);
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
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8A238]" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                  One-Click Hackathon Demo Cases
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#2E7D32]">
                6 Real-Life Cases
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Test instant diagnostic evaluation on authentic Indian agricultural outbreak cases with ICAR & KVK verified ground truth:
            </p>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {DEMO_CASES.map((sample) => {
                const isSelected = activeDemoCase?.key === sample.key;
                return (
                  <button
                    key={sample.key}
                    onClick={() => loadDemoSample(sample)}
                    disabled={loading}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group disabled:opacity-50 ${
                      isSelected
                        ? 'bg-[#EBF5ED] border-[#2E7D32] shadow-xs'
                        : 'bg-[#F7FBF8] hover:bg-[#EBF5ED] border-[#E2ECE3] hover:border-[#2E7D32]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-2xl shrink-0">{sample.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs text-[#123826] group-hover:text-[#2E7D32] transition-colors truncate">
                            {sample.name}
                          </strong>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            sample.severity === 'severe'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {sample.tag}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                          <span className="truncate">{sample.location} • {sample.farmer}</span>
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                      isSelected && loading
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : 'bg-white border-[#CCE0D0] text-[#123826] group-hover:bg-[#2E7D32] group-hover:text-white'
                    }`}>
                      {isSelected && loading ? 'Scanning...' : 'Simulate'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#FFE0A3] text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Kisan Safety Principle:</strong> All diagnostic chemical formulations specify statutory Pre-Harvest Intervals (PHI) and CIBRC-approved dosages.
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
          {/* Active Outbreak Case Context Banner */}
          {activeDemoCase && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#123826] to-[#1E4D34] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white/10">{activeDemoCase.icon}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#E8A238] text-[#123826]">
                      Validated Field Outbreak Case
                    </span>
                    <span className="text-xs text-[#A5D6A7] font-mono">
                      ICAR / KVK Ground Truth
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8A238] shrink-0" />
                    <span>{activeDemoCase.location} • {activeDemoCase.farmer}</span>
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    {activeDemoCase.description}
                  </p>
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Causal Pathogen</span>
                <span className="text-xs font-mono font-bold text-[#E8A238]">{activeDemoCase.latin}</span>
              </div>
            </div>
          )}
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
