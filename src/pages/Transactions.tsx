import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Activity,
  Search,
  Eye,
  ArrowRight,
  RefreshCw,
  X,
  HelpCircle,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [whaleOnly, setWhaleOnly] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFIRMED" | "MEMPOOL">("ALL");
  const navigate = useNavigate();

  const fetchTransactions = () => {
    setLoading(true);
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load transactions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "NEW_TRANSACTION" && msg.data) {
            setTransactions((prev) => [msg.data, ...prev.slice(0, 149)]);
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };
    } catch (e) {
      console.warn("WebSocket warning:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      tx.id.toLowerCase().includes(q) ||
      tx.senderName?.toLowerCase().includes(q) ||
      tx.receiverName?.toLowerCase().includes(q) ||
      tx.senderAddress?.toLowerCase().includes(q) ||
      tx.receiverAddress?.toLowerCase().includes(q);

    const matchesRisk =
      riskFilter === "ALL"
        ? true
        : riskFilter === "HIGH"
        ? tx.riskScore >= 75 || tx.riskFlag === "High"
        : riskFilter === "REVIEW"
        ? (tx.riskScore >= 45 && tx.riskScore < 75) || tx.riskFlag === "Review"
        : tx.riskScore < 45 || tx.riskFlag === "Low";

    const matchesWhale = whaleOnly ? tx.isWhale || tx.amountBtc >= 5.0 : true;

    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "CONFIRMED"
        ? tx.status === "Confirmed"
        : tx.status === "Pending" || tx.status === "Mempool";

    return matchesSearch && matchesRisk && matchesWhale && matchesTab;
  });

  const totalVolume = transactions.reduce((acc, t) => acc + (t.amountBtc || 0), 0).toFixed(2);
  const highRiskCount = transactions.filter((t) => t.riskScore >= 75).length;
  const whaleCount = transactions.filter((t) => t.isWhale || t.amountBtc >= 5.0).length;

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header onSearch={setSearchQuery} />

        <section className="content">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
                  Transaction Ledger
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Mempool broadcasts, risk evaluations, and heuristic forensic traces
              </p>
            </div>

            <button
              onClick={fetchTransactions}
              className="px-3 py-1.5 rounded-lg bg-[#0d111b] hover:bg-[#151c2b] text-slate-300 font-semibold text-xs border border-[#1c2436] flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <span className="text-xs text-slate-400 uppercase font-mono font-medium block">Streamed Txs</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 leading-relaxed">{transactions.length}</div>
              <span className="text-xs text-slate-500 font-mono mt-1 block">Active Ledger</span>
            </div>

            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <span className="text-xs text-slate-400 uppercase font-mono font-medium block">Cumulative Volume</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                {totalVolume} <span className="text-xs font-normal text-slate-400 font-mono">BTC</span>
              </div>
              <span className="text-xs text-slate-500 font-mono mt-1 block">Network Throughput</span>
            </div>

            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <span className="text-xs text-slate-400 uppercase font-mono font-medium block">Whale Transfers</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 leading-relaxed">{whaleCount}</div>
              <span className="text-xs text-slate-500 font-mono mt-1 block">&ge; 5.00 BTC Transfers</span>
            </div>

            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <span className="text-xs text-slate-400 uppercase font-mono font-medium block">Flagged Threats</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-1 leading-relaxed">{highRiskCount}</div>
              <span className="text-xs text-slate-500 font-mono mt-1 block">Risk Score &ge; 75</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-[#0d111b] border border-[#1c2436] flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Tabs */}
              <div className="flex bg-[#090c13] p-1 rounded-lg border border-[#1c2436] text-xs font-mono">
                {(["ALL", "CONFIRMED", "MEMPOOL"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === tab ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Risk Filters */}
              <div className="flex bg-[#090c13] p-1 rounded-lg border border-[#1c2436] text-xs font-mono">
                {[
                  { key: "ALL", label: "All" },
                  { key: "HIGH", label: "High Risk (75+)" },
                  { key: "REVIEW", label: "Review (45-74)" },
                  { key: "LOW", label: "Low Risk (<45)" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRiskFilter(item.key)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      riskFilter === item.key
                        ? "bg-[#1c2436] text-white font-medium"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setWhaleOnly(!whaleOnly)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
                whaleOnly
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                  : "bg-[#090c13] text-slate-400 border-[#1c2436] hover:text-white"
              }`}
            >
              Whale Only (&ge;5 BTC): {whaleOnly ? "ON" : "OFF"}
            </button>
          </div>

          {/* Transactions Table Panel */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 leading-relaxed">
                  <Activity size={16} className="text-amber-400" />
                  Transactions Feed ({filtered.length} matching)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review transaction amounts, destination addresses, and heuristics
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Tx ID</th>
                    <th className="py-3 px-4">Sender & Receiver</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">USD Value</th>
                    <th className="py-3 px-4 text-center">Fee Rate</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Risk</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const isHighRisk = tx.riskScore >= 75;
                    return (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono text-xs">
                        <td className="py-3 px-4 font-semibold text-slate-300 max-w-[130px] truncate">
                          {tx.id}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs">
                          <div className="text-white font-medium leading-relaxed">{tx.senderName || tx.senderAddress?.slice(0, 12)}</div>
                          <div className="text-slate-400 text-[11px] truncate max-w-[160px]">→ {tx.receiverName || tx.receiverAddress?.slice(0, 12)}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-400">
                          {tx.amountBtc} BTC
                          {tx.isWhale && (
                            <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                              WHALE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          ${tx.amountUsd?.toLocaleString() || "—"}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {tx.feeRateSatVb} sat/vB
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300 font-sans">
                          {tx.status}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isHighRisk
                                ? "text-rose-400 bg-rose-500/10"
                                : tx.riskScore >= 45
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-emerald-400 bg-emerald-500/10"
                            }`}
                          >
                            {tx.riskScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="px-2 py-1 rounded bg-[#1c2436] hover:bg-[#25324d] text-slate-300 text-xs cursor-pointer"
                              title="Heuristic details"
                            >
                              <HelpCircle size={13} />
                            </button>
                            <button
                              onClick={() => navigate(`/investigation?target=${tx.id}`)}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Trace</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500 text-sm">
                        No transactions match your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Explanation Modal */}
          {selectedTx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
              <div className="p-6 bg-[#0d111b] border border-[#1c2436] rounded-xl max-w-lg w-full shadow-2xl relative">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    !
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-relaxed">Detection Heuristic</h3>
                    <p className="text-xs font-mono text-slate-400 truncate max-w-xs">{selectedTx.id}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-[#1c2436] pt-4">
                  <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                    <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                      AI Assessment Reason
                    </span>
                    <p className="text-white text-sm font-normal leading-relaxed">{selectedTx.aiInterpretation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-[10px] font-mono text-slate-500 block">AMOUNT</span>
                      <span className="text-sm font-bold text-white font-mono">{selectedTx.amountBtc} BTC</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-[10px] font-mono text-slate-500 block">FEE RATE</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">{selectedTx.feeRateSatVb} sat/vB</span>
                    </div>
                  </div>

                  {selectedTx.aiDecisionNote && (
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                        Model Classification Note
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed">{selectedTx.aiDecisionNote}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#1c2436] flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const id = selectedTx.id;
                      setSelectedTx(null);
                      navigate(`/investigation?target=${id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Multi-Hop Trace</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
