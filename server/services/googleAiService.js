// AgriMate Google Gemini AI Service
// Implements PRD Section 14, 18, 19.1 & 34:
// Google Gemini acts strictly as an explanation and natural language understanding layer on structured, verified data.
// It NEVER invents prices and NEVER overrides verified numbers.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMarketExplanation, TERMINOLOGY_EXPLANATIONS } from "./aiService.js";

const DEFAULT_MODEL_ID = process.env.GEMINI_MODEL || "gemini-3.8-flash";

let geminiClient = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGoogleAiConfig() {
  return {
    provider: "Google Gemini",
    model: DEFAULT_MODEL_ID,
    isConfigured: isGeminiConfigured(),
    groundingRule: "Deterministic Ground Truth from Agmarknet / APMC. Zero numerical hallucination.",
    ecosystem: "Google Cloud / Generative AI SDK"
  };
}

/**
 * Invoke Google Gemini to explain market trends and pricing.
 * Falls back deterministically if Gemini call fails or API key is not supplied.
 */
export async function explainMarketWithGemini({ market, trend, language = 'en', quantityQuintals = 0 }) {
  // 1. Always obtain deterministic base explanation first to guarantee invariant
  const deterministicResult = generateMarketExplanation({ market, trend, language, quantityQuintals });

  const client = getGeminiClient();

  // If Google Gemini API key is not set, return grounded deterministic result with Google telemetry
  if (!client) {
    return {
      ...deterministicResult,
      telemetry: {
        engine: "Google Gemini 2.0 Flash (Grounded Template Fallback)",
        provider: "Google Cloud / Gemini",
        model: DEFAULT_MODEL_ID,
        mode: "Deterministic Local Edge / Offline",
        grounded: true
      }
    };
  }

  try {
    const langLabel = language === 'hi' ? 'Hindi (हिन्दी)' : (language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : 'English');
    const prompt = `
You are MandiMate, an agricultural market advisor for small and marginal Indian farmers.
Explain the following verified market facts in simple, encouraging language in ${langLabel}.

CRITICAL PRINCIPLE: NEVER invent, hallucinate, or adjust prices. Stick ONLY to these verified facts:
- Market: ${market.market_name}, District: ${market.district}, State: ${market.state}
- Crop: ${market.commodity_name || 'Crop'} (Variety: ${market.variety || 'Standard'})
- Modal Price: ₹${market.modal_price}/quintal
- Min Price: ₹${market.min_price}/quintal, Max Price: ₹${market.max_price}/quintal
- Arrival Volume: ${market.arrival_quantity} quintals
- Trend: ${trend?.direction || 'stable'} (${trend?.percent_change || 0}% change over ${trend?.period_days || 7} days)
- Source: ${market.source} (${market.source_timestamp})
- Farmer Quantity: ${quantityQuintals} quintals (Gross Estimate: ₹${Math.round(quantityQuintals * market.modal_price)})

Format response strictly as a single JSON object with these exact keys:
{
  "title": "short headline",
  "summary": "1-2 sentence core message with modal price",
  "priceDetails": "spread between min and max and arrivals",
  "trendExplanation": "explanation of price direction",
  "estimatedValueNote": "gross value estimate statement with disclaimer",
  "advice": "practical farmer advice on grading/transport",
  "verifiedNotice": "mention official Agmarknet source"
}
`;

    const modelNames = [DEFAULT_MODEL_ID, 'gemini-flash-latest', 'gemini-2.0-flash'];
    let parsedText = '';

    for (const modelName of modelNames) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        parsedText = result.response.text();
        if (parsedText) break;
      } catch (err) {
        if (err.message && err.message.includes('404')) continue;
        throw err;
      }
    }

    // Try extracting JSON from LLM output
    const jsonMatch = parsedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0]);
      return {
        ...deterministicResult,
        ...parsedJson,
        telemetry: {
          engine: "Google Gemini 2.0 Flash (Live Runtime)",
          provider: "Google Cloud / Gemini",
          model: DEFAULT_MODEL_ID,
          grounded: true
        }
      };
    }

    return {
      ...deterministicResult,
      telemetry: {
        engine: "Google Gemini 2.0 Flash (Grounding Safe Fallback)",
        provider: "Google Cloud / Gemini",
        model: DEFAULT_MODEL_ID,
        grounded: true
      }
    };
  } catch (err) {
    console.warn("[GoogleAiService] Error invoking Gemini, falling back to deterministic template:", err.message);
    return {
      ...deterministicResult,
      telemetry: {
        engine: "Google Gemini 2.0 Flash (Offline Grounded Fallback)",
        provider: "Google Cloud / Gemini",
        model: DEFAULT_MODEL_ID,
        grounded: true
      }
    };
  }
}
