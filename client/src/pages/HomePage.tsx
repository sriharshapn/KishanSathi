import React, { useState } from 'react';
import type { Language, NavigationPage, Commodity } from '../types';
import { 
  ArrowUpRight, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  MapPin
} from 'lucide-react';

interface HomePageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
  onSelectCropAndNavigate?: (cropName: string) => void;
  onSearchAndNavigate?: (crop?: string, location?: string) => void;
  commodities?: Commodity[];
}

/**
 * KisanSathi Authentic Behance Design Implementation
 * Recreating the exact UI from Anastasia Chugueva's AgroInvest:
 * - Color Palette: Deep Forest Green (#022113), Dark Olive (#59701E / #4A6016), 
 *   Electric Lime (#DFEB38), Card White (#FFFFFF), Inset Pale Gray (#F0F2EB / #F8FAF6).
 * - Typography: Montserrat (Headings, Buttons, Numbers), Open Sans (Body, Descriptions).
 */
const QUICK_PRODUCE_OPTIONS = [
  { name: 'Tomato', label: 'Tomato', sub: 'टमाटर', modalRate: 2450, mandi: 'Bengaluru, KA', msp: 2100 },
  { name: 'Onion', label: 'Onion', sub: 'प्याज़', modalRate: 1850, mandi: 'Nashik, MH', msp: 1650 },
  { name: 'Potato', label: 'Potato', sub: 'आलू', modalRate: 1620, mandi: 'Agra, UP', msp: 1500 },
  { name: 'Maize', label: 'Maize', sub: 'मक्का', modalRate: 2150, mandi: 'Davanagere, KA', msp: 2090 },
  { name: 'Paddy', label: 'Paddy', sub: 'धान', modalRate: 2320, mandi: 'Raichur, KA', msp: 2300 },
  { name: 'Cotton', label: 'Cotton', sub: 'कपास', modalRate: 7120, mandi: 'Guntur, AP', msp: 6620 },
];

// Location-based price multiplier so rates realistically vary by mandi hub
const MANDI_PRICE_MULTIPLIER: Record<string, number> = {
  bengaluru: 1.08, kolar: 1.02, nashik: 1.05, lasalgaon: 1.03,
  agra: 0.97, davanagere: 0.96, raichur: 0.94, guntur: 0.99,
  ballari: 0.95, azadpur: 1.04, unjha: 1.01, kota: 0.98,
  khanna: 0.96, kolkata: 1.03, indore: 0.99,
};
const getMandiMultiplier = (loc: string) => {
  const key = loc.trim().toLowerCase().split(/[\s,]+/)[0];
  return MANDI_PRICE_MULTIPLIER[key] ?? 1.0;
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSearchAndNavigate
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeSatelliteHotspot, setActiveSatelliteHotspot] = useState<number | null>(null);
  const [demoQuickCrop, setDemoQuickCrop] = useState('Tomato');
  const [demoQuickLocation, setDemoQuickLocation] = useState('Bengaluru');
  const [demoQuickQty, setDemoQuickQty] = useState(1000);

  const currentBenchmark = QUICK_PRODUCE_OPTIONS.find(
    p => p.name.toLowerCase() === demoQuickCrop.toLowerCase()
  ) || QUICK_PRODUCE_OPTIONS[0];

  const mandiMultiplier = getMandiMultiplier(demoQuickLocation);
  const adjustedModalRate = Math.round(currentBenchmark.modalRate * mandiMultiplier);
  const qtlCount = demoQuickQty / 100;
  const estimatedGross = Math.round(qtlCount * adjustedModalRate);
  const estimatedFreight = Math.round(350 + qtlCount * 65);
  const estimatedNet = Math.max(0, estimatedGross - estimatedFreight);
  const mspBenchmarkTotal = Math.round(qtlCount * currentBenchmark.msp);
  const gainPct = Number((((estimatedNet - mspBenchmarkTotal) / mspBenchmarkTotal) * 100).toFixed(1));

  const satelliteSpecs = [
    {
      id: 1,
      pct: '92%',
      label: 'Canopy NDVI & vegetative vigor index.',
      thumb: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80',
      pos: 'top-[8%] left-[2%] sm:left-[8%]'
    },
    {
      id: 2,
      pct: '88%',
      label: 'Soil moisture & surface hydration.',
      thumb: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80',
      pos: 'top-[8%] right-[2%] sm:right-[8%]'
    },
    {
      id: 3,
      pct: '74%',
      label: 'Multi-band nitrogen & thermal stress.',
      thumb: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=150&q=80',
      pos: 'bottom-[8%] left-[4%] sm:left-[12%]'
    },
    {
      id: 4,
      pct: '10m',
      label: 'Spatial ground resolution per pixel.',
      thumb: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&q=80',
      pos: 'bottom-[8%] right-[4%] sm:right-[12%]'
    }
  ];

  const faqs = [
    {
      id: 1,
      q: 'How does KisanSathi compute real-time Mandi price discovery?',
      a: 'We ingest live official arrival and modal rate feeds from 2,400+ APMC mandis across India, calculating transportation fuel costs, local market demand, and historical variance to compute your true net farm-gate realization with zero price hallucination.',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      q: 'How does Sentinel-2 satellite NDVI crop health monitoring work?',
      a: 'KisanSathi pulls 10-meter multispectral optical and infrared satellite bands from European Space Agency Sentinel-2 satellites to measure chlorophyll absorption and compute Normalized Difference Vegetation Index (NDVI) for any parcel in India.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      q: 'Can I receive agronomy advice in Hindi, Kannada, Telugu, or Marathi?',
      a: 'Yes. KisanSathi is natively tuned for 10 regional Indian languages with localized vernacular crop dictionaries and regional agronomic practices.',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      q: 'Is KisanSathi free for individual farmers and FPOs?',
      a: 'Yes. Core mandi price terminals, weather alerts, and AI advisory are 100% free and open as a Digital Public Good. Advanced enterprise spatial analytics are available for cooperatives and agribusinesses.',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchAndNavigate) {
      onSearchAndNavigate(demoQuickCrop, demoQuickLocation);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#022113] font-['Open_Sans',sans-serif] selection:bg-[#DFEB38] selection:text-[#022113]">
      
      {/* ── 1. EXACT BEHANCE HERO SECTION (Image 1) ───────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 pt-4 pb-10">
        
        {/* Main Hero Outer Canvas Box */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-cover bg-center border border-[#022113]/10 shadow-xl"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85')`
          }}
        >
          {/* Subtle soft gradient over field */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF6]/40 via-transparent to-[#022113]/50 pointer-events-none" />

          {/* Hero Top Content Grid */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
            
            {/* Top Row: Floating Video Badge (Left) + Center Headline + Collaboration Button */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16 pt-4">
              
              {/* Left: Live Data Status Pill */}
              <div className="lg:col-span-3 flex items-start">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-white/60">
                  <span className="w-2 h-2 rounded-full bg-[#59701E] animate-pulse shrink-0" />
                  <span className="text-[11px] font-bold text-[#022113] font-['Montserrat',sans-serif]">2,400+ Mandis Live</span>
                </div>
              </div>

              {/* Center Main Headline & Collaboration CTA */}
              <div className="lg:col-span-6 text-center space-y-4">
                <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-[#022113] font-['Montserrat',sans-serif] leading-[1.05]">
                  Intelligence for <br />
                  <span className="font-light text-[#022113]">Farmers & Mandis</span>
                </h1>

                <p className="text-xs sm:text-sm text-[#022113]/80 max-w-md mx-auto leading-relaxed font-medium">
                  Real-time APMC Mandi rates, Sentinel-2 satellite crop health monitoring, and AI agronomy advisory for farmers and agri-enterprises across India.
                </p>

                {/* Big Lime Collaboration Pill with Attached Down-Arrow Circle */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      const el = document.getElementById('analytics-mission-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center gap-3 bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] pl-7 pr-3 py-2.5 rounded-full font-bold text-xs sm:text-sm font-['Montserrat',sans-serif] shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Explore Mandis</span>
                    <span className="w-8 h-8 rounded-full bg-[#546C18] text-[#DFEB38] flex items-center justify-center group-hover:translate-y-0.5 transition-transform shadow-xs">
                      <ArrowDown className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Spacer / Balance */}
              <div className="hidden lg:block lg:col-span-3"></div>
            </div>

            {/* Bottom Row Overlaid on Field: 5 Cards (Smart Farm, +14.6%, +1.1%, Movement of Mandi Rates, +2400 Report) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch pt-8">
              
              {/* Card 1: Smart Farm Mechanization (Left White Card) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-2xl border border-white/80 flex flex-col justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80" 
                      alt="Tractor in agricultural field" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#022113] font-['Montserrat',sans-serif] leading-tight">
                      Smart Farm <br />Mechanization
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug line-clamp-3">
                      Track modern farm machinery rental rates, custom hiring center (CHC) availability, and fuel cost economics per acre.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex items-center gap-2 bg-[#DFEB38] hover:bg-[#cde025] text-[#022113] px-5 py-2.5 rounded-full font-bold text-xs font-['Montserrat',sans-serif] transition shadow-xs cursor-pointer"
                  >
                    <span>Explore Fleet</span>
                    <span className="w-5 h-5 rounded-full bg-[#546C18] text-[#DFEB38] flex items-center justify-center">
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 2: +14,6% (Frosted Card) */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="lg:col-span-2 bg-[#546C18]/60 backdrop-blur-md rounded-3xl p-5 text-white border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer hover:bg-[#546C18]/70 transition"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-300 font-mono block">APMC Arbitrage</span>
                  <span className="text-3xl lg:text-4xl font-extrabold font-['Montserrat',sans-serif] text-white block mt-1">
                    +14.6%
                  </span>
                </div>
                <p className="text-[11px] text-stone-200 leading-snug mt-2">
                  Average net profit increase for farmers utilizing inter-mandi price arbitrage.
                </p>
              </div>

              {/* Card 3: +1,1% (Frosted Card) */}
              <div 
                onClick={() => onNavigate('satellite')}
                className="lg:col-span-2 bg-[#546C18]/60 backdrop-blur-md rounded-3xl p-5 text-white border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer hover:bg-[#546C18]/70 transition"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-300 font-mono block">NDVI Recovery</span>
                  <span className="text-3xl lg:text-4xl font-extrabold font-['Montserrat',sans-serif] text-[#DFEB38] block mt-1">
                    +1.1%
                  </span>
                </div>
                <p className="text-[11px] text-stone-200 leading-snug mt-2">
                  Monthly vegetative index recovery monitored by Sentinel-2 multispectral sensors.
                </p>
              </div>

              {/* Card 4: Movement of Mandi Rates with 5 3D Neon Bars (Frosted Card) */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="lg:col-span-2 bg-[#546C18]/60 backdrop-blur-md rounded-3xl p-5 text-white border border-white/20 shadow-xl flex flex-col justify-between relative cursor-pointer hover:bg-[#546C18]/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-['Montserrat',sans-serif] text-white leading-tight">
                      Movement of <br />Mandi Rates
                    </h4>
                    <p className="text-[10px] text-stone-300 mt-1">Modal price trend across 2,400+ APMC mandis</p>
                    <span className="text-[11px] font-bold text-[#DFEB38] font-mono block mt-0.5">↑ +9.6%/month</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 5 Neon Lime 3D Vertical Rising Bars */}
                <div className="h-16 flex items-end gap-1.5 pt-3">
                  <div className="flex-1 bg-[#DFEB38] rounded-t-lg shadow-[0_0_12px_rgba(223,235,56,0.5)] transition-all hover:brightness-110" style={{ height: '35%' }} />
                  <div className="flex-1 bg-[#DFEB38] rounded-t-lg shadow-[0_0_12px_rgba(223,235,56,0.5)] transition-all hover:brightness-110" style={{ height: '55%' }} />
                  <div className="flex-1 bg-[#DFEB38] rounded-t-lg shadow-[0_0_12px_rgba(223,235,56,0.5)] transition-all hover:brightness-110" style={{ height: '48%' }} />
                  <div className="flex-1 bg-[#DFEB38] rounded-t-lg shadow-[0_0_12px_rgba(223,235,56,0.5)] transition-all hover:brightness-110" style={{ height: '78%' }} />
                  <div className="flex-1 bg-[#DFEB38] rounded-t-lg shadow-[0_0_12px_rgba(223,235,56,0.5)] transition-all hover:brightness-110" style={{ height: '100%' }} />
                </div>
              </div>

              {/* Card 5: +2,400 Report Column (Tall White Card with cross pattern) */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-2xl border border-white/80 flex flex-col justify-between text-left cursor-pointer hover:shadow-lg transition"
              >
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">
                    KisanSathi Mandi Telemetry Report
                  </span>

                  {/* Diamond / Plus Pattern Texture */}
                  <div className="py-3 grid grid-cols-5 gap-1.5 opacity-20 text-[10px] font-mono text-center text-[#022113]">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <span key={i}>+</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] block">
                    +2,400
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                    Regulated APMC mandis connected with real-time price telemetry.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ── 2. EXACT 73K ANALYTICS & MISSION SECTION (Image 1 Bottom) ────────── */}
      <section id="analytics-mission-section" className="mx-auto max-w-[1440px] px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main White Container (73K Gauge + Smiling Farmer Photo + Analytics Copy) */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-6 sm:p-10 border border-[#022113]/10 shadow-sm flex flex-col md:flex-row items-center gap-8">
            
            {/* 86K Donut Gauge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#F0F2EB" strokeWidth="8" fill="none" />
                  {/* 78% dark arc: 251.2 × 0.78 = 195.9, offset = 251.2 - 195.9 = 55.3 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#022113" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="55.3" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                  {/* 22% olive arc: 251.2 × 0.22 = 55.3, offset = 251.2 - 55.3 = 195.9 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#59701E" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="195.9" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-[#022113] font-['Montserrat',sans-serif]">86K</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#022113]" />
                  <span className="text-stone-600">Smallholder Farmers</span>
                  <span className="font-bold text-[#022113] ml-auto">78%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#59701E]" />
                  <span className="text-stone-600">FPOs & Agri-Traders</span>
                  <span className="font-bold text-[#022113] ml-auto">22%</span>
                </div>
              </div>
            </div>

            {/* Smiling Farmer Photo with straw hat & green produce */}
            <div className="w-44 h-44 rounded-3xl overflow-hidden shrink-0 shadow-md border border-[#022113]/10">
              <img 
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=500&q=80" 
                alt="Smiling woman farmer with straw hat and fresh greens" 
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* KisanSathi Analytics Text + Double Pill Button */}
            <div className="space-y-3 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] tracking-tight">
                KisanSathi <br />Intelligence
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                India's sovereign agri-intelligence network combining Agmarknet terminal prices, ISRO & ESA Sentinel-2 multispectral satellite telemetry, and Gemini 3.8 AI agronomist advisory in 10 regional Indian dialects.
              </p>

              {/* Authentic Behance Double-Pill Button: Lime Pill + Circlepod Arrow */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="group inline-flex items-center gap-2 bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] pl-6 pr-2 py-2 rounded-full font-bold text-xs font-['Montserrat',sans-serif] shadow-sm transition-all cursor-pointer"
                >
                  <span>Explore Analytics</span>
                  <span className="w-7 h-7 rounded-full bg-white text-[#022113] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Dark Olive Card (Our Mission) */}
          <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-lg flex flex-col justify-between min-h-[300px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[#DFEB38]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2v20M12 4c-3 0-5 2-5 5 0 2 2 3 5 3M12 4c3 0 5 2 5 5 0 2-2 3-5 3" />
                </svg>
              </div>
              <span className="text-sm font-bold font-['Montserrat',sans-serif] tracking-tight text-white">KisanSathi</span>
            </div>

            <div className="my-6">
              <h3 className="text-3xl font-extrabold font-['Montserrat',sans-serif] text-white">
                Our mission
              </h3>
              <p className="text-xs sm:text-sm text-stone-100 leading-relaxed mt-3 font-normal">
                Eliminate market information asymmetry, bridge fair farm-gate realizations, and equip every Indian farmer with sovereign AI decision support.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => onNavigate('about')}
                className="w-12 h-12 rounded-full border border-white/30 hover:bg-white text-white hover:text-[#546C18] flex items-center justify-center transition cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ── 3. EXACT OUR SERVICES SECTION (Image 2) ────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 py-12">
        
        {/* Section Header with Left Title and Right Carousel Navigation Circles */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] uppercase tracking-tight">
              Our Services
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Our platform <span className="text-[#59701E]">provides sovereign agricultural intelligence tools</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Services Cards (Mandi Price Terminal, Satellite NDVI, AI Pathology) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Mandi Price Terminal */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="bg-[#F0F2EB] rounded-[2.5rem] p-7 sm:p-8 flex flex-col justify-between min-h-[460px] border border-[#022113]/5 hover:shadow-md transition cursor-pointer group"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-stone-500 font-mono">Live APMC Rates</span>
                <span className="w-10 h-10 rounded-full border border-[#022113]/40 flex items-center justify-center text-[#022113] group-hover:bg-[#DFEB38] transition">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Montserrat',sans-serif] text-[#022113] mt-4">
                Mandi Price <br />Terminal
              </h3>
            </div>

            <div className="mt-8 rounded-3xl overflow-hidden aspect-[16/10] shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80" 
                alt="Green tractors harvesting crops" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Card 2: Satellite Crop NDVI Analytics (Center Dark Olive Active Card) */}
          <div className="bg-[#546C18] text-white rounded-[2.5rem] p-7 sm:p-8 flex flex-col justify-between min-h-[460px] shadow-xl">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-white/70 font-mono">Sentinel-2 Multispectral</span>
                <span className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white">
                  <ArrowDown className="w-5 h-5 -rotate-45" />
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Montserrat',sans-serif] text-white mt-4">
                Satellite Crop <br />NDVI Analytics
              </h3>
            </div>

            {/* Inner White Card with text and button */}
            <div className="mt-8 bg-white text-[#022113] rounded-3xl p-6 shadow-md space-y-4">
              <p className="text-xs leading-relaxed text-stone-600 font-normal">
                Track field-level vegetative vigor, soil moisture anomalies, and nitrogen stress directly from orbit before symptoms become visible on the ground.
              </p>
              <button 
                onClick={() => onNavigate('satellite')}
                className="w-full py-2.5 px-4 rounded-full border border-[#022113] text-[#022113] hover:bg-[#DFEB38] font-bold text-xs font-['Montserrat',sans-serif] transition cursor-pointer"
              >
                Launch Satellite NDVI
              </button>
            </div>
          </div>

          {/* Card 3: AI Pathology & Agronomy Advisory */}
          <div 
            onClick={() => onNavigate('diagnose')}
            className="bg-[#F0F2EB] rounded-[2.5rem] p-7 sm:p-8 flex flex-col justify-between min-h-[460px] border border-[#022113]/5 hover:shadow-md transition cursor-pointer group"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-stone-500 font-mono">Gemini 3.8 AI Vision</span>
                <span className="w-10 h-10 rounded-full border border-[#022113]/40 flex items-center justify-center text-[#022113] group-hover:bg-[#DFEB38] transition">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Montserrat',sans-serif] text-[#022113] mt-4">
                AI Pathology & <br />Agronomy Advisory
              </h3>
            </div>

            <div className="mt-8 rounded-3xl overflow-hidden aspect-[16/10] shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=700&q=80" 
                alt="Agronomist field inspection and plant leaf pathology diagnosis" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>

        </div>
      </section>


      {/* ── 4. SATELLITE REMOTE SENSING & ORBITAL MAPPING ── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 py-12">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] uppercase tracking-tight">
              Revolution in <br />Satellite Agronomy
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Copernicus Sentinel-2 multispectral earth observation <span className="text-[#59701E]">captures vegetative vigor, canopy nitrogen, and root hydration across every farm parcel in India.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Satellite Earth Observation Stage (Zero Nested Images) */}
        <div 
          className="relative rounded-[2.5rem] overflow-hidden bg-[#022113] border border-[#022113]/10 shadow-2xl py-12 sm:py-16 px-4 sm:px-12 min-h-[600px] sm:min-h-[680px] flex flex-col justify-between bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85')`
          }}
        >
          {/* Atmospheric Depth Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/75 pointer-events-none" />

          {/* Left Decorative Pillar with Plus symbols */}
          <div className="absolute left-6 top-10 bottom-10 hidden lg:flex flex-col justify-between opacity-30 text-xs font-mono text-white pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i}>+</span>
            ))}
          </div>

          {/* Right Decorative Pillar with Plus symbols */}
          <div className="absolute right-6 top-10 bottom-10 hidden lg:flex flex-col justify-between opacity-30 text-xs font-mono text-white pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i}>+</span>
            ))}
          </div>

          {/* Center Title */}
          <div className="relative z-10 text-center space-y-2 max-w-3xl mx-auto pt-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#DFEB38] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#DFEB38] animate-pulse" />
              <span>Copernicus Sentinel-2 • Orbital Telemetry</span>
            </div>
            <h3 className="text-3xl sm:text-6xl font-black text-white font-['Montserrat',sans-serif] tracking-tight leading-tight">
              Sentinel-2 for <br />
              <span className="font-light italic text-[#DFEB38]">orbital field mapping</span>
            </h3>
          </div>

          {/* 4 Interactive Hotspot Callout Cards - Positioned directly over the Earth */}
          <div className="relative z-10 my-6 sm:my-10">
            <div className="relative max-w-5xl mx-auto h-[320px] sm:h-[360px]">
              {satelliteSpecs.map((spec) => (
                <div 
                  key={spec.id}
                  className={`absolute ${spec.pos} z-20 transition-all duration-200 hover:scale-105 cursor-pointer`}
                  onClick={() => setActiveSatelliteHotspot(activeSatelliteHotspot === spec.id ? null : spec.id)}
                >
                  <div className="bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-white/40 flex items-center gap-3 transition-shadow">
                    <div>
                      <div className="flex items-center gap-1.5 font-black text-xs text-[#022113] font-['Montserrat',sans-serif]">
                        <span>{spec.pct}</span>
                        <span className="w-2 h-2 rounded-full bg-[#546C18]" />
                      </div>
                      <p className="text-[11px] text-[#022113]/75 font-semibold max-w-[150px] leading-snug mt-0.5 font-['Open_Sans',sans-serif]">
                        {spec.label}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#022113]/10 shadow-xs">
                      <img src={spec.thumb} alt={spec.label} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Down-Arrow Circle */}
          <div className="relative z-10 flex justify-center pb-2">
            <button 
              onClick={() => onNavigate('satellite')}
              className="w-14 h-14 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95 group"
              title="Launch Satellite NDVI Terminal"
            >
              <ArrowDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
            </button>
          </div>

        </div>
      </section>


      {/* ── 5. EXACT FREQUENTLY ASKED QUESTIONS SECTION (Image 3) ──────────── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 py-12">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] uppercase tracking-tight">
              Frequently <br />Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Our team has prepared a list of frequently asked questions <span className="text-[#59701E]">to help you quickly find answers to the most important issues.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-11 h-11 rounded-full border border-[#022113]/30 flex items-center justify-center hover:bg-white transition text-[#022113] cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 FAQ Cards: Card 1 Featured with Greenhouse image, Cards 2-4 Off-white with Down-Arrow Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Card 1: Featured Photo Card */}
          <div className="rounded-[2.5rem] overflow-hidden relative p-7 sm:p-8 flex flex-col justify-end text-white min-h-[380px] shadow-lg">
            <img 
              src={faqs[0].image} 
              alt="Greenhouse" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#022113] via-[#022113]/60 to-transparent" />
            
            <div className="relative z-10 space-y-3">
              <h3 className="text-lg font-bold font-['Montserrat',sans-serif] text-white leading-snug">
                {faqs[0].q}
              </h3>
              <p className="text-xs text-stone-200 leading-relaxed font-normal">
                {faqs[0].a}
              </p>
            </div>
          </div>

          {/* Cards 2, 3, 4: Photo Cards with toggle overlay */}
          {faqs.slice(1).map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div 
                key={faq.id}
                onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                className="rounded-[2.5rem] overflow-hidden relative p-7 sm:p-8 flex flex-col justify-end text-white min-h-[380px] shadow-lg cursor-pointer hover:shadow-xl transition"
              >
                <img 
                  src={(faq as { image?: string }).image} 
                  alt={faq.q}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-75 hover:scale-105 transition duration-500"
                />
                <div className={`absolute inset-0 transition-opacity duration-300 ${isOpen ? 'bg-gradient-to-t from-[#022113] via-[#022113]/80 to-[#022113]/40' : 'bg-gradient-to-t from-[#022113] via-[#022113]/60 to-transparent'}`} />
                
                <div className="relative z-10 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold font-['Montserrat',sans-serif] text-white leading-snug">
                    {faq.q}
                  </h3>
                  {isOpen && (
                    <p className="text-xs text-stone-200 leading-relaxed animate-in fade-in font-normal">
                      {faq.a}
                    </p>
                  )}
                  <div className="flex justify-start pt-2">
                    <span className={`w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white transition-transform ${isOpen ? 'rotate-180 bg-[#DFEB38]/30' : ''}`}>
                      <ArrowDown className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </section>


      {/* ── 6. QUICK MANDI REALIZATION TERMINAL (Behance AgroInvest Bento Redesign) ── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 py-10">
        <div className="rounded-[2.5rem] bg-white border border-[#022113]/8 p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left Column: Context, Methodology & Value Prop */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#546C18] bg-[#F0F2EB] px-4 py-1.5 rounded-full inline-block font-['Montserrat',sans-serif] border border-[#022113]/8 shadow-sm">
                  Agro-Financial Realization Terminal
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#022113] font-['Montserrat',sans-serif] tracking-tight leading-[1.08]">
                  Calculate Real Net Returns <br className="hidden sm:inline" />
                  <span className="text-[#546C18]">Before You Haul</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#022113]/70 leading-relaxed font-normal">
                  KisanSathi normalizes your harvest volume against live Agmarknet APMC modal prices, automatically deducting transit diesel costs and market cess to compute your true in-hand realization with zero price hallucination.
                </p>
                
                <div className="pt-2 flex flex-wrap gap-2.5 text-xs font-bold text-[#022113] font-['Montserrat',sans-serif]">
                  <span className="flex items-center gap-2 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                    <CheckCircle2 className="w-4 h-4 text-[#546C18]" />
                    Agmarknet Verified
                  </span>
                  <span className="flex items-center gap-2 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                    <CheckCircle2 className="w-4 h-4 text-[#546C18]" />
                    Fuel & Cess Deducted
                  </span>
                  <span className="flex items-center gap-2 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                    <CheckCircle2 className="w-4 h-4 text-[#546C18]" />
                    Zero Hallucination
                  </span>
                </div>
              </div>

              {/* Verified Mandi Telemetry Trust Card */}
              <div className="bg-[#F0F2EB] p-5 sm:p-6 rounded-[2rem] border border-[#022113]/8 space-y-3">
                <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif]">
                  <span className="text-[#022113]/60 font-bold uppercase tracking-wider">APMC Network</span>
                  <span className="text-[#546C18] font-black">2,400+ Mandis Live</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif]">
                  <span className="text-[#022113]/60 font-bold uppercase tracking-wider">Daily Arrivals Tracked</span>
                  <span className="text-[#022113] font-bold">100% Govt Audited</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif]">
                  <span className="text-[#022113]/60 font-bold uppercase tracking-wider">Pricing Precision</span>
                  <span className="text-[#546C18] font-bold">Real Auction Modal</span>
                </div>
              </div>
            </div>

            {/* Right Column: Redesigned Interactive Calculator Bento Card */}
            <div className="lg:col-span-7 rounded-[2.5rem] bg-[#F0F2EB] border border-[#022113]/8 p-6 sm:p-9 shadow-lg flex flex-col justify-between space-y-6">
              
              {/* Form Controls */}
              <form onSubmit={handleQuickLaunch} className="space-y-5">
                
                {/* 1. Crop Selection as Visual Capsule Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#022113] uppercase tracking-wider font-['Montserrat',sans-serif]">
                      Select Commodity / Produce
                    </label>
                    <span className="text-[11px] font-semibold text-[#546C18] bg-white px-2.5 py-0.5 rounded-full border border-[#022113]/8 font-['Montserrat',sans-serif]">
                      Grade-A FAQ
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {QUICK_PRODUCE_OPTIONS.map((item) => {
                      const isSelected = demoQuickCrop.toLowerCase() === item.name.toLowerCase();
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setDemoQuickCrop(item.name);
                            if (!demoQuickLocation || demoQuickLocation === 'Ballari') {
                              setDemoQuickLocation(item.mandi.split(',')[0]);
                            }
                          }}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[#546C18] text-white border-[#546C18] shadow-md'
                              : 'bg-white hover:bg-[#E5EAD7] text-[#022113] border-[#022113]/8'
                          }`}
                        >
                          <span className={`text-xs font-black font-['Montserrat',sans-serif] ${isSelected ? 'text-[#DFEB38]' : 'text-[#022113]'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#022113]/50'}`}>
                            {item.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Target Mandi & District */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#022113] uppercase tracking-wider font-['Montserrat',sans-serif]">
                    Target Mandi / Trade Hub
                  </label>
                  <div className="relative rounded-2xl border border-[#022113]/10 bg-white focus-within:border-[#546C18] transition-all shadow-inner px-4 py-3 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#546C18] shrink-0" />
                    <input
                      type="text"
                      value={demoQuickLocation}
                      onChange={(e) => setDemoQuickLocation(e.target.value)}
                      placeholder="e.g. Ballari, Nashik, Agra, Guntur"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#022113] placeholder-[#022113]/40 outline-none"
                    />
                  </div>

                  {/* Quick Mandi Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-[#022113]/50 font-['Montserrat',sans-serif] mr-1">
                      Quick Hubs:
                    </span>
                    {['Bengaluru', 'Nashik', 'Agra', 'Davanagere', 'Guntur'].map(hub => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => setDemoQuickLocation(hub)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                          demoQuickLocation.toLowerCase().includes(hub.toLowerCase())
                            ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                            : 'bg-white text-[#022113] hover:bg-[#E5EAD7] border border-[#022113]/8'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Produce Volume & Stepper / Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif]">
                    <label className="font-bold text-[#022113] uppercase tracking-wider">
                      Batch Volume
                    </label>
                    <span className="font-extrabold text-[#546C18]">
                      {demoQuickQty.toLocaleString('en-IN')} kg ({qtlCount} Quintals)
                    </span>
                  </div>

                  {/* Quick Preset Volume Pills */}
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDemoQuickQty(val)}
                        className={`py-2 px-1 rounded-xl text-center text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                          demoQuickQty === val
                            ? 'bg-[#546C18] text-white shadow-sm'
                            : 'bg-white text-[#022113] hover:bg-[#E5EAD7] border border-[#022113]/8'
                        }`}
                      >
                        {val >= 1000 ? `${val / 1000} Ton` : `${val} kg`}
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider with Custom Accent */}
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={demoQuickQty}
                    onChange={(e) => setDemoQuickQty(Number(e.target.value))}
                    className="w-full accent-[#546C18] cursor-pointer mt-1"
                  />
                </div>

                {/* 4. Live Net Realization Card (Deep Utility & High Aesthetic) */}
                <div className="bg-[#546C18] text-white rounded-[2rem] p-5 sm:p-6 shadow-md border border-[#546C18]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] bg-white/10 px-3 py-1 rounded-full text-white/90">
                      Live Net Realization
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DFEB38] text-[#022113] text-[11px] font-black font-['Montserrat',sans-serif] uppercase tracking-wider">
                      {gainPct > 0 ? `+${gainPct}% Over MSP` : 'At Fair Market Value'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/70 font-['Montserrat',sans-serif] uppercase tracking-wider block">
                      Estimated In-Hand Net Return
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-white font-['Montserrat',sans-serif] tracking-tight">
                        ₹{estimatedNet.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-white/70 font-normal">
                        (@ ₹{(adjustedModalRate / 100).toFixed(2)}/kg)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
                    <div>
                      <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] block">Gross Auction Value</span>
                      <span className="font-bold text-white font-['Montserrat',sans-serif] mt-0.5 block">
                        ₹{estimatedGross.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] block">Est. Freight & Cess</span>
                      <span className="font-bold text-[#DFEB38] font-['Montserrat',sans-serif] mt-0.5 block">
                        -₹{estimatedFreight.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Signature Electric Lime Action Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] font-['Montserrat',sans-serif]"
                >
                  <span>Query 2,400+ Mandis in Real-Time Terminal</span>
                  <ArrowRight className="w-4 h-4 text-[#022113] stroke-[2.5]" />
                </button>
              </form>

            </div>

          </div>
        </div>
      </section>


      {/* ── 7. EXACT COLLABORATION CTA & FOOTER (Image 4) ────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-6 py-12">
        <div className="bg-[#F0F2EB] rounded-[2.5rem] p-8 sm:p-14 border border-[#022113]/5">
          
          {/* Top CTA Row: Headline + Collaboration Double Pill Button on Left, Links on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-16 border-b border-[#022113]/10">
            
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#022113] font-['Montserrat',sans-serif] leading-tight">
                Isn't it time to empower your farm with sovereign agricultural intelligence?
              </h2>

              {/* Exact Double-Pill Collaboration Button */}
              <div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="group inline-flex items-center gap-3 bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] pl-8 pr-2.5 py-2.5 rounded-full font-bold text-sm font-['Montserrat',sans-serif] shadow-sm transition-all cursor-pointer"
                >
                  <span>Launch Mandi Terminal</span>
                  <span className="w-8 h-8 rounded-full bg-white text-[#022113] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shadow-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>

            {/* Links on Right: Sovereign Solutions & Public Infrastructure */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="text-base font-bold font-['Montserrat',sans-serif] text-[#022113] mb-4">
                  Sovereign Solutions
                </h4>
                <ul className="space-y-2.5 text-stone-600 font-['Open_Sans',sans-serif]">
                  <li>
                    <button 
                      onClick={() => onNavigate('dashboard')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      Mandi Price Terminal
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('satellite')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      Satellite NDVI Telemetry
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('advisory')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      AI Crop Advisory
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('diagnose')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      Plant Disease Diagnostics
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-bold font-['Montserrat',sans-serif] text-[#022113] mb-4">
                  Public Infrastructure
                </h4>
                <ul className="space-y-2.5 text-stone-600 font-['Open_Sans',sans-serif]">
                  <li>
                    <button 
                      onClick={() => onNavigate('weather')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      Microclimate Telemetry
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('gov')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      State Extension Data Mesh
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('about')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      About KisanSathi Network
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate('contact')} 
                      className="hover:text-[#546C18] text-left cursor-pointer transition-colors"
                    >
                      KVK Help & Grievances
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Bar: KisanSathi Logo, Pill Navigation, Social Circles, Message Bubble */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo */}
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-2xl bg-[#546C18] flex items-center justify-center text-[#DFEB38]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2v20M12 4c-3 0-5 2-5 5 0 2 2 3 5 3M12 4c3 0 5 2 5 5 0 2-2 3-5 3M12 10c-3.5 0-6 2.5-6 5.5 0 2 2.5 3.5 6 3.5M12 10c3.5 0 6 2.5 6 5.5 0 2-2.5 3.5-6 3.5" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#022113] font-['Montserrat',sans-serif]">
                Kisan<span className="text-[#59701E]">Sathi</span>
              </span>
            </div>

            {/* Pill Navigation Capsule */}
            <div className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-xs border border-stone-200">
              <button onClick={() => onNavigate('home')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#022113] bg-[#F0F2EB] font-['Montserrat',sans-serif]">
                Home page
              </button>
              <button onClick={() => onNavigate('about')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] font-['Montserrat',sans-serif]">
                About us
              </button>
              <button onClick={() => onNavigate('advisory')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] font-['Montserrat',sans-serif]">
                Our services
              </button>
              <button onClick={() => onNavigate('gov')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] font-['Montserrat',sans-serif]">
                Latest news
              </button>
              <button onClick={() => onNavigate('dashboard')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] font-['Montserrat',sans-serif]">
                Shares
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default HomePage;
