import React from 'react';
import type { Language, NavigationPage } from '../types';
import { 
  ArrowRight,
  ShieldCheck,
  Compass,
  Sprout,
  Layers,
  PhoneCall,
  Server
} from 'lucide-react';

interface AboutPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate
}) => {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Editorial Page Header — Grounded in PRD Section 1 */}
      <section className="bg-[#ECE8DE]/60 border-b border-[#E6E1D7] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] bg-white px-3 py-1 rounded-full border border-[#E6E1D7]">
              Product Requirements Document (PRD) • Version 1.0
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#153424] font-['Syne',sans-serif] tracking-tight">
              Interoperable Digital Agriculture Network for India
            </h1>
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-['Outfit',sans-serif]">
              AgriMate is a scalable, AI-powered digital public good that delivers real-time, hyper-localised agro-advisories to small and marginal farmers across India. By fusing satellite imagery, soil health data, climate forecasting, and Gemini 2.0 Flash, AgriMate puts data-driven guidance in the hands of 100M+ farmers — in their own language, on any device.
            </p>
          </div>
        </div>
      </section>

      {/* PRD Problem Statement & Core Insight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono font-bold text-[#2E7D32] uppercase tracking-wider">The Last-Mile Agricultural Challenge</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
              Converting Data Abundance into Simple Vernacular Action
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Small and marginal farmers cultivate over 86% of India's operational landholdings yet remain underserved by traditional extension services. Traditional reliance on word-of-mouth leads to 20–40% preventable yield losses and up to 30% disease damage.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed font-medium">
              The problem is not a lack of data — it is the absence of a last-mile bridge that converts satellite imagery, soil health telemetry, and NWP weather into simple, actionable advisories delivered in the farmer's native tongue.
            </p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl glass-card-subtle border border-white/80 shadow-xs">
                <p className="text-xl font-black text-[#153424] font-mono">100M+</p>
                <p className="text-xs text-stone-600 mt-0.5">Target smallholder farmers</p>
              </div>
              <div className="p-3.5 rounded-xl glass-card-subtle border border-white/80 shadow-xs">
                <p className="text-xl font-black text-[#2E7D32] font-mono">≤10m</p>
                <p className="text-xs text-stone-600 mt-0.5">Sentinel-2 satellite resolution</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-white/80 shadow-lg bg-stone-100">
              <img 
                src="/farmer_field.jpg" 
                alt="Indian Smallholder Farmer Soil Inspection" 
                className="w-full h-72 sm:h-84 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Integrated Product Architecture (PRD Section 5 & 6) */}
      <section className="bg-[#ECE8DE]/40 py-12 sm:py-16 border-y border-[#E6E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E7D32] bg-[#EAEFE9] px-3 py-1 rounded-full border border-[#D6DFD4]">
              PRD Section 5 & 6
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
              Core Technical Capabilities
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Integrated technical modules specified in the official AgriMate PRD.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Capability 1 */}
            <div 
              onClick={() => onNavigate('satellite')}
              className="glass-card p-5 rounded-2xl border border-white/80 shadow-xs space-y-2.5 hover-slide-up cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2E7D32]">Copernicus Sentinel-2</span>
                <h3 className="text-base font-bold text-[#153424]">🛰️ Satellite Intelligence</h3>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Sentinel-2 multispectral processing for NDVI, EVI, and soil moisture indices at ≤10m resolution. Delivers daily irrigation schedules.
              </p>
            </div>

            {/* Capability 2 */}
            <div 
              onClick={() => onNavigate('advisory')}
              className="glass-card p-5 rounded-2xl border border-white/80 shadow-xs space-y-2.5 hover-slide-up cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8A238]">Gemini 2.0 Flash</span>
                <h3 className="text-base font-bold text-[#153424]">🌱 AI Crop Advisory</h3>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Gemini 2.0 Flash engine synthesizing satellite data, soil NPK, and 7-day NWP weather with Regenerative Scores (A–F) and farming calendars.
              </p>
            </div>

            {/* Capability 3 */}
            <div 
              onClick={() => onNavigate('diagnose')}
              className="glass-card p-5 rounded-2xl border border-white/80 shadow-xs space-y-2.5 hover-slide-up cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2E7D32]">Computer Vision AI</span>
                <h3 className="text-base font-bold text-[#153424]">🔬 Disease Diagnostics</h3>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Photo-based vision plant pathology. Delivers certified organic remedies and statutory chemical treatment with exact dilution.
              </p>
            </div>

            {/* Capability 4 */}
            <div 
              onClick={() => onNavigate('gov')}
              className="glass-card p-5 rounded-2xl border border-white/80 shadow-xs space-y-2.5 hover-slide-up cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8A238]">FIWARE NGSI-LD</span>
                <h3 className="text-base font-bold text-[#153424]">🔗 Interop Network</h3>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Federated data architecture across Indian states using FIWARE NGSI-LD open standards and India Stack integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Public Good & Compliance Commitment (PRD Section 14 & 16) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] bg-[#EAEFE9] px-3 py-1 rounded-full border border-[#D6DFD4]">
            Public Infrastructure
          </span>
          <h2 className="text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
            Digital Public Good & India Stack Commitment
          </h2>
          <p className="text-stone-600 text-sm">
            Aligned with MeitY DPG Guidelines and India's Digital Personal Data Protection Act 2023.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up">
            <div className="w-10 h-10 rounded-lg bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#153424]">Apache 2.0 Open Source Core</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Advisory engine, interop APIs, and data models are published under an open license. States retain full data sovereignty without vendor lock-in.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up">
            <div className="w-10 h-10 rounded-lg bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#153424]">DPDP Act 2023 Compliance</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Zero farmer Personally Identifiable Information (PII) leaves the state boundary without explicit opt-in consent. Farmer consent is managed natively.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/80 shadow-xs space-y-3 hover-slide-up">
            <div className="w-10 h-10 rounded-lg bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#153424]">Voice-First Telephony Access</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Serving low-literacy and feature-phone users via toll-free Kisan Call Centre (1800-180-1551) IVR voice advisories in 10+ regional languages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#153424] text-white p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#1f4a34]">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black font-['Syne',sans-serif]">
              Explore AgriMate's Core Agricultural Intelligence
            </h3>
            <p className="text-stone-300 text-sm">
              Generate personalised crop advisories, inspect Sentinel-2 vegetative indices, and access plant pathology scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('advisory')}
              className="px-6 py-3.5 rounded-2xl bg-[#E8A238] hover:bg-[#d6922b] text-[#153424] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>🌱 Start AI Advisory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('satellite')}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>🛰️ Field Satellite Scan</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
