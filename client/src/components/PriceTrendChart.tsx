import React, { useState, useEffect, useRef } from 'react';
import type { PriceTrend, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface PriceTrendChartProps {
  crop: string;
  marketId: string;
  marketName: string;
  language: Language;
}

/** Build a smooth SVG path from points using cubic bezier control points */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  crop,
  marketId,
  marketName,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [days, setDays] = useState<number>(7);
  const [trendData, setTrendData] = useState<PriceTrend | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrend() {
      setIsLoading(true);
      try {
        const res = await fetch(apiUrl(`/trends?crop=${encodeURIComponent(crop)}&market_id=${encodeURIComponent(marketId)}&days=${days}`));
        const data = await res.json();
        if (isMounted && data.success) setTrendData(data);
      } catch (err) {
        console.error('Error fetching price trends', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    if (crop && marketId) fetchTrend();
    return () => { isMounted = false; };
  }, [crop, marketId, days]);

  if (!trendData || !trendData.has_data) {
    return (
      <div className="rounded-2xl border border-white/[0.08] p-8 text-center bg-[#0F0F12]/90 backdrop-blur-xl">
        <BarChart2 className="w-8 h-8 mx-auto text-zinc-600 mb-2" strokeWidth={1.5} />
        <p className="text-xs font-mono text-zinc-500">No historical data available for this market.</p>
      </div>
    );
  }

  const { symbol, direction, percent_change, price_change, average_price, highest_price, lowest_price, descriptive_statement, history } = trendData;

  // Chart geometry
  const W = 600, H = 200, PX = 48, PY = 24;
  const minP = Math.min(...history.map(h => h.modal_price));
  const maxP = Math.max(...history.map(h => h.modal_price));
  const span = Math.max(1, maxP - minP);

  const pts = history.map((item, idx) => ({
    x: PX + (idx / Math.max(1, history.length - 1)) * (W - PX * 2),
    y: PY + (1 - (item.modal_price - minP) / span) * (H - PY * 2),
    item,
  }));

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PY} L ${pts[0].x} ${H - PY} Z`;

  const isUp = direction === 'increasing';
  const isDown = direction === 'decreasing';
  const hovered = hoveredIdx !== null ? pts[hoveredIdx] : null;

  // 3 evenly-spaced Y-axis labels
  const yLabels = [maxP, Math.round((maxP + minP) / 2), minP];

  return (
    <div className="rounded-3xl border border-[#E5EAD7] overflow-hidden bg-white shadow-[0_4px_24px_rgba(2,33,19,0.04)] font-['Open_Sans',sans-serif]">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#E5EAD7]">
        <div>
          <h3 className="text-base font-bold text-[#022113] tracking-tight font-['Montserrat',sans-serif]">
            {t.trendsTitle}
          </h3>
          <p className="text-xs font-mono text-[#59701E] mt-0.5">
            {crop} · {marketName}
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-[#F0F4EC] border border-[#E5EAD7] p-1 rounded-full">
          {[7, 15, 30].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3.5 py-1 text-xs font-['Montserrat',sans-serif] rounded-full transition-all cursor-pointer ${
                days === d
                  ? 'bg-[#546C18] text-[#DFEB38] font-bold shadow-xs'
                  : 'text-[#59701E] hover:text-[#546C18]'
              }`}
            >
              {d === 7 ? t.period7Days : d === 15 ? t.period15Days : t.period30Days}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Trend summary row ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isUp ? 'bg-emerald-50 border border-emerald-200' : isDown ? 'bg-rose-50 border border-rose-200' : 'bg-[#F0F4EC] border border-[#E5EAD7]'
            }`}>
              {isUp
                ? <TrendingUp className="w-5 h-5 text-emerald-700" strokeWidth={2} />
                : isDown
                  ? <TrendingDown className="w-5 h-5 text-rose-700" strokeWidth={2} />
                  : <Minus className="w-5 h-5 text-[#59701E]" strokeWidth={2} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#022113] font-['Montserrat',sans-serif]">
                  {symbol} {isUp ? 'Increasing' : isDown ? 'Decreasing' : 'Stable'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-['Montserrat',sans-serif] ${
                  isUp ? 'bg-[#DFEB38] text-[#022113]' : isDown ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-[#F0F4EC] text-[#59701E] border border-[#E5EAD7]'
                }`}>
                  {percent_change > 0 ? `+${percent_change}%` : `${percent_change}%`}
                </span>
              </div>
              <p className="text-xs text-[#59701E] mt-0.5 leading-snug">{descriptive_statement}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className={`text-base font-bold font-['Montserrat',sans-serif] ${price_change >= 0 ? 'text-[#59701E]' : 'text-rose-700'}`}>
              {price_change > 0 ? `+₹${price_change}` : `-₹${Math.abs(price_change)}`}
            </div>
            <div className="text-[10px] text-[#718096] font-medium">{days}d net shift</div>
          </div>
        </div>

        {/* ── 3 stat pills ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t.periodAvg, value: average_price, color: 'text-[#022113]' },
            { label: t.periodHigh, value: highest_price, color: 'text-[#59701E]' },
            { label: t.periodLow,  value: lowest_price,  color: 'text-rose-700'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="border border-[#E5EAD7] rounded-2xl px-3.5 py-3 bg-[#F8FAF6] text-center">
              <div className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider text-[#59701E] mb-1">{label}</div>
              <div className={`text-sm font-bold font-['Montserrat',sans-serif] ${color}`}>₹{value.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        {/* ── SVG Chart ── */}
        <div className="relative rounded-2xl bg-[#F8FAF6] border border-[#E5EAD7] overflow-hidden p-2">
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center text-xs font-mono text-[#59701E] animate-pulse">
              Loading historical telemetry…
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 180 }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#59701E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#DFEB38" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Horizontal grid */}
              {yLabels.map((label, i) => {
                const gy = PY + (i / 2) * (H - PY * 2);
                return (
                  <g key={i}>
                    <line x1={PX} y1={gy} x2={W - PX} y2={gy}
                      stroke="#E5EAD7" strokeWidth="1" strokeDasharray={i === 2 ? '0' : '3 4'} />
                    <text x={PX - 6} y={gy + 4} textAnchor="end"
                      style={{ fontSize: 9, fill: '#59701E', fontFamily: 'monospace' }}>
                      ₹{label.toLocaleString('en-IN')}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaFill)" />

              {/* Smooth line */}
              <path d={linePath} fill="none" stroke="#59701E" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />

              {/* Hover line */}
              {hovered && (
                <line x1={hovered.x} y1={PY} x2={hovered.x} y2={H - PY}
                  stroke="#59701E" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              )}

              {/* Data points — invisible wide hit areas + visible dots */}
              {pts.map((pt, i) => (
                <g key={i} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
                  {/* Wide invisible hit area */}
                  <rect x={pt.x - 14} y={PY} width={28} height={H - PY * 2} fill="transparent" />
                  <circle cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 5 : 3.5}
                    fill={hoveredIdx === i ? "#DFEB38" : "#59701E"} stroke="#022113" strokeWidth="1.5"
                    style={{ transition: 'r 0.1s' }} />
                </g>
              ))}

              {/* X-axis date labels */}
              <text x={pts[0].x} y={H - 6} textAnchor="middle"
                style={{ fontSize: 9, fill: '#718096', fontFamily: 'monospace' }}>
                {pts[0].item.date.slice(5)}
              </text>
              <text x={pts[pts.length - 1].x} y={H - 6} textAnchor="middle"
                style={{ fontSize: 9, fill: '#022113', fontFamily: 'monospace', fontWeight: 600 }}>
                {pts[pts.length - 1].item.date.slice(5)}
              </text>
            </svg>
          )}

          {/* Floating tooltip */}
          {hovered && !isLoading && (
            <div className="absolute top-3 right-3 bg-[#546C18] border border-[#546C18] text-white text-[11px] font-mono px-3.5 py-2 rounded-xl shadow-xl pointer-events-none leading-snug">
              <div className="text-[#DFEB38] font-bold">{hovered.item.date}</div>
              <div>₹{hovered.item.modal_price.toLocaleString('en-IN')}/q</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PriceTrendChart;
