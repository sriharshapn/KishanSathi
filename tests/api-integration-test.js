import assert from 'assert';
import express from '../server/node_modules/express/index.js';
import apiRouter from '../server/routes/api.js';
import db from '../server/database/db.js';

console.log('====================================================');
console.log('🌾 Running End-to-End Express API Route Verification');
console.log('====================================================');

async function runApiIntegrationTests() {
  await db.initDb();

  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'healthy');
    console.log('✅ PASS: GET /api/health');

    // 2. Advisory Generation & Persistence
    const advRes = await fetch(`${baseUrl}/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: 'Karnataka',
        district: 'Ballari',
        crop: 'Tomato',
        soilType: 'Red Loam',
        season: 'Kharif 2026',
        language: 'en'
      })
    });
    assert.strictEqual(advRes.status, 200);
    const advData = await advRes.json();
    assert.strictEqual(advData.success, true);
    assert(advData.advisory.crop_recommendations.length > 0);
    console.log('✅ PASS: POST /api/advisory (Gemini 2.0 Flash + Persistence)');

    // 3. Advisory History
    const advHistRes = await fetch(`${baseUrl}/advisory/history`);
    assert.strictEqual(advHistRes.status, 200);
    const advHistData = await advHistRes.json();
    assert.strictEqual(advHistData.success, true);
    assert(advHistData.history.length > 0);
    assert.strictEqual(advHistData.history[0].state, 'Karnataka');
    console.log(`✅ PASS: GET /api/advisory/history (${advHistData.history.length} records retrieved)`);

    // 4. Disease Reports History
    const diseaseReportsRes = await fetch(`${baseUrl}/disease/reports`);
    assert.strictEqual(diseaseReportsRes.status, 200);
    const diseaseReportsData = await diseaseReportsRes.json();
    assert.strictEqual(diseaseReportsData.success, true);
    console.log(`✅ PASS: GET /api/disease/reports (${diseaseReportsData.reports.length} reports retrieved)`);

    // 5. Farmer Fields CRUD
    const fieldsRes = await fetch(`${baseUrl}/fields`);
    assert.strictEqual(fieldsRes.status, 200);
    const fieldsData = await fieldsRes.json();
    assert.strictEqual(fieldsData.success, true);
    assert(fieldsData.fields.length >= 3);
    console.log(`✅ PASS: GET /api/fields (${fieldsData.fields.length} parcels retrieved)`);

    // Create a new field
    const createFieldRes = await fetch(`${baseUrl}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field_name: 'Ballari Test Cadastre #77',
        state: 'Karnataka',
        district: 'Ballari',
        area_hectares: 2.5,
        soil_type: 'Clay Loam',
        current_crop: 'Tomato'
      })
    });
    assert.strictEqual(createFieldRes.status, 200);
    const createdFieldData = await createFieldRes.json();
    assert.strictEqual(createdFieldData.success, true);
    const newFieldId = createdFieldData.field.field_id;
    assert(newFieldId);
    console.log(`✅ PASS: POST /api/fields (Created ${newFieldId} with auto-NDVI: ${createdFieldData.field.ndvi_latest})`);

    // Delete the field
    const delFieldRes = await fetch(`${baseUrl}/fields/${newFieldId}`, { method: 'DELETE' });
    assert.strictEqual(delFieldRes.status, 200);
    const delFieldData = await delFieldRes.json();
    assert.strictEqual(delFieldData.success, true);
    console.log(`✅ PASS: DELETE /api/fields/${newFieldId}`);

    // 6. Live Weather
    const weatherRes = await fetch(`${baseUrl}/weather?state=Punjab&district=Ludhiana`);
    assert.strictEqual(weatherRes.status, 200);
    const weatherData = await weatherRes.json();
    assert.strictEqual(weatherData.success, true);
    assert(weatherData.weather.summary);
    console.log('✅ PASS: GET /api/weather (Punjab / Ludhiana micro-climate)');

    // 7. IVR Advisory Script
    const ivrRes = await fetch(`${baseUrl}/ivr/advisory?state=Karnataka&district=Ballari&language=kn`);
    assert.strictEqual(ivrRes.status, 200);
    const ivrData = await ivrRes.json();
    assert.strictEqual(ivrData.success, true);
    assert(ivrData.ivr_script.length > 20);
    assert.strictEqual(ivrData.language, 'kn');
    console.log('✅ PASS: GET /api/ivr/advisory (Kannada IVR telephony text)');

    // 8. Satellite NDVI
    const ndviRes = await fetch(`${baseUrl}/satellite/ndvi?state=Tamil Nadu&district=Thanjavur`);
    assert.strictEqual(ndviRes.status, 200);
    const ndviData = await ndviRes.json();
    assert.strictEqual(ndviData.success, true);
    assert.strictEqual(ndviData.timeseries.length, 30);
    console.log('✅ PASS: GET /api/satellite/ndvi (Tamil Nadu / Thanjavur)');

    // 9. Government Dashboard
    const govRes = await fetch(`${baseUrl}/gov/dashboard`);
    assert.strictEqual(govRes.status, 200);
    const govData = await govRes.json();
    assert.strictEqual(govData.success, true);
    assert.strictEqual(govData.stats.states_active, 8);
    assert(govData.disease_alerts.length >= 5);
    console.log('✅ PASS: GET /api/gov/dashboard (8 States Telemetry & Disease Outbreaks)');

    // 10. ETSI NGSI-LD Entities (DPG)
    const ngsiRes = await fetch(`${baseUrl}/interop/ngsi-ld/v1/entities`);
    assert.strictEqual(ngsiRes.status, 200);
    const ngsiData = await ngsiRes.json();
    assert.strictEqual(ngsiData.type, 'QueryResponse');
    assert.strictEqual(ngsiData.entities.length, 8);
    assert.strictEqual(ngsiData.entities[0].type, 'AgriParcel');
    console.log('✅ PASS: GET /api/interop/ngsi-ld/v1/entities (ETSI GS CIM 009 JSON-LD)');

    console.log('\n🏆 All 10 Backend API Endpoints fully operational & verified!\n');
  } finally {
    server.close();
  }
}

runApiIntegrationTests().catch(err => {
  console.error('❌ Integration Test Failed:', err);
  process.exit(1);
});
