import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api.js';
import db from '../server/database/db.js';
import { refreshCache } from '../server/services/marketService.js';

const app = express();

app.use(cors());
app.use(express.json());

let isInitialized = false;
let initPromise = null;

async function ensureInitialized() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await db.initDb();
        await refreshCache();
        isInitialized = true;
      } catch (err) {
        console.warn('Vercel DB initialization warning:', err.message);
      }
    })();
  }
  return initPromise;
}

// Ensure DB and cache are warm for API requests
app.use(async (req, res, next) => {
  await ensureInitialized();
  next();
});

// Mount router on both '/api' and '/' to seamlessly handle any Vercel URL rewrite variation
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
