import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Activity,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface BitcoinMarketData {
  currentPrice: {
    usd: number;
    inr: number;
    eur: number;
    gbp: number;
  };
  change24h: {
    percent: number;
    amountUsd: number;
    isPositive: boolean;
  };
  range24h: {
    high: number;
    low: number;
  };
  networkStats: {
    marketCapUsd: number;
    volume24hUsd: number;
    btcDominance: number;
    satsPerDollar: number;
    hashrateEH: number;
    avgFeeSatVb: number;
    blockHeight: number;
    nextHalvingBlock: number;
    blocksUntilHalving: number;
  };
  charts: {
    "24H": { time: string; price: number; volume: number }[];
    "7D": { time: string; price: number; volume: number }[];
    "1M": { time: string; price: number; volume: number }[];
    "1Y": { time: string; price: number; volume: number }[];
  };
  lastUpdated: string;
}

type TimeFrame = "24H" | "7D" | "1M" | "1Y";
type Currency = "USD" | "INR" | "EUR";

export default function BitcoinMarketCard() {
  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>("24H");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMarketData = async () => {
    try {
      const res = await fetch("/api/bitcoin/market");
      if (res.ok) {
        const data: BitcoinMarketData = await res.json();
        setMarketData(data);
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
      }
    } catch (err) {
      console.error("Failed to load bitcoin market data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !marketData) {
    return (
      <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6 animate-pulse">
        <div className="h-6 w-48 bg-[#1c2436] rounded mb-4"></div>
        <div className="h-72 w-full bg-[#090c13] rounded-lg"></div>
      </div>
    );
  }

  const { currentPrice, change24h, range24h, networkStats, charts } = marketData;

  const formatPrice = (val: number) => {
    if (currency === "INR") {
      const inrVal = Math.round(val * (currentPrice.inr / currentPrice.usd));
      return `₹${inrVal.toLocaleString("en-IN")}`;
    }
    if (currency === "EUR") {
      const eurVal = Math.round(val * (currentPrice.eur / currentPrice.usd));
      return `€${eurVal.toLocaleString("de-DE")}`;
    }
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentDisplayPrice =
    currency === "INR"
      ? `₹${currentPrice.inr.toLocaleString("en-IN")}`
      : currency === "EUR"
      ? `€${currentPrice.eur.toLocaleString("de-DE")}`
      : `$${currentPrice.usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const chartData = charts[timeframe] || charts["24H"];
  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;

  const rangeProgress = Math.min(
    100,
    Math.max(
      0,
      ((currentPrice.usd - range24h.low) / (range24h.high - range24h.low || 1)) * 100
    )
  );

  return (
    <div
      id="bitcoin-market-value-card"
      className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1c2436]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Bitcoin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-relaxed">
                Bitcoin Market & Network Telemetry
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                SPOT
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time spot pricing, 24h range, and cryptographic network metrics
            </p>
          </div>
        </div>

        {/* Currency & Timeframe Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency Toggle */}
          <div className="flex items-center p-1 bg-[#090c13] rounded-lg border border-[#1c2436] text-xs">
            {(["USD", "INR", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  currency === c
                    ? "bg-[#1c2436] text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center p-1 bg-[#090c13] rounded-lg border border-[#1c2436] text-xs font-mono">
            {(["24H", "7D", "1M", "1Y"] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  timeframe === tf
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMarketData}
            title="Refresh Live Price"
            className="p-1.5 rounded-lg bg-[#090c13] hover:bg-[#151c2c] border border-[#1c2436] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        {/* Spot Price Card */}
        <div className="bg-[#090c13] p-5 rounded-lg border border-[#1c2436] flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Spot Price ({currency})
          </span>
          <div className="my-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight leading-relaxed">
              {currentDisplayPrice}
            </span>
            <span
              className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                change24h.isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {change24h.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {change24h.isPositive ? "+" : ""}{change24h.percent}%
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono mt-1">
            24h: {change24h.isPositive ? "+$" : "-$"}{Math.abs(change24h.amountUsd).toLocaleString()}
          </span>
        </div>

        {/* 24h High / Low */}
        <div className="bg-[#090c13] p-5 rounded-lg border border-[#1c2436] flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            24h Range
          </span>
          <div className="space-y-1 my-1 text-sm font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">H:</span>
              <span className="text-emerald-400 font-medium">{formatPrice(range24h.high)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">L:</span>
              <span className="text-rose-400 font-medium">{formatPrice(range24h.low)}</span>
            </div>
          </div>
          <div className="w-full h-1 bg-[#1c2436] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${rangeProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-[#090c13] p-5 rounded-lg border border-[#1c2436] flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Market Cap & Dominance
          </span>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight leading-relaxed my-1">
            ${(networkStats.marketCapUsd / 1e12).toFixed(2)}T
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span className="text-slate-500">Dominance:</span>
            <span className="text-amber-400 font-semibold">{networkStats.btcDominance}%</span>
          </div>
        </div>

        {/* Mempool & Block Height */}
        <div className="bg-[#090c13] p-5 rounded-lg border border-[#1c2436] flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Mempool & Height
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tracking-tight leading-relaxed my-1 flex items-center gap-1.5">
            <Zap size={16} className="text-amber-400" />
            {networkStats.avgFeeSatVb} sat/vB
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span className="text-slate-500">Block:</span>
            <span className="text-slate-200">#{networkStats.blockHeight.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Trajectory Chart View */}
      <div className="bg-[#090c13] p-5 rounded-lg border border-[#1c2436]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2436] text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-amber-400" />
            <span className="font-semibold text-white uppercase tracking-wider">
              Price Trajectory ({timeframe})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Min: <strong className="text-slate-200">{formatPrice(Math.min(...prices))}</strong></span>
            <span>Max: <strong className="text-slate-200">{formatPrice(Math.max(...prices))}</strong></span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141a27" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#475569"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#1c2436" }}
                dy={6}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#475569"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#1c2436" }}
                tickFormatter={(v) =>
                  currency === "INR"
                    ? `₹${((v * 86.85) / 100000).toFixed(1)}L`
                    : `$${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#0d111b] border border-[#1c2436] p-2.5 rounded-lg text-xs font-mono shadow-lg">
                        <p className="text-slate-400 mb-0.5">{dataPoint.time}</p>
                        <p className="font-bold text-amber-400">{formatPrice(dataPoint.price)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fillOpacity={0.08}
                fill="#f59e0b"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
