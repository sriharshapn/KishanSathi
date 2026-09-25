import React from 'react';
import type { Language, NavigationPage } from '../types';
import { 
  ArrowRight,
  ShieldCheck,
  Compass,
  Sprout,
  Layers,
  PhoneCall,
  Server,
  Satellite,
  ArrowUpRight
} from 'lucide-react';

interface AboutPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate
}) => {
  return (
    <div className="space-y-12 sm:space-y-16 pb-20 font-['Open_Sans',sans-serif] text-[#022113]">
      {/* Editorial Page Header (Pic 1 & 2 Aesthetic) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Crisp White Card */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#546C18] bg-[#F0F2EB] px-4 py-1.5 rounded-full border border-[#022113]/8 inline-block">
                Digital Public Good (DPG) • Sovereign Architecture
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-[#022113] tracking-tight leading-[1.08] font-['Montserrat',sans-serif]">
                KisanSathi: <span className="text-[#546C18]">Sovereign Soil Intelligence</span>
              </h1>
              <p className="text-[#4A5568] text-base sm:text-lg leading-relaxed font-normal">
                KisanSathi is a scalable, AI-powered digital public good delivering real-time, hyper-localised agro-advisories to small and marginal farmers across India. By fusing satellite imagery, soil health data, microclimate forecasting, and Gemini 2.0 Flash, KisanSathi puts verified data guidance in the hands of 140M+ farmers in their native languages.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#022113]/8">
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                140M+ Operational Landholdings
              </span>
              <span className="text-[#718096]">•</span>
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                DPDP Act 2023 Compliant
              </span>
              <span className="text-[#718096]">•</span>
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                Open Source & Interoperable
              </span>
            </div>
          </div>

          {/* Right Card: Rich Olive Card */}
          <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113]">
                  • KisanSathi
                </span>
                <span className="text-xs font-mono text-white/80">Our Vision</span>
              </div>
              <h3 className="text-2xl font-bold font-['Montserrat',sans-serif] text-white pt-2">
                Our mission
              </h3>
              <p className="text-sm text-white/85 leading-relaxed font-normal">
                Eliminate market information asymmetry, bridge fair farm-gate realizations, and equip every Indian farmer with sovereign AI decision support.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] block">Farmer Equity Goal</span>
              <span className="text-2xl font-black font-['Montserrat',sans-serif] text-white block">+28% Realization</span>
              <span className="text-[11px] text-white/70 block">Target increase in smallholder farm-gate revenue</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRD Problem Statement & Core Insight */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#59701E]">The Last-Mile Agricultural Challenge</span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
              Converting Data Abundance into Vernacular Action
            </h2>
            <p className="text-[#022113]/80 text-sm sm:text-base leading-relaxed font-normal">
              Small and marginal farmers cultivate over 86% of India's operational landholdings yet remain underserved by traditional extension services. Lack of timely intelligence leads to 20–40% preventable yield losses and up to 30% disease damage.
            </p>
            <p className="text-[#022113]/70 text-sm leading-relaxed font-normal">
              The bottleneck is not a lack of data — it is the absence of a reliable bridge converting raw multispectral satellite passes, soil laboratory grids, and NWP forecasts into vernacular directives.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-6 rounded-[2rem] bg-white border border-[#022113]/8 shadow-xl">
                <p className="text-3xl sm:text-4xl font-black text-[#022113] font-['Montserrat',sans-serif]">100M+</p>
                <p className="text-xs text-[#022113]/70 font-semibold mt-1 font-['Open_Sans',sans-serif]">Target smallholders</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-[#546C18] text-white shadow-xl">
                <p className="text-3xl sm:text-4xl font-black text-[#DFEB38] font-['Montserrat',sans-serif]">≤10m</p>
                <p className="text-xs text-white/80 font-semibold mt-1 font-['Open_Sans',sans-serif]">Sentinel-2 resolution</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[2.5rem] overflow-hidden border border-[#022113]/8 shadow-xl bg-white">
              <img 
                src="/farmer_field.jpg" 
                alt="Indian Smallholder Farmer Soil Inspection" 
                className="w-full h-80 sm:h-96 object-cover filter contrast-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Technical Capabilities */}
      <section className="bg-[#F0F2EB] py-16 sm:py-24 border-y border-[#022113]/8">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-white px-4 py-1.5 rounded-full border border-[#022113]/8 inline-block shadow-sm">
              Architecture & Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
              Four Sovereign Pillars
            </h2>
            <p className="text-[#022113]/70 text-xs sm:text-sm font-normal">
              Integrated technical modules specified in the official KisanSathi specification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capability 1: Satellite */}
            <div 
              onClick={() => onNavigate('satellite')}
              className="bg-white p-7 sm:p-8 rounded-[2.5rem] border border-[#022113]/8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all space-y-5 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-[#546C18] text-[#DFEB38] flex items-center justify-center shadow-sm">
                  <Compass className="w-6 h-6 text-[#DFEB38]" />
                </div>
                <div className="mt-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-3 py-1 rounded-full inline-block">Copernicus Sentinel-2</span>
                  <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif] mt-2">Satellite Intelligence</h3>
                </div>
                <p className="text-[#022113]/70 text-xs leading-relaxed mt-2.5 font-normal">
                  Sentinel-2 multispectral processing for NDVI, EVI, and canopy moisture indices at 10m spatial resolution.
                </p>
              </div>
              <div className="pt-4 border-t border-[#022113]/8 flex items-center justify-between">
                <span className="px-5 py-2.5 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] flex items-center gap-1.5 shadow-sm transition-all group-hover:scale-105">
                  <span>Launch Monitor</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#022113]" />
                </span>
              </div>
            </div>

            {/* Capability 2: AI Crop Advisory (Signature Olive card like Image 2) */}
            <div 
              onClick={() => onNavigate('advisory')}
              className="bg-[#546C18] text-white p-7 sm:p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all space-y-5 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-white/20 text-[#DFEB38] flex items-center justify-center shadow-sm">
                  <Sprout className="w-6 h-6 text-[#DFEB38]" />
                </div>
                <div className="mt-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] bg-black/20 px-3 py-1 rounded-full inline-block">Gemini 2.0 Flash</span>
                  <h3 className="text-lg font-black text-white font-['Montserrat',sans-serif] mt-2">AI Crop Advisory</h3>
                </div>
                <p className="text-white/80 text-xs leading-relaxed mt-2.5 font-normal">
                  Grounded engine synthesizing satellite indices, soil NPK, and 7-day weather forecasts with Regenerative Scores (A–F).
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="px-5 py-2.5 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] flex items-center gap-1.5 shadow-sm transition-all group-hover:scale-105">
                  <span>View Advisory</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#022113]" />
                </span>
              </div>
            </div>

            {/* Capability 3: Vision Pathology */}
            <div 
              onClick={() => onNavigate('diagnose')}
              className="bg-white p-7 sm:p-8 rounded-[2.5rem] border border-[#022113]/8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all space-y-5 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-[#546C18] text-[#DFEB38] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#DFEB38]" />
                </div>
                <div className="mt-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-3 py-1 rounded-full inline-block">Vision Pathology</span>
                  <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif] mt-2">Disease Diagnostics</h3>
                </div>
                <p className="text-[#022113]/70 text-xs leading-relaxed mt-2.5 font-normal">
                  Plant pathology vision diagnosis. Provides organic treatments and statutory chemical formulations with precise dilution.
                </p>
              </div>
              <div className="pt-4 border-t border-[#022113]/8 flex items-center justify-between">
                <span className="px-5 py-2.5 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] flex items-center gap-1.5 shadow-sm transition-all group-hover:scale-105">
                  <span>Diagnose Plant</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#022113]" />
                </span>
              </div>
            </div>

            {/* Capability 4: Interop Network */}
            <div 
              onClick={() => onNavigate('gov')}
              className="bg-white p-7 sm:p-8 rounded-[2.5rem] border border-[#022113]/8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all space-y-5 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-[#546C18] text-[#DFEB38] flex items-center justify-center shadow-sm">
                  <Layers className="w-6 h-6 text-[#DFEB38]" />
                </div>
                <div className="mt-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-3 py-1 rounded-full inline-block">FIWARE NGSI-LD</span>
                  <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif] mt-2">Interop Network</h3>
                </div>
                <p className="text-[#022113]/70 text-xs leading-relaxed mt-2.5 font-normal">
                  Federated digital public good architecture linking Indian state extension departments using ETSI NGSI-LD open standards.
                </p>
              </div>
              <div className="pt-4 border-t border-[#022113]/8 flex items-center justify-between">
                <span className="px-5 py-2.5 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] flex items-center gap-1.5 shadow-sm transition-all group-hover:scale-105">
                  <span>Explore Mesh</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#022113]" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Public Good Commitment */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-4 py-1.5 rounded-full border border-[#022113]/8 inline-block shadow-sm">
            Public Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
            Digital Public Good & India Stack Commitment
          </h2>
          <p className="text-[#022113]/70 text-sm font-normal">
            Aligned with MeitY DPG Guidelines and India's Digital Personal Data Protection Act 2023.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 sm:p-9 rounded-[2.5rem] border border-[#022113]/8 shadow-xl space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] flex items-center justify-center">
              <Server className="w-6 h-6 text-[#546C18]" />
            </div>
            <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif]">Apache 2.0 Open Source Core</h3>
            <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal">
              Advisory engine, interop APIs, and data models are published under an open license. States retain full data sovereignty without vendor lock-in.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-9 rounded-[2.5rem] border border-[#022113]/8 shadow-xl space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#546C18]" />
            </div>
            <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif]">DPDP Act 2023 Compliance</h3>
            <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal">
              Zero farmer Personally Identifiable Information (PII) leaves the state boundary without explicit opt-in consent. Farmer consent is managed natively.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-9 rounded-[2.5rem] border border-[#022113]/8 shadow-xl space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-[#F0F2EB] border border-[#022113]/8 text-[#022113] flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-[#546C18]" />
            </div>
            <h3 className="text-lg font-black text-[#022113] font-['Montserrat',sans-serif]">Voice-First Telephony Access</h3>
            <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal">
              Serving low-literacy and feature-phone growers via toll-free Kisan Call Centre (1800-180-1551) IVR voice dispatch in 10 Indian vernaculars.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="bg-[#546C18] text-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#546C18]/20">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-['Montserrat',sans-serif]">
              Explore KisanSathi's Agricultural Intelligence
            </h3>
            <p className="text-white/80 text-sm font-['Open_Sans',sans-serif]">
              Generate personalized crop advisories, inspect Sentinel-2 vegetative indices, and access plant pathology scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <button
              onClick={() => onNavigate('advisory')}
              className="px-6 py-3 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-black text-xs font-['Montserrat',sans-serif] uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(223,235,56,0.4)] hover:scale-105"
            >
              <Sprout className="w-4 h-4 text-[#022113]" />
              <span>Start AI Advisory</span>
              <ArrowRight className="w-4 h-4 text-[#022113]" />
            </button>
            <button
              onClick={() => onNavigate('satellite')}
              className="px-5 py-3 rounded-full bg-white hover:bg-[#F0F2EB] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Satellite className="w-4 h-4 text-[#546C18]" />
              <span>Satellite Scan</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
