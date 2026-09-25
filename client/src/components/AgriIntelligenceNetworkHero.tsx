import React, { useState, useMemo } from 'react';
import type { NavigationPage } from '../types';
import { 
  Sprout, 
  Satellite, 
  ScanLine, 
  Layers, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  ArrowUpRight,
  Activity,
  Droplets,
  ThermometerSun
} from 'lucide-react';
import { indiaMapData } from '../data/indiaMapData';
import { AGRI_INTELLIGENCE_NODES, type AgriIntelligenceNode } from '../data/agriIntelligenceData';

interface AgriIntelligenceNetworkHeroProps {
  onNavigate: (page: NavigationPage) => void;
  onSearchAndNavigate?: (crop?: string, location?: string) => void;
}

export const AgriIntelligenceNetworkHero: React.FC<AgriIntelligenceNetworkHeroProps> = ({
  onNavigate,
  onSearchAndNavigate
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'north' | 'west' | 'south' | 'east' | 'central_ne'>('all');
  const [selectedStateId, setSelectedStateId] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<AgriIntelligenceNode>(AGRI_INTELLIGENCE_NODES[0]);

  // Linear projection onto official SVG viewBox 0 0 612 696
  const projectCoords = (lat: number, lon: number) => {
    const x = Math.round((20.75 * lon - 1416) * 10) / 10;
    const y = Math.round((-22.35 * lat + 848) * 10) / 10;
    return { x, y };
  };

  // Filter nodes based on Region and State
  const filteredNodes = useMemo(() => {
    return AGRI_INTELLIGENCE_NODES.filter((n) => {
      if (selectedRegion !== 'all' && n.region !== selectedRegion) return false;
      if (selectedStateId !== 'all' && n.stateId !== selectedStateId) return false;
      return true;
    });
  }, [selectedRegion, selectedStateId]);

  // Check if state is highlighted in active region filter
  const isStateHighlighted = (stateId: string) => {
    if (selectedStateId !== 'all') {
      return stateId === selectedStateId;
    }
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'north') {
      return ['pb', 'hr', 'dl', 'up', 'hp', 'jk', 'ut', 'ch'].includes(stateId);
    }
    if (selectedRegion === 'west') {
      return ['mh', 'gj', 'rj', 'ga', 'dn', 'dd'].includes(stateId);
    }
    if (selectedRegion === 'south') {
      return ['ka', 'ap', 'tg', 'tn', 'kl', 'py'].includes(stateId);
    }
    if (selectedRegion === 'east') {
      return ['wb', 'br', 'or', 'jh'].includes(stateId);
    }
    if (selectedRegion === 'central_ne') {
      return ['mp', 'ct', 'as', 'ml', 'tr', 'mn', 'nl', 'mz', 'ar', 'sk'].includes(stateId);
    }
    return false;
  };

  const handleLaunchAdvisory = (node: AgriIntelligenceNode) => {
    if (onSearchAndNavigate) {
      onSearchAndNavigate(node.sampleCrop, node.district);
    } else {
      onNavigate('advisory');
    }
  };

  const activeRegionLabel = selectedStateId !== 'all'
    ? activeNode.state
    : selectedRegion === 'all'
      ? 'All India'
      : selectedRegion === 'central_ne'
        ? 'Central & NE'
        : selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1);

  return (
    <section className="relative rounded-[2.5rem] overflow-hidden border border-[#022113]/10 shadow-2xl bg-[#022113]">
      {/* Background Image: Lush Precision Agricultural Crop Canopy with Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2200&q=85')`
        }}
      />
      {/* Deep Forest Green Gradient Overlay matching Behance AgroInvest theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#022113] via-[#022113]/90 to-[#022113]/70 pointer-events-none" />

      {/* Main Grid: Left Pitch & Navigation CTAs, Right Interactive Agricultural Intelligence Map */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Problem Statement Mission, Clean Icon Buttons, DPG Compliance Badges */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#546C18]/30 border border-[#DFEB38]/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFEB38] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFEB38]"></span>
              </span>
              <span className="font-['Montserrat',sans-serif] tracking-wide text-xs">
                Open Digital Public Good for Indian Agriculture • Hack2skill
              </span>
            </div>

            {/* Giant Heading with Lime Highlight matching Pic 1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-white font-['Montserrat',sans-serif] leading-[1.04] tracking-tight">
              Digital<br />
              Agriculture<br />
              Network for<br />
              <span className="text-[#DFEB38] font-black">India</span>
            </h1>

            {/* Subtitle Grounded in Build with AI Hack2skill Agriculture Problem Statement */}
            <p className="text-xs sm:text-sm lg:text-base text-stone-200 max-w-xl leading-relaxed font-['Open_Sans',sans-serif] font-normal">
              Democratising precision agriculture for 100M+ small & marginal farmers. Hyper-localised advisories fusing Sentinel-2 satellite imagery, soil health data, climate forecasting, and Gemini 2.0 Flash in 10+ Indian languages.
            </p>

            {/* Quick Action Navigation Grid (Clean Lucide Icons, Zero Emojis) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onNavigate('advisory')}
                className="group px-5 py-3.5 rounded-2xl bg-[#546C18] hover:bg-[#627d1d] text-[#DFEB38] font-bold text-xs sm:text-sm font-['Montserrat',sans-serif] flex items-center justify-between shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-[#DFEB38]" />
                  <span>AI Crop Advisory</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('satellite')}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm font-['Montserrat',sans-serif] flex items-center gap-2.5 backdrop-blur-md transition-all cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-emerald-400" />
                <span>Field Satellite Scan</span>
              </button>

              <button
                onClick={() => onNavigate('diagnose')}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm font-['Montserrat',sans-serif] flex items-center gap-2.5 backdrop-blur-md transition-all cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-[#DFEB38]" />
                <span>Disease Scan</span>
              </button>

              <button
                onClick={() => onNavigate('gov')}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm font-['Montserrat',sans-serif] flex items-center gap-2.5 backdrop-blur-md transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-blue-300" />
                <span>Gov Interop Portal</span>
              </button>
            </div>

            {/* Bottom Compliance & Trust Badges */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-300 font-medium font-['Montserrat',sans-serif]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#DFEB38]" />
                <span>MeitY DPG Guidelines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Price Hallucination</span>
              </div>
            </div>

          </div>

          {/* Right Column: Agricultural Intelligence & Precision Agro-Climatic India Map */}
          <div className="lg:col-span-6">
            <div className="bg-[#F8FAF6] rounded-3xl p-4 sm:p-5 border border-[#E5EAD7] shadow-2xl text-[#022113] flex flex-col justify-between transition-all">
              
              {/* Card Header: Live Beacon + Agricultural Problem Statement Indicator */}
              <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#E5EAD7]">
                <h3 className="text-xs sm:text-sm font-black text-[#022113] font-['Montserrat',sans-serif] tracking-tight flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#546C18] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#546C18]"></span>
                  </span>
                  <span>732 Precision Agro-Climatic Telemetry Hubs • {activeRegionLabel}</span>
                </h3>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#546C18]/10 text-[#546C18] border border-[#546C18]/20">
                  AgriStack DPG
                </span>
              </div>

              {/* Region Filter Chips */}
              <div className="pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-['Montserrat',sans-serif]">
                {[
                  { id: 'all', label: `All India (732)` },
                  { id: 'south', label: 'South' },
                  { id: 'west', label: 'West' },
                  { id: 'north', label: 'North' },
                  { id: 'east', label: 'East' },
                  { id: 'central_ne', label: 'Central & NE' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const r = tab.id as any;
                      setSelectedRegion(r);
                      setSelectedStateId('all');
                      const firstInRegion = AGRI_INTELLIGENCE_NODES.find(n => r === 'all' || n.region === r);
                      if (firstInRegion) setActiveNode(firstInRegion);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                      selectedRegion === tab.id && selectedStateId === 'all'
                        ? 'bg-[#546C18] text-white shadow-xs'
                        : 'bg-white hover:bg-[#F0F2EB] text-stone-600 border border-[#E5EAD7]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Official SVG India Map Canvas */}
              <div className="relative w-full h-72 sm:h-80 my-2 flex items-center justify-center select-none overflow-hidden">
                <svg
                  viewBox={indiaMapData.viewBox || "0 0 612 696"}
                  className="w-full h-full max-h-[340px] drop-shadow-sm transition-transform duration-300"
                >
                  <defs>
                    <radialGradient id="agriRadarGrad">
                      <stop offset="0%" stopColor="#546C18" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#546C18" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* India State Outlines */}
                  <g className="transition-colors duration-300">
                    {indiaMapData.locations.map((loc) => {
                      const highlighted = isStateHighlighted(loc.id);
                      const hasActiveNode = activeNode.stateId === loc.id;
                      const isDirectlySelectedState = selectedStateId === loc.id;

                      return (
                        <path
                          key={loc.id}
                          id={loc.id}
                          d={loc.path}
                          fill={
                            isDirectlySelectedState || hasActiveNode
                              ? "#E5EED8" 
                              : highlighted 
                                ? "#F0F4EC" 
                                : "#EAEFE8"
                          }
                          stroke={
                            isDirectlySelectedState || hasActiveNode 
                              ? "#546C18" 
                              : highlighted 
                                ? "#CAD6BF" 
                                : "#D8E2D0"
                          }
                          strokeWidth={isDirectlySelectedState || hasActiveNode ? "1.5" : highlighted ? "0.9" : "0.5"}
                          strokeLinejoin="round"
                          className="transition-all duration-300 hover:fill-[#DFEBD0] cursor-pointer"
                          onClick={() => {
                            const matchNode = AGRI_INTELLIGENCE_NODES.find(n => n.stateId === loc.id);
                            if (matchNode) {
                              setActiveNode(matchNode);
                              setSelectedStateId(loc.id);
                              setSelectedRegion('all');
                            }
                          }}
                        >
                          <title>{loc.name}</title>
                        </path>
                      );
                    })}
                  </g>

                  {/* Plotted Agro-Climatic Intelligence Pins */}
                  {filteredNodes.map((node) => {
                    const { x, y } = projectCoords(node.lat, node.lon);
                    const isSelected = activeNode.id === node.id;

                    return (
                      <g
                        key={node.id}
                        onClick={() => setActiveNode(node)}
                        className="cursor-pointer group/pin"
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      >
                        {/* Active animated radar pulse */}
                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="url(#agriRadarGrad)"
                            className="animate-ping pointer-events-none"
                          />
                        )}

                        {/* Outer Glow Halo */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? "9" : node.isPrimaryHub ? "7" : "5"}
                          fill={isSelected ? "#546C18" : node.isPrimaryHub ? "#E8A238" : "#022113"}
                          fillOpacity={isSelected ? "0.35" : "0.22"}
                          className="transition-all duration-300"
                        />

                        {/* Main Dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? "5" : node.isPrimaryHub ? "3.8" : "2.8"}
                          fill={isSelected ? "#546C18" : node.isPrimaryHub ? "#E8A238" : "#022113"}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? "1.8" : "1"}
                          className="transition-all duration-300 group-hover/pin:scale-125"
                        />

                        {/* Center Accent Pip */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? "1.8" : "0.9"}
                          fill="#FFFFFF"
                        />

                        {/* Selected Pin Tooltip Label */}
                        {isSelected && (
                          <g className="transition-all duration-300 pointer-events-none">
                            <rect
                              x={x + 6}
                              y={y - 11}
                              width={node.name.length * 6 + 14}
                              height="16"
                              rx="4"
                              fill="#022113"
                              stroke="#546C18"
                              strokeWidth="0.8"
                            />
                            <text
                              x={x + 10}
                              y={y + 0.5}
                              fill="#FFFFFF"
                              fontSize="8.5"
                              fontWeight="bold"
                              fontFamily="Montserrat, sans-serif"
                            >
                              {node.name}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Map Legend Overlay */}
                <div className="absolute top-2 right-2 p-2.5 rounded-xl bg-white/95 border border-[#E5EAD7] text-[10px] font-mono text-stone-600 space-y-1 shadow-sm pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E8A238]"></span>
                    <span>Primary Hub</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#546C18]"></span>
                    <span>Regional KVK</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#022113]"></span>
                    <span>Telemetry Node</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Active Agro-Climatic Intelligence HUD Card */}
              <div className="mt-1 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5EAD7] shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Zone & Location Breadcrumbs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0F4EC] text-[#546C18] border border-[#E5EAD7]">
                        {activeNode.zoneName}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {activeNode.district}, {activeNode.state}
                      </span>
                    </div>

                    {/* Station Name */}
                    <h4 className="text-xs sm:text-sm font-bold text-[#022113] truncate font-['Montserrat',sans-serif]">
                      {activeNode.stationName}
                    </h4>

                    {/* Monitored Metrics Row */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-[#546C18]" />
                        <span className="font-semibold text-[#022113]">NDVI: {activeNode.ndviScore}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                          {activeNode.ndviStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span>Soil: {activeNode.soilHydration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThermometerSun className="w-3 h-3 text-amber-500" />
                        <span>{activeNode.temperature}</span>
                      </div>
                    </div>

                    {/* Advisory Snippet grounded in the problem statement */}
                    <p className="text-[11px] text-stone-600 leading-snug pt-1 italic line-clamp-2">
                      <span className="font-semibold not-italic text-[#546C18]">{activeNode.activeAdvisoryPillar}:</span> "{activeNode.recommendationSnippet}"
                    </p>
                  </div>

                  {/* Quick Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleLaunchAdvisory(activeNode)}
                      className="px-3.5 py-2 rounded-xl bg-[#546C18] hover:bg-[#627d1d] text-[#DFEB38] text-[11px] font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title={`Launch Gemini Advisory for ${activeNode.sampleCrop} in ${activeNode.district}`}
                    >
                      <span>Launch Advisory</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#DFEB38]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('satellite')}
                      className="text-[10px] text-stone-500 hover:text-[#546C18] font-bold font-['Montserrat',sans-serif] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Inspect Sentinel-2 Satellite multispectral pass"
                    >
                      <span>Satellite Telemetry</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
