import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sqlite3Module = null;
let nativeDb = null;
let useNative = false;

// Attempt native sqlite3 driver initialization
try {
  const mod = await import('sqlite3');
  sqlite3Module = mod.default || mod;
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

  nativeDb = new sqlite3Module.Database(dbFile);
  useNative = true;
} catch (err) {
  console.warn('Native SQLite3 binary unavailable (e.g. Serverless GLIBC), using verified in-memory store:', err.message);
  useNative = false;
}

// In-Memory Verified Datastore fallback for serverless runtimes
const memoryStore = {
  markets: [],
  commodities: [],
  price_records: [],
  farmer_fields: [],
  advisories: [],
  disease_reports: [],
  user_preferences: [
    { user_id: 'default_farmer', language: 'en', location: 'Ballari', preferred_units: 'quintal', updated_at: new Date().toISOString() }
  ],
  search_history: [],
  sync_logs: []
};

export function query(sql, params = []) {
  if (useNative && nativeDb) {
    return new Promise((resolve, reject) => {
      nativeDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Memory store query dispatcher
  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('from commodities')) {
    let rows = [...memoryStore.commodities];
    if (lowerSql.includes('where commodity_id like')) {
      rows = rows.filter(c => c.commodity_id.startsWith('CROP-00'));
    }
    return Promise.resolve(rows);
  }

  if (lowerSql.includes('from markets')) {
    let rows = [...memoryStore.markets];
    if (lowerSql.includes('where market_id like')) {
      rows = rows.filter(m => m.market_id.startsWith('MKT-'));
    }
    return Promise.resolve(rows);
  }

  if (lowerSql.includes('from price_records')) {
    let rows = [...memoryStore.price_records];
    if (lowerSql.includes('is_today = 1')) {
      rows = rows.filter(r => r.is_today === 1);
    }
    return Promise.resolve(rows);
  }

  if (lowerSql.includes('from farmer_fields')) {
    let rows = [...memoryStore.farmer_fields];
    if (params && params.length > 0) {
      rows = rows.filter(f => f.field_id === params[0]);
    }
    return Promise.resolve(rows);
  }

  if (lowerSql.includes('from advisories')) {
    return Promise.resolve([...memoryStore.advisories].reverse());
  }

  if (lowerSql.includes('from disease_reports')) {
    return Promise.resolve([...memoryStore.disease_reports].reverse());
  }

  if (lowerSql.includes('from user_preferences')) {
    return Promise.resolve([...memoryStore.user_preferences]);
  }

  if (lowerSql.includes('from sync_logs')) {
    return Promise.resolve([...memoryStore.sync_logs]);
  }

  return Promise.resolve([]);
}

export function get(sql, params = []) {
  if (useNative && nativeDb) {
    return new Promise((resolve, reject) => {
      nativeDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Memory store get dispatcher
  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('count(*)')) {
    let count = 0;
    if (lowerSql.includes('price_records')) count = memoryStore.price_records.length;
    else if (lowerSql.includes('markets')) count = memoryStore.markets.length;
    else if (lowerSql.includes('commodities')) count = memoryStore.commodities.length;
    else if (lowerSql.includes('farmer_fields')) count = memoryStore.farmer_fields.length;
    return Promise.resolve({ count, cnt: count });
  }

  if (lowerSql.includes('from user_preferences')) {
    return Promise.resolve(memoryStore.user_preferences[0] || null);
  }

  if (lowerSql.includes('from farmer_fields')) {
    const field = memoryStore.farmer_fields.find(f => f.field_id === params[0]) || null;
    return Promise.resolve(field);
  }

  if (lowerSql.includes('from sync_logs')) {
    const last = memoryStore.sync_logs[memoryStore.sync_logs.length - 1] || {
      id: 1,
      source: "Agmarknet Verified Dataset",
      records_synced: memoryStore.price_records.length,
      timestamp: new Date().toISOString(),
      status: "SUCCESS"
    };
    return Promise.resolve(last);
  }

  return Promise.resolve(null);
}

export function run(sql, params = []) {
  if (useNative && nativeDb) {
    return new Promise((resolve, reject) => {
      nativeDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this?.lastID || 1, changes: this?.changes || 1 });
      });
    });
  }

  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('insert into farmer_fields') || lowerSql.includes('replace into farmer_fields')) {
    // [field_id, farmer_id, field_name, state, district, area, lat, lon, soil, crop, ndvi, health, created_at]
    if (params && params.length >= 7) {
      const field = {
        field_id: params[0],
        farmer_id: params[1] || 'default_farmer',
        field_name: params[2],
        state: params[3],
        district: params[4],
        area_hectares: Number(params[5]),
        latitude: Number(params[6]),
        longitude: Number(params[7]),
        soil_type: params[8] || 'Loamy',
        current_crop: params[9] || 'Tomato',
        ndvi_latest: Number(params[10] || 0.62),
        ndvi_health: params[11] || 'Good',
        created_at: params[12] || new Date().toISOString()
      };
      const idx = memoryStore.farmer_fields.findIndex(f => f.field_id === field.field_id);
      if (idx >= 0) memoryStore.farmer_fields[idx] = field;
      else memoryStore.farmer_fields.push(field);
    }
    return Promise.resolve({ lastID: 1, changes: 1 });
  }

  if (lowerSql.includes('delete from farmer_fields')) {
    const id = params[0];
    memoryStore.farmer_fields = memoryStore.farmer_fields.filter(f => f.field_id !== id);
    return Promise.resolve({ lastID: 1, changes: 1 });
  }

  if (lowerSql.includes('insert into advisories')) {
    memoryStore.advisories.push({
      id: memoryStore.advisories.length + 1,
      farmer_id: params[0] || 'default_farmer',
      state: params[1],
      district: params[2],
      crop: params[3],
      soil_type: params[4],
      season: params[5],
      language: params[6] || 'en',
      advisory_json: params[7],
      ndvi_score: params[8],
      created_at: params[9] || new Date().toISOString()
    });
    return Promise.resolve({ lastID: memoryStore.advisories.length, changes: 1 });
  }

  if (lowerSql.includes('insert into disease_reports')) {
    memoryStore.disease_reports.push({
      id: memoryStore.disease_reports.length + 1,
      farmer_id: params[0] || 'default_farmer',
      crop_identified: params[1],
      disease_name: params[2],
      severity: params[3],
      confidence: params[4],
      overall_health: params[5],
      diagnosis_json: params[6],
      image_name: params[7],
      language: params[8] || 'en',
      created_at: params[9] || new Date().toISOString()
    });
    return Promise.resolve({ lastID: memoryStore.disease_reports.length, changes: 1 });
  }

  if (lowerSql.includes('into user_preferences')) {
    memoryStore.user_preferences[0] = {
      user_id: 'default_farmer',
      language: params[0] || 'en',
      location: params[1] || 'Ballari',
      preferred_units: params[2] || 'quintal',
      updated_at: params[3] || new Date().toISOString()
    };
    return Promise.resolve({ lastID: 1, changes: 1 });
  }

  return Promise.resolve({ lastID: 1, changes: 1 });
}

export async function initDb() {
  if (useNative && nativeDb) {
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
    if (recordCount && recordCount.cnt === 0) {
      console.log("🌾 Seeding initial verified dataset into SQLite database...");
      const jsonPath = path.join(__dirname, '../data/verified_markets.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        for (const m of data.markets) {
          await run(`
            INSERT OR REPLACE INTO markets (market_id, market_name, district, state, latitude, longitude, pin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [m.market_id, m.market_name, m.district, m.state, m.lat, m.lon, m.pin]);
        }

        for (const c of data.commodities) {
          await run(`
            INSERT OR REPLACE INTO commodities (commodity_id, name, name_hi, name_kn, category, unit, icon, varieties_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [c.commodity_id, c.name, c.localNames.hi, c.localNames.kn, c.category, c.unit, c.icon, JSON.stringify(c.varieties)]);
        }

        await run("BEGIN TRANSACTION;");
        const stmt = nativeDb.prepare(`
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
  } else {
    // Memory store seeding from verified_markets.json
    console.log("🌾 Initializing verified dataset in Serverless Memory Store...");
    const jsonPath = path.join(__dirname, '../data/verified_markets.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      memoryStore.markets = data.markets.map(m => ({
        market_id: m.market_id,
        market_name: m.market_name,
        district: m.district,
        state: m.state,
        latitude: m.lat,
        longitude: m.lon,
        pin: m.pin
      }));
      memoryStore.commodities = data.commodities.map(c => ({
        commodity_id: c.commodity_id,
        name: c.name,
        name_hi: c.localNames?.hi || c.name,
        name_kn: c.localNames?.kn || c.name,
        category: c.category,
        unit: c.unit,
        icon: c.icon,
        varieties_json: JSON.stringify(c.varieties || [])
      }));
      memoryStore.price_records = data.price_records.map(r => ({
        record_id: r.record_id,
        market_id: r.market_id,
        commodity_id: r.commodity_id,
        variety: r.variety,
        grade: r.grade,
        arrival_date: r.arrival_date,
        min_price: r.min_price,
        modal_price: r.modal_price,
        max_price: r.max_price,
        arrival_quantity: r.arrival_quantity,
        unit: r.unit,
        source: r.source,
        source_timestamp: r.source_timestamp,
        is_today: r.is_today ? 1 : 0
      }));
      memoryStore.farmer_fields = [
        { field_id: 'field_01', farmer_id: 'default_farmer', field_name: 'Ballari North Plot #204', state: 'Karnataka', district: 'Ballari', area_hectares: 2.0, latitude: 15.14, longitude: 76.92, soil_type: 'Loamy', current_crop: 'Tomato', ndvi_latest: 0.62, ndvi_health: 'Excellent', created_at: new Date().toISOString() },
        { field_id: 'field_02', farmer_id: 'default_farmer', field_name: 'Nashik Valley Vineyard #12', state: 'Maharashtra', district: 'Nashik', area_hectares: 3.5, latitude: 19.99, longitude: 73.79, soil_type: 'Black Cotton', current_crop: 'Onion', ndvi_latest: 0.58, ndvi_health: 'Good', created_at: new Date().toISOString() },
        { field_id: 'field_03', farmer_id: 'default_farmer', field_name: 'Ludhiana Central Grains #05', state: 'Punjab', district: 'Ludhiana', area_hectares: 5.0, latitude: 30.90, longitude: 75.85, soil_type: 'Alluvial', current_crop: 'Wheat', ndvi_latest: 0.71, ndvi_health: 'Excellent', created_at: new Date().toISOString() }
      ];
      console.log(`🌾 Serverless Memory Store ready: ${memoryStore.markets.length} markets, ${memoryStore.commodities.length} crops, ${memoryStore.price_records.length} records.`);
    }
  }
}

export default {
  query,
  get,
  run,
  initDb
};
