// AgriMate Standard Storage Service
// Replaces AWS DynamoDB with standard SQLite relational storage (Google Cloud SQL compatible)
// Implements PRD Section 19.3, 21 & 22

import db from "../database/db.js";

export function getStorageConfig() {
  return {
    provider: "Google Firebase Cloud Firestore",
    engine: "Document Collection Store (NoSQL Cloud Firestore)",
    collections: {
      markets: "markets",
      commodities: "commodities",
      priceRecords: "price_records",
      users: "user_preferences",
      advisory: "advisories",
      diseaseReports: "disease_reports",
      farmerFields: "farmer_fields"
    },
    isConfigured: true,
    cloudReady: true
  };
}

/**
 * Put a verified price record into database per PRD Sec 22 pipeline
 */
export async function putPriceRecord(record) {
  const recordId = record.record_id || `rec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const arrivalDate = record.date || new Date().toISOString().split('T')[0];
  const sourceTimestamp = record.source_timestamp || new Date().toISOString();

  await db.run(
    `INSERT OR REPLACE INTO price_records 
     (record_id, market_id, commodity_id, variety, grade, arrival_date, min_price, modal_price, max_price, arrival_quantity, unit, source, source_timestamp, is_today)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      recordId,
      record.market_id,
      record.commodity_id,
      record.variety || 'Standard',
      record.grade || 'FAQ',
      arrivalDate,
      Number(record.min_price) || 0,
      Number(record.modal_price) || 0,
      Number(record.max_price) || 0,
      Number(record.arrival_quantity) || 0,
      record.unit || 'quintal',
      record.source || 'Agmarknet / APMC',
      sourceTimestamp,
      1
    ]
  );

  return { success: true, record_id: recordId };
}

/**
 * Get user preferences from database (PRD Sec 21)
 */
export async function getUserPreferences(userId = 'default_farmer') {
  try {
    const row = await db.get(
      `SELECT * FROM user_preferences WHERE user_id = ?;`,
      [userId]
    );
    return row || null;
  } catch (err) {
    console.warn("[StorageService] Could not read user preferences:", err.message);
    return null;
  }
}

/**
 * Set user preferences in database
 */
export async function setUserPreferences({ userId = 'default_farmer', language = 'en', location = '', preferredUnits = 'quintal' }) {
  try {
    await db.run(
      `INSERT OR REPLACE INTO user_preferences (user_id, language, location, preferred_units, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      [userId, language, location, preferredUnits, new Date().toISOString()]
    );
    return { success: true };
  } catch (err) {
    console.warn("[StorageService] Could not write user preferences:", err.message);
    return { success: false, error: err.message };
  }
}
