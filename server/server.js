import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust .env loader: checks both root (outside itself) and server directories
const rootEnvPath = path.resolve(__dirname, '../.env');
const serverEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logging for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount MandiMate API routes
app.use('/api', apiRouter);

// Serve static frontend build if available
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Fallback root endpoint
  app.get('/', (req, res) => {
    res.json({
      app: "AgriMate API Service",
      version: "1.0.0",
      docs: "/api/health",
      principle: "AgriMate must never invent a market price. Numerical information originates from verified external data sources."
    });
  });
}

// Global error handling middleware - prevents server from crashing on route errors
app.use((err, req, res, next) => {
  console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
});

// Process safety: prevent server from ever exiting on unexpected async errors
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception caught safely:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled promise rejection caught safely:', reason);
});

import db from './database/db.js';
import { refreshCache } from './services/marketService.js';
import { syncMarketData } from './services/syncService.js';

// Initialize SQLite database and warm cache
async function startServer() {
  try {
    console.log("[Firebase] Initializing KisanSathi Cloud Firestore database...");
    await db.initDb();
    await refreshCache();
    console.log("[Firebase] KisanSathi Cloud Firestore database ready and verified.");

    // Initial Live Sync with Data.gov.in on startup
    syncMarketData()
      .then(res => console.log(`[MandiSync] Initial live mandi sync complete: ${res.records_synced} records (${res.live_records || 0} live Data.gov.in)`))
      .catch(err => console.warn("[MandiSync] Initial live sync notice:", err.message));

    // Recurring 30-minute live sync for continuous fresh mandi rate updates
    const SYNC_INTERVAL_MS = 30 * 60 * 1000;
    setInterval(() => {
      console.log("[Auto-Sync] Scheduled 30-min live mandi rate update running...");
      syncMarketData()
        .then(res => console.log(`[Auto-Sync] Complete: ${res.records_synced} records (${res.live_records || 0} live Data.gov.in)`))
        .catch(err => console.warn("[Auto-Sync Notice] Background sync failed:", err.message));
    }, SYNC_INTERVAL_MS);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[AgriMate] Full-stack service running on http://localhost:${PORT}`);
      console.log(`[AgriMate] Also accessible on http://127.0.0.1:${PORT}`);
      console.log(`[AgriMate] Verified agricultural intelligence ready.`);
    });
  } catch (err) {
    console.error("Failed to start AgriMate service:", err);
    process.exit(1);
  }
}

startServer();
