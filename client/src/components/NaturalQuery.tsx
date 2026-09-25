import React, { useState } from 'react';
import type { Language, CropUnit } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Mic, MicOff, CornerDownLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface NaturalQueryProps {
  language: Language;
  onParsedResult: (parsed: { crop: string; location: string; quantity: number; unit: CropUnit }) => void;
}

export const NaturalQuery: React.FC<NaturalQueryProps> = ({
  language,
  onParsedResult
}) => {
  const t = TRANSLATIONS[language];
  const [queryText, setQueryText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{
    crop: string;
    location: string;
    quantity: number;
    unit: string;
  } | null>(null);

  // Suggested prompt examples
  const samplePrompts = [
    { en: "500 kg tomato in Ballari", hi: "500 किलो टमाटर बेल्लारी", kn: "ಬಳ್ಳಾರಿಯಲ್ಲಿ 500 ಕೆಜಿ ಟೊಮೆಟೊ" },
    { en: "15 quintals onion in Nashik", hi: "15 क्विंटल प्याज नासिक", kn: "ನಾಸಿಕ್‌ನಲ್ಲಿ 15 ಕ್ವಿಂಟಾಲ್ ಈರುಳ್ಳಿ" },
    { en: "2 tonnes potato in Agra", hi: "2 टन आलू आगरा", kn: "ಆಗ್ರಾದಲ್ಲಿ 2 ಟನ್ ಆಲೂಗಡ್ಡೆ" },
    { en: "5 quintals chilli in Guntur", hi: "5 क्विंटल मिर्च गुंटूर", kn: "ಗುಂಟೂರಿನಲ್ಲಿ 5 ಕ್ವಿಂಟಾಲ್ ಮೆಣಸಿನಕಾಯಿ" }
  ];

  const handleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your query in the box.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'kn' ? 'kn-IN' : 'en-IN');
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQueryText(transcript);
      parseAndApply(transcript);
    };

    recognition.start();
  };

  const parseAndApply = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(apiUrl('/parse-query'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();
      if (data.success && data.parsed) {
        setParsedPreview(data.parsed);
        onParsedResult({
          crop: data.parsed.crop,
          location: data.parsed.location,
          quantity: data.parsed.quantity,
          unit: data.parsed.unit as CropUnit
        });
      }
    } catch (err) {
      console.error("NLP parsing error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-5 font-['Open_Sans',sans-serif]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#546C18]" strokeWidth={2} />
          <h3 className="font-bold text-[#022113] text-sm sm:text-base font-['Montserrat',sans-serif]">
            {t.searchTabNlp}
          </h3>
        </div>
        <span className="text-[10px] font-bold font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] border border-[#022113]/8 px-3.5 py-1 rounded-full uppercase tracking-wider">
          Voice & Natural Search
        </span>
      </div>
      
      <p className="text-xs text-[#4A5568]">
        {t.nlpPrompt}
      </p>

      {/* Input bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                parseAndApply(queryText);
              }
            }}
            placeholder={
              language === 'hi' 
                ? "जैसे: 'बेल्लारी में 500 किलो टमाटर बेचना है'" 
                : (language === 'kn' ? "ಉದಾ: 'ಬಳ್ಳಾರಿಯಲ್ಲಿ 500 ಕೆಜಿ ಟೊಮೆಟೊ'" : "e.g. 'I want to sell 500 kg tomato in Ballari'")
            }
            className="w-full px-4 py-3.5 bg-[#F8FAF6] border border-[#E5EAD7] rounded-2xl text-[#022113] text-xs sm:text-sm placeholder:text-[#889988] focus:outline-none focus:border-[#59701E] transition-all"
          />
        </div>

        {/* Mic button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title={isListening ? t.nlpListening : t.nlpMicStart}
          className={`px-4 py-3 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
            isListening 
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
              : 'bg-[#F0F4EC] hover:bg-[#E5EAD7] border-[#E5EAD7] text-[#59701E]'
          }`}
          aria-label={t.nlpMicStart}
        >
          {isListening ? <MicOff className="w-4 h-4 text-rose-600" strokeWidth={2} /> : <Mic className="w-4 h-4" strokeWidth={2} />}
        </button>

        {/* Submit button */}
        <button
          type="button"
          onClick={() => parseAndApply(queryText)}
          disabled={isProcessing || !queryText.trim()}
          className="px-6 py-3 bg-[#DFEB38] hover:bg-[#d0dc32] text-[#022113] font-bold text-xs uppercase tracking-wider font-['Montserrat',sans-serif] rounded-full transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-[#022113] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CornerDownLeft className="w-4 h-4 text-[#022113]" strokeWidth={2} />
              <span className="hidden sm:inline">{t.nlpSubmit}</span>
            </>
          )}
        </button>
      </div>

      {/* Sample Quick Prompts */}
      <div className="flex flex-wrap gap-2 pt-1 items-center">
        <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E]">Quick Prompt:</span>
        {samplePrompts.map((prompt, idx) => {
          const label = language === 'hi' ? prompt.hi : (language === 'kn' ? prompt.kn : prompt.en);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryText(label);
                parseAndApply(label);
              }}
              className="text-xs bg-[#F0F4EC] hover:bg-[#DFEB38] border border-[#E5EAD7] text-[#022113] px-3 py-1 rounded-full transition-all cursor-pointer font-medium"
            >
              "{label}"
            </button>
          );
        })}
      </div>

      {/* Structured parsed preview verification */}
      {parsedPreview && (
        <div className="p-3.5 bg-[#F8FAF6] border border-[#E5EAD7] rounded-2xl flex items-center justify-between text-xs text-[#022113]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#59701E] shrink-0" strokeWidth={2} />
            <span>
              <strong className="text-[#022113] font-bold font-['Montserrat',sans-serif]">Validated:</strong> {parsedPreview.crop} • {parsedPreview.location} • {parsedPreview.quantity} {parsedPreview.unit}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#022113] bg-[#DFEB38] px-3 py-0.5 rounded-full font-bold font-['Montserrat',sans-serif]">
            Search Ready
          </span>
        </div>
      )}
    </div>
  );
};

export default NaturalQuery;
