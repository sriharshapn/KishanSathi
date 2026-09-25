import React from 'react';
import { ArrowUpRight, Satellite, Sparkles, Scan, Share2 } from 'lucide-react';
import type { NavigationPage } from '../types';

interface ContinentalMosaicProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectCrop?: (crop: string) => void;
}

export const ContinentalMosaic: React.FC<ContinentalMosaicProps> = ({
  onNavigate
}) => {
  return (
    <section className="py-12 bg-[#ECE8DE]/60 border-y border-[#E6E1D7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header: Corporate Editorial Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E1D7] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2E7D32]"></span>
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#2E7D32]">
                AgriMate Core Capabilities
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#153424] tracking-tight font-['Syne',sans-serif]">
              Precision Agriculture & Public Digital Goods
            </h2>
          </div>
        </div>

        {/* Asymmetrical 4-Card Photographic Mosaic Grid — Core Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Satellite Intelligence & Sentinel-2 NDVI (Span 7 cols) */}
          <div
            onClick={() => onNavigate('satellite')}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[400px] border border-[#CCE0D0] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-[#163D28] flex flex-col justify-between p-6 sm:p-8"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
              style={{ backgroundImage: `url('/mandi_auction_yard.jpg')` }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(12, 38, 24, 0.90) 0%, rgba(18, 54, 34, 0.50) 55%, rgba(12, 38, 24, 0.25) 100%)'
              }}
            />

            {/* Top Row: Tag & Live Indicator */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-[#FCD34D] uppercase">
                <Satellite className="w-3 h-3 text-[#FCD34D]" />
                Satellite Intelligence
              </span>
              <span className="text-[11px] font-mono text-emerald-200 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Sentinel-2 ≤10m Multispectral
              </span>
            </div>

            {/* Bottom Content & Circular Arrow Button */}
            <div className="relative z-10 pt-16 flex items-end justify-between gap-4">
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif] tracking-tight group-hover:text-emerald-200 transition-colors">
                  Field NDVI & Crop Vigor Heatmap
                </h3>
                <p className="text-stone-200 text-xs sm:text-sm font-['Outfit',sans-serif] leading-relaxed line-clamp-2">
                  Plot GPS field polygons for instantaneous 10m-resolution NDVI, EVI indices, soil moisture anomalies, and irrigation schedules.
                </p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-full border border-white/40 bg-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FCD34D] group-hover:border-[#FCD34D] group-hover:text-[#123826] group-hover:scale-110 shadow-lg">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Card 2: AI Crop Advisory Engine (Span 5 cols) */}
          <div
            onClick={() => onNavigate('advisory')}
            className="lg:col-span-5 group relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[400px] border border-[#CCE0D0] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-[#163D28] flex flex-col justify-between p-6 sm:p-8"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
              style={{ backgroundImage: `url('/farmer_field.jpg')` }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(12, 38, 24, 0.90) 0%, rgba(18, 54, 34, 0.50) 55%, rgba(12, 38, 24, 0.25) 100%)'
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-[#FCD34D] uppercase">
                <Sparkles className="w-3 h-3 text-[#FCD34D]" />
                AI Advisory Engine
              </span>
              <span className="text-[11px] font-mono text-amber-200 bg-amber-900/70 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Gemini 2.0 Flash
              </span>
            </div>

            <div className="relative z-10 pt-16 flex items-end justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif] tracking-tight group-hover:text-amber-200 transition-colors">
                  Personalised Agro-Advisory Engine
                </h3>
                <p className="text-stone-200 text-xs sm:text-sm font-['Outfit',sans-serif] leading-relaxed line-clamp-2">
                  Hyper-local guidance based on soil NPK, climate zone, sowing calendar, and regenerative farming (Score A–F).
                </p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-full border border-white/40 bg-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FCD34D] group-hover:border-[#FCD34D] group-hover:text-[#123826] group-hover:scale-110 shadow-lg">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Crop Disease Diagnostics (Span 5 cols) */}
          <div
            onClick={() => onNavigate('diagnose')}
            className="lg:col-span-5 group relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[380px] border border-[#CCE0D0] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-[#163D28] flex flex-col justify-between p-6 sm:p-8"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
              style={{ backgroundImage: `url('/logistics_truck.jpg')` }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(12, 38, 24, 0.90) 0%, rgba(18, 54, 34, 0.50) 55%, rgba(12, 38, 24, 0.25) 100%)'
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-[#FCD34D] uppercase">
                <Scan className="w-3 h-3 text-[#FCD34D]" />
                Crop Diagnostics
              </span>
              <span className="text-[11px] font-mono text-emerald-200 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Vision AI Diagnostics
              </span>
            </div>

            <div className="relative z-10 pt-16 flex items-end justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif] tracking-tight group-hover:text-emerald-200 transition-colors">
                  Instant Crop Disease Diagnosis
                </h3>
                <p className="text-stone-200 text-xs sm:text-sm font-['Outfit',sans-serif] leading-relaxed line-clamp-2">
                  Upload leaf symptoms for instant pathogen identification, confidence scores, dual organic/chemical prescriptions, and dosage rates.
                </p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-full border border-white/40 bg-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FCD34D] group-hover:border-[#FCD34D] group-hover:text-[#123826] group-hover:scale-110 shadow-lg">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Card 4: Inter-State Gov Network & DPG (Span 7 cols) */}
          <div
            onClick={() => onNavigate('gov')}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[380px] border border-[#CCE0D0] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-[#163D28] flex flex-col justify-between p-6 sm:p-8"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
              style={{ backgroundImage: `url('/cold_storage.jpg')` }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(12, 38, 24, 0.90) 0%, rgba(18, 54, 34, 0.50) 55%, rgba(12, 38, 24, 0.25) 100%)'
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-[#FCD34D] uppercase">
                <Share2 className="w-3 h-3 text-[#FCD34D]" />
                Inter-State Gov Layer
              </span>
              <span className="text-[11px] font-mono text-emerald-200 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                FIWARE NGSI-LD & India Stack
              </span>
            </div>

            <div className="relative z-10 pt-16 flex items-end justify-between gap-4">
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif] tracking-tight group-hover:text-emerald-200 transition-colors">
                  Inter-State Gov Exchange & Policy Portal
                </h3>
                <p className="text-stone-200 text-xs sm:text-sm font-['Outfit',sans-serif] leading-relaxed line-clamp-2">
                  Unified open data exchange across state agriculture departments, ICAR KVK nodes, and standard FIWARE NGSI-LD endpoints.
                </p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-full border border-white/40 bg-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FCD34D] group-hover:border-[#FCD34D] group-hover:text-[#123826] group-hover:scale-110 shadow-lg">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
export default ContinentalMosaic;
