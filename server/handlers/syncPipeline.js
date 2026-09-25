// AgriMate Standard Scheduled Ingestion Pipeline
// Compatible with Google Cloud Scheduler, standard Node.js cron, and manual triggers
// Implements PRD Section 22 & 23:
// "Government data/API → Ingestion Pipeline → Validate records → Normalize crop names 
// → Normalize units → Validate timestamps → Store in Database → Application queries Database"

import { putPriceRecord } from "../services/storageService.js";
import { syncMarketData } from "../services/syncService.js";

/**
 * Scheduled Ingestion Pipeline Trigger
 * Can be triggered via HTTP POST by Google Cloud Scheduler or Node.js process
 */
export async function runIngestionPipeline(options = {}) {
  const startTime = Date.now();
  console.log("[Pipeline Scheduler] Ingestion pipeline started at", new Date().toISOString());

  try {
    // 1. Ingest, validate records, normalize crop names, normalize units, validate timestamps
    const syncResult = await syncMarketData();

    // 2. Batch persist verified records into relational database
    if (syncResult.records && Array.isArray(syncResult.records)) {
      for (const rec of syncResult.records) {
        await putPriceRecord(rec);
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[Pipeline Scheduler] Ingestion successful in ${durationMs}ms. Records synced: ${syncResult.records_synced}`);

    return {
      success: true,
      architecture: "Google Cloud Scheduler / Node.js Standard Pipeline",
      records_synced: syncResult.records_synced,
      timestamp: syncResult.timestamp,
      duration_ms: durationMs
    };
  } catch (error) {
    console.error("[Pipeline Scheduler] Ingestion Pipeline Failed:", error);
    return {
      success: false,
      architecture: "Google Cloud Scheduler / Node.js Standard Pipeline",
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
