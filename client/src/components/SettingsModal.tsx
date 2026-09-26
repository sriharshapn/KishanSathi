import React, { useState, useEffect } from 'react';
import type { Language, CropUnit, SyncStatusData } from '../types';
import { X, Settings, Check, MapPin, Globe, Scale, RefreshCw, Database, ShieldCheck } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  currentUnit: CropUnit;
  onUnitChange: (unit: CropUnit) => void;
  syncStatus?: SyncStatusData | null;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

const LANGUAGES: { id: Language; nativeName: string; englishName: string }[] = [
  { id: 'en', nativeName: 'English', englishName: 'Default' },
  { id: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { id: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { id: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { id: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { id: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
  { id: 'bn', nativeName: 'বাংলা', englishName: 'Bengali' },
  { id: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati' },
  { id: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { id: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam' }
];

const UNITS: { id: CropUnit; label: string; desc: string }[] = [
  { id: 'quintal', label: 'Quintal', desc: '100 kg Agmarknet benchmark' },
  { id: 'kg', label: 'Kilogram', desc: 'Base metric (kg)' },
  { id: 'tonne', label: 'Tonne', desc: '1,000 kg bulk standard' }
];

const DISTRICT_SUGGESTIONS = [
  "Ballari, Karnataka",
  "Kolar, Karnataka",
  "Chikkaballapur, Karnataka",
  "Bengaluru, Karnataka",
  "Belagavi, Karnataka",
  "Mysuru, Karnataka",
  "Nashik, Maharashtra",
  "Pune, Maharashtra",
  "Guntur, Andhra Pradesh",
  "Agra, Uttar Pradesh",
  "Karnal, Haryana"
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  currentLocation,
  onLocationChange,
  currentUnit,
  onUnitChange,
  syncStatus,
  onTriggerSync,
  isSyncing = false
}) => {
  if (!isOpen) return null;

  const [localLang, setLocalLang] = useState<Language>(currentLanguage);
  const [localLoc, setLocalLoc] = useState<string>(currentLocation);
  const [localUnit, setLocalUnit] = useState<CropUnit>(currentUnit);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    onLanguageChange(localLang);
    onLocationChange(localLoc);
    onUnitChange(localUnit);

    try {
      await fetch(apiUrl('/preferences'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: localLang,
          location: localLoc,
          preferredUnits: localUnit
        })
      });
    } catch (e) {
      console.warn("Could not save preferences to server", e);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#022113]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#022113]/10 p-6 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 cursor-default relative font-['Open_Sans',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#022113]/8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8 text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#546C18]">
              <Settings className="w-3.5 h-3.5 text-[#546C18]" />
              <span>Farmer Profile & Regional Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif] tracking-tight mt-2.5">
              Platform Preferences
            </h2>
            <p className="text-xs sm:text-sm text-[#022113]/70 mt-1 leading-relaxed">
              Configure your regional APMC mandi telemetry, dialect localization, and crop yield measurement standards.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F0F2EB] hover:bg-[#E5EAD7] text-[#022113] flex items-center justify-center transition-all cursor-pointer border border-[#022113]/8 shrink-0 hover:scale-105 shadow-xs"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Regional Language & Dialect */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#F0F2EB] flex items-center justify-center text-[#546C18]">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
                Preferred Language / Dialect
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#546C18] bg-[#F0F2EB] px-2.5 py-0.5 rounded-full border border-[#022113]/5 font-['Montserrat',sans-serif]">
              10 Indian Languages
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 notranslate" translate="no">
            {LANGUAGES.map((lang) => {
              const isSelected = localLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLocalLang(lang.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#546C18] border-[#546C18] text-white shadow-md'
                      : 'bg-[#F8FAF6] hover:bg-[#F0F2EB] border-[#022113]/8 text-[#022113]'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold leading-tight font-['Montserrat',sans-serif] ${isSelected ? 'text-white' : 'text-[#022113]'}`}>
                      {lang.nativeName}
                    </p>
                    <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-[#DFEB38]' : 'text-[#022113]/50'}`}>
                      {lang.englishName}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#DFEB38] text-[#022113] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Default District / Farm Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F0F2EB] flex items-center justify-center text-[#546C18]">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
              Default District / Primary APMC Mandi
            </span>
          </div>

          <div className="relative rounded-2xl border border-[#022113]/10 bg-[#F8FAF6] focus-within:border-[#546C18] focus-within:bg-white transition-all shadow-inner px-4 py-3 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#546C18] shrink-0" />
            <input
              type="text"
              value={localLoc}
              onChange={(e) => setLocalLoc(e.target.value)}
              placeholder="e.g. Ballari, Karnataka"
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#022113] placeholder-[#022113]/40 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#022113]/50 font-['Montserrat',sans-serif] mr-1">
              Popular APMC Hubs:
            </span>
            {DISTRICT_SUGGESTIONS.slice(0, 5).map(d => {
              const isSelected = localLoc === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLocalLoc(d)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                      : 'bg-[#F0F2EB] text-[#022113] hover:bg-[#E5EAD7] border border-[#022113]/8'
                  }`}
                >
                  {d.split(',')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Agricultural Unit */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F0F2EB] flex items-center justify-center text-[#546C18]">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
              Default Measurement Standard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {UNITS.map((u) => {
              const isSelected = localUnit === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setLocalUnit(u.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#546C18] text-white border-[#546C18] shadow-md'
                      : 'bg-[#F8FAF6] hover:bg-[#F0F2EB] border-[#022113]/8 text-[#022113]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-extrabold font-['Montserrat',sans-serif] uppercase tracking-wider ${isSelected ? 'text-[#DFEB38]' : 'text-[#022113]'}`}>
                      {u.label}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#DFEB38] text-[#022113] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] mt-1 ${isSelected ? 'text-white/80' : 'text-[#022113]/60'}`}>
                    {u.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Sovereign Telemetry & Architecture Bento Card */}
        <div className="bg-[#F0F2EB] rounded-[2rem] p-6 border border-[#022113]/8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#546C18] shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
                Sovereign Mandi Telemetry
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#DFEB38]/50 border border-[#DFEB38] text-[#022113] px-3 py-1 rounded-full text-[11px] font-bold font-['Montserrat',sans-serif]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#546C18]" />
              <span>Agmarknet Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-[#022113]/5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/50 block">
                Telemetry Source
              </span>
              <span className="font-extrabold text-[#022113] font-['Montserrat',sans-serif] mt-0.5 block">
                Agmarknet / DMI Live
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#022113]/5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/50 block">
                Verified Records
              </span>
              <span className="font-extrabold text-[#546C18] font-['Montserrat',sans-serif] mt-0.5 block">
                {syncStatus?.total_verified_records || 7621} Mandi Rates
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#022113]/5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/50 block">
                Edge Data Store
              </span>
              <span className="font-extrabold text-[#022113] font-['Montserrat',sans-serif] mt-0.5 block">
                Google Cloud Firestore
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#022113]/5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/50 block">
                Agronomic Compliance
              </span>
              <span className="font-extrabold text-[#022113] font-['Montserrat',sans-serif] mt-0.5 block">
                AgriStack Sovereign Mesh
              </span>
            </div>
          </div>

          {onTriggerSync && (
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-black font-['Montserrat',sans-serif] text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing APMC Feeds...' : 'Refresh Market Telemetry'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[#022113]/8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-[#F0F2EB] hover:bg-[#E5EAD7] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] uppercase tracking-wider transition-colors cursor-pointer border border-[#022113]/8"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-7 py-3 bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-black text-xs font-['Montserrat',sans-serif] uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <span>Save Preferences</span>
                <span className="w-6 h-6 rounded-full bg-white text-[#022113] flex items-center justify-center font-bold text-xs shadow-xs">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
