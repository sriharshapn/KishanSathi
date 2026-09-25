import React, { useState } from 'react';
import { ArrowRight, Play, Pause } from 'lucide-react';
import type { NavigationPage } from '../types';

interface VergeShowcaseProps {
  onNavigate: (page: NavigationPage) => void;
}

/**
 * VergeShowcase Component
 * Inspired by Scrolltide's Verge template (https://www.scrolltide.co/templates/verge)
 * "Cream and acid green over a meadow shot, running the whole way from a studio thesis through selected work..."
 */
export const VergeShowcase: React.FC<VergeShowcaseProps> = ({ onNavigate }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'thesis' | 'pillars' | 'telemetry'>('thesis');

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="rounded-full border border-line px-3 py-1 text-[11px] font-mono font-medium text-mist uppercase tracking-wider">
          Digital Public Good • Sovereign Architecture
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-mono font-semibold border border-tide/40 bg-tide/10 text-foam">
          <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse"></span>
          Cinematic Field Stream
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h2 className="font-['Syne',sans-serif] text-4xl sm:text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] text-bone">
            Kisan Setu: <span className="text-transparent bg-clip-text bg-gradient-to-r from-foam via-neon to-tide">Sovereign Soil Intelligence</span>
          </h2>
          <p className="mt-3 text-base text-mist max-w-2xl leading-relaxed">
            Cream, acid mint, and obsidian over panoramic field telemetry — connecting Copernicus Sentinel-2 canopy health directly into local APMC price discovery.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-full border border-line bg-surface/60 p-1 backdrop-blur self-start">
          {[
            { id: 'thesis', label: 'Platform Mandate' },
            { id: 'pillars', label: 'Core Pillars' },
            { id: 'telemetry', label: 'State Data Mesh' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-bone text-ink shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-mist hover:text-bone'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verge Signature Video Container */}
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-ink-2 shadow-2xl group">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/verge-hq-poster.jpg"
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
            ref={(ref) => {
              if (ref) {
                if (isPlaying) ref.play().catch(() => {});
                else ref.pause();
              }
            }}
          >
            <source src="https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/verge-hq.mp4" type="video/mp4" />
          </video>

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-black/30 pointer-events-none"></div>

          {/* Floating Telemetry Callout Pill */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <div className="rounded-full border border-white/20 bg-ink/75 px-4 py-1.5 text-xs font-mono text-bone backdrop-blur-md flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon animate-ping"></span>
              <span>COP-S2 • 10M Multispectral Stream</span>
            </div>
          </div>

          {/* Play/Pause Control Floating Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink/70 text-bone backdrop-blur-md transition hover:bg-white hover:text-ink cursor-pointer shadow-lg"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5 fill-current" />}
          </button>

          {/* Floating Bottom Card Over Video */}
          <div className="absolute bottom-6 left-6 right-20 z-20 hidden sm:block max-w-xl">
            <div className="rounded-2xl border border-white/15 bg-ink-2/80 p-4 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-foam mb-1">
                <span className="uppercase tracking-wider">Karnataka Sub-Basin Centroid</span>
                <span className="text-neon font-bold">NDVI 0.742 High Vigor</span>
              </div>
              <p className="text-xs text-mist line-clamp-1">
                Sentinel-2 Surface Reflectance (Level-2A) harmonized with Ballari APMC market arrivals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verge Grid Information Architecture */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        
        {/* Left Manifesto */}
        <article className="space-y-5 text-sm sm:text-base leading-relaxed text-mist">
          <p className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-bone leading-snug">
            Small and marginal farmers need definitive facts, not stochastic price guesses.
          </p>
          <p>
            The Kisan Setu architecture delivers verified agro-climatic intelligence by treating every data source as a sovereign layer: Agmarknet records remain immutable, Sentinel-2 spectral indices provide canopy truth, and Google Gemini 2.0 Flash is strictly grounded as an accessible multilingual translation layer.
          </p>
          
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="rounded-xl border border-line bg-surface/50 p-3">
              <span className="text-dim uppercase text-[10px] block">Spatial Resolution</span>
              <span className="font-bold text-bone text-sm mt-0.5 block">10 Meters</span>
            </div>
            <div className="rounded-xl border border-line bg-surface/50 p-3">
              <span className="text-dim uppercase text-[10px] block">Price Hallucination</span>
              <span className="font-bold text-neon text-sm mt-0.5 block">0% Verified</span>
            </div>
            <div className="rounded-xl border border-line bg-surface/50 p-3">
              <span className="text-dim uppercase text-[10px] block">DPG Protocol</span>
              <span className="font-bold text-foam text-sm mt-0.5 block">NGSI-LD V1</span>
            </div>
          </div>
        </article>

        {/* Right Stack Panel */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface/40 p-6 backdrop-blur">
            <h3 className="font-['Syne',sans-serif] text-base font-bold text-bone flex items-center justify-between">
              <span>Architectural Stack</span>
              <span className="font-mono text-xs text-tide">7 Layers</span>
            </h3>
            
            <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
              {['Sentinel-2 NDVI', 'Gemini 2.0 Flash', 'Vision Pathology', 'ETSI NGSI-LD', 'SQLite WAL', 'Data.gov.in', 'React 19 + Vite'].map(tech => (
                <li key={tech} className="rounded-full border border-line bg-ink/60 px-3 py-1 text-mist">
                  {tech}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <span className="text-xs text-dim">DPDP Act 2023 Compliant</span>
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-tide hover:text-foam transition cursor-pointer"
              >
                <span>Read Full Spec</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
