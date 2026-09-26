import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MarketItem, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { MarketCard } from './MarketCard';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  RotateCcw, 
  TrendingUp, 
  BarChart2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  Sparkles
} from 'lucide-react';

const INITIAL_BATCH_SIZE = 6;
const BATCH_INCREMENT = 6;

const SHOW_MORE_LABELS: Record<Language, string> = {
  en: 'Show More',
  hi: 'और देखें',
  kn: 'ಇನ್ನಷ್ಟು ತೋರಿಸಿ',
  te: 'ಮರಿನ್ನಿ ಚೂಪಿಂಚು',
  ta: 'ಮೇಲುಮ್ ಕಾಟ್ಟು',
  mr: 'ಆಣಖೀ ದಾಖವಾ',
  bn: 'ಆರೋ ದೇಖುನ್',
  gu: 'ವಧು ಜುಓ',
  pa: 'ಹೋರ್ ವೇಖೋ',
  ml: 'ಕೂಡುತಲ್ ಕಾಣಿಕ್ಕುಕ್'
};

const SHOW_LESS_LABELS: Record<Language, string> = {
  en: 'Show Less',
  hi: 'कम देखें',
  kn: 'ಕಡಿಮೆ ತೋರಿಸಿ',
  te: 'ತಕ್ಕುವ ಚೂಪಿಂಚು',
  ta: 'ಕುಱೈವಾಗಕ್ ಕಾಟ್ಟು',
  mr: 'ಕಮೀ ದಾಖವಾ',
  bn: 'ಕಮ್ ದೇಖುನ್',
  gu: 'ಓಛುಂ ಜುಓ',
  pa: 'ಘಟ್ಟ್ ವೇಖೋ',
  ml: 'ಕುಱಚ್ಚು ಕಾಣಿಕ್ಕುಕ್'
};

interface MarketComparisonProps {
  markets: MarketItem[];
  language: Language;
  selectedMarket: MarketItem | null;
  onSelectMarket: (market: MarketItem) => void;
  onExplainTerm: (term: string) => void;
}

export const MarketComparison: React.FC<MarketComparisonProps> = ({
  markets,
  language,
  selectedMarket,
  onSelectMarket,
  onExplainTerm
}) => {
  const t = TRANSLATIONS[language];
  const carouselRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const targetScrollRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Layout mode: Spotlight Carousel vs Grid
  const [viewLayout, setViewLayout] = useState<'carousel' | 'grid'>('carousel');
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter & Sort State
  const [selectedState, setSelectedState] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 = all
  const [sortBy, setSortBy] = useState<string>('distance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);

  // Extract unique states
  const availableStates = useMemo(() => {
    const states = new Set(markets.map(m => m.state));
    return Array.from(states).sort();
  }, [markets]);

  // Filter and sort the markets
  const processedMarkets = useMemo(() => {
    let result = [...markets];

    // Filter by state
    if (selectedState !== 'all') {
      result = result.filter(m => m.state.toLowerCase() === selectedState.toLowerCase());
    }

    // Filter by max distance
    if (maxDistance > 0) {
      result = result.filter(m => m.distance_km === null || m.distance_km <= maxDistance);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => 
        m.market_name.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_desc':
          return b.modal_price - a.modal_price;
        case 'price_asc':
          return a.modal_price - b.modal_price;
        case 'arrivals_desc':
          return b.arrival_quantity - a.arrival_quantity;
        case 'spread_asc':
          return a.price_spread - b.price_spread;
        case 'distance':
        default:
          return (a.distance_km ?? 9999) - (b.distance_km ?? 9999);
      }
    });

    return result;
  }, [markets, selectedState, maxDistance, searchQuery, sortBy]);

  // Reset visibleCount and activeIndex whenever filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedState, maxDistance, sortBy, searchQuery]);

  // If selectedMarket is set, scroll to it in carousel or expand grid
  useEffect(() => {
    if (selectedMarket) {
      const idx = processedMarkets.findIndex(m => m.market_id === selectedMarket.market_id);
      if (idx !== -1) {
        setActiveIndex(idx);
        if (carouselRef.current && viewLayout === 'carousel') {
          const cardWidth = 380;
          carouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
        }
        if (idx >= visibleCount) {
          setVisibleCount(Math.ceil((idx + 1) / BATCH_INCREMENT) * BATCH_INCREMENT);
        }
      }
    }
  }, [selectedMarket, processedMarkets, viewLayout, visibleCount]);

  const visibleMarkets = useMemo(() => {
    return processedMarkets.slice(0, visibleCount);
  }, [processedMarkets, visibleCount]);

  // Carousel scroll handler
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 360;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(idx, processedMarkets.length - 1)));
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth > 768 ? 390 : 320;
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth > 768 ? 390 : 320;
      carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (idx: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth > 768 ? 390 : 320;
      carouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
      setActiveIndex(idx);
    }
  };

  // Smooth mouse-follow scroll loop ("moving right and left by just moving it with mouse")
  useEffect(() => {
    if (viewLayout !== 'carousel') return;

    const smoothScrollLoop = () => {
      const el = carouselRef.current;
      if (el && isHoveringRef.current && !isDraggingRef.current) {
        const current = el.scrollLeft;
        const target = targetScrollRef.current;
        const diff = target - current;
        if (Math.abs(diff) > 0.5) {
          el.scrollLeft = current + diff * 0.08;
        }
      }
      animationFrameRef.current = requestAnimationFrame(smoothScrollLoop);
    };

    animationFrameRef.current = requestAnimationFrame(smoothScrollLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [viewLayout]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    if (!el) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartXRef.current;
      if (Math.abs(dx) > 5) {
        hasDraggedRef.current = true;
      }
      el.scrollLeft = dragStartScrollRef.current - dx;
      targetScrollRef.current = el.scrollLeft;
      return;
    }

    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      targetScrollRef.current = ratio * maxScroll;
      isHoveringRef.current = true;
    }
  };

  const handleContainerMouseEnter = () => {
    isHoveringRef.current = true;
    if (carouselRef.current) {
      targetScrollRef.current = carouselRef.current.scrollLeft;
    }
  };

  const handleContainerMouseLeave = () => {
    isHoveringRef.current = false;
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Aggregate Market Stats
  const stats = useMemo(() => {
    if (markets.length === 0) return null;
    const prices = markets.map(m => m.modal_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
    const totalArrivals = markets.reduce((sum, m) => sum + m.arrival_quantity, 0);

    return { minPrice, maxPrice, avgPrice, totalArrivals };
  }, [markets]);

  const handleResetFilters = () => {
    setSelectedState('all');
    setMaxDistance(0);
    setSortBy('distance');
    setSearchQuery('');
    setVisibleCount(INITIAL_BATCH_SIZE);
    setActiveIndex(0);
  };

  if (markets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 font-['Open_Sans',sans-serif]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EAD7] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113] text-[10px] font-black font-['Montserrat',sans-serif] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#022113]" />
              Spotlight Carousel
            </span>
            <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider bg-[#F0F4EC] text-[#59701E] border border-[#E5EAD7] px-3 py-1 rounded-full">
              {processedMarkets.length} of {markets.length} Mandis
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
            {t.marketComparisonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568] mt-1 max-w-3xl font-normal leading-relaxed">
            {t.marketComparisonSubtitle}
          </p>
        </div>

        {/* View Layout Toggle & Carousel Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Layout switcher */}
          <div className="flex items-center bg-[#F0F4EC] p-1 rounded-full border border-[#E5EAD7]">
            <button
              onClick={() => setViewLayout('carousel')}
              className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer flex items-center gap-1.5 ${
                viewLayout === 'carousel'
                  ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                  : 'text-[#59701E] hover:text-[#022113]'
              }`}
              title="Spotlight Carousel Rail (Scrolltide)"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer flex items-center gap-1.5 ${
                viewLayout === 'grid'
                  ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                  : 'text-[#59701E] hover:text-[#022113]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>

          {/* Prev/Next arrows when in Carousel mode */}
          {viewLayout === 'carousel' && processedMarkets.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={scrollPrev}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#F0F4EC] border border-[#E5EAD7] text-[#022113] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                title="Previous Mandi"
              >
                <ChevronLeft className="w-4 h-4 text-[#022113]" strokeWidth={2.5} />
              </button>
              <button
                onClick={scrollNext}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#F0F4EC] border border-[#E5EAD7] text-[#022113] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                title="Next Mandi"
              >
                <ChevronRight className="w-4 h-4 text-[#022113]" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Stats Matrix */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-5 rounded-3xl border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59701E] font-['Montserrat',sans-serif] block">Floor Price</span>
            <strong className="text-base sm:text-lg text-[#022113] font-['Montserrat',sans-serif] font-bold block mt-1">₹{stats.minPrice.toLocaleString('en-IN')}/q</strong>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59701E] font-['Montserrat',sans-serif] block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
              Ceiling Modal Price
            </span>
            <strong className="text-base sm:text-lg text-[#022113] font-['Montserrat',sans-serif] font-bold block mt-1">₹{stats.maxPrice.toLocaleString('en-IN')}/q</strong>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59701E] font-['Montserrat',sans-serif] block">Regional Average</span>
            <strong className="text-base sm:text-lg text-[#022113] font-['Montserrat',sans-serif] font-bold block mt-1">₹{stats.avgPrice.toLocaleString('en-IN')}/q</strong>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59701E] font-['Montserrat',sans-serif] block flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
              Total Recorded Arrivals
            </span>
            <strong className="text-base sm:text-lg text-[#022113] font-['Montserrat',sans-serif] font-bold block mt-1">{stats.totalArrivals.toLocaleString('en-IN')} q</strong>
          </div>
        </div>
      )}

      {/* Interactive Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF6] px-3 py-1.5 rounded-full border border-[#E5EAD7]">
            <Filter className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
            <span className="text-[#59701E] font-semibold hidden sm:inline">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-[#022113] font-semibold cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-white text-[#022113]">All States</option>
              {availableStates.map(st => (
                <option key={st} value={st} className="bg-white text-[#022113]">{st}</option>
              ))}
            </select>
          </div>

          {/* Distance Radius Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF6] px-3 py-1.5 rounded-full border border-[#E5EAD7]">
            <span className="text-[#59701E] font-semibold">Radius:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="bg-transparent text-[#022113] font-semibold cursor-pointer focus:outline-none"
            >
              <option value={0} className="bg-white text-[#022113]">Any Distance</option>
              <option value={50} className="bg-white text-[#022113]">&lt; 50 km</option>
              <option value={100} className="bg-white text-[#022113]">&lt; 100 km</option>
              <option value={200} className="bg-white text-[#022113]">&lt; 200 km</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF6] px-3 py-1.5 rounded-full border border-[#E5EAD7]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#59701E]" strokeWidth={2} />
            <span className="text-[#59701E] font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#022113] font-semibold cursor-pointer focus:outline-none"
            >
              <option value="distance" className="bg-white text-[#022113]">Nearest Distance</option>
              <option value="price_desc" className="bg-white text-[#022113]">Highest Modal Price</option>
              <option value="price_asc" className="bg-white text-[#022113]">Lowest Modal Price</option>
              <option value="arrivals_desc" className="bg-white text-[#022113]">Highest Arrivals</option>
              <option value="spread_asc" className="bg-white text-[#022113]">Tightest Spread</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(selectedState !== 'all' || maxDistance > 0 || searchQuery.trim() || sortBy !== 'distance') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-[#59701E] hover:text-[#022113] font-semibold rounded-full hover:bg-[#F0F4EC] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#59701E] absolute left-3 top-2.5" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter mandi..."
            className="w-full pl-8 pr-3 py-2 border border-[#E5EAD7] rounded-full bg-[#F8FAF6] text-[#022113] text-xs placeholder:text-[#889988] focus:outline-none focus:border-[#59701E]"
          />
        </div>
      </div>

      {/* Render Cards: Spotlight Carousel vs Grid */}
      {processedMarkets.length > 0 ? (
        viewLayout === 'carousel' ? (
          /* ── Scrolltide Spotlight Carousel Rail ── */
          <div className="space-y-4">
            {/* Scrollable Track */}
            <div className="relative">
              {/* Fade gradients on edges */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F8FAF6] to-transparent z-10 hidden sm:block" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAF6] to-transparent z-10 hidden sm:block" />

              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                onMouseMove={handleContainerMouseMove}
                onMouseEnter={handleContainerMouseEnter}
                onMouseLeave={handleContainerMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-ew-resize select-none"
              >
                {processedMarkets.map((market, idx) => {
                  const isChosen = selectedMarket?.market_id === market.market_id;

                  return (
                    <div
                      key={market.market_id}
                      onClick={() => {
                        if (hasDraggedRef.current) return;
                        setActiveIndex(idx);
                      }}
                      className="shrink-0 w-[310px] sm:w-[350px] md:w-[370px] h-[460px] transition-opacity duration-300"
                    >
                      <MarketCard
                        market={market}
                        language={language}
                        isSelected={isChosen}
                        onSelect={(m) => {
                          if (hasDraggedRef.current) return;
                          onSelectMarket(m);
                          setActiveIndex(idx);
                        }}
                        onExplainTerm={onExplainTerm}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Bottom Control Bar: Dots + Counter + Arrows */}
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-mono text-[#59701E] font-bold">
                Mandi {activeIndex + 1} of {processedMarkets.length}
              </span>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5 max-w-[200px] overflow-hidden">
                {processedMarkets.slice(0, 12).map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => scrollToIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === dotIdx
                        ? 'w-6 bg-[#546C18]'
                        : 'w-2 bg-[#E5EAD7] hover:bg-[#59701E]/40'
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
                {processedMarkets.length > 12 && (
                  <span className="text-[10px] text-[#718096] font-mono ml-1">+{processedMarkets.length - 12}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  className="px-3 py-1 rounded-full bg-white hover:bg-[#DFEB38] text-[#022113] border border-[#E5EAD7] text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  onClick={scrollNext}
                  className="px-3 py-1 rounded-full bg-white hover:bg-[#DFEB38] text-[#022113] border border-[#E5EAD7] text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Standard Grid Mode ── */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleMarkets.map((market) => (
                <MarketCard
                  key={market.market_id}
                  market={market}
                  language={language}
                  isSelected={selectedMarket?.market_id === market.market_id}
                  onSelect={onSelectMarket}
                  onExplainTerm={onExplainTerm}
                />
              ))}
            </div>

            {/* Centered Show More Button in Grid Mode */}
            {processedMarkets.length > INITIAL_BATCH_SIZE && (
              <div className="flex justify-center pt-4 pb-2">
                {visibleCount < processedMarkets.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => Math.min(prev + BATCH_INCREMENT, processedMarkets.length))}
                    className="px-8 py-3 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] text-xs font-black font-['Montserrat',sans-serif] uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
                  >
                    <span>{SHOW_MORE_LABELS[language] || 'Show More'}</span>
                    <ChevronDown className="w-4 h-4 text-[#022113]" strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(INITIAL_BATCH_SIZE)}
                    className="px-7 py-2.5 rounded-full bg-white hover:bg-[#F8FAF6] text-[#022113] border border-[#E5EAD7] text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>{SHOW_LESS_LABELS[language] || 'Show Less'}</span>
                    <ChevronUp className="w-4 h-4 text-[#022113]" strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5EAD7] p-8 text-center space-y-3 shadow-xs">
          <p className="text-[#4A5568] text-xs">
            No markets match your current filter parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-[#DFEB38] text-[#022113] text-xs font-bold rounded-full hover:bg-[#d0dc32] transition-colors cursor-pointer font-['Montserrat',sans-serif]"
          >
            Show All {markets.length} Markets
          </button>
        </div>
      )}
    </section>
  );
};

export default MarketComparison;
