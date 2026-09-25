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
    q: "How does KisanSathi generate personalised AI crop advisories?",
    a: "KisanSathi's advisory engine (powered by fine-tuned Gemini 2.0 Flash) synthesises multiple real-time inputs: Sentinel-2 satellite soil moisture & NDVI, IMD 7-day NWP weather forecasts, State Soil Health Card NPK levels, and prevailing e-NAM/Agmarknet market price signals to generate 3–5 optimal crop recommendations with regenerative scores (A–F)."
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
    a: "Yes. Under feature F-ADV-04, farmers can dial the toll-free Kisan Call Centre shortcode 1800-180-1551. After selecting their language (Hindi, Tamil, Kannada, etc.), the system delivers a 90-second voice advisory directly over standard cellular telephony."
  },
  {
    q: "Is my farm data private and compliant with the DPDP Act 2023?",
    a: "Strictly yes. KisanSathi operates on a federated digital public good architecture. Farmer Personally Identifiable Information (PII) is encrypted at rest and in transit, and never leaves the state data centre boundary without explicit opt-in consent. Zero farmer data is sold to private brokers."
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
    <div className="space-y-12 sm:space-y-16 pb-20 font-['Open_Sans',sans-serif] text-[#022113]">
      {/* Header Banner (Pic 1 & 2 Aesthetic) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Crisp White Card */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#546C18] bg-[#F0F2EB] px-4 py-1.5 rounded-full border border-[#022113]/8 inline-block">
                Krishi Vigyan Kendra & Grower Support • 24x7
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-[#022113] tracking-tight leading-[1.08] font-['Montserrat',sans-serif]">
                Direct Access to <span className="text-[#546C18]">Agricultural Science</span>
              </h1>
              <p className="text-[#4A5568] text-base sm:text-lg leading-relaxed font-normal">
                Connect directly with verified ICAR Krishi Vigyan Kendras, regional extension agronomists, or dial the 24x7 toll-free Kisan Call Centre for immediate vernacular advice.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#022113]/8">
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                Toll-Free 1800-180-1551
              </span>
              <span className="text-[#718096]">•</span>
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                731 KVK ICAR Network
              </span>
              <span className="text-[#718096]">•</span>
              <span className="text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
                10 Regional Dialects
              </span>
            </div>
          </div>

          {/* Right Card: Rich Olive Card */}
          <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113]">
                  Emergency Escalation
                </span>
                <span className="text-xs font-mono text-white/80">Active</span>
              </div>
              <h3 className="text-2xl font-bold font-['Montserrat',sans-serif] text-white pt-2">
                Grower Help Desk
              </h3>
              <p className="text-sm text-white/85 leading-relaxed font-normal">
                Direct telephonic and digital assistance for acute crop pest outbreaks, market realization queries, and weather advisories.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] block">Resolution Time</span>
              <span className="text-2xl font-black font-['Montserrat',sans-serif] text-white block">&lt; 15 Minutes</span>
              <span className="text-[11px] text-white/70 block">Average response time for urgent field calls</span>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency & Toll-Free Highlights */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-[#022113]/8 space-y-4 shadow-xl hover:shadow-2xl transition-all">
            <div className="w-13 h-13 rounded-2xl bg-[#546C18] text-[#DFEB38] flex items-center justify-center font-bold shadow-sm">
              <PhoneCall className="w-6 h-6 text-[#DFEB38]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-3 py-1 rounded-full inline-block">Toll-Free 24x7 Helpline</span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Montserrat',sans-serif] text-[#022113]">1800-180-1551</h3>
            <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal">
              Ministry of Agriculture & Farmers Welfare Kisan Call Centre. Instant voice connection to agricultural officers in your vernacular tongue.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#546C18] text-white space-y-4 shadow-xl hover:shadow-2xl transition-all">
            <div className="w-13 h-13 rounded-2xl bg-white/20 text-[#DFEB38] flex items-center justify-center font-bold shadow-sm">
              <MessageSquare className="w-6 h-6 text-[#DFEB38]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38] bg-black/20 px-3 py-1 rounded-full inline-block">Farmer Digital Desk</span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Montserrat',sans-serif] text-white">Direct Advisory</h3>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-normal">
              Send crop diagnostic photos, receive instant organic remedy prescriptions, and subscribe to localized weekly district advisories.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-[#022113]/8 space-y-4 shadow-xl hover:shadow-2xl transition-all">
            <div className="w-13 h-13 rounded-2xl bg-[#546C18] text-[#DFEB38] flex items-center justify-center font-bold shadow-sm">
              <Clock className="w-6 h-6 text-[#DFEB38]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F2EB] px-3 py-1 rounded-full inline-block">Service Reliability</span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Montserrat',sans-serif] text-[#022113]">99.9% Core Uptime</h3>
            <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal">
              Built on local-first SQLite WAL architecture and cloud nodes for uninterrupted field operation during peak Kharif and Rabi cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Directory of KVK Centres */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#022113]/8 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] block mb-1">
              Field Science Infrastructure
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
              Krishi Vigyan Kendra (KVK) Partner Centres
            </h2>
          </div>
          <span className="text-xs text-[#022113]/60 font-bold font-['Montserrat',sans-serif] uppercase tracking-wider">Government Extension Network</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KVK_CENTRES.map((c) => (
            <div key={c.name} className="p-7 sm:p-8 rounded-[2.2rem] bg-white border border-[#022113]/8 hover:shadow-2xl hover:-translate-y-1 transition-all space-y-4 shadow-xl">
              <h3 className="text-base font-black text-[#022113] font-['Montserrat',sans-serif]">{c.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#022113]/70">
                <MapPin className="w-3.5 h-3.5 text-[#546C18] shrink-0" />
                <span className="truncate">{c.location}</span>
              </div>

              <div className="pt-3 border-t border-[#022113]/8 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#022113]/50 font-medium">KVK Telephone:</span>
                  <strong className="text-[#022113] font-bold font-mono">{c.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#022113]/50 font-medium">Agro-Speciality:</span>
                  <span className="text-[#546C18] font-bold truncate max-w-[180px]">{c.speciality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#022113]/50 font-medium">Office Timings:</span>
                  <span className="text-[#022113]/70">{c.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions & Direct Escalation Form Side by Side */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Frequently Asked Questions */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-[#022113]/8 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] bg-[#F0F4EC] px-4 py-1.5 rounded-full border border-[#E5EAD7] inline-block">
                Knowledge Base
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
                KisanSathi Architecture FAQs
              </h2>
              <p className="text-[#022113]/70 text-xs sm:text-sm font-normal">
                Answers grounded in the official KisanSathi precision agriculture specification.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_LIST.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="rounded-2xl border border-[#E5EAD7] bg-[#F8FAF6] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">
                        {item.q}
                      </span>
                      <span className="text-[#546C18] shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-[#022113]/80 leading-relaxed border-t border-[#E5EAD7] pt-3 font-normal">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Direct Escalation Form */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-[#022113]/8 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#546C18] block mb-1">
                Escalate to Agronomist
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
                Submit Query to Regional KVK Extension Desk
              </h3>
              <p className="text-[#022113]/70 text-xs sm:text-sm leading-relaxed font-normal mt-1">
                If an advisory requires custom validation or field inspection, our KVK agronomists respond within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#F0F4EC] border border-[#DFEB38] text-[#022113] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-[#546C18]" />
                <h4 className="text-base font-bold font-['Montserrat',sans-serif] text-[#022113]">Query Logged Successfully</h4>
                <p className="text-xs text-[#022113]/70">
                  Ticket reference has been created. A certified agronomist from your selected KVK centre will contact you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/70 block mb-1.5">Farmer Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full px-4 py-2.5 rounded-full border border-[#E5EAD7] bg-[#F8FAF6] text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#546C18]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/70 block mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9845012345"
                      className="w-full px-4 py-2.5 rounded-full border border-[#E5EAD7] bg-[#F8FAF6] text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#546C18]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/70 block mb-1.5">Select KVK Research Centre</label>
                  <select
                    value={formData.centre}
                    onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#E5EAD7] bg-[#F8FAF6] text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#546C18]"
                  >
                    {KVK_CENTRES.map((c) => (
                      <option key={c.name} value={c.name} className="bg-white text-[#022113]">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/70 block mb-1.5">Issue Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#E5EAD7] bg-[#F8FAF6] text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#546C18]"
                  >
                    <option value="Crop Advisory Query">Crop Advisory & Sowing Query</option>
                    <option value="Disease / Pest Escalation">Disease / Pest Escalation</option>
                    <option value="Satellite NDVI Discrepancy">Satellite NDVI / Moisture Query</option>
                    <option value="Soil Health Card Integration">Soil Health Card Integration</option>
                    <option value="Kisan Call Centre IVR">Kisan Call Centre IVR Audio</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/70 block mb-1.5">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your crop, acreage, and specific symptoms or questions..."
                    className="w-full px-4 py-3 rounded-2xl border border-[#E5EAD7] bg-[#F8FAF6] text-xs font-semibold text-[#022113] focus:outline-none focus:border-[#546C18]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#DFEB38] hover:bg-[#c9d42f] text-[#022113] font-black text-xs font-['Montserrat',sans-serif] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(223,235,56,0.4)]"
                >
                  <Send className="w-4 h-4 text-[#022113]" />
                  <span>Submit Query to Agronomist</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
