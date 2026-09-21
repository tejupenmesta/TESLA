import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Zap } from "lucide-react";

interface ChartPoint {
  time: string;
  tps: number;
  feeSatVb: number;
  mempoolMb: number;
}

const INITIAL_CHART_DATA: ChartPoint[] = [
  { time: "03:10", tps: 4.8, feeSatVb: 15, mempoolMb: 238 },
  { time: "03:11", tps: 5.1, feeSatVb: 16, mempoolMb: 240 },
  { time: "03:12", tps: 4.9, feeSatVb: 17, mempoolMb: 242 },
  { time: "03:13", tps: 5.3, feeSatVb: 18, mempoolMb: 243 },
  { time: "03:14", tps: 5.0, feeSatVb: 19, mempoolMb: 244 },
  { time: "03:15", tps: 5.4, feeSatVb: 18, mempoolMb: 245 },
  { time: "03:16", tps: 5.2, feeSatVb: 18, mempoolMb: 245 },
];

export default function NetworkChart() {
  const [data, setData] = useState<ChartPoint[]>(INITIAL_CHART_DATA);
  const [metric, setMetric] = useState<"tps" | "feeSatVb">("tps");

  // Stream live data points periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);

      setData((prev) => {
        const last = prev[prev.length - 1];
        const nextTps = Math.max(3.5, +(last.tps + (Math.random() * 0.8 - 0.38)).toFixed(1));
        const nextFee = Math.max(12, Math.round(last.feeSatVb + (Math.random() * 4 - 2)));
        const nextMempool = Math.max(220, Math.round(last.mempoolMb + (Math.random() * 3 - 1.4)));

        const newPoint: ChartPoint = {
          time: timeStr,
          tps: nextTps,
          feeSatVb: nextFee,
          mempoolMb: nextMempool,
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="network-chart-panel" className="slot-panel mb-12">
      <div className="slot-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 sm:p-10 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Bitcoin Network Dynamics</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time mempool fee pressure & transaction throughput</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="metric-toggle-tps"
            onClick={() => setMetric("tps")}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              metric === "tps"
                ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Activity size={14} />
            TPS (Throughput)
          </button>

          <button
            id="metric-toggle-fee"
            onClick={() => setMetric("feeSatVb")}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              metric === "feeSatVb"
                ? "bg-emerald-500 text-slate-950 font-bold border-emerald-500"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Zap size={14} />
            Sat/vB (Fee Rate)
          </button>
        </div>
      </div>

      <div className="p-8 sm:p-10" style={{ height: 320, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a202c" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              domain={metric === "tps" ? [2, 8] : [10, 30]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            {metric === "tps" ? (
              <Area
                type="monotone"
                dataKey="tps"
                name="TPS"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={0.08}
                fill="#f59e0b"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="feeSatVb"
                name="Fee (sat/vB)"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={0.08}
                fill="#10b981"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
