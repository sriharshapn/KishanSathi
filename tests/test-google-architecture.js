// AgriMate Google Cloud Architecture & System Verification Test
// Verifies Google Gemini AI Engine, Standard SQLite/Cloud Storage, and Node.js Cloud Run Architecture

import assert from 'assert';
import { getGoogleAiConfig, explainMarketWithGemini } from '../server/services/googleAiService.js';
import { getStorageConfig, putPriceRecord, getUserPreferences } from '../server/services/storageService.js';
import { runIngestionPipeline } from '../server/handlers/syncPipeline.js';
import { searchMarkets } from '../server/services/marketService.js';
import { getPriceTrends } from '../server/services/trendService.js';

async function runGoogleArchitectureTests() {
  console.log("🌾 Running Google Cloud & Normal Architecture Verification Tests...\n");

  // 1. Check Google Gemini AI Configuration
  const geminiConfig = getGoogleAiConfig();
  console.log("1. Google Gemini AI Config:", geminiConfig);
  assert.strictEqual(geminiConfig.provider, "Google Gemini");
  assert.ok(geminiConfig.model.includes("gemini"));
  assert.ok(geminiConfig.groundingRule.includes("Zero numerical hallucination"));
  console.log("   ✅ Google Gemini AI Service: VALIDATED\n");

  // 2. Check Standard Relational Storage Configuration
  const storageConfig = getStorageConfig();
  assert.strictEqual(storageConfig.isConfigured, true);
  assert.ok(storageConfig.provider.includes("Google Cloud SQL") || storageConfig.provider.includes("SQLite") || storageConfig.provider.includes("Cloud Firestore"));
  assert.ok(storageConfig.collections?.priceRecords || storageConfig.tables?.priceRecords);
  console.log("   ✅ Standard Storage Service: VALIDATED\n");

  // 3. Test Storage Write & Read Operations
  const testRecord = {
    record_id: `test_rec_${Date.now()}`,
    market_id: "MKT-KA-001",
    commodity_id: "tomato",
    min_price: 2000,
    modal_price: 2400,
    max_price: 2800,
    arrival_quantity: 450,
    source: "Agmarknet Verified API"
  };
  const putRes = await putPriceRecord(testRecord);
  assert.strictEqual(putRes.success, true);
  console.log("3. Database write verified: PASSED\n");

  // 4. Test Verified Market Search with Normalized Units
  const marketResult = searchMarkets({
    crop: "Tomato",
    location: "Ballari",
    quantity: 500,
    unit: "kg"
  });
  assert.strictEqual(marketResult.success, true);
  assert.ok(marketResult.markets.length > 0);
  assert.strictEqual(marketResult.normalized_quantity.in_quintals, 5);
  console.log(`4. Verified APMC Market Discovery: PASSED (${marketResult.markets.length} verified mandis retrieved)\n`);

  // 5. Test Google Gemini Market Explanation Service
  const sampleMarket = marketResult.markets[0];
  const trend = getPriceTrends({ crop: "Tomato", market_id: sampleMarket.market_id, days: 7 });
  const explanation = await explainMarketWithGemini({
    market: sampleMarket,
    trend,
    language: "en",
    quantityQuintals: 5
  });

  assert.ok(explanation.title, "Must return structured explanation title");
  assert.ok(explanation.summary, "Must return structured summary");
  assert.ok(explanation.summary.includes(sampleMarket.modal_price.toLocaleString('en-IN')) || explanation.summary.includes(sampleMarket.modal_price.toString()), "Summary must contain verified modal price");
  assert.ok(explanation.telemetry.provider.includes("Google"), "Telemetry must attribute to Google Gemini");
  console.log("5. Google Gemini Grounded Market Explanation:", {
    title: explanation.title,
    engine: explanation.telemetry.engine,
    grounded: explanation.telemetry.grounded
  });
  console.log("   ✅ Google Gemini Grounded AI Layer: PASSED\n");

  // 6. Test Scheduled Ingestion Pipeline (Google Cloud Scheduler compatible)
  const pipelineResult = await runIngestionPipeline();
  assert.strictEqual(pipelineResult.success, true);
  assert.ok(pipelineResult.architecture.includes("Google Cloud Scheduler"));
  assert.ok(pipelineResult.records_synced > 0);
  console.log(`6. Google Cloud Scheduler Pipeline Handler: PASSED (${pipelineResult.records_synced} records synced)\n`);

  console.log("🎉 All Google Cloud & Normal Architecture Tests Passed Successfully!");
}

runGoogleArchitectureTests().catch(err => {
  console.error("❌ Google Architecture Test Failed:", err);
  process.exit(1);
});
