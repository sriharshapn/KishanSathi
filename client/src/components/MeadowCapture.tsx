import React from 'react';
import type { NavigationPage } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface MeadowCaptureProps {
  onNavigate: (page: NavigationPage) => void;
}

/**
 * SiteFooter / MeadowCapture Component
 * Authentic Behance AgroInvest design system:
 * - Inset Pale Gray (#F0F2EB) rounded-[2.5rem] card
 * - Deep Evergreen (#022113) typography in Montserrat & Open Sans
 * - Electric Pale Lime (#DFEB38) double-pill CTA button
 * - White capsule pill navbar [ Home page ] [ About us ] [ Our services ] [ Latest news ] [ Shares ]
 */
export const MeadowCapture: React.FC<MeadowCaptureProps> = ({ onNavigate }) => {
  return (
    <footer className="mx-auto max-w-[1440px] px-3 sm:px-6 py-12 font-['Open_Sans',sans-serif]">
      <div className="bg-[#F0F2EB] rounded-[2.5rem] p-8 sm:p-14 border border-[#022113]/5 shadow-xs">
        
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
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#546C18] flex items-center justify-center text-[#DFEB38] group-hover:scale-105 transition-transform">
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
            <button onClick={() => onNavigate('home')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#022113] hover:bg-[#F0F2EB] font-['Montserrat',sans-serif] transition cursor-pointer">
              Home page
            </button>
            <button onClick={() => onNavigate('about')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] hover:bg-[#F0F2EB] font-['Montserrat',sans-serif] transition cursor-pointer">
              About us
            </button>
            <button onClick={() => onNavigate('advisory')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] hover:bg-[#F0F2EB] font-['Montserrat',sans-serif] transition cursor-pointer">
              Our services
            </button>
            <button onClick={() => onNavigate('gov')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] hover:bg-[#F0F2EB] font-['Montserrat',sans-serif] transition cursor-pointer">
              Latest news
            </button>
            <button onClick={() => onNavigate('dashboard')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-[#022113] hover:bg-[#F0F2EB] font-['Montserrat',sans-serif] transition cursor-pointer">
              Shares
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default MeadowCapture;
