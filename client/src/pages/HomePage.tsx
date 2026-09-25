import React, { useState, useRef } from 'react';
import type { Language, NavigationPage, Commodity } from '../types';
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Database, 
  Search, 
  X, 
  Sprout, 
  Layers, 
  PhoneCall,
  Compass
} from 'lucide-react';
import { ContinentalMosaic } from '../components/ContinentalMosaic';
import { IndiaMarketsMap } from '../components/IndiaMarketsMap';
import { COMPREHENSIVE_CROPS, resolveCropFromQuery } from '../data/cropDictionary';

interface HomePageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
  onSelectCropAndNavigate?: (cropName: string) => void;
  onSearchAndNavigate?: (crop?: string, location?: string) => void;
  commodities?: Commodity[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectCropAndNavigate,
  onSearchAndNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Live mandi ticker data (Agmarknet / e-NAM feeds feeding the advisory model)
  const liveTickers = [
    { crop: 'Maize', mandi: 'Davanagere APMC', state: 'Karnataka', modal: '₹2,150', unit: 'q', change: '+4.2%', trend: 'up' },
    { crop: 'Tomato', mandi: 'Ballari APMC', state: 'Karnataka', modal: '₹1,850', unit: 'q', change: '+2.6%', trend: 'up' },
    { crop: 'Onion', mandi: 'Lasalgaon APMC', state: 'Maharashtra', modal: '₹2,100', unit: 'q', change: '+1.9%', trend: 'up' },
    { crop: 'Cumin', mandi: 'Unjha APMC', state: 'Gujarat', modal: '₹28,500', unit: 'q', change: '+4.8%', trend: 'up' },
    { crop: 'Mustard', mandi: 'Kota APMC', state: 'Rajasthan', modal: '₹5,450', unit: 'q', change: '+2.1%', trend: 'up' },
    { crop: 'Wheat', mandi: 'Khanna APMC', state: 'Punjab', modal: '₹2,275', unit: 'q', change: '+1.1%', trend: 'up' },
    { crop: 'Potato', mandi: 'Agra APMC', state: 'Uttar Pradesh', modal: '₹1,480', unit: 'q', change: '-0.5%', trend: 'stable' },
    { crop: 'Green Chilli', mandi: 'Guntur APMC', state: 'Andhra Pradesh', modal: '₹3,400', unit: 'q', change: '+5.2%', trend: 'up' },
    { crop: 'Soybean', mandi: 'Indore APMC', state: 'Madhya Pradesh', modal: '₹4,600', unit: 'q', change: '+1.8%', trend: 'up' },
    { crop: 'Paddy / Rice', mandi: 'Burdwan APMC', state: 'West Bengal', modal: '₹2,550', unit: 'q', change: '+1.8%', trend: 'up' },
    { crop: 'Apple', mandi: 'Sopore Mandi', state: 'Jammu and Kashmir', modal: '₹5,200', unit: 'q', change: '+3.6%', trend: 'up' },
    { crop: 'Turmeric', mandi: 'Nizamabad APMC', state: 'Telangana', modal: '₹12,400', unit: 'q', change: '+4.1%', trend: 'up' },
  ];

  const filteredCrops = searchQuery.trim() === ''
    ? COMPREHENSIVE_CROPS.slice(0, 5)
    : COMPREHENSIVE_CROPS.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.primaryAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hindi.includes(searchQuery) || 
        c.kannada.includes(searchQuery) ||
        c.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.toLowerCase().includes(a.toLowerCase()))
      );

  const handleExecuteSearch = (targetCrop?: string, targetLocation?: string) => {
    setShowSuggestions(false);
    if (onSearchAndNavigate) {
      onSearchAndNavigate(targetCrop, targetLocation);
    } else if (targetCrop && onSelectCropAndNavigate) {
      onSelectCropAndNavigate(targetCrop);
    } else {
      onNavigate('dashboard');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      onNavigate('advisory');
      return;
    }
    const resolved = resolveCropFromQuery(query);
    handleExecuteSearch(resolved ? resolved.name : query);
  };

  const cropSliderRef = useRef<HTMLDivElement>(null);

  const slideLeft = () => {
    cropSliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const slideRight = () => {
    cropSliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const featuredCrops = [
    { name: 'Tomato', mandi: 'Ballari APMC', modal: '₹1,850', unit: 'q', change: '+2.6%', note: 'Solanaceous • High Yield' },
    { name: 'Onion', mandi: 'Lasalgaon APMC', modal: '₹2,100', unit: 'q', change: '+1.9%', note: 'Allium • Low Water Need' },
    { name: 'Maize', mandi: 'Davanagere APMC', modal: '₹2,150', unit: 'q', change: '+4.2%', note: 'Regenerative • Grade A' },
    { name: 'Green Chilli', mandi: 'Guntur APMC', modal: '₹3,400', unit: 'q', change: '+5.2%', note: 'High Soil Nitrogen Retainer' },
    { name: 'Potato', mandi: 'Hassan APMC', modal: '₹1,600', unit: 'q', change: '+0.8%', note: 'Tuber • Steady Returns' },
    { name: 'Paddy / Rice', mandi: 'Sindhanur APMC', modal: '₹2,450', unit: 'q', change: '+3.1%', note: 'Staple • MSP Grounded' },
    { name: 'Cotton', mandi: 'Hubballi APMC', modal: '₹7,200', unit: 'q', change: '+1.4%', note: 'Commercial • High Suitability' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* SECTION 1: HERO — Grounded in PRD Executive Summary */}
      <section className="relative overflow-hidden -mt-[88px] sm:-mt-[98px] pt-[124px] sm:pt-[138px] pb-10 sm:pb-14 bg-[#0F2316]">
        {/* Full-bleed background photo extending well past top */}
        <div
          className="absolute -top-20 inset-x-0 bottom-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1800&q=80&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        {/* Dark green scrim */}
        <div
          className="absolute -top-20 inset-x-0 bottom-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(15,35,22,0.88) 0%, rgba(15,35,22,0.65) 35%, rgba(15,35,22,0.85) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Universal Search Bar with Live Autocomplete */}
          <div className="max-w-3xl mx-auto relative z-30">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 pl-4 rounded-full border border-white/20 focus-within:border-[#2E7D32] shadow-lg hover:shadow-xl transition-all flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAEFE9] flex items-center justify-center text-[#2E7D32] shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search crop for AI advisory in English, ಕನ್ನಡ (Kadlekayi), or हिन्दी (टमाटर)..."
                  className="text-xs sm:text-sm text-[#153424] font-semibold flex-1 bg-transparent outline-none placeholder:text-stone-400 placeholder:font-normal"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#153424] hover:bg-[#2E7D32] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <span>Query Advisory</span>
                  <ArrowRight className="w-4 h-4 text-[#E8A238]" />
                </button>
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-[#E6E1D7] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#ECE8DE] text-xs">
                    <span className="font-bold text-[#153424] uppercase tracking-wider text-[11px]">
                      {searchQuery.trim() ? 'Matching Crops' : 'Popular Crops for Advisory'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                    <div className="space-y-1.5">
                      {filteredCrops.map((c) => (
                        <div
                          key={c.name}
                          onClick={() => handleExecuteSearch(c.name, undefined)}
                          className="p-2 rounded-xl hover:bg-[#EBF5ED] transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#123826] block">
                              {c.name} {c.primaryAlias && c.primaryAlias.toLowerCase() !== c.name.toLowerCase() ? `(${c.primaryAlias})` : ''}
                            </span>
                            <span className="text-[10px] text-stone-500">{c.kannada} • {c.hindi}</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-[#2E7D32]">{c.modal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Hero Editorial Header & Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A5D6A7] text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse"></span>
                <span>Open Digital Public Good for Indian Agriculture</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-['Syne',sans-serif] leading-[1.14]">
                Digital Agriculture Network for <span className="text-[#6FBF73] italic">India</span>
              </h1>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-['Outfit',sans-serif]">
                Democratising precision agriculture for 100M+ small & marginal farmers. Hyper-localised advisories fusing Sentinel-2 satellite imagery, soil health data, climate forecasting, and Gemini 2.0 Flash in 10+ Indian languages.
              </p>

              {/* 4 Core Pillars Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('advisory')}
                  className="px-6 py-3.5 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-emerald-200" />
                  <span>🌱 AI Crop Advisory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onNavigate('satellite')}
                  className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/25 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Compass className="w-4 h-4 text-[#A5D6A7]" />
                  <span>🛰️ Field Satellite Scan</span>
                </button>

                <button
                  onClick={() => onNavigate('diagnose')}
                  className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/25 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFE082]" />
                  <span>🔬 Disease Scan</span>
                </button>

                <button
                  onClick={() => onNavigate('gov')}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Layers className="w-4 h-4 text-white" />
                  <span>🔗 Gov Interop Portal</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-white/65">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#6FBF73]" />
                  <span>DPDP Act 2023 Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-[#E8A238]" />
                  <span>MeitY DPG Guidelines</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Database className="w-4 h-4 text-[#6FBF73]" />
                  <span>Zero Price Hallucination</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive National Agricultural Grid Map */}
            <div className="lg:col-span-5 animate-slide-up">
              <IndiaMarketsMap 
                onNavigate={onNavigate} 
                onSearchAndNavigate={onSearchAndNavigate} 
              />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: LIVE MARKET PRICE INPUT STREAM (Data Input for Advisory Engine) */}
      <section className="bg-[#ECE8DE]/60 border-y border-[#E6E1D7] py-3.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#153424]">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse"></span>
            <span className="uppercase tracking-wider text-[11px] font-mono">Official Agmarknet / e-NAM Rate Stream (Input Signals)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono hidden sm:block">Hover to pause • Click to inspect</span>
        </div>

        {/* Sliding Marquee Track */}
        <div className="overflow-hidden w-full select-none py-1">
          <div className="animate-slide-infinite flex items-center gap-3">
            {[...liveTickers, ...liveTickers].map((item, idx) => (
              <div
                key={`${item.crop}-${idx}`}
                onClick={() => {
                  if (onSelectCropAndNavigate) onSelectCropAndNavigate(item.crop);
                  else onNavigate('advisory');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-white/80 hover:border-[#2E7D32] shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#153424] flex items-center gap-1.5">
                    <span>{item.crop}</span>
                    <span className="text-[10px] text-stone-400 font-normal">({item.mandi})</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-black text-[#153424]">{item.modal}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded font-mono">
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: CONTINENTAL FARMERS GROUP ASYMMETRICAL MOSAIC */}
      <ContinentalMosaic
        onNavigate={onNavigate}
        onSelectCrop={onSelectCropAndNavigate}
      />

      {/* SECTION 4: BENCHMARK COMMODITIES CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#2E7D32] block mb-1">
              Benchmark Crops
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
              Popular Crops & Expected Advisory Yield
            </h2>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={slideLeft}
              className="w-10 h-10 rounded-full border border-[#E6E1D7] bg-white hover:bg-[#EAEFE9] text-[#153424] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Slide left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={slideRight}
              className="w-10 h-10 rounded-full border border-[#E6E1D7] bg-white hover:bg-[#EAEFE9] text-[#153424] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Slide right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={cropSliderRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 slide-scroll-snap no-scrollbar"
        >
          {featuredCrops.map((c) => (
            <div
              key={c.name}
              onClick={() => {
                if (onSelectCropAndNavigate) onSelectCropAndNavigate(c.name);
                else onNavigate('advisory');
              }}
              className="w-72 sm:w-80 shrink-0 p-5 rounded-2xl glass-card border border-white/80 hover:border-[#2E7D32] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 hover-slide-up"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#153424] font-['Syne',sans-serif]">{c.name}</h3>
                    <p className="text-xs text-stone-500 font-medium">{c.mandi}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono border border-emerald-200/60 shrink-0">
                    {c.change}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-['Outfit',sans-serif] leading-relaxed">{c.note}</p>
              </div>

              <div className="pt-3 border-t border-[#ECE8DE] flex items-center justify-between">
                <span className="font-mono font-black text-base text-[#153424]">{c.modal} <span className="text-xs font-normal text-stone-500">/{c.unit}</span></span>
                <span className="text-xs font-bold text-[#2E7D32] flex items-center gap-1 hover:underline">
                  <span>Get Advisory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: THE FOUR INTEGRATED PRODUCT PILLARS (PRD Section 5 & 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] bg-[#EAEFE9] px-3 py-1 rounded-full border border-[#D6DFD4]">
            AgriMate Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#153424] font-['Syne',sans-serif]">
            Four Core Pillars of AgriMate
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            Integrated digital public good infrastructure defined in the AgriMate PRD.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: Satellite Intelligence */}
          <div 
            onClick={() => onNavigate('satellite')}
            className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up cursor-pointer hover:border-[#2E7D32] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2E7D32]">Pillar 1</span>
              <h3 className="text-base font-bold text-[#153424]">🛰️ Satellite Intelligence</h3>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              Sentinel-2 multispectral imagery at ≤10m resolution. Computes NDVI, EVI, soil moisture, and daily irrigation schedule.
            </p>
            <div className="pt-2 text-xs font-bold text-[#2E7D32] flex items-center gap-1">
              <span>View Field NDVI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2: AI Crop Advisory */}
          <div 
            onClick={() => onNavigate('advisory')}
            className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up cursor-pointer hover:border-[#2E7D32] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8A238]">Pillar 2</span>
              <h3 className="text-base font-bold text-[#153424]">🌱 AI Crop Advisory</h3>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              Gemini 2.0 Flash engine synthesising satellite data, soil NPK, and 7-day NWP weather with Regenerative Scores (A–F).
            </p>
            <div className="pt-2 text-xs font-bold text-[#E8A238] flex items-center gap-1">
              <span>Generate Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3: Disease Diagnostics */}
          <div 
            onClick={() => onNavigate('diagnose')}
            className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up cursor-pointer hover:border-[#2E7D32] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2E7D32]">Pillar 3</span>
              <h3 className="text-base font-bold text-[#153424]">🔬 Disease Diagnostics</h3>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              Photo-based vision plant pathology. Delivers certified organic remedies and statutory chemical treatment with exact dilution.
            </p>
            <div className="pt-2 text-xs font-bold text-[#2E7D32] flex items-center gap-1">
              <span>Scan Crop Leaf</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 4: Interop Network */}
          <div 
            onClick={() => onNavigate('gov')}
            className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up cursor-pointer hover:border-[#2E7D32] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8A238]">Pillar 4</span>
              <h3 className="text-base font-bold text-[#153424]">🔗 Interop Network</h3>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              Federated data architecture across Indian states using FIWARE NGSI-LD open standards and India Stack integration.
            </p>
            <div className="pt-2 text-xs font-bold text-[#E8A238] flex items-center gap-1">
              <span>Open Gov Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: KISAN CALL CENTRE & VERNACULAR VOICE ADVISORY (PRD F-ADV-04) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#153424] via-[#1c4430] to-[#153424] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8A238] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              PRD Feature F-ADV-04 • Telephony Channel
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-['Syne',sans-serif]">
              24x7 Kisan Call Centre IVR & Vernacular Voice Advisory
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Feature-phone users dial <strong className="text-white font-mono">1800-180-1551</strong> (toll-free) to authenticate via mobile and receive a 90-second voice advisory in their regional language.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('advisory')}
              className="px-6 py-3 rounded-2xl bg-[#E8A238] hover:bg-[#d6922b] text-[#153424] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Inspect IVR Script</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>KVK Centres Directory</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
