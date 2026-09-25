# 🌾 AgriMate — Interoperable Digital Agriculture Network

> **AI-Assisted Agricultural Market Intelligence & Regenerative Advisory Platform for Small & Marginal Farmers**
> Built for the **Hack2skill Hackathon** • Digital Public Good (DPG) • Zero Price Hallucination

---

## 🏆 Hack2skill Challenge Deliverables

AgriMate addresses the hackathon challenge through 4 foundational pillars:

1. 🛰️ **Satellite Field Intelligence (Copernicus Sentinel-2)**:
   - 10-meter multispectral NDVI canopy monitoring and 30-day vegetation index trends.
   - Farm plot zonation (High Vigor, Moderate, and Moisture/Nutrient Stress sub-plots).
   - False-color NIR composite and True-color RGB simulation.

2. 🌱 **AI Regenerative Agro-Advisory (Gemini 2.0 Flash)**:
   - Hyper-local crop recommendations harmonizing soil health, microclimate forecasts, and NDVI.
   - Soil carbon building rating (Regenerative Score A through F) with estimated APMC realization.
   - 7-day precision irrigation schedules and 4-milestone seasonal execution calendar.

3. 🔬 **Instant Plant Disease Diagnostics (Gemini Vision AI)**:
   - Upload or snap photos of infected plant tissue with real-time pathogen identification.
   - Dual remedy protocol: Certified bio/organic treatments + statutory chemical dosage per litre.
   - Severity indexing, long-term farm hygiene prevention tips, and KVK emergency escalation.

4. 🏛️ **Interoperable Digital Public Good Network (ETSI NGSI-LD)**:
   - Federated cross-state data exchange connecting 8 state agriculture extension models.
   - Coordinated cross-border disease outbreak early warning system.
   - Standardized JSON-LD schemas compliant with Open Data Commons and ETSI NGSI-LD.

---

## 📖 Overview

Small and marginal farmers often struggle to interpret complex agricultural market information (varying modal prices, minimum/maximum ranges, arrival volumes, grades, and disparate reporting dates across APMC yards).

**AgriMate** bridges this information gap by converting verified market data into simple, accessible, and actionable intelligence.

### 🛡️ Core Principle: Never Invent a Market Price
AgriMate operates under a non-negotiable data integrity constraint:
- **Numerical market data originates strictly from verified external sources** (Agmarknet / Directorate of Marketing & Inspection, Ministry of Agriculture, Govt. of India).
- If verified data is not available for a given crop and market, the application explicitly states that no verified data is available rather than guessing or extrapolating.
- **Google Gemini 2.0 Flash / LLM layers serve strictly as an explanation and natural language translation layer**—they are never used to substitute or hallucinate numerical market data.

---

## ✨ Key Features

1. **Market Price Discovery & Comparison**:
   - Compares prevailing market rates across regional APMCs (e.g., Ballari, Kolar, Bangalore, Belagavi, Mysuru, Nashik, Pune, Guntur, Agra, Khanna, etc.).
   - Displays modal price, minimum and maximum range, price spread, arrival quantity, distance from user (via GPS or district search), and verified timestamp freshness.
   - Preserves comparative factors without oversimplifying into an artificial "best market" label.

2. **Multilingual by Default**:
   - Seamless one-tap language switching between **English**, **हिन्दी (Hindi)**, and **ಕನ್ನಡ (Kannada)** across all UI elements, educational guides, checklists, and AI insights.

3. **Smart Quantity Normalization**:
   - Accepts produce quantity in `kg`, `quintals (q)`, or `tonnes (t)` and normalizes automatically internally (e.g., `500 kg = 5 quintals = 0.5 tonnes`).

4. **Quantity Value Calculator**:
   - Calculates estimated gross value: `Normalized Quintals × Modal Price` (e.g. `5 quintals × ₹2,200 = ₹11,000`).
   - Labeled with the mandatory disclaimer: *Estimated gross value based on reported modal price, not guaranteed earnings.*

5. **Net Return In-Hand Estimator**:
   - Allows farmers to estimate net in-hand earnings by subtracting freight transportation costs, loading/unloading (hamali), and statutory APMC cess.

6. **Deterministic Price Trends**:
   - Computes real descriptive trends over 7, 15, and 30-day historical time series (price change, percentage change, period average, high, low).
   - Utilizes accessible symbols and text (`↑ Increasing`, `→ Stable`, `↓ Decreasing`) without relying on color alone.

7. **Google Gemini AI Explanation Layer**:
   - Generates contextual, farmer-friendly explanations in the user's selected language grounded purely in retrieved verified facts.
   - Natural language query parser with speech-to-text input (e.g., *"500 kg tomato in Ballari"*, *"15 क्विंटल प्याज नासिक"*, *"ಬಳ್ಳಾರಿಯಲ್ಲಿ 500 ಕೆಜಿ ಟೊಮೆಟೊ"*).

8. **"Explain This" Agricultural Terminology Guide**:
   - Farmer-friendly analogies explaining *Modal Price*, *Minimum Price*, *Maximum Price*, and *Market Arrivals*.

9. **11-Step Farmer Selling Checklist**:
   - Interactive checklist covering pre-departure preparation, APMC gate entry, electronic weighbridge verification, fee breakdowns, and payment receipt confirmation, with print/save support.

10. **Offline & Low-Connectivity Resilience**:
    - Automatically caches recent searches in local storage with exact timestamps.
    - Clearly marks cached data with an offline warning banner.

---

## 🏗️ Architecture

```
Farmer Client (React 19 + TypeScript + Tailwind v4)
         │
         ▼
Google Cloud Run / Express REST Backend
         │
    ┌────┴──────────────────────────┐
    ▼                               ▼
Verified APMC Dataset         Google Gemini AI Layer
(Agmarknet / DMI Records)     (Grounded Explanations & NLP)
    │                               │
    └───────────────┬───────────────┘
                    ▼
Deterministic Math & Statistics (Zero Hallucination)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Shreyas-M007/Agrimate.git
cd Agrimate

# Install dependencies
npm --prefix server install
npm --prefix client install
```

### Running Locally

```bash
# Start backend server (port 5001)
npm run dev:server

# Start frontend dev server (port 5173 with API proxy)
npm run dev:client
```

Or build and serve full-stack on port 5001:
```bash
npm --prefix client run build
npm --prefix server start
```
Open **[http://localhost:5001](http://localhost:5001)** in your browser.

---

## 🧪 Automated Testing

Run the automated verification test suite:
```bash
npm test
```
Tests cover:
- Quantity normalization formulas (`kg`, `quintal`, `tonne`)
- Gross value & net return calculations
- Haversine distance estimation
- Data integrity & refusal to fabricate prices
- Deterministic price trend statistics & accessible symbols
- Multilingual AI explanation generation (EN, HI, KN)
- 11-step selling checklist integrity
- Natural language query parser

---

## 📄 License
MIT License. Built for small and marginal farmers.
