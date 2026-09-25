import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { X, BookOpen, Lightbulb, Compass } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface ExplainModalProps {
  term: string | null;
  language: Language;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  term,
  language,
  onClose
}) => {
  const t = TRANSLATIONS[language];
  const [termData, setTermData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>(term || 'modal_price');

  useEffect(() => {
    if (term) {
      setActiveTab(term);
    }
  }, [term]);

  useEffect(() => {
    let isMounted = true;
    async function fetchTerm() {
      try {
        const res = await fetch(apiUrl(`/explain-term/${activeTab}?lang=${language}`));
        const data = await res.json();
        if (isMounted && data.success) {
          setTermData(data.data);
        }
      } catch (err) {
        console.error("Error fetching term explanation", err);
      }
    }
    fetchTerm();
    return () => { isMounted = false; };
  }, [activeTab, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!term) return null;

  const termsList = [
    { key: 'modal_price', label: t.modalPrice },
    { key: 'min_price', label: t.minPrice },
    { key: 'max_price', label: t.maxPrice },
    { key: 'arrival_quantity', label: t.arrivalQty }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#022113]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5EAD7] animate-in fade-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#546C18] text-white px-6 py-4 flex items-center justify-between border-b border-[#546C18]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#DFEB38]" />
            <h2 className="text-lg font-bold tracking-tight text-white font-['Montserrat',sans-serif]">
              {t.educationalModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Term Tabs */}
        <div className="flex border-b border-[#E5EAD7] bg-[#F8FAF6] p-2.5 gap-2 overflow-x-auto font-mono text-xs">
          {termsList.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-['Montserrat',sans-serif] ${
                activeTab === item.key 
                  ? 'bg-[#546C18] text-[#DFEB38] shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-[#022113] hover:bg-[#F0F4EC]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 font-['Open_Sans',sans-serif]">
          {termData ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-[#022113] mb-1.5 font-['Montserrat',sans-serif]">
                  {termData.title}
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {termData.definition}
                </p>
              </div>

              {/* Real life analogy */}
              <div className="bg-[#F8FAF6] rounded-2xl p-4 border border-[#E5EAD7]">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#59701E] font-bold mb-1.5">
                  <Compass className="w-4 h-4 text-[#59701E]" />
                  <span>Farmer Analogy (सरल उदाहरण)</span>
                </div>
                <p className="text-xs sm:text-sm text-[#022113] leading-relaxed font-mono">
                  {termData.analogy}
                </p>
              </div>

              {/* Actionable Tip */}
              <div className="bg-[#F0F4EC] rounded-2xl p-4 border border-[#CCE0D0]">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#022113] font-bold mb-1.5">
                  <Lightbulb className="w-4 h-4 text-[#59701E]" />
                  <span>Field Action Tip</span>
                </div>
                <p className="text-xs sm:text-sm text-[#022113] leading-relaxed">
                  {termData.farmerTip}
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs font-mono text-stone-500">
              Loading guide...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F8FAF6] px-6 py-3.5 border-t border-[#E5EAD7] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#DFEB38] hover:bg-[#cbe025] text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] rounded-full transition-all cursor-pointer shadow-sm"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainModal;
