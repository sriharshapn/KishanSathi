# 🌾 AgriMate — Interoperable Digital Agriculture Network

> **AI-Assisted Agricultural Market Intelligence, Geospatial Remote Sensing & Regenerative Advisory Platform for Small & Marginal Farmers**  
> Built for the **Hack2skill Hackathon** • Digital Public Good (DPG) • Zero Price Hallucination • Grounded Telemetry

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hack2skill-flax.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-KishanSathi-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sriharshapn/KishanSathi)
[![License: MIT](https://img.shields.io/badge/License-MIT-2E7D32.svg?style=for-the-badge)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/Node->=20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 🌐 Live Production Application
- **Live Vercel Production URL**: **[https://hack2skill-flax.vercel.app](https://hack2skill-flax.vercel.app)**
- **GitHub Repository**: **[https://github.com/sriharshapn/KishanSathi.git](https://github.com/sriharshapn/KishanSathi.git)**

---

## 🏆 Core Architectural Capabilities

AgriMate addresses the hackathon challenge through four foundational capabilities:

1. 🛰️ **Satellite Field Intelligence & Interactive Cadastre (Copernicus Sentinel-2 & Google Maps API)**:
   - **Google Maps JavaScript API & Google Earth Engine Integration**: Real-world high-resolution satellite imagery with NDVI vector overlays, RGB True Color, Moisture Stress heatmap, and Google Earth 3D topography perspective.
   - **Interactive Field Boundary Polygon Editing**: Live in-map polygon sculpting—drag corner vertices, click edge midpoints to add points, scale (`+5%`, `-5%`), rotate (`↺ 15°`), and drag entire parcels.
   - **Real-Time Geodesic Area Recalculation**: WGS84 geodesic area engine dynamically recalculates parcel size in **hectares** ($1\text{ ha} = 10,000\text{ m}^2$) and **acres** ($1\text{ ha} \approx 2.471\text{ acres}$) in real time.
   - **All 369 Indian Districts Grounded**: Comprehensive verified GPS centroids across 11 Indian states with zero missing location mappings.
   - **Official Government Cadastre Integration**: Connects with AgriStack (`agristack.gov.in`), ISRO Bhuvan (`bhuvan.nrsc.gov.in`), Soil Health Card (`soilhealth.dac.gov.in`), and State RoRs (Bhoomi, Mahabhulekh, AnyRoR, Bhulekh UP, PLRS).

2. 🌱 **AI Regenerative Agro-Advisory (Google Gemini 2.0 Flash)**:
   - Hyper-local crop recommendations harmonizing soil health, Open-Meteo NWP microclimate forecasts, and Sentinel-2 NDVI telemetry.
   - Soil carbon building rating (Regenerative Score A through F) with estimated APMC price realization.
   - 7-day precision irrigation schedules and 4-milestone seasonal execution calendar.
   - 24x7 Kisan Call Centre (1800-180-1551) IVR speech scripts with regional telephony translations.

3. 🔬 **Instant Plant Disease Diagnostics (Gemini Vision AI)**:
   - Upload or camera capture of infected crop leaves with real-time visual pathogen identification.
   - Dual remedy protocol: Certified bio/organic treatments + statutory chemical dosage per litre.
   - Severity indexing, long-term farm hygiene prevention tips, and emergency KVK (Krishi Vigyan Kendra) escalation.

4. 🏛️ **Interoperable Digital Public Good Network (ETSI NGSI-LD & e-NAM Sync)**:
   - **Live Agmarknet / e-NAM Sync**: Integrated with official Ministry of Agriculture API on `data.gov.in` for continuous live mandi rate updates.
   - Federated cross-state data exchange connecting 8 state agriculture extension models.
   - Coordinated cross-border disease outbreak early warning system.
   - Standardized JSON-LD schemas compliant with Open Data Commons and ETSI GS CIM 009 NGSI-LD.

---

## 📖 Overview

Small and marginal farmers often struggle to interpret complex agricultural market information (varying modal prices, minimum/maximum ranges, arrival volumes, grades, and disparate reporting dates across APMC yards).

**AgriMate** bridges this information gap by converting verified market data into simple, accessible, and actionable intelligence.

### 🛡️ Non-Negotiable Data Integrity: Never Invent a Market Price
- **Numerical market data originates strictly from verified external sources** (Agmarknet / Directorate of Marketing & Inspection, Ministry of Agriculture, Govt. of India).
- If verified data is not available for a given crop and market, the application explicitly states that no verified data is available rather than guessing or extrapolating.
- **Google Gemini 2.0 Flash / LLM layers serve strictly as an explanation and natural language translation layer**—they are never used to substitute or hallucinate numerical market data.

---

## ✨ Key Features

1. **Interactive Field Boundary Polygon Editing**:
   - Farmers can adjust, resize, and reshape their parcel boundary directly on the satellite view.
   - Google Maps vector handles allow dragging vertices, adding intermediate points, and moving parcels.
   - Real-time geodesic area calculation displayed live in both hectares and acres.
   - One-click quick adjustment tools (`+5%`, `-5%`, `↺ 15° Rotate`, `Reset`, and `Save`).

2. **Official Google Earth Engine Integration**:
   - Installed `@google/earthengine` directly from the official Google Earth Engine API repository.
   - Automated Harmonized Sentinel-2 MSI surface reflectance processing with SCL cloud masking and NDVI computation.
   - Generates executable Earth Engine Python and JavaScript pipelines for remote sensing research.

3. **Live e-NAM & APMC Market Discovery**:
   - Compares prevailing market rates across regional APMCs (Ballari, Kolar, Bangalore, Belagavi, Mysuru, Nashik, Pune, Guntur, Agra, Ludhiana, etc.).
   - Displays modal price, minimum and maximum range, price spread, arrival quantity, distance from user (via GPS or district search), and verified timestamp freshness.
   - Integrated with official `data.gov.in` live API with 30-minute automated background sync.

4. **Clean, Decluttered Interface**:
   - Minimalist centered navigation capsule without distracting badge pills.
   - Single-row glassmorphic map HUD overlay displaying location, coordinates, live parcel area, and satellite telemetry.
   - Structured 2-row control bar for state/district picking and spectral layer toggling.

5. **Multilingual by Default**:
   - Instant language switching between **English**, **हिन्दी (Hindi)**, **ಕನ್ನಡ (Kannada)**, and regional languages across all UI elements, educational guides, checklists, and AI insights.

6. **Smart Quantity Normalization & In-Hand Estimator**:
   - Accepts produce quantity in `kg`, `quintals (q)`, or `tonnes (t)` and normalizes automatically internally.
   - Calculates estimated gross value and net in-hand earnings (deducting freight, hamali loading, and APMC cess).

7. **Deterministic Price Trends**:
   - Computes descriptive trends over 7, 15, and 30-day historical time series (price change, percentage change, period average, high, low).
   - Utilizes accessible symbols and text (`↑ Increasing`, `→ Stable`, `↓ Decreasing`).

8. **11-Step Farmer Selling Checklist & Glossary**:
   - Interactive checklist covering pre-departure preparation, APMC gate entry, electronic weighbridge verification, fee breakdowns, and payment receipt confirmation.
   - Farmer-friendly analogies explaining *Modal Price*, *Minimum Price*, *Maximum Price*, and *Market Arrivals*.

9. **Offline & Low-Connectivity Resilience**:
   - Automatically caches recent searches and telemetry in local storage with exact timestamps and offline warning indicators.

---

## 🏗️ System Architecture

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │               Farmer / User Interface                  │
                                    │    (React 19 + TypeScript + Vite + Tailwind CSS v4)    │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │
                                              HTTPS Requests / `/api/*`
                                                                ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │           Vercel Serverless / Express API              │
                                    │                    (api/index.js)                      │
                                    └───────┬───────────────────┬────────────────────┬───────┘
                                            │                   │                    │
                     ┌──────────────────────┴──────┐            │      ┌─────────────┴──────────────────────┐
                     ▼                             ▼            ▼      ▼                                    ▼
       ┌──────────────────────────┐  ┌───────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────┐
       │   Copernicus Sentinel-2  │  │   Google Maps JS API      │  │   Google Gemini 2.0      │  │  Data.gov.in /    │
       │   & Google Earth Engine  │  │   & Geodesic Polygons     │  │   Flash AI Engine        │  │  Agmarknet Mandis │
       │   (@google/earthengine)  │  │   (WGS84 Area Engine)     │  │   (Advisory & Vision)    │  │  (Live API Sync)  │
       └──────────────────────────┘  └───────────────────────────┘  └──────────────────────────┘  └───────────────────┘
                                                   │
                                                   ▼
                                     ┌───────────────────────────┐
                                     │   Resilient Data Store    │
                                     │   (SQLite3 + Memory Store)│
                                     └───────────────────────────┘
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (v10+ recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/sriharshapn/KishanSathi.git
cd KishanSathi
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run install:all
```

### 3. Configure Environment Variables (Optional)
Create a `.env` file in the project root:
```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
DATA_GOV_API_KEY=579b464db66ec23bdd000001dedacf0e499b49a56823f17ffc58aef1
```
*(AgriMate includes deterministic fallback engines for Google Satellite, Sentinel-2 NDVI, and Agmarknet rates if external keys are not provided).*

### 4. Run the Development Servers
In separate terminal windows (or concurrently):
```bash
# Start backend API service (http://localhost:5001)
npm run dev:server

# Start frontend dev server with hot reload (http://localhost:5173)
npm run dev:client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ☁️ Deployment to Vercel

The application is pre-configured for full-stack Vercel deployment via [`vercel.json`](file:///c:/Users/sriha/Downloads/Agrimate-main/hack2skill/vercel.json) and [`api/index.js`](file:///c:/Users/sriha/Downloads/Agrimate-main/hack2skill/api/index.js).

### Option A: Automatic Git Integration
1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Select your repository: `sriharshapn/KishanSathi`.
3. Vercel automatically detects `vercel.json`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Serverless API**: `api/index.js`
4. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
npx vercel --prod
```

---

## 🧪 Automated Verification Test Suite

AgriMate includes comprehensive automated verification suites covering market math, API endpoints, and cloud architecture:

```bash
npm test
```

### Verification Checks Performed:
1. **Quantity Normalization**: `500 kg = 5 quintals`, `1 tonne = 10 quintals`, `2.5 tonnes = 25 quintals`.
2. **Gross Value Calculation**: `5 quintals @ ₹2,200 = ₹11,000`.
3. **Haversine Distance**: GPS distance estimation between mandis.
4. **Data Integrity & Non-Hallucination**: Rejection of fabricated or unsupported prices.
5. **Deterministic Price Trends**: 7, 15, and 30-day moving trends and accessible symbols (`↑`, `→`, `↓`).
6. **Multilingual AI Grounding**: Verified explanation templates in English, Hindi, and Kannada.
7. **End-to-End Express API Routes**:
   - `GET /api/health`
   - `POST /api/advisory`
   - `GET /api/advisory/history`
   - `GET /api/disease/reports`
   - `GET /api/fields` & `POST /api/fields`
   - `GET /api/weather`
   - `GET /api/satellite/ndvi`
   - `GET /api/gov/dashboard`
   - `GET /api/interop/ngsi-ld/v1/entities`
8. **Cloud Architecture Verification**: Google Cloud Gemini configuration, SQLite WAL mode, and Agmarknet data ingestion pipeline.

---

## 📄 License
MIT License. Built with ❤️ for Indian farmers.
