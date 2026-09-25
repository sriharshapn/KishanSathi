// New AgriMate AI routes — appended to existing api.js
// Handles: Advisory, Disease Diagnosis, Satellite NDVI, Government Dashboard

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  searchMarkets, getCommodities, getMarkets,
  normalizeToQuintals, logSearch, getRecentSearches
} from '../services/marketService.js';
import { getPriceTrends } from '../services/trendService.js';
import { explainMarketWithGemini, getGoogleAiConfig } from '../services/googleAiService.js';
import { getStorageConfig } from '../services/storageService.js';
import { runIngestionPipeline } from '../handlers/syncPipeline.js';
import { getSellingChecklist } from '../services/checklistService.js';
import { parseNaturalLanguageQuery } from '../services/nlpService.js';
import { syncMarketData, getSyncStatus } from '../services/syncService.js';
import { 
  generateCropAdvisory, 
  diagnoseCropDisease, 
  getSatelliteNDVI, 
  getLiveWeather, 
  generateIVRAdvisoryText, 
  STATE_COORDINATES 
} from '../services/geminiService.js';
import { GOV_API_REGISTRY, searchGovPlotData } from '../services/govPlotService.js';
import { processEarthEnginePass, getEarthEngineStatus } from '../services/earthEngineService.js';
import db from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Upload config for disease images ──────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ── Existing routes ───────────────────────────────

router.get('/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// System & Cloud Architecture Status (Google Cloud Platform / Standard Node.js)
router.get('/cloud/status', (req, res) => {
  res.json({
    success: true,
    platform: "Google Cloud Platform / Standard Node.js Architecture",
    runtime: {
      engine: "Node.js 20.x Express REST Architecture",
      container: "Google Cloud Run / Cloud Build Ready",
      dpg_interop: "ETSI GS CIM 009 NGSI-LD compliant"
    },
    ai_engine: getGoogleAiConfig(),
    storage: getStorageConfig(),
    scheduler: {
      provider: "Google Cloud Scheduler / Cron Trigger",
      endpoint: "/api/pipeline/sync",
      active: true
    }
  });
});

router.get('/system/status', (req, res) => {
  res.redirect('/api/cloud/status');
});

// Legacy backward compatibility route
router.get('/aws/status', (req, res) => {
  res.json({
    success: true,
    migrated: true,
    platform: "Google Cloud Platform / Standard Node.js Architecture",
    canonical_endpoint: "/api/cloud/status",
    ai_engine: getGoogleAiConfig(),
    storage: getStorageConfig()
  });
});

router.get('/crops', (req, res) => {
  res.json({ success: true, commodities: getCommodities() });
});

router.get('/markets/all', (req, res) => {
  res.json({ success: true, markets: getMarkets() });
});

router.get('/markets', async (req, res) => {
  const { crop, location, district, quantity = 5, unit = 'quintal', lat, lon, filterState, maxDistanceKm, sortBy } = req.query;
  const targetLocation = location || district || '';
  const numQuantity = Number(quantity);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    return res.status(400).json({ success: false, error: "Quantity must be a positive number.", code: "INVALID_QUANTITY" });
  }
  const result = searchMarkets({ crop, location: targetLocation, quantity: numQuantity, unit, lat, lon, filterState, maxDistanceKm, sortBy });
  if (!result.success) return res.status(400).json(result);
  if (crop) logSearch({ crop, location: targetLocation, quantity: numQuantity, unit }).catch(() => {});
  res.json(result);
});

router.get('/prices', (req, res) => {
  const { crop, market_id } = req.query;
  if (!crop) return res.status(400).json({ success: false, error: "Crop parameter is required." });
  const result = searchMarkets({ crop, quantity: 1 });
  if (market_id && result.markets) result.markets = result.markets.filter(m => m.market_id === market_id);
  res.json(result);
});

router.get('/trends', (req, res) => {
  const { crop, market_id, days = 7 } = req.query;
  const result = getPriceTrends({ crop, market_id, days: Number(days) });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

router.post('/explain', async (req, res) => {
  const { market, trend, language = 'en', quantityQuintals = 0 } = req.body;
  if (!market) return res.status(400).json({ success: false, error: "Market data object is required." });
  try {
    const explanation = await explainMarketWithGemini({ market, trend, language, quantityQuintals: Number(quantityQuintals) || 0 });
    res.json({ success: true, explanation });
  } catch (err) {
    const explanation = generateMarketExplanation({ market, trend, language, quantityQuintals: Number(quantityQuintals) || 0 });
    res.json({ success: true, explanation });
  }
});

// Scheduled Ingestion Pipeline (Google Cloud Scheduler / Cron Trigger)
router.post('/pipeline/sync', async (req, res) => {
  try {
    const result = await runIngestionPipeline();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/explain-term/:term', (req, res) => {
  const { term } = req.params;
  const { lang = 'en' } = req.query;
  const cleanTerm = term.toLowerCase().trim();
  const termData = TERMINOLOGY_EXPLANATIONS[cleanTerm];
  if (!termData) return res.status(404).json({ success: false, error: `No explanation found for term '${term}'.` });
  res.json({ success: true, term: cleanTerm, data: termData[lang] || termData['en'] });
});

router.post('/checklist', (req, res) => {
  const { crop = "produce", marketName = "APMC Mandi", quantityQuintals = 0, language = 'en' } = req.body;
  const checklist = getSellingChecklist({ crop, marketName, quantityQuintals: Number(quantityQuintals) || 0, language });
  res.json({ success: true, checklist });
});

router.post('/parse-query', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, error: "Query is required." });
  res.json(parseNaturalLanguageQuery(query));
});

router.post('/net-return', (req, res) => {
  const { grossValue = 0, transportCost = 0, loadingCost = 0, marketCessPercent = 1.5, otherCharges = 0 } = req.body;
  const gross = Math.max(0, Number(grossValue) || 0);
  const transport = Math.max(0, Number(transportCost) || 0);
  const loading = Math.max(0, Number(loadingCost) || 0);
  const cess = Math.round((gross * (Number(marketCessPercent) || 0)) / 100);
  const other = Math.max(0, Number(otherCharges) || 0);
  const totalDeductions = transport + loading + cess + other;
  res.json({
    success: true, gross_value: gross,
    deductions: { transport, loading_unloading: loading, market_cess: cess, other_charges: other, total_deductions: totalDeductions },
    estimated_net_return: Math.max(0, gross - totalDeductions),
    disclaimer: "Approximation for budgeting purposes only."
  });
});

router.post('/sync', async (req, res) => { res.json(await syncMarketData()); });
router.get('/sync/status', async (req, res) => { res.json({ success: true, ...(await getSyncStatus()) }); });
router.get('/history', async (req, res) => { res.json({ success: true, history: await getRecentSearches(15) }); });
router.post('/history', async (req, res) => {
  const { crop, location, quantity, unit } = req.body;
  await logSearch({ crop, location, quantity, unit });
  res.json({ success: true });
});
router.get('/preferences', async (req, res) => {
  try {
    const pref = await db.get("SELECT * FROM user_preferences WHERE user_id = 'default_farmer';");
    res.json({ success: true, preferences: pref || null });
  } catch (err) { res.json({ success: false, error: err.message }); }
});
router.post('/preferences', async (req, res) => {
  const { language = 'en', location = '', preferredUnits = 'quintal' } = req.body;
  try {
    await db.run(`INSERT OR REPLACE INTO user_preferences (user_id, language, location, preferred_units, updated_at) VALUES ('default_farmer', ?, ?, ?, ?);`,
      [language, location, preferredUnits, new Date().toISOString()]);
    res.json({ success: true, message: "Preferences saved" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── AI Crop Advisory & History ────────────────────
// POST /api/advisory
router.post('/advisory', async (req, res) => {
  const { state = 'Karnataka', district = 'Ballari', crop = '', soilType = 'Mixed loam', season, language = 'en' } = req.body;
  const currentSeason = season || getCurrentSeason();
  try {
    const advisory = await generateCropAdvisory({ state, district, crop, soilType, season: currentSeason, language });
    
    // Persist into SQLite advisories table
    await db.run(
      `INSERT INTO advisories (farmer_id, state, district, crop, soil_type, season, language, advisory_json, ndvi_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'default_farmer',
        state,
        district,
        crop || '',
        soilType || '',
        currentSeason,
        language,
        JSON.stringify(advisory),
        advisory.ndvi_score || 0.6,
        new Date().toISOString()
      ]
    ).catch(err => console.warn('Advisory DB insert warning:', err.message));

    res.json({ success: true, advisory, season: currentSeason, location: `${district}, ${state}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/advisory/history
router.get('/advisory/history', async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT id, farmer_id, state, district, crop, soil_type, season, language, advisory_json, ndvi_score, created_at FROM advisories ORDER BY id DESC LIMIT 20;"
    );
    const history = rows.map(r => {
      let parsed = {};
      try { parsed = JSON.parse(r.advisory_json); } catch (_) {}
      return {
        id: r.id,
        farmer_id: r.farmer_id,
        state: r.state,
        district: r.district,
        crop: r.crop,
        soil_type: r.soil_type,
        season: r.season,
        language: r.language,
        ndvi_score: r.ndvi_score,
        created_at: r.created_at,
        advisory: parsed
      };
    });
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Disease Diagnosis & Reports ───────────────────
// POST /api/disease/diagnose  (multipart/form-data, field: image)
router.post('/disease/diagnose', upload.single('image'), async (req, res) => {
  const { language = 'en', sampleName = '' } = req.body;
  if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded.' });

  const imagePath = req.file.path;
  const specimenHint = sampleName || req.file.originalname || '';
  try {
    const diagnosis = await diagnoseCropDisease({ imagePath, language, sampleName: specimenHint });

    // Persist into SQLite disease_reports table
    const primaryDiag = diagnosis.diagnoses?.[0] || {};
    await db.run(
      `INSERT INTO disease_reports (farmer_id, crop_identified, disease_name, severity, confidence, overall_health, diagnosis_json, image_name, language, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'default_farmer',
        diagnosis.crop_identified || 'Botanical Sample',
        primaryDiag.disease_name || 'Healthy / Undetermined',
        primaryDiag.severity || 'low',
        primaryDiag.confidence || 0.85,
        diagnosis.overall_health || 'healthy',
        JSON.stringify(diagnosis),
        req.file ? req.file.originalname : 'crop_sample.png',
        language,
        new Date().toISOString()
      ]
    ).catch(err => console.warn('Disease report DB insert warning:', err.message));

    res.json({ success: true, diagnosis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Clean up uploaded file
    try { fs.unlinkSync(imagePath); } catch (_) {}
  }
});

// GET /api/disease/reports
router.get('/disease/reports', async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT id, farmer_id, crop_identified, disease_name, severity, confidence, overall_health, diagnosis_json, image_name, language, created_at FROM disease_reports ORDER BY id DESC LIMIT 20;"
    );
    const reports = rows.map(r => {
      let parsed = {};
      try { parsed = JSON.parse(r.diagnosis_json); } catch (_) {}
      return {
        id: r.id,
        farmer_id: r.farmer_id,
        crop_identified: r.crop_identified,
        disease_name: r.disease_name,
        severity: r.severity,
        confidence: r.confidence,
        overall_health: r.overall_health,
        image_name: r.image_name,
        language: r.language,
        created_at: r.created_at,
        diagnosis: parsed
      };
    });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Farmer Fields Management (CRUD) ───────────────
// GET /api/fields
router.get('/fields', async (req, res) => {
  try {
    const fields = await db.query(
      "SELECT * FROM farmer_fields WHERE farmer_id = 'default_farmer' ORDER BY created_at DESC;"
    );
    res.json({ success: true, count: fields.length, fields });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fields
router.post('/fields', async (req, res) => {
  const { field_name, state = 'Karnataka', district = 'Ballari', area_hectares = 1.0, latitude, longitude, soil_type = 'Loamy', current_crop = 'Tomato' } = req.body;
  if (!field_name) {
    return res.status(400).json({ success: false, error: 'field_name is required' });
  }
  const lat = Number(latitude) || (STATE_COORDINATES[state]?.lat || 15.14);
  const lon = Number(longitude) || (STATE_COORDINATES[state]?.lon || 76.92);
  const area = Number(area_hectares) || 1.0;

  const ndviData = getSatelliteNDVI(state, district);
  const fieldId = `field_${Date.now().toString(36)}`;

  try {
    await db.run(
      `INSERT INTO farmer_fields (field_id, farmer_id, field_name, state, district, area_hectares, latitude, longitude, soil_type, current_crop, ndvi_latest, ndvi_health, created_at)
       VALUES (?, 'default_farmer', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [fieldId, field_name, state, district, area, lat, lon, soil_type, current_crop, ndviData.ndvi_mean, ndviData.health_status, new Date().toISOString()]
    );
    res.json({
      success: true,
      message: "Field registered successfully",
      field: {
        field_id: fieldId,
        field_name,
        state,
        district,
        area_hectares: area,
        latitude: lat,
        longitude: lon,
        soil_type,
        current_crop,
        ndvi_latest: ndviData.ndvi_mean,
        ndvi_health: ndviData.health_status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/fields/:id
router.delete('/fields/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM farmer_fields WHERE field_id = ? AND farmer_id = 'default_farmer';", [id]);
    res.json({ success: true, message: `Field ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Government Agricultural Plot & Cadastral Registry APIs ──
// GET /api/cadastre/apis - List official govt cadastral & plot APIs
router.get('/cadastre/apis', (req, res) => {
  res.json({ success: true, count: GOV_API_REGISTRY.length, apis: GOV_API_REGISTRY });
});

// GET /api/cadastre/query?state=Karnataka&district=Ballari&survey_number=142/2A
router.get('/cadastre/query', (req, res) => {
  try {
    const plotData = searchGovPlotData(req.query);
    res.json(plotData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cadastre/query
router.post('/cadastre/query', (req, res) => {
  try {
    const plotData = searchGovPlotData(req.body);
    res.json(plotData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Google Earth Engine (GEE) API ─────────────────
// Official repo: https://github.com/google/earthengine-api.git
// Client Library: @google/earthengine
// GET /api/earthengine/status
router.get('/earthengine/status', (req, res) => {
  res.json({ success: true, ...getEarthEngineStatus() });
});

// POST /api/earthengine/process
router.post('/earthengine/process', async (req, res) => {
  try {
    const result = await processEarthEnginePass(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Satellite NDVI ────────────────────────────────
// GET /api/satellite/ndvi?state=Karnataka&district=Ballari
router.get('/satellite/ndvi', (req, res) => {
  const { state = 'Karnataka', district = 'Ballari' } = req.query;
  const ndviData = getSatelliteNDVI(state, district);
  res.json({ success: true, state, district, ...ndviData });
});

// ── Live Weather (Open-Meteo High-Resolution NWP) ─
// GET /api/weather?state=Karnataka&district=Ballari&lat=13.03&lon=77.57
router.get('/weather', async (req, res) => {
  const { state = 'Karnataka', district = 'Ballari', lat, lon } = req.query;
  try {
    const weather = await getLiveWeather(state, district, lat ? Number(lat) : undefined, lon ? Number(lon) : undefined);
    res.json({ success: true, state, district, weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── IVR Voice Advisory Script (Kisan Call Centre) ─
// GET /api/ivr/advisory?state=Karnataka&district=Ballari&language=en
router.get('/ivr/advisory', async (req, res) => {
  const { state = 'Karnataka', district = 'Ballari', language = 'en' } = req.query;
  try {
    const advisory = await generateCropAdvisory({
      state,
      district,
      crop: '',
      soilType: 'Mixed loam',
      season: getCurrentSeason(),
      language
    });
    const ivrScript = generateIVRAdvisoryText(advisory, language);
    res.json({
      success: true,
      state,
      district,
      language,
      ivr_script: ivrScript,
      telephony_provider: "Kisan Call Centre (1800-180-1551) Compatible Voice Gateway",
      audio_format: "PCM 8kHz / GSM 6.10 Telephony Standard"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Government Dashboard & Inter-State DPG ────────
// GET /api/gov/dashboard
router.get('/gov/dashboard', (req, res) => {
  const states = ['Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Andhra Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'];
  const districtData = states.map(state => {
    const ndvi = getSatelliteNDVI(state, '');
    return {
      state,
      ndvi_mean: ndvi.ndvi_mean,
      health_status: ndvi.health_status,
      health_color: ndvi.health_color,
      disease_alerts: Math.floor(Math.random() * 12),
      farmers_count: Math.floor(Math.random() * 45000) + 5000,
      dominant_crop: ['Tomato', 'Onion', 'Wheat', 'Rice', 'Cotton', 'Maize', 'Soybean'][Math.floor(Math.random() * 7)]
    };
  });

  const diseaseAlerts = [
    { district: 'Ballari', state: 'Karnataka', disease: 'Yellow Rust', severity: 'moderate', reports: 8, lat: 15.15, lon: 76.92 },
    { district: 'Nashik', state: 'Maharashtra', disease: 'Powdery Mildew', severity: 'mild', reports: 5, lat: 19.99, lon: 73.79 },
    { district: 'Ludhiana', state: 'Punjab', disease: 'Stem Borer', severity: 'severe', reports: 14, lat: 30.90, lon: 75.85 },
    { district: 'Guntur', state: 'Andhra Pradesh', disease: 'Leaf Blight', severity: 'moderate', reports: 7, lat: 16.30, lon: 80.44 },
    { district: 'Thanjavur', state: 'Tamil Nadu', disease: 'Rice Blast', severity: 'severe', reports: 11, lat: 10.79, lon: 79.13 },
  ];

  res.json({
    success: true,
    stats: {
      total_farmers: 284750,
      advisories_today: 18420,
      disease_reports_week: 63,
      states_active: 8,
      avg_ndvi: parseFloat((districtData.reduce((a, b) => a + b.ndvi_mean, 0) / districtData.length).toFixed(3))
    },
    district_data: districtData,
    disease_alerts: diseaseAlerts,
    last_updated: new Date().toISOString()
  });
});

// ── ETSI NGSI-LD & Schema.org Interoperability ───
// GET /api/interop/ngsi-ld/v1/entities
router.get('/interop/ngsi-ld/v1/entities', (req, res) => {
  const states = ['Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Andhra Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'];
  const entities = states.map((state, idx) => {
    const coords = STATE_COORDINATES[state] || { lat: 15.14, lon: 76.92, defaultDistrict: 'Ballari' };
    const ndvi = getSatelliteNDVI(state, coords.defaultDistrict);
    return {
      "@context": [
        "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
        "https://schema.org",
        {
          "AgriParcel": "https://smartdatamodels.org/dataModel.Agrifood/AgriParcel",
          "ndviMean": "https://smartdatamodels.org/dataModel.Agrifood/ndviMean",
          "cropStatus": "https://smartdatamodels.org/dataModel.Agrifood/cropStatus"
        }
      ],
      "id": `urn:ngsi-ld:AgriParcel:IN-${state.replace(/\s+/g, '_').toUpperCase()}-${idx + 101}`,
      "type": "AgriParcel",
      "name": { "type": "Property", "value": `${state} Regional Agricultural Observation Unit` },
      "location": {
        "type": "GeoProperty",
        "value": {
          "type": "Point",
          "coordinates": [coords.lon, coords.lat]
        }
      },
      "ndviMean": {
        "type": "Property",
        "value": ndvi.ndvi_mean,
        "unitCode": "C62",
        "observedAt": new Date().toISOString()
      },
      "healthStatus": {
        "type": "Property",
        "value": ndvi.health_status
      },
      "dataProvider": {
        "type": "Property",
        "value": "AgriMate National DPG Mesh (ISRO Sentinel-2 + AGMARKNET)"
      },
      "license": {
        "type": "Property",
        "value": "https://opendatacommons.org/licenses/by/1-0/"
      }
    };
  });

  res.setHeader('Content-Type', 'application/ld+json');
  res.json({
    "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "type": "QueryResponse",
    "totalCount": entities.length,
    "entities": entities
  });
});

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'Kharif 2026';
  if (month >= 11 || month <= 2) return 'Rabi 2026-27';
  return 'Zaid 2026';
}

export default router;
