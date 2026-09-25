import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbFile = path.join(__dirname, 'mandimate.db');

if (process.env.VERCEL) {
  try {
    const tmpDb = path.join('/tmp', 'mandimate.db');
    if (!fs.existsSync(tmpDb) && fs.existsSync(dbFile)) {
      fs.copyFileSync(dbFile, tmpDb);
    }
    dbFile = tmpDb;
  } catch (err) {
    console.warn('Vercel tmp sqlite copy warning:', err.message);
  }
}

const db = new sqlite3.Database(dbFile);

export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export async function initDb() {
  // Enable WAL mode for high concurrency
  await run("PRAGMA journal_mode = WAL;");
  await run("PRAGMA synchronous = NORMAL;");

  // Create tables per PRD Section 19.3 & 21
  await run(`
    CREATE TABLE IF NOT EXISTS markets (
      market_id TEXT PRIMARY KEY,
      market_name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      pin TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS commodities (
      commodity_id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      name_hi TEXT NOT NULL,
      name_kn TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      icon TEXT NOT NULL,
      varieties_json TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS price_records (
      record_id TEXT PRIMARY KEY,
      market_id TEXT NOT NULL,
      commodity_id TEXT NOT NULL,
      variety TEXT NOT NULL,
      grade TEXT NOT NULL,
      arrival_date TEXT NOT NULL,
      min_price REAL NOT NULL,
      modal_price REAL NOT NULL,
      max_price REAL NOT NULL,
      arrival_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      source TEXT NOT NULL,
      source_timestamp TEXT NOT NULL,
      is_today INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (market_id) REFERENCES markets(market_id),
      FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      language TEXT NOT NULL DEFAULT 'en',
      location TEXT,
      preferred_units TEXT DEFAULT 'quintal',
      updated_at TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop TEXT NOT NULL,
      location TEXT,
      quantity REAL,
      unit TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      records_synced INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS advisories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id TEXT DEFAULT 'default_farmer',
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      crop TEXT,
      soil_type TEXT,
      season TEXT,
      language TEXT DEFAULT 'en',
      advisory_json TEXT NOT NULL,
      ndvi_score REAL,
      created_at TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS disease_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id TEXT DEFAULT 'default_farmer',
      crop_identified TEXT,
      disease_name TEXT,
      severity TEXT,
      confidence REAL,
      overall_health TEXT,
      diagnosis_json TEXT NOT NULL,
      image_name TEXT,
      language TEXT DEFAULT 'en',
      created_at TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS farmer_fields (
      field_id TEXT PRIMARY KEY,
      farmer_id TEXT DEFAULT 'default_farmer',
      field_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      area_hectares REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      soil_type TEXT,
      current_crop TEXT,
      ndvi_latest REAL,
      ndvi_health TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Performance Indexes
  await run(`CREATE INDEX IF NOT EXISTS idx_records_commodity_today ON price_records (commodity_id, is_today);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_records_market_history ON price_records (commodity_id, market_id, arrival_date);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_markets_location ON markets (district, state);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fields_farmer ON farmer_fields (farmer_id);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_advisories_farmer ON advisories (farmer_id, created_at);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_disease_farmer ON disease_reports (farmer_id, created_at);`);

  // Check if initial seeding is needed
  const recordCount = await get("SELECT COUNT(*) as cnt FROM price_records;");
  if (recordCount.cnt === 0) {
    console.log("🌾 Seeding initial verified dataset into SQLite database...");
    const jsonPath = path.join(__dirname, '../data/verified_markets.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Seed markets
      for (const m of data.markets) {
        await run(`
          INSERT OR REPLACE INTO markets (market_id, market_name, district, state, latitude, longitude, pin)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [m.market_id, m.market_name, m.district, m.state, m.lat, m.lon, m.pin]);
      }

      // Seed commodities
      for (const c of data.commodities) {
        await run(`
          INSERT OR REPLACE INTO commodities (commodity_id, name, name_hi, name_kn, category, unit, icon, varieties_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [c.commodity_id, c.name, c.localNames.hi, c.localNames.kn, c.category, c.unit, c.icon, JSON.stringify(c.varieties)]);
      }

      // Bulk insert price records in chunks using a transaction
      await run("BEGIN TRANSACTION;");
      const stmt = db.prepare(`
        INSERT INTO price_records (
          record_id, market_id, commodity_id, variety, grade, arrival_date,
          min_price, modal_price, max_price, arrival_quantity, unit,
          source, source_timestamp, is_today
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const r of data.price_records) {
        stmt.run([
          r.record_id, r.market_id, r.commodity_id, r.variety, r.grade, r.arrival_date,
          r.min_price, r.modal_price, r.max_price, r.arrival_quantity, r.unit,
          r.source, r.source_timestamp, r.is_today ? 1 : 0
        ]);
      }

      await new Promise((resolve, reject) => {
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await run("COMMIT;");

      await run(`
        INSERT INTO sync_logs (source, records_synced, timestamp, status)
        VALUES (?, ?, ?, ?)
      `, ["Agmarknet Verified Base Ingestion", data.price_records.length, new Date().toISOString(), "SUCCESS"]);

      console.log(`🌾 Successfully seeded ${data.price_records.length} records into SQLite database!`);
    }
  }

  // Seed demo farmer fields if table is empty
  const fieldCount = await get("SELECT COUNT(*) as cnt FROM farmer_fields;");
  if (fieldCount && fieldCount.cnt === 0) {
    const demoFields = [
      { id: 'field_01', name: 'Ballari North Plot #204', state: 'Karnataka', district: 'Ballari', area: 2.0, lat: 15.14, lon: 76.92, soil: 'Loamy', crop: 'Tomato', ndvi: 0.62, health: 'Excellent' },
      { id: 'field_02', name: 'Nashik Valley Vineyard #12', state: 'Maharashtra', district: 'Nashik', area: 3.5, lat: 19.99, lon: 73.79, soil: 'Black Cotton', crop: 'Onion', ndvi: 0.58, health: 'Good' },
      { id: 'field_03', name: 'Ludhiana Central Grains #05', state: 'Punjab', district: 'Ludhiana', area: 5.0, lat: 30.90, lon: 75.85, soil: 'Alluvial', crop: 'Wheat', ndvi: 0.71, health: 'Excellent' }
    ];
    for (const f of demoFields) {
      await run(`
        INSERT OR REPLACE INTO farmer_fields (field_id, farmer_id, field_name, state, district, area_hectares, latitude, longitude, soil_type, current_crop, ndvi_latest, ndvi_health, created_at)
        VALUES (?, 'default_farmer', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [f.id, f.name, f.state, f.district, f.area, f.lat, f.lon, f.soil, f.crop, f.ndvi, f.health, new Date().toISOString()]);
    }
    console.log("🌾 Initialized demo farmer fields in SQLite.");
  }
}

export default {
  query,
  get,
  run,
  initDb
};
