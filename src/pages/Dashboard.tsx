import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import KPICard from "../components/KPICard";
import BitcoinMarketCard from "../components/BitcoinMarketCard";
import WatchedWalletsSection from "../components/WatchedWalletsSection";
import {
  ShieldAlert,
  Wallet,
  Zap,
  Radio,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Shuffle,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { watchedWallets } = useAuth();
  const [criticalNotice, setCriticalNotice] = useState<any | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [activeStreamTab, setActiveStreamTab] = useState<"TRANSACTIONS" | "ALERTS">("TRANSACTIONS");
  const [isFeedCollapsed, setIsFeedCollapsed] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "NEW_ALERT" && msg.data) {
            if (msg.data.severity === "CRITICAL") {
              setCriticalNotice(msg.data);
            }
            setRecentAlerts((prev) => [msg.data, ...prev.slice(0, 9)]);
          } else if (msg.type === "NEW_TRANSACTION" && msg.data) {
            setRecentTransactions((prev) => [msg.data, ...prev.slice(0, 9)]);
          }
        } catch (err) {
          console.error("WS Parse error:", err);
        }
      };
    } catch (e) {
      console.warn("WebSocket warning:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const [txRes, alertRes] = await Promise.all([
          fetch("/api/transactions?limit=8"),
          fetch("/api/alerts"),
        ]);
        if (txRes.ok) {
          const txData = await txRes.json();
          setRecentTransactions(txData.transactions?.slice(0, 8) || []);
        }
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setRecentAlerts(alertData.alerts?.slice(0, 8) || []);
        }
      } catch (e) {
        console.warn("Feed fetch warning:", e);
      }
    };
    fetchFeeds();
  }, []);

  const totalMonitoredBalance = watchedWallets.reduce(
    (acc, curr) => acc + (curr.balanceBtc || 0),
    0
  );
  const highRiskWalletsCount = watchedWallets.filter((w) => (w.riskScore || 0) >= 70).length;

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Header Action Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
                  Security Operations Center
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  LIVE
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Block #884,120
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Bitcoin ledger surveillance, peeling chain detection, and entity risk profiling
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/investigation"
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search size={14} />
                <span>Investigate</span>
              </Link>
              <Link
                to="/scam-analysis"
                className="px-3.5 py-2 rounded-lg bg-[#0d111b] hover:bg-[#151c2b] text-slate-200 border border-[#1c2436] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shuffle size={14} className="text-amber-400" />
                <span>Mule Analysis</span>
              </Link>
              <Link
                to="/alerts"
                className="px-3.5 py-2 rounded-lg bg-[#0d111b] hover:bg-[#151c2b] text-slate-200 border border-[#1c2436] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert size={14} className="text-rose-400" />
                <span>Alerts</span>
              </Link>
            </div>
          </div>

          {/* Critical Risk Notification Banner */}
          {criticalNotice && (
            <div className="mb-6 p-4 rounded-lg bg-rose-950/30 border border-rose-800/40 flex items-center justify-between gap-4 text-xs text-rose-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="font-semibold text-white">Critical Alert:</span>
                <span>{criticalNotice.title || criticalNotice.flowSummary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/investigation?target=${criticalNotice.targetWallet || criticalNotice.memberId || ""}`}
                  className="px-2 py-1 rounded bg-rose-500 text-white font-semibold text-xs hover:bg-rose-400"
                >
                  Trace
                </Link>
                <button
                  onClick={() => setCriticalNotice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Standardized KPI Grid */}
          <div className="kpi-grid">
            <KPICard
              title="BTC Spot Benchmark"
              value="$64,250.00"
              change="+3.4% 24h"
              isPositive={true}
              badge="INDEX"
              icon={<Zap size={16} />}
            />
            <KPICard
              title="Surveilled Wallets"
              value={`${watchedWallets.length} Pinned`}
              change={`${highRiskWalletsCount} High Risk`}
              isPositive={highRiskWalletsCount === 0}
              badge="WATCHLIST"
              icon={<Wallet size={16} />}
            />
            <KPICard
              title="Monitored Balance"
              value={`${totalMonitoredBalance.toFixed(2)} BTC`}
              change="Synced"
              isPositive={true}
              badge="FIRESTORE"
              icon={<Layers size={16} />}
            />
            <KPICard
              title="Threat Alerts"
              value={recentAlerts.length > 0 ? `${recentAlerts.length} Flagged` : "14 Flagged"}
              change="Active Queue"
              isPositive={false}
              badge="SOC"
              icon={<ShieldAlert size={16} />}
            />
          </div>

          {/* Section 1: Bitcoin Market & Network Telemetry */}
          <BitcoinMarketCard />

          {/* Section 2: Watched Wallets */}
          <WatchedWalletsSection />

          {/* Section 3: Telemetry Stream Panel */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2436]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Radio size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-relaxed">
                    Live Telemetry Stream
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time mempool transactions and threat alert queue
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center p-1 bg-[#090c13] border border-[#1c2436] rounded-lg text-xs font-mono">
                  <button
                    onClick={() => setActiveStreamTab("TRANSACTIONS")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeStreamTab === "TRANSACTIONS"
                        ? "bg-[#1c2436] text-amber-400 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Transactions ({recentTransactions.length})
                  </button>
                  <button
                    onClick={() => setActiveStreamTab("ALERTS")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeStreamTab === "ALERTS"
                        ? "bg-[#1c2436] text-rose-400 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Alerts ({recentAlerts.length})
                  </button>
                </div>

                <button
                  onClick={() => setIsFeedCollapsed(!isFeedCollapsed)}
                  className="p-1.5 rounded-lg bg-[#090c13] border border-[#1c2436] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isFeedCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                </button>
              </div>
            </div>

            {!isFeedCollapsed && (
              <div className="pt-4">
                {activeStreamTab === "TRANSACTIONS" ? (
                  <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Tx ID</th>
                          <th className="py-3 px-4">Sender</th>
                          <th className="py-3 px-4">Destination</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4 text-center">Risk</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((tx) => {
                          const isHighRisk = (tx.riskScore || 0) >= 70;
                          return (
                            <tr key={tx.id} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono text-xs">
                              <td className="py-3 px-4 font-semibold text-white max-w-[130px] truncate">
                                {tx.id}
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-sans text-sm">
                                {tx.senderName || tx.memberId || "Node"}
                              </td>
                              <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]">
                                {tx.receiverAddress || "Multi-output"}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-amber-400">
                                {tx.amountBtc || tx.amount || "0.50"} BTC
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded font-bold ${
                                    isHighRisk ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
                                  }`}
                                >
                                  {tx.riskScore || 45}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Link
                                  to={`/investigation?target=${tx.senderAddress || tx.id}`}
                                  className="text-amber-400 hover:text-amber-300 font-sans font-semibold inline-flex items-center gap-1"
                                >
                                  <span>Trace</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436] flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-1.5 rounded shrink-0 ${
                              alert.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                            }`}
                          >
                            <ShieldAlert size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                {alert.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : "Recent"}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white leading-relaxed">
                              {alert.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                              {alert.description || alert.summary}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/investigation?target=${alert.targetWallet || alert.memberId || ""}`}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/20 shrink-0"
                        >
                          Trace
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
