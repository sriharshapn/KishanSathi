import React, { useState } from 'react';
import type { Language, NavigationPage } from '../types';
import { 
  PhoneCall, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  MessageSquare
} from 'lucide-react';

interface ContactPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: "How does AgriMate generate personalised AI crop advisories?",
    a: "AgriMate's advisory engine (powered by fine-tuned Gemini 2.0 Flash) synthesises multiple real-time inputs: Sentinel-2 satellite soil moisture & NDVI, IMD 7-day NWP weather forecasts, State Soil Health Card NPK levels, and prevailing e-NAM/Agmarknet market price signals to generate 3–5 optimal crop recommendations with regenerative scores (A–F)."
  },
  {
    q: "How does the Sentinel-2 satellite NDVI and irrigation model work?",
    a: "The Satellite Intelligence Module processes multispectral imagery at ≤10m resolution every 5 days. It calculates vegetative canopy density (NDVI) and soil moisture indices. Combined with local evapotranspiration rates, it delivers precise daily irrigation schedules in millimeters to prevent crop water stress."
  },
  {
    q: "How does photo disease diagnosis work, and what treatments are provided?",
    a: "Farmers upload or take a clear photo of the infected leaf or plant. Our vision pathology model identifies the disease or pest with high confidence in seconds. It provides a dual treatment prescription: certified organic bio-remedies (e.g. neem extract, Trichoderma) and statutory chemical treatments with exact dilution dosages and pre-harvest intervals (PHI)."
  },
  {
    q: "Can I access advisories without an internet connection or on a basic feature phone?",
    a: "Yes. Under PRD feature F-ADV-04, farmers can dial the toll-free Kisan Call Centre shortcode 1800-180-1551. After selecting their language (Hindi, Tamil, Kannada, etc.), the system delivers a 90-second voice advisory directly over standard cellular telephony."
  },
  {
    q: "Is my farm data private and compliant with the DPDP Act 2023?",
    a: "Strictly yes. AgriMate operates on a federated digital public good architecture. Farmer Personally Identifiable Information (PII) is encrypted at rest and in transit, and never leaves the state data centre boundary without explicit opt-in consent. Zero farmer data is sold to private brokers."
  }
];

const KVK_CENTRES = [
  {
    name: "ICAR - Krishi Vigyan Kendra, Ballari",
    location: "Hagari Agricultural Research Station, Ballari, Karnataka - 583106",
    phone: "08392-286060",
    speciality: "Dryland Horticulture, Cotton, Tomato Pathology",
    hours: "09:00 AM - 05:00 PM"
  },
  {
    name: "ICAR - Krishi Vigyan Kendra, Kolar",
    location: "Tamaka, Kolar, Karnataka - 563103",
    phone: "08152-243122",
    speciality: "Vegetable Precision Farming, Soil Health Testing",
    hours: "09:00 AM - 05:00 PM"
  },
  {
    name: "ICAR - KVK Nashik (YCMOU)",
    location: "Dnyangangotri, Near Gangapur Dam, Nashik, Maharashtra - 422222",
    phone: "0253-2230717",
    speciality: "Onion Storage, Grapes, Integrated Pest Management",
    hours: "09:30 AM - 05:30 PM"
  },
  {
    name: "ICAR - Central Rice Research Institute KVK",
    location: "Santhapur, Cuttack, Odisha - 753006",
    phone: "0671-2367777",
    speciality: "Paddy Blast Surveillance, Water Salinity Management",
    hours: "09:00 AM - 05:00 PM"
  },
  {
    name: "ICAR - KVK Ludhiana (PAU)",
    location: "Punjab Agricultural University Campus, Ludhiana, Punjab - 141004",
    phone: "0161-2401960",
    speciality: "Wheat Stripe Rust Alerts, Laser Land Leveling",
    hours: "09:00 AM - 05:00 PM"
  },
  {
    name: "Tamil Nadu Agricultural University KVK",
    location: "Needamangalam, Thiruvarur / Thanjavur Delta, Tamil Nadu - 614404",
    phone: "04367-260666",
    speciality: "Cauvery Delta Agro-Advisories, Soil Carbon Index",
    hours: "09:00 AM - 05:00 PM"
  }
];

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    centre: 'ICAR - Krishi Vigyan Kendra, Ballari',
    category: 'Crop Advisory Query',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        centre: 'ICAR - Krishi Vigyan Kendra, Ballari',
        category: 'Crop Advisory Query',
        message: ''
      });
    }, 4000);
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <section className="bg-[#ECE8DE]/60 border-b border-[#E6E1D7] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] bg-white px-3 py-1 rounded-full border border-[#E6E1D7]">
              Krishi Vigyan Kendra & Grower Support
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#153424] font-['Syne',sans-serif] tracking-tight">
              Direct Access to Agricultural Science
            </h1>
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-['Outfit',sans-serif]">
              Connect directly with verified ICAR Krishi Vigyan Kendras, regional extension agronomists, or dial the 24x7 toll-free Kisan Call Centre for immediate vernacular advice.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency & Toll-Free Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#153424] text-white space-y-3 shadow-md border border-[#1f4a34]">
            <div className="w-12 h-12 rounded-2xl bg-[#E8A238] text-[#153424] flex items-center justify-center font-bold">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A5D6A7]">Toll-Free 24x7 Helpline</span>
            <h3 className="text-2xl font-black font-['Syne',sans-serif] text-white">1800-180-1551</h3>
            <p className="text-emerald-100/70 text-xs leading-relaxed font-['Outfit',sans-serif]">
              Ministry of Agriculture & Farmers Welfare Kisan Call Centre. Instant voice connection to agricultural graduates in your regional language.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white text-[#153424] space-y-3 shadow-xs border border-[#E6E1D7]">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E7D32]">Farmer WhatsApp Helpdesk</span>
            <h3 className="text-xl font-black font-['Syne',sans-serif]">WhatsApp Advisory</h3>
            <p className="text-stone-600 text-xs leading-relaxed font-['Outfit',sans-serif]">
              Send high-resolution plant disease photos, receive instant treatment PDFs, and subscribe to weekly district crop advisories.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white text-[#153424] space-y-3 shadow-xs border border-[#E6E1D7]">
            <div className="w-12 h-12 rounded-2xl bg-[#EAEFE9] text-[#2E7D32] flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">Service Reliability</span>
            <h3 className="text-xl font-black font-['Syne',sans-serif]">99.9% Core Uptime</h3>
            <p className="text-stone-600 text-xs leading-relaxed font-['Outfit',sans-serif]">
              Built on local-first SQLite WAL architecture and Google Cloud for uninterrupted field operation during peak Kharif and Rabi cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Directory of KVK Centres */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E7D32] block mb-1">
              Field Science Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
              Krishi Vigyan Kendra (KVK) Partner Centres
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">Government Extension Network</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {KVK_CENTRES.map((c) => (
            <div key={c.name} className="p-5 rounded-2xl bg-white border border-[#E6E1D7] shadow-xs space-y-3 hover:border-[#2E7D32] transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#153424] font-['Syne',sans-serif]">{c.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>{c.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ECE8DE] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">KVK Telephone:</span>
                  <strong className="text-[#153424] font-mono">{c.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Agro-Speciality:</span>
                  <span className="text-[#2E7D32] font-semibold truncate max-w-[180px]">{c.speciality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Office Timings:</span>
                  <span className="text-stone-600 font-mono">{c.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] p-8 sm:p-12 rounded-3xl border border-[#E6E1D7] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E7D32]">
              Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#153424] font-['Syne',sans-serif]">
              AgriMate Architecture FAQs
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Answers grounded in the AgriMate Product Requirements Document (PRD).
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_LIST.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-[#E6E1D7] bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-[#153424] font-['Outfit',sans-serif]">
                      {item.q}
                    </span>
                    <span className="text-stone-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-[#F0EDE6] pt-3 animate-in fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Escalation Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E6E1D7] shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E7D32] block mb-1">
              Escalate to Agronomist
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#153424] font-['Syne',sans-serif]">
              Submit Query to Regional KVK Extension Desk
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              If an advisory requires custom validation or field inspection, our KVK agronomists respond within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-[#EBF5ED] border border-[#CCE0D0] text-[#123826] text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#2E7D32]" />
              <h4 className="text-base font-bold">Query Logged Successfully</h4>
              <p className="text-xs text-stone-600">
                Ticket reference has been created. A certified agronomist from your selected KVK centre will contact you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">Farmer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCE0D0] bg-[#F7FBF8] text-xs font-semibold text-[#153424] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9845012345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCE0D0] bg-[#F7FBF8] text-xs font-semibold text-[#153424] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">Select KVK Research Centre</label>
                <select
                  value={formData.centre}
                  onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCE0D0] bg-[#F7FBF8] text-xs font-semibold text-[#153424] focus:outline-none focus:border-[#2E7D32]"
                >
                  {KVK_CENTRES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">Issue Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCE0D0] bg-[#F7FBF8] text-xs font-semibold text-[#153424] focus:outline-none focus:border-[#2E7D32]"
                >
                  <option value="Crop Advisory Query">Crop Advisory & Sowing Query</option>
                  <option value="Disease / Pest Escalation">Disease / Pest Escalation</option>
                  <option value="Satellite NDVI Discrepancy">Satellite NDVI / Moisture Query</option>
                  <option value="Soil Health Card Integration">Soil Health Card Integration</option>
                  <option value="Kisan Call Centre IVR">Kisan Call Centre IVR Audio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your crop, acreage, and specific symptoms or questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCE0D0] bg-[#F7FBF8] text-xs font-semibold text-[#153424] focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#153424] hover:bg-[#2E7D32] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4 text-[#A5D6A7]" />
                <span>Submit Query to Agronomist</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
