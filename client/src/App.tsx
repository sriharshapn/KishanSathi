import React, { useState, useEffect } from 'react';
import type { 
  Language, 
  CropUnit, 
  Commodity, 
  MarketItem, 
  SearchResult,
  SyncStatusData,
  PriceTrend,
  NavigationPage
} from './types';

import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { ExplainModal } from './components/ExplainModal';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { DiagnosePage } from './pages/DiagnosePage';
import { SatellitePage } from './pages/SatellitePage';
import { GovDashboardPage } from './pages/GovDashboardPage';
import { WeatherDashboardPage } from './pages/WeatherDashboardPage';
import { 
  saveSearchResultToCache, 
  getCachedSearchResult 
} from './utils/storage';
import { setSiteLanguage, clearAllTranslateCookies } from './utils/translator';
import { apiUrl } from './utils/api';
import { CheckCircle2 } from 'lucide-react';
import { MeadowCapture } from './components/MeadowCapture';

export const App: React.FC = () => {
  // English is ALWAYS default on initial load / refresh per user instruction
  const [language, setLanguage] = useState<Language>('en');

  // Purge any stale Google Translate cookies on initial mount to guarantee pure English
  useEffect(() => {
    clearAllTranslateCookies();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setSiteLanguage(newLang);
  };

  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'form' | 'nlp'>('form');

  // Commodities metadata
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  // Search form state
  const [crop, setCrop] = useState<string>('Tomato');
  const [variety, setVariety] = useState<string>('Hybrid');
  const [location, setLocation] = useState<string>('Bengaluru');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<CropUnit>('kg');

  // Results state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketItem | null>(null);
  const [activeTrend, setActiveTrend] = useState<PriceTrend | null>(null);
  const [cachedAt, setCachedAt] = useState<string | undefined>();
  const [explanationTerm, setExplanationTerm] = useState<string | null>(null);

  // Production Sync & Settings state
  const [syncStatus, setSyncStatus] = useState<SyncStatusData | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Initialize page routing from hash and pathname
  useEffect(() => {
    const validPages: NavigationPage[] = [
      'home', 'satellite', 'advisory', 'diagnose', 'gov',
      'weather', 'dashboard', 'about', 'contact'
    ];

    const getPageFromLocation = (): NavigationPage => {
      // 1. Check hash first (e.g. #/satellite, #advisory)
      const hashClean = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0].toLowerCase();
      if (validPages.includes(hashClean as NavigationPage)) {
        return hashClean as NavigationPage;
      }
      // 2. Check pathname (e.g. /satellite or /satellite.html)
      const pathClean = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').toLowerCase();
      if (validPages.includes(pathClean as NavigationPage)) {
        return pathClean as NavigationPage;
      }
      return 'home';
    };

    setCurrentPage(getPageFromLocation());

    const handleLocationChange = () => {
      setCurrentPage(getPageFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (page: NavigationPage) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Re-apply site-wide dynamic translation whenever the page route changes
  useEffect(() => {
    if (language !== 'en') {
      const timer = setTimeout(() => {
        setSiteLanguage(language);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      try {
        const hostname = window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      } catch {
        // silent
      }
    }
  }, [currentPage, language]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch sync status on mount
  const fetchSyncStatus = async () => {
    try {
      const res = await fetch(apiUrl('/sync/status'));
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data);
      }
    } catch (e) {
      console.warn("Could not fetch sync status", e);
    }
  };

  useEffect(() => {
    fetchSyncStatus();

    // Fetch user preferences (location and unit only; language remains 'en' on fresh load)
    async function loadPreferences() {
      try {
        const res = await fetch(apiUrl('/preferences'));
        const data = await res.json();
        if (data.success && data.preferences) {
          if (data.preferences.location) setLocation(data.preferences.location);
          if (data.preferences.preferred_units) setUnit(data.preferences.preferred_units as CropUnit);
        }
      } catch (e) {
        console.warn("Could not load preferences", e);
      }
    }
    loadPreferences();
  }, []);

  // Fetch trend whenever selectedMarket or crop changes
  useEffect(() => {
    if (!selectedMarket || !crop) {
      setActiveTrend(null);
      return;
    }
    const marketId = selectedMarket.market_id;
    async function loadMarketTrend() {
      try {
        const res = await fetch(apiUrl(`/trends?crop=${encodeURIComponent(crop)}&market_id=${encodeURIComponent(marketId)}&days=7`));
        const data = await res.json();
        if (data.success && data.has_data) {
          setActiveTrend(data);
        } else {
          setActiveTrend(null);
        }
      } catch {
        setActiveTrend(null);
      }
    }
    loadMarketTrend();
  }, [selectedMarket?.market_id, crop]);

  // Live Sync trigger handler
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(apiUrl('/sync'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncToast(`Successfully synced ${data.records_synced} APMC records into SQLite & Cloud DB!`);
        setTimeout(() => setSyncToast(null), 4500);
        await fetchSyncStatus();
        await handleSearch();
      }
    } catch (err) {
      console.error("Live sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch standardized commodities on mount
  useEffect(() => {
    async function loadCrops() {
      try {
        const res = await fetch(apiUrl('/crops'));
        const data = await res.json();
        if (data.success && data.commodities) {
          setCommodities(data.commodities);
        }
      } catch (err) {
        console.error("Failed to load commodities", err);
      }
    }
    loadCrops();

    // Auto-run initial search for baseline data
    handleSearch();
  }, []);

  // Search handler
  const handleSearch = async (gpsCoords?: { lat: number; lon: number }, overrideCrop?: string) => {
    const targetCrop = overrideCrop || crop;
    if (!targetCrop) return;
    setIsLoading(true);

    const queryParams = new URLSearchParams({
      crop: targetCrop,
      location,
      quantity: quantity.toString(),
      unit,
      pan_india: 'true'
    });

    if (gpsCoords) {
      queryParams.append('lat', gpsCoords.lat.toString());
      queryParams.append('lon', gpsCoords.lon.toString());
    }

    try {
      if (!navigator.onLine) {
        const cached = getCachedSearchResult(targetCrop, location);
        if (cached) {
          setSearchResult(cached.data);
          setCachedAt(cached.cachedAt);
          if (cached.data.markets && cached.data.markets.length > 0) {
            setSelectedMarket(cached.data.markets[0]);
          }
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch(apiUrl(`/markets?${queryParams.toString()}`));
      const data: SearchResult = await res.json();

      setSearchResult(data);
      setCachedAt(undefined);

      if (data.success && data.verified && data.markets.length > 0) {
        setSelectedMarket(data.markets[0]);
        saveSearchResultToCache(targetCrop, location, data);
      } else {
        setSelectedMarket(null);
      }
    } catch (err) {
      console.warn("Network request failed, attempting cache lookup", err);
      const cached = getCachedSearchResult(targetCrop, location);
      if (cached) {
        setSearchResult(cached.data);
        setCachedAt(cached.cachedAt);
        if (cached.data.markets && cached.data.markets.length > 0) {
          setSelectedMarket(cached.data.markets[0]);
        }
      } else {
        setSearchResult({
          success: false,
          verified: false,
          markets: [],
          message: "Unable to retrieve verified market data. Check connection."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for natural language query parser
  const handleNlpResult = (parsed: { crop: string; location: string; quantity: number; unit: CropUnit }) => {
    setCrop(parsed.crop);
    setLocation(parsed.location);
    setQuantity(parsed.quantity);
    setUnit(parsed.unit);

    setTimeout(() => {
      handleSearch(undefined, parsed.crop);
    }, 100);
  };

  // One-click select crop from Portfolio and jump to terminal
  const handleSelectCropAndNavigate = (cropName: string) => {
    setCrop(cropName);
    navigateTo('dashboard');
    handleSearch(undefined, cropName);
  };

  // Full cross-platform search handler that sets crop and/or location, navigates, and queries API
  const handleSearchAndNavigate = (targetCrop?: string, targetLocation?: string) => {
    if (targetCrop) setCrop(targetCrop);
    if (targetLocation) setLocation(targetLocation);
    navigateTo('dashboard');
    setTimeout(() => {
      handleSearch(undefined, targetCrop || crop);
    }, 50);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-['Open_Sans',sans-serif] bg-[#F8FAF6] text-[#022113] relative selection:bg-[#DFEB38] selection:text-[#022113]" 
      style={{ background: '#F8FAF6' }}
    >
      <div className="grain fixed inset-0 opacity-15 pointer-events-none z-0"></div>

      {/* Editorial Header with Core Technical Modules, multi-page navigation, language switch & sync */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        isOnline={isOnline}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onSearchAndNavigate={handleSearchAndNavigate}
      />

      {/* Live Sync Notification Toast */}
      {syncToast && (
        <div className="bg-[#153424] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-sm animate-in fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Offline / Cached timestamp notification banner */}
      <OfflineBanner
        isOnline={isOnline}
        cachedAt={cachedAt}
        language={language}
        onRefresh={() => handleSearch()}
      />

      {/* Main Page Content Router with Smooth Slide Transition */}
      <main key={currentPage} className="relative z-10 flex-1 w-full animate-slide-up">
        {currentPage === 'home' && (
          <HomePage
            language={language}
            onNavigate={navigateTo}
            onSelectCropAndNavigate={handleSelectCropAndNavigate}
            onSearchAndNavigate={handleSearchAndNavigate}
            commodities={commodities}
          />
        )}

        {currentPage === 'satellite' && (
          <SatellitePage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'advisory' && (
          <AdvisoryPage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'diagnose' && (
          <DiagnosePage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'gov' && (
          <GovDashboardPage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'weather' && (
          <WeatherDashboardPage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'dashboard' && (
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8">
            <DashboardPage
              language={language}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              commodities={commodities}
              crop={crop}
              setCrop={setCrop}
              variety={variety}
              setVariety={setVariety}
              location={location}
              setLocation={setLocation}
              quantity={quantity}
              setQuantity={setQuantity}
              unit={unit}
              setUnit={setUnit}
              isLoading={isLoading}
              searchResult={searchResult}
              selectedMarket={selectedMarket}
              setSelectedMarket={setSelectedMarket}
              activeTrend={activeTrend}
              explanationTerm={explanationTerm}
              setExplanationTerm={setExplanationTerm}
              handleSearch={handleSearch}
              handleNlpResult={handleNlpResult}
              onNavigate={navigateTo}
            />
          </div>
        )}

        {currentPage === 'about' && (
          <AboutPage
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            language={language}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Farmer Preferences & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        currentLocation={location}
        onLocationChange={setLocation}
        currentUnit={unit}
        onUnitChange={setUnit}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Educational Term Modal */}
      <ExplainModal
        term={explanationTerm}
        language={language}
        onClose={() => setExplanationTerm(null)}
      />

      {/* AgroInvest DPG Sovereign Network Footer for Subpages */}
      {currentPage !== 'home' && (
        <div className="mt-auto print:hidden">
          <MeadowCapture onNavigate={navigateTo} />
        </div>
      )}
    </div>
  );
};

export default App;
