import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Initialize SQLite database and warm cache
async function startServer() {
  try {
    console.log("🌾 Initializing AgriMate SQLite database...");
    await db.initDb();
    await refreshCache();
    console.log("🌾 AgriMate SQLite database ready and verified.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌾 AgriMate full-stack service running on http://localhost:${PORT}`);
      console.log(`🌾 Also accessible on http://127.0.0.1:${PORT}`);
      console.log(`🌾 Verified agricultural intelligence ready.`);
    });
  } catch (err) {
    console.error("Failed to start AgriMate service:", err);
    process.exit(1);
  }
}

startServer();
