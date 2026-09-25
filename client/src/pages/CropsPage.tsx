import React, { useState } from 'react';
import type { Language, NavigationPage, Commodity } from '../types';
import { resolveCropFromQuery } from '../data/cropDictionary';
import { 
  Search, 
  ChevronRight,
  ShieldCheck,
  Droplets,
  Warehouse,
  TrendingUp,
  CheckCircle2,
  Boxes
} from 'lucide-react';

interface CropsPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
  onSelectCropAndNavigate: (cropName: string) => void;
  commodities?: Commodity[];
}

interface CropDetail {
  id: string;
  name: string;
  hindiName: string;
  kannadaName: string;
  category: 'Solanaceous' | 'Alliums & Tubers' | 'Grains & Pulses' | 'Cash Crops' | 'Oilseeds' | 'Spices & Plantation' | 'Fruits & Exotic';
  varieties: string[];
  modalRange: string;
  peakSeason: string;
  majorMandis: string[];
  storageAdvice: string;
  moistureThreshold: string;
}

const CROP_DATABASE: CropDetail[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर',
    kannadaName: 'ಟೊಮೆಟೊ',
    category: 'Solanaceous',
    varieties: ['Hybrid Shivam', 'Local Country', 'Abhinav', 'Arka Rakshak'],
    modalRange: '₹1,400 - ₹2,350 / q',
    peakSeason: 'Year-round (Peak: Nov - Feb)',
    majorMandis: ['Kolar (KA)', 'Ballari (KA)', 'Madanapalle (AP)', 'Azadpur (DL)'],
    storageAdvice: 'Stage at 10-12°C with 90% relative humidity. Do not refrigerate below 8°C to prevent chilling injury.',
    moistureThreshold: 'Firm red / breaker stage, zero skin punctures'
  },
  {
    id: 'onion',
    name: 'Onion',
    hindiName: 'प्याज',
    kannadaName: 'ಈರುಳ್ಳಿ',
    category: 'Alliums & Tubers',
    varieties: ['Nashik Red', 'Garwa Late', 'Bellary White', 'Bhima Super'],
    modalRange: '₹1,600 - ₹2,450 / q',
    peakSeason: 'Kharif (Oct-Dec) & Rabi (Mar-Jun)',
    majorMandis: ['Lasalgaon (MH)', 'Hubballi (KA)', 'Dindori (MH)', 'Yeola (MH)'],
    storageAdvice: 'Cure in field shadows for 48 hours. Store in ventilated slotted sheds at 65% humidity.',
    moistureThreshold: 'Dry outer neck scale, moisture below 12%'
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू',
    kannadaName: 'ಆಲೂಗಡ್ಡೆ',
    category: 'Alliums & Tubers',
    varieties: ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Pukhraj'],
    modalRange: '₹1,300 - ₹1,900 / q',
    peakSeason: 'Dec - Mar',
    majorMandis: ['Hassan (KA)', 'Agra (UP)', 'Farrukhabad (UP)', 'Kolar (KA)'],
    storageAdvice: 'Cold storage at 3-4°C with CIPC sprout suppression for table stock.',
    moistureThreshold: 'Tough skin setting, no greening or tuber moth damage'
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Kadlekayi)',
    hindiName: 'मूंगफली',
    kannadaName: 'ಕಡಲೆಕಾಯಿ',
    category: 'Oilseeds',
    varieties: ['TMV-2', 'JL-24', 'Kadiri-6', 'TAG-24'],
    modalRange: '₹5,800 - ₹7,400 / q',
    peakSeason: 'Oct - Jan (Kharif) & Mar - May (Summer)',
    majorMandis: ['Ballari (KA)', 'Challakere (KA)', 'Kurnool (AP)', 'Gondal (GJ)'],
    storageAdvice: 'Sun-cure pods for 3-5 days. Store in double-layer breathable gunny bags at moisture < 8% to prevent aflatoxin contamination.',
    moistureThreshold: 'Pod moisture strictly below 8%, shelling outturn > 70%'
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    hindiName: 'सरसों / राई',
    kannadaName: 'ಸಾಸಿವೆ',
    category: 'Oilseeds',
    varieties: ['Pusa Bold', 'Giriraj', 'RH-749', 'Kranti'],
    modalRange: '₹5,400 - ₹6,350 / q',
    peakSeason: 'Feb - Apr (Rabi Peak)',
    majorMandis: ['Bharatpur (RJ)', 'Kota (RJ)', 'Hisar (HR)', 'Agra (UP)'],
    storageAdvice: 'Store below 8% moisture in dry, clean sealed gunny bags to prevent mold and rancidity.',
    moistureThreshold: 'Seed moisture strictly < 8%, minimum oil extraction content > 40%'
  },
  {
    id: 'ginger',
    name: 'Ginger',
    hindiName: 'अदरक',
    kannadaName: 'ಶುಂಠಿ',
    category: 'Spices & Plantation',
    varieties: ['Rio-de-Janeiro', 'Varada', 'Mahim', 'Nadia'],
    modalRange: '₹4,500 - ₹8,200 / q',
    peakSeason: 'Nov - Feb',
    majorMandis: ['Shimoga (KA)', 'Wayanad (KL)', 'Raipur (CG)', 'Kozhikode (KL)'],
    storageAdvice: 'Store in pit cellars with clean sand layering or cold storage at 12°C.',
    moistureThreshold: 'Plump rhizomes, free from soft rot and soil dirt'
  },
  {
    id: 'garlic',
    name: 'Garlic',
    hindiName: 'लहसुन',
    kannadaName: 'ಬೆಳ್ಳುಳ್ಳಿ',
    category: 'Alliums & Tubers',
    varieties: ['G-282', 'Yamuna Safed', 'Ooty-1', 'Bhima Omkar'],
    modalRange: '₹7,500 - ₹16,000 / q',
    peakSeason: 'Jan - Apr',
    majorMandis: ['Mandsaur (MP)', 'Neemuch (MP)', 'Kota (RJ)', 'Jamnagar (GJ)'],
    storageAdvice: 'Hang in braids in well-aerated sheds. Avoid humid airtight containers.',
    moistureThreshold: 'Compact papery cloves, moisture < 65% in fresh cured bulbs'
  },
  {
    id: 'cardamom',
    name: 'Cardamom (Small)',
    hindiName: 'छोटी इलायची',
    kannadaName: 'ಏಲಕ್ಕಿ',
    category: 'Spices & Plantation',
    varieties: ['Malabar', 'Mysore', 'Vazhukka'],
    modalRange: '₹1,40,000 - ₹2,10,000 / q',
    peakSeason: 'Aug - Jan',
    majorMandis: ['Bodinayakanur (TN)', 'Vandanmedu (KL)', 'Sakleshpur (KA)'],
    storageAdvice: 'Store cured green pods in black polythene lined airtight containers at 10-12% moisture.',
    moistureThreshold: 'Retention of vibrant parrot green color, capsule diameter > 7mm'
  },
  {
    id: 'dragonfruit',
    name: 'Dragonfruit (Pitaya)',
    hindiName: 'ड्रैगन फ्रूट / कमलम',
    kannadaName: 'ಡ್ರ್ಯಾಗನ್ ಹಣ್ಣು',
    category: 'Fruits & Exotic',
    varieties: ['Red Flesh', 'White Flesh', 'Royal Red'],
    modalRange: '₹12,000 - ₹22,000 / q',
    peakSeason: 'Jun - Nov',
    majorMandis: ['Kolar (KA)', 'Surat (GJ)', 'Vashi APMC (MH)', 'Azadpur (DL)'],
    storageAdvice: 'Stage at 10°C with 85-90% relative humidity. Shelf life 14-21 days.',
    moistureThreshold: 'Uniform coloration, firm bracts, zero mechanical bruising'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    hindiName: 'मक्का',
    kannadaName: 'ಮೆಕ್ಕೆಜೋಳ',
    category: 'Grains & Pulses',
    varieties: ['Pioneer 3396', 'DeKalb 9108', 'NK-6240', 'CP-818'],
    modalRange: '₹1,950 - ₹2,280 / q',
    peakSeason: 'Oct - Jan (Kharif) & Apr - Jun (Rabi)',
    majorMandis: ['Davanagere (KA)', 'Khanna (PB)', 'Gulabbagh (BR)', 'Chhindwara (MP)'],
    storageAdvice: 'Dry grains to moisture < 12% before bagging. Treat against Sitophilus zeamais.',
    moistureThreshold: 'Grain moisture strictly below 12%, inorganic matter < 1%'
  },
  {
    id: 'paddy',
    name: 'Paddy (Rice / Dhan)',
    hindiName: 'धान / चावल',
    kannadaName: 'ಭತ್ತ',
    category: 'Grains & Pulses',
    varieties: ['Sona Masoori', 'Basmati 1121', 'IR-64', 'BPT-5204'],
    modalRange: '₹2,180 - ₹3,600 / q',
    peakSeason: 'Nov - Jan (Kharif) & May - Jul (Rabi)',
    majorMandis: ['Karnal (HR)', 'Sindhanur (KA)', 'Gondia (MH)', 'Nalgonda (TS)'],
    storageAdvice: 'Parboil or mill promptly. Store dried paddy at 13-14% moisture in well-dunnaged godowns.',
    moistureThreshold: 'Moisture cutoff < 14%, head rice recovery > 62%'
  },
  {
    id: 'cotton',
    name: 'Cotton (Kapas)',
    hindiName: 'कपास',
    kannadaName: 'ಹತ್ತಿ',
    category: 'Cash Crops',
    varieties: ['Bt Cotton RCH-2', 'Brahma', 'DCH-32', 'Bunny'],
    modalRange: '₹6,800 - ₹7,650 / q',
    peakSeason: 'Oct - Feb',
    majorMandis: ['Adilabad (TS)', 'Rajkot (GJ)', 'Raichur (KA)', 'Abohar (PB)'],
    storageAdvice: 'Store seed-cotton in moisture-proof ventilated dry bays. Gin promptly to maintain lint whiteness.',
    moistureThreshold: 'Moisture < 8.5%, trash content < 3%, staple length > 29mm'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    hindiName: 'गन्ना',
    kannadaName: 'ಕಬ್ಬು',
    category: 'Cash Crops',
    varieties: ['Co-0238', 'Co-86032', 'Co-0118', 'Co-265'],
    modalRange: '₹340 - ₹420 / q',
    peakSeason: 'Oct - Apr (Mandi Crushing Season)',
    majorMandis: ['Kolhapur (MH)', 'Belagavi (KA)', 'Mandya (KA)', 'Muzaffarnagar (UP)'],
    storageAdvice: 'Transport and crush within 24-36 hrs of harvest to prevent sucrose inversion and driage loss.',
    moistureThreshold: 'Brix reading > 18-21%, clean detrashed stalks, zero red-rot infection'
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    hindiName: 'हल्दी',
    kannadaName: 'ಅರಿಶಿನ',
    category: 'Spices & Plantation',
    varieties: ['Salem', 'Prathibha', 'Rajapore', 'Waigaon'],
    modalRange: '₹9,800 - ₹14,500 / q',
    peakSeason: 'Feb - May',
    majorMandis: ['Nizamabad (TS)', 'Sangli (MH)', 'Erode (TN)', 'Chamarajanagar (KA)'],
    storageAdvice: 'Boil, sun-dry, and polish before bagging. Store in dry, well-aerated dark godowns.',
    moistureThreshold: 'Curcumin content > 3.5%, moisture strictly below 10%, deep golden fingers'
  }
];

export const CropsPage: React.FC<CropsPageProps> = ({
  onSelectCropAndNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Solanaceous', 'Alliums & Tubers', 'Grains & Pulses', 'Cash Crops', 'Oilseeds', 'Spices & Plantation', 'Fruits & Exotic'];

  const resolvedSearch = searchQuery.trim() ? resolveCropFromQuery(searchQuery.trim()) : null;

  const filteredCrops = CROP_DATABASE.filter(crop => {
    const matchesCat = selectedCategory === 'All' || crop.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesDirect = !searchQuery ||
                          crop.name.toLowerCase().includes(q) ||
                          crop.hindiName.includes(searchQuery) ||
                          crop.kannadaName.includes(searchQuery) ||
                          crop.varieties.some(v => v.toLowerCase().includes(q));
    const matchesResolved = resolvedSearch ? (
      crop.name.toLowerCase().includes(resolvedSearch.name.toLowerCase()) ||
      resolvedSearch.name.toLowerCase().includes(crop.name.toLowerCase())
    ) : false;
    return matchesCat && (matchesDirect || matchesResolved);
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 font-['Open_Sans',sans-serif] text-[#022113]">
      {/* Crops Page Header - Two Card Bento Layout */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Crisp Pure White Banner */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#022113]/8 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#546C18] bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                  Produce Directory
                </span>
                <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#022113]/70 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                  Agmarknet Grade-A Standards
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#022113] tracking-tight leading-[1.08] font-['Montserrat',sans-serif]">
                Commodity Portfolio & <span className="text-[#546C18]">Agronomic Standards</span>
              </h1>

              <p className="text-[#022113]/70 text-sm sm:text-base leading-relaxed max-w-2xl font-['Open_Sans',sans-serif]">
                Explore official APMC grading metrics, moisture benchmarks, storage conditions, and prevailing auction price bands across Indian agricultural commodities.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-['Montserrat',sans-serif]">
                <div className="flex items-center gap-1.5 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#546C18]" />
                  <span className="text-[#022113] font-bold">Zero Price Hallucination</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#546C18]" />
                  <span className="text-[#022113] font-bold">APMC Act Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F0F2EB] px-3.5 py-1.5 rounded-full border border-[#022113]/8">
                  <Boxes className="w-3.5 h-3.5 text-[#546C18]" />
                  <span className="text-[#022113] font-bold">7 Produce Classes</span>
                </div>
              </div>
            </div>

            {/* 4 Agronomic Benchmark Tiles in Sub-containers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#022113]/8">
              <div className="bg-[#F0F2EB] p-4 rounded-2xl border border-[#022113]/5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#546C18]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">Grading</span>
                </div>
                <p className="text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">Grade-A FAQ</p>
                <p className="text-[11px] text-[#022113]/70 mt-0.5 leading-snug">Fair average specs</p>
              </div>

              <div className="bg-[#F0F2EB] p-4 rounded-2xl border border-[#022113]/5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Droplets className="w-4 h-4 text-[#546C18]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">Moisture</span>
                </div>
                <p className="text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">&lt; 10% – 14%</p>
                <p className="text-[11px] text-[#022113]/70 mt-0.5 leading-snug">Permissible cutoff</p>
              </div>

              <div className="bg-[#F0F2EB] p-4 rounded-2xl border border-[#022113]/5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Warehouse className="w-4 h-4 text-[#546C18]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">Storage</span>
                </div>
                <p className="text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">3°C – 12°C RH</p>
                <p className="text-[11px] text-[#022113]/70 mt-0.5 leading-snug">Sprout control</p>
              </div>

              <div className="bg-[#F0F2EB] p-4 rounded-2xl border border-[#022113]/5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-[#546C18]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">Linkage</span>
                </div>
                <p className="text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">Daily Rates</p>
                <p className="text-[11px] text-[#022113]/70 mt-0.5 leading-snug">85 APMC mandis</p>
              </div>
            </div>
          </div>

          {/* Right Card: Rich Olive Green Highlight Card */}
          <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-[#546C18]/20 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full bg-[#DFEB38] text-[#022113] text-xs font-black font-['Montserrat',sans-serif] uppercase tracking-wider shadow-sm">
                  Agmarknet FAQ
                </span>
                <div className="w-10 h-10 rounded-full bg-white text-[#022113] flex items-center justify-center font-bold shadow-md">
                  ↗
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Montserrat',sans-serif] tracking-tight leading-snug pt-2">
                Audited APMC <br />Grading Catalog
              </h3>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-['Open_Sans',sans-serif]">
                Direct terminal linkage with live arrivals, modal rates, and moisture-controlled warehouse limits across Indian trade corridors.
              </p>
            </div>

            <div className="pt-6 border-t border-white/20 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/90 font-['Montserrat',sans-serif]">
                <span>Verified Varieties</span>
                <span className="font-bold text-[#DFEB38]">100% Traceable</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/90 font-['Montserrat',sans-serif]">
                <span>Price Transparency</span>
                <span className="font-bold text-[#DFEB38]">Govt Agmarknet</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/90 font-['Montserrat',sans-serif]">
                <span>Coverage</span>
                <span className="font-bold text-[#DFEB38]">Pan-India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="bg-white p-4 sm:p-5 rounded-[2rem] border border-[#022113]/8 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
                    : 'bg-[#F0F2EB] text-[#022113] hover:bg-[#E2ECE3] border border-[#022113]/8'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#546C18] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crop, variety or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs font-semibold border border-[#022113]/10 focus:border-[#546C18] outline-none bg-[#F0F2EB]/50 text-[#022113] placeholder-[#022113]/40"
            />
          </div>
        </div>
      </section>

      {/* Crops Cards Grid */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div 
              key={crop.id}
              className="bg-white rounded-[2.5rem] border border-[#022113]/8 hover:border-[#546C18]/40 transition-all p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-xl hover:shadow-2xl"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
                      {crop.name}
                    </h3>
                    <p className="text-xs text-[#546C18] font-bold mt-1 font-['Montserrat',sans-serif]">
                      {crop.hindiName} • {crop.kannadaName}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] px-3 py-1 rounded-full bg-[#DFEB38]/40 text-[#022113] border border-[#DFEB38] shrink-0">
                    {crop.category}
                  </span>
                </div>

                {/* Modal Rate & Season */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#022113]/8 text-xs">
                  <div>
                    <span className="text-[#022113]/50 text-[10px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] block">Prevailing Band</span>
                    <span className="font-extrabold text-[#022113] mt-0.5 block font-['Montserrat',sans-serif]">{crop.modalRange}</span>
                  </div>
                  <div>
                    <span className="text-[#022113]/50 text-[10px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] block">Harvest Window</span>
                    <span className="text-[#022113]/80 mt-0.5 block font-medium">{crop.peakSeason}</span>
                  </div>
                </div>

                {/* Varieties */}
                <div>
                  <span className="text-[#022113]/50 text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] block mb-1.5">Key Varieties</span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.varieties.map((v, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F2EB] border border-[#022113]/8 text-[#022113]">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Major Mandis */}
                <div>
                  <span className="text-[#022113]/50 text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] block mb-1.5">Major APMC Hubs</span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.majorMandis.map((m, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F2EB] text-[#022113] border border-[#022113]/8">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Storage & Moisture */}
                <div className="bg-[#F0F2EB] p-4 rounded-2xl border border-[#022113]/8 text-xs space-y-1.5 text-[#022113]/70">
                  <p><strong className="text-[#022113] font-bold font-['Montserrat',sans-serif]">Quality:</strong> {crop.moistureThreshold}</p>
                  <p><strong className="text-[#022113] font-bold font-['Montserrat',sans-serif]">Storage:</strong> {crop.storageAdvice}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCropAndNavigate(crop.name)}
                className="w-full mt-4 py-3 rounded-full bg-[#DFEB38] hover:bg-[#d0df2a] text-[#022113] font-black text-xs font-['Montserrat',sans-serif] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(223,235,56,0.4)] hover:scale-[1.02]"
              >
                <span>Analyze {crop.name} in Terminal</span>
                <ChevronRight className="w-4 h-4 text-[#022113]" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CropsPage;
