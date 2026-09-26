export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr' | 'bn' | 'gu' | 'pa' | 'ml';

export type CropUnit = 'kg' | 'quintal' | 'tonne';

export interface Commodity {
  commodity_id: string;
  name: string;
  localNames: {
    hi: string;
    kn: string;
  };
  varieties: string[];
  basePrice: number;
  priceSpread: number;
  typicalArrival: number;
  unit: string;
  category: string;
  icon: string;
}

export interface MarketItem {
  market_id: string;
  market_name: string;
  district: string;
  state: string;
  commodity_id?: string;
  commodity_name?: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  price_spread: number;
  arrival_quantity: number;
  unit: string;
  source: string;
  source_timestamp: string;
  freshness: string;
  distance_km: number | null;
  estimated_gross_value: number;
  calculator_formula: string | null;
}

export interface SearchResult {
  success: boolean;
  verified: boolean;
  message?: string;
  error?: string;
  commodity?: Commodity;
  normalized_quantity?: {
    input_value: number;
    input_unit: string;
    in_quintals: number;
    in_kg: number;
    in_tonnes: number;
  };
  user_location?: {
    query: string;
    resolved_lat: number | null;
    resolved_lon: number | null;
  };
  disclaimer?: string;
  markets: MarketItem[];
  cached_at?: string;
}

export interface TrendHistoryItem {
  date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity: number;
}

export interface PriceTrend {
  success: boolean;
  has_data: boolean;
  commodity: string;
  market_name: string;
  period_days: number;
  start_date: string;
  end_date: string;
  start_price: number;
  latest_price: number;
  price_change: number;
  percent_change: number;
  highest_price: number;
  lowest_price: number;
  average_price: number;
  direction: 'increasing' | 'stable' | 'decreasing';
  symbol: '↑' | '→' | '↓';
  status_text: string;
  accessible_label: string;
  descriptive_statement: string;
  history: TrendHistoryItem[];
}

export interface AiExplanationData {
  language: Language;
  title: string;
  summary: string;
  priceDetails: string;
  trendExplanation: string;
  estimatedValueNote: string;
  advice: string;
  verifiedNotice: string;
}

export interface ChecklistStep {
  id: number;
  category: string;
  title: string;
  desc: string;
  important: boolean;
}

export interface SellingChecklistData {
  title: string;
  language: Language;
  steps: ChecklistStep[];
}

export interface SyncStatusData {
  success: boolean;
  last_sync?: {
    id: number;
    source: string;
    records_synced: number;
    timestamp: string;
    status: string;
  };
  today_active_quotes?: number;
  total_verified_records: number;
  api_connected?: boolean;
}

export interface UserPreferences {
  user_id?: string;
  language: Language;
  location: string;
  preferred_units: CropUnit;
}

export interface WeatherCurrent {
  temperature: number;
  apparent_temperature: number;
  condition: string;
  icon: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  dew_point: number;
  pressure: number;
  pressure_trend: string;
  visibility_km: number;
  visibility_status: string;
  wind_speed: number;
  wind_direction: number;
  wind_direction_text: string;
  wind_cardinal?: string;
  wind_gust: number;
  wind_force: string;
  uv_index: number;
  uv_status: string;
  aqi: number;
  aqi_status: string;
  sunrise: string;
  sunset: string;
  sun_hours: string;
  updated_at: string;
}

export interface WeatherDayForecast {
  date: string;
  day_name: string;
  temp_max: number;
  temp_min: number;
  precip_prob: number;
  weather_code?: number;
  condition: string;
  icon: string;
  wind_speed?: number;
  wind_gust?: number;
  wind_direction?: number;
  wind_cardinal?: string;
  wind_force?: string;
  pressure?: number;
  pressure_trend?: string;
  humidity?: number;
  dew_point?: number;
  visibility_km?: number;
  visibility_status?: string;
  aqi?: number;
  aqi_status?: string;
  uv_index?: number;
  uv_status?: string;
  sunrise?: string;
  sunset?: string;
  sun_hours?: string;
  hourly_trend?: WeatherHourlyItem[];
  agri_advisory?: WeatherAgriAdvisory;
}

export interface WeatherHourlyItem {
  time_label: string;
  temp: number;
  precip_prob: number;
}

export interface WeatherAgriAdvisory {
  spraying?: string;
  irrigation?: string;
  harvesting?: string;
  spraying_window?: string;
  heat_stress_risk?: string;
  fungal_risk?: string;
  irrigation_need?: string;
  [key: string]: any;
}

export interface WeatherData {
  summary: string;
  rainfall: string;
  source: string;
  is_live: boolean;
  coords: { lat: number; lon: number };
  location_name: string;
  current: WeatherCurrent;
  forecast_7day: WeatherDayForecast[];
  hourly_trend: WeatherHourlyItem[];
  agri_advisory: WeatherAgriAdvisory;
}

export type NavigationPage = 
  | 'home' 
  | 'satellite' 
  | 'advisory' 
  | 'diagnose' 
  | 'gov' 
  | 'weather' 
  | 'dashboard' 
  | 'about' 
  | 'contact';

// ── Crop Advisory ──────────────────────────────────
export interface CropRecommendation {
  crop: string;
  variety: string;
  suitability_score: number;
  reason: string;
  water_need: 'low' | 'medium' | 'high';
  expected_yield_qtl_per_ha: number;
  regenerative_score: string;
  market_price_inr_per_qtl: number;
  icon: string;
}

export interface FarmingCalendarItem {
  milestone: string;
  days_from_now: number;
  action: string;
  icon: string;
}

export interface AdvisoryResult {
  crop_recommendations: CropRecommendation[];
  current_field_assessment: string;
  irrigation_advice: string;
  pest_disease_warning: string;
  farming_calendar: FarmingCalendarItem[];
  weather_summary: string;
  ndvi_score: number;
}

// ── Disease Diagnosis ──────────────────────────────
export interface DiseaseDiagnosis {
  disease_name: string;
  disease_name_en: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  affected_part: string;
  description: string;
  organic_treatment: string[];
  chemical_treatment: { product: string; dosage: string; frequency: string; };
  prevention: string[];
}

export interface DiagnosisResult {
  crop_identified: string;
  overall_health: 'healthy' | 'stressed' | 'diseased';
  diagnoses: DiseaseDiagnosis[];
  should_escalate_to_expert: boolean;
  urgency: 'immediate' | 'within_3_days' | 'monitor';
  additional_notes: string;
}

// ── Satellite NDVI ─────────────────────────────────
export interface NDVITimeseriesItem {
  date: string;
  ndvi: number;
}

export interface NDVIResult {
  ndvi_mean: number;
  ndvi_min: number;
  ndvi_max: number;
  health_status: string;
  health_color: string;
  source: string;
  last_updated: string;
  cloud_coverage_pct: number;
  timeseries: NDVITimeseriesItem[];
}
