import React, { useRef, useCallback } from 'react';
import type { MarketItem, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { MapPin, Clock, ShieldCheck, HelpCircle, CheckCircle, Zap, Check, ArrowRight } from 'lucide-react';

interface MarketCardProps {
  market: MarketItem;
  language: Language;
  isSelected: boolean;
  onSelect: (market: MarketItem) => void;
  onExplainTerm: (term: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  language,
  isSelected,
  onSelect,
  onExplainTerm
}) => {
  const t = TRANSLATIONS[language];
  const cardRef = useRef<HTMLDivElement>(null);
  const arrivalPct = Math.min(100, Math.max(4, Math.round((market.arrival_quantity / 500) * 100)));
  const isEstimated = market.source?.toLowerCase().includes('fallback') || market.source?.toLowerCase().includes('dynamic');

  // Scrolltide-style spotlight: radial glow follows mouse within card
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
    card.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(market)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--spotlight-x': '50%',
        '--spotlight-y': '50%',
        '--spotlight-opacity': '0',
      } as React.CSSProperties}
      className={`
        group relative rounded-[2.2rem] cursor-pointer transition-all duration-300 flex flex-col justify-between h-[460px] w-full overflow-hidden font-['Open_Sans',sans-serif] select-none
        ${isSelected
          ? 'bg-white border-2 border-[#546C18] shadow-2xl'
          : 'bg-white border-2 border-[#022113]/8 hover:border-[#546C18]/40 shadow-lg hover:shadow-xl'
        }
      `}
    >
      {/* Spotlight glow overlay — pure CSS radial, no dependencies */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[2.2rem] transition-opacity duration-300"
        style={{
          background: `radial-gradient(280px circle at var(--spotlight-x) var(--spotlight-y), rgba(223,235,56,0.12), transparent 70%)`,
          opacity: 'var(--spotlight-opacity)',
        }}
      />

      {/* Top indicator line on select */}
      <div
        className={`relative z-10 h-1.5 w-full transition-all duration-300 shrink-0 ${isSelected ? 'bg-[#546C18]' : 'bg-transparent group-hover:bg-[#DFEB38]'}`}
      />

      <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-between h-[calc(460px-6px)]">

        {/* ── Row 1: Name + meta ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              {isSelected && (
                <CheckCircle className="w-4 h-4 text-[#59701E] shrink-0" strokeWidth={2} />
              )}
              <h3 className="font-bold text-[#022113] text-base leading-snug truncate tracking-tight font-['Montserrat',sans-serif]">
                {market.market_name}
              </h3>
            </div>
            <p className="text-xs text-[#59701E] font-medium flex items-center gap-1 leading-none">
              <MapPin className="w-3 h-3 shrink-0 text-[#59701E]" strokeWidth={2} />
              <span className="truncate">{market.district}, {market.state}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {market.distance_km !== null && (
              <span className="text-[11px] font-bold font-['Montserrat',sans-serif] text-[#022113] bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-0.5 rounded-full">
                {market.distance_km} km
              </span>
            )}
            <span className="text-[10px] text-[#718096] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
              {market.freshness}
            </span>
          </div>
        </div>

        {/* ── Row 2: Modal price ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">
              {t.modalPrice}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onExplainTerm('modal_price'); }}
              className="text-[#718096] hover:text-[#022113] transition-colors cursor-pointer"
              aria-label="Explain Modal Price"
            >
              <HelpCircle className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#022113] font-['Montserrat',sans-serif] leading-none tracking-tight">
              ₹{market.modal_price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#718096] font-medium">/quintal</span>
          </div>
        </div>

        {/* ── Row 3: Min / Max — inline ── */}
        <div className="grid grid-cols-2 divide-x divide-[#E5EAD7] border border-[#E5EAD7] rounded-2xl overflow-hidden bg-[#F8FAF6]">
          <div className="px-3.5 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">{t.minPrice}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onExplainTerm('min_price'); }}
                className="text-[#718096] hover:text-[#022113] cursor-pointer transition-colors"
                aria-label="Explain Min Price"
              >
                <HelpCircle className="w-2.5 h-2.5" strokeWidth={1.5} />
              </button>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">
              ₹{market.min_price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="px-3.5 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">{t.maxPrice}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onExplainTerm('max_price'); }}
                className="text-[#718096] hover:text-[#022113] cursor-pointer transition-colors"
                aria-label="Explain Max Price"
              >
                <HelpCircle className="w-2.5 h-2.5" strokeWidth={1.5} />
              </button>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">
              ₹{market.max_price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* ── Row 4: Pills — variety, grade, arrival ── */}
        <div className="h-[54px] flex flex-wrap content-start gap-1.5 overflow-hidden">
          <span className="text-[10px] font-medium text-[#022113] bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-0.5 rounded-full">
            {market.variety}
          </span>
          <span className="text-[10px] font-medium text-[#022113] bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-0.5 rounded-full">
            {market.grade}
          </span>
          <span className="text-[10px] font-medium text-[#022113] bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-0.5 rounded-full">
            {t.arrivalQty}: {market.arrival_quantity}q
          </span>
        </div>

        {/* ── Row 5: Arrival bar ── */}
        <div>
          <div className="flex justify-between items-center mb-1 text-[10px] text-[#718096]">
            <span className="font-semibold text-[#59701E]">Arrival volume</span>
            <span className="text-[#022113] font-bold font-['Montserrat',sans-serif]">{arrivalPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E5EAD7] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#59701E] transition-all duration-700"
              style={{ width: `${arrivalPct}%` }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pt-3 mt-auto border-t border-[#E5EAD7] flex items-center justify-between gap-2">
          {isEstimated ? (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" strokeWidth={2} />
              Estimated
            </span>
          ) : (
            <span className="text-[10px] font-bold font-['Montserrat',sans-serif] text-[#59701E] bg-[#F0F4EC] border border-[#E5EAD7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2} />
              Official Agmarknet
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(market); }}
            className={`text-xs font-bold font-['Montserrat',sans-serif] px-4 py-2 rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
              isSelected
                ? 'bg-[#546C18] text-[#DFEB38] ring-2 ring-[#DFEB38]/50'
                : 'bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113]'
            }`}
          >
            {isSelected ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'चयनित' : language === 'kn' ? 'ಆಯ್ಕೆ' : 'Selected'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span>{language === 'hi' ? 'विश्लेषण' : language === 'kn' ? 'ವಿಶ್ಲೇಷಣೆ' : 'Analyze'}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MarketCard;
