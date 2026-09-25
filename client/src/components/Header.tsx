import React, { useState, useRef, useEffect } from 'react';
import type { Language, SyncStatusData, NavigationPage } from '../types';
import { 
  Globe, 
  Settings, 
  Menu, 
  X, 
  ArrowUpRight 
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOnline?: boolean;
  syncStatus?: SyncStatusData | null;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
  onOpenSettings?: () => void;
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onSearchAndNavigate?: (crop?: string, location?: string) => void;
}

const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'en', label: 'English', name: 'EN' },
  { code: 'hi', label: 'हिन्दी', name: 'HI' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'KN' },
  { code: 'te', label: 'తెలుగు', name: 'TE' },
  { code: 'ta', label: 'தமிழ்', name: 'TA' },
  { code: 'mr', label: 'मराठी', name: 'MR' },
  { code: 'bn', label: 'বাংলা', name: 'BN' },
  { code: 'gu', label: 'ગુજરાતી', name: 'GU' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', name: 'PA' },
  { code: 'ml', label: 'മലയാളം', name: 'ML' }
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenSettings,
  currentPage,
  onNavigate,
  syncStatus: _syncStatus,
  onTriggerSync: _onTriggerSync,
  isSyncing: _isSyncing
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: NavigationPage; label: string }[] = [
    { id: 'home', label: 'Home Page' },
    { id: 'dashboard', label: 'Mandi Terminal' },
    { id: 'satellite', label: 'Satellite NDVI' },
    { id: 'advisory', label: 'AI Advisory' },
    { id: 'diagnose', label: 'Pathology' },
    { id: 'weather', label: 'Weather NWP' },
    { id: 'gov', label: 'Data Mesh' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ── KisanSathi Primary Navbar (Authentic Behance Style with Full Navigation) ─────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[#F8FAF6]/90 backdrop-blur-md border-b border-[#022113]/5 transition-colors shadow-xs">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 sm:px-6 py-3">
          
          {/* Left Brand: KisanSathi Logo with authentic wheat/leaf emblem */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#546C18] flex items-center justify-center text-[#DFEB38] group-hover:scale-105 transition-transform shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M12 4c-3 0-5 2-5 5 0 2 2 3 5 3" />
                <path d="M12 4c3 0 5 2 5 5 0 2-2 3-5 3" />
                <path d="M12 10c-3.5 0-6 2.5-6 5.5 0 2 2.5 3.5 6 3.5" />
                <path d="M12 10c3.5 0 6 2.5 6 5.5 0 2-2.5 3.5-6 3.5" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#022113] font-['Montserrat',sans-serif]">
              Kisan<span className="text-[#59701E]">Sathi</span>
            </span>
          </div>

          {/* Center Floating Pill: All KisanSathi Modules */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-white border border-[#022113]/10 rounded-full p-1 shadow-xs">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'home'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'dashboard'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Mandi Terminal
            </button>
            <button
              onClick={() => handleNavClick('satellite')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'satellite'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Satellite NDVI
            </button>
            <button
              onClick={() => handleNavClick('advisory')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'advisory'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              AI Advisory
            </button>
            <button
              onClick={() => handleNavClick('diagnose')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'diagnose'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Pathology
            </button>
            <button
              onClick={() => handleNavClick('weather')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'weather'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => handleNavClick('gov')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'gov'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Data Mesh
            </button>
            <div className="h-4 w-px bg-[#022113]/10 mx-0.5" />
            <button
              onClick={() => handleNavClick('about')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'about'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer font-['Montserrat',sans-serif] shrink-0 ${
                currentPage === 'contact'
                  ? 'bg-[#546C18] text-white shadow-xs'
                  : 'text-[#022113]/80 hover:text-[#546C18] hover:bg-[#F0F4EC]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons (Minimal & Balanced) */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded-full border border-[#022113]/10 bg-white px-3 py-1.5 text-xs font-bold font-['Montserrat',sans-serif] text-[#022113] hover:bg-[#F0F4EC] transition cursor-pointer shadow-xs"
              >
                <Globe strokeWidth={1.5} className="w-3.5 h-3.5 text-[#59701E]" />
                <span>{LANGUAGES.find(l => l.code === language)?.name || 'EN'}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#022113]/10 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-2 py-1">
                    Select Language
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`text-left text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
                          language === lang.code
                            ? 'bg-[#546C18] text-white font-bold'
                            : 'text-[#022113] hover:bg-[#F0F4EC]'
                        }`}
                      >
                        <span className="font-semibold">{lang.name}</span>
                        <span className="text-[10px] opacity-60">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Trigger */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022113]/10 bg-white text-[#022113] hover:bg-[#F0F4EC] transition cursor-pointer shadow-xs"
                title="Preferences & Profile"
              >
                <Settings strokeWidth={1.5} className="w-3.5 h-3.5 text-[#59701E]" />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022113]/10 bg-white text-[#022113] lg:hidden cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X strokeWidth={1.5} className="w-4 h-4" /> : <Menu strokeWidth={1.5} className="w-4 h-4 text-[#022113]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#022113]/10 bg-white px-4 py-5 shadow-xl lg:hidden animate-in slide-in-from-top-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition text-left cursor-pointer font-['Montserrat',sans-serif] ${
                    currentPage === item.id
                      ? 'bg-[#546C18] text-white'
                      : 'text-[#022113] hover:bg-[#F0F4EC]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight strokeWidth={1.5} className="w-4 h-4 opacity-60" />
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
