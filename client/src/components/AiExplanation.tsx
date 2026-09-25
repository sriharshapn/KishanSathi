import React, { useState, useEffect } from 'react';
import type { MarketItem, PriceTrend, Language, AiExplanationData } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Sparkles, Bot, ShieldCheck, Volume2, VolumeX, Share2, Check, Copy } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface AiExplanationProps {
  market: MarketItem;
  trend: PriceTrend | null;
  language: Language;
  quantityQuintals: number;
}

export const AiExplanation: React.FC<AiExplanationProps> = ({
  market,
  trend,
  language,
  quantityQuintals
}) => {
  const t = TRANSLATIONS[language];
  const [explanation, setExplanation] = useState<AiExplanationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchExplanation() {
      setLoading(true);
      try {
        const res = await fetch(apiUrl('/explain'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            market,
            trend,
            language,
            quantityQuintals
          })
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setExplanation(data.explanation);
        }
      } catch (err) {
        console.error("Error fetching AI explanation", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (market) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      fetchExplanation();
    }
    return () => { 
      isMounted = false; 
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [market, trend, language, quantityQuintals]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window) || !explanation) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const fullText = `${explanation.title}. ${explanation.summary} ${explanation.priceDetails} ${explanation.trendExplanation} ${explanation.advice}`;
    const utterance = new SpeechSynthesisUtterance(fullText);

    const langCodeMap: Record<Language, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ml: 'ml-IN'
    };
    utterance.lang = langCodeMap[language] || 'en-IN';
    utterance.rate = 0.92;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!explanation) return;
    const text = `${explanation.title}\n\n${explanation.summary}\n\n${explanation.priceDetails}\n${explanation.trendExplanation}\n\nTip: ${explanation.advice}\n\nVerified by Kisan Setu`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!explanation) return;
    const text = `*${explanation.title}*\n\n${explanation.summary}\n\n${explanation.priceDetails}\n${explanation.trendExplanation}\n\n*Farmer Tip:* ${explanation.advice}\n\n_Source: ${market.source}_\n_Verified by Kisan Setu Market Intelligence_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const languageDisplayNames: Record<Language, string> = {
    en: "English",
    hi: "हिन्दी",
    kn: "ಕನ್ನಡ",
    te: "తెలుగు",
    ta: "தமிழ்",
    mr: "मराठी",
    bn: "বাংলা",
    gu: "ગુજરાતી",
    pa: "ਪੰਜਾਬੀ",
    ml: "മലയാളം"
  };

  const listenButtonLabels: Record<Language, string> = {
    en: "Listen Voice",
    hi: "आवाज़ में सुनें",
    kn: "ಧ್ವನಿ ಕೇಳಿ",
    te: "ವాయిస్ వినండి",
    ta: "குரல் கேளுங்கள்",
    mr: "आवाज ऐका",
    bn: "ভয়েস শুনুন",
    gu: "અવાજ સાંભળો",
    pa: "ਆਵਾਜ਼ ਸੁਣੋ",
    ml: "ശബ്ദം കേൾക്കൂ"
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)] animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#59701E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-['Montserrat',sans-serif] font-semibold text-[#59701E]">
            Generating market analysis in {languageDisplayNames[language]}...
          </span>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="bg-white text-[#022113] rounded-3xl p-6 sm:p-8 border border-[#E5EAD7] shadow-[0_4px_24px_rgba(2,33,19,0.04)] font-['Open_Sans',sans-serif]">
      {/* Header with audio and action controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5EAD7] pb-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#F0F4EC] border border-[#E5EAD7] text-[#59701E] rounded-2xl">
            <Sparkles className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#022113] font-['Montserrat',sans-serif]">
              {explanation.title}
            </h3>
            <span className="text-xs font-semibold text-[#59701E] flex items-center gap-1.5 mt-0.5 font-['Montserrat',sans-serif]">
              <span>{t.aiExplanationBadge}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Text-to-Speech Button */}
          <button
            type="button"
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer shadow-xs ${
              isSpeaking 
                ? 'bg-amber-500 text-white animate-pulse' 
                : 'bg-[#DFEB38] hover:bg-[#d0dc32] text-[#022113]'
            }`}
            title={isSpeaking ? "Stop Voice Narration" : `Listen in ${languageDisplayNames[language]}`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" strokeWidth={2} /> : <Volume2 className="w-4 h-4" strokeWidth={2} />}
            <span>{isSpeaking ? "Speaking..." : listenButtonLabels[language]}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-full bg-[#F0F4EC] hover:bg-[#E5EAD7] text-[#022113] border border-[#E5EAD7] transition-colors cursor-pointer"
            title="Copy Insights"
          >
            {copied ? <Check className="w-4 h-4 text-[#59701E]" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F0F4EC] hover:bg-[#E5EAD7] border border-[#E5EAD7] text-[#022113] text-xs font-bold font-['Montserrat',sans-serif] transition-colors cursor-pointer"
            title="Share to WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Narrative Cards */}
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="bg-[#F8FAF6] p-5 rounded-2xl border border-[#E5EAD7]">
          <p className="font-medium text-[#022113] text-base leading-relaxed">
            {explanation.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#F8FAF6] p-4 rounded-2xl border border-[#E5EAD7]">
            <div className="text-[10px] uppercase font-bold font-['Montserrat',sans-serif] tracking-wider text-[#59701E] mb-1.5">
              Price Range & Arrival Volume
            </div>
            <p className="text-[#4A5568] leading-normal">{explanation.priceDetails}</p>
          </div>

          <div className="bg-[#F8FAF6] p-4 rounded-2xl border border-[#E5EAD7]">
            <div className="text-[10px] uppercase font-bold font-['Montserrat',sans-serif] tracking-wider text-[#59701E] mb-1.5">
              Historical Trend Insight
            </div>
            <p className="text-[#4A5568] leading-normal">{explanation.trendExplanation}</p>
          </div>
        </div>

        {explanation.estimatedValueNote && (
          <div className="bg-[#F8FAF6] p-4 rounded-2xl border border-[#E5EAD7] text-xs text-[#59701E]">
            <strong className="text-[#022113]">Produce Estimate Note:</strong> {explanation.estimatedValueNote}
          </div>
        )}

        <div className="bg-[#F0F4EC] p-5 rounded-2xl border border-[#E5EAD7] flex items-start gap-3.5">
          <div className="p-2.5 bg-white border border-[#E5EAD7] text-[#59701E] rounded-xl shrink-0 mt-0.5 shadow-2xs">
            <Bot className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">
              Field Action Advice
            </div>
            <p className="text-[#022113] font-normal leading-relaxed">{explanation.advice}</p>
          </div>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="mt-6 pt-4 border-t border-[#E5EAD7] text-xs font-mono text-[#59701E] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#59701E] shrink-0" strokeWidth={2} />
          <span>{explanation.verifiedNotice}</span>
        </div>
        <span className="text-[10px] bg-[#F0F4EC] px-3 py-1 rounded-full border border-[#E5EAD7] text-[#022113] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider">
          Official APMC Advisory • Ministry of Agriculture
        </span>
      </div>
    </div>
  );
};

export default AiExplanation;
