import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Search,
  ShieldAlert,
  Sliders,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Share2,
} from "lucide-react";

export default function Investigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTarget = searchParams.get("target") || "bc1qexample001syntheticbitcoindemo";
  const [targetInput, setTargetInput] = useState(initialTarget);
  const [hopCount, setHopCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [investigationData, setInvestigationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "hops" | "risk" | "timeline" | "report">("graph");
  const [copied, setCopied] = useState(false);

  const runInvestigation = async (targetToRun: string, hops: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/investigation/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetToRun, hopCount: hops }),
      });
      const data = await res.json();
      setInvestigationData(data);
    } catch (err) {
      console.error("Investigation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInvestigation(targetInput, hopCount);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;
    setSearchParams({ target: targetInput.trim() });
    runInvestigation(targetInput.trim(), hopCount);
  };

  const handleHopChange = (h: number) => {
    setHopCount(h);
    runInvestigation(targetInput, h);
  };

  const quickPresets = [
    { label: "M001 (Aarav Kumar)", value: "M001" },
    { label: "TX-001 (Peeling Chain)", value: "DEMO-TX-001-BITFLOW" },
    { label: "M010 (Rapid Forwarding)", value: "M010" },
    { label: "TX-025 (Fan-In Hub)", value: "DEMO-TX-025-BITFLOW" },
    { label: "M047 (Dormant Anomaly)", value: "M047" },
  ];

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Title and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
                  Investigation Center
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                  MULTI-HOP TRACER
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Graph traversal, risk propagation scoring, and AI anomaly detection
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="text-slate-400">Expansion Depth:</span>
              <div className="flex bg-[#090c13] p-1 rounded-lg border border-[#1c2436]">
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHopChange(h)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      hopCount === h ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {h}-Hop
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Form Card */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter Transaction Hash, Wallet Address, Member ID (e.g. M001)..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sliders size={14} />}
                <span>Investigate</span>
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 flex-wrap">
              <span className="font-mono text-slate-500">Presets:</span>
              {quickPresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setTargetInput(p.value);
                    setSearchParams({ target: p.value });
                    runInvestigation(p.value, hopCount);
                  }}
                  className="px-2.5 py-1 rounded bg-[#090c13] hover:bg-[#141b29] text-slate-300 border border-[#1c2436] text-xs transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Profile Card */}
          {investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
                      {investigationData.targetMember?.name ? investigationData.targetMember.name[0] : "₿"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white leading-relaxed">
                          {investigationData.targetMember?.name || "Target Entity"}
                        </h2>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#141a27] text-amber-400">
                          {investigationData.targetMember?.memberId || "M-DEMO"}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {investigationData.targetMember?.profileStatus || "Active"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5 truncate max-w-lg leading-relaxed">
                        {investigationData.targetWallet}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-xs">
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-slate-500 font-mono block text-[11px]">INCOMING</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {investigationData.historicalStats.incomingVolumeBtc} BTC
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-slate-500 font-mono block text-[11px]">OUTGOING</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {investigationData.historicalStats.outgoingVolumeBtc} BTC
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-slate-500 font-mono block text-[11px]">CONNECTED PEERS</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {investigationData.totalConnectedWallets} Nodes
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                      <span className="text-slate-500 font-mono block text-[11px]">ANOMALY SCORE</span>
                      <span className="font-semibold text-amber-400 mt-0.5 block">
                        {investigationData.aiAnomalyEngine.anomalyScore} / 1.00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center p-5 rounded-lg bg-[#090c13] border border-[#1c2436] shrink-0 min-w-[180px]">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Risk Assessment
                  </span>
                  <div className="text-3xl font-bold font-mono text-white mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.finalScore}
                    <span className="text-xs font-normal text-slate-500 font-mono">/100</span>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded mt-1 ${
                      investigationData.riskBreakdown.riskLevel === "CRITICAL"
                        ? "text-rose-400 bg-rose-500/10"
                        : investigationData.riskBreakdown.riskLevel === "HIGH"
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    {investigationData.riskBreakdown.riskLevel} PRIORITY
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#1c2436] mb-6 gap-2 overflow-x-auto">
            {[
              { id: "graph", label: "Topology Graph", icon: Layers },
              { id: "hops", label: "Trace Ledger", icon: TrendingUp },
              { id: "risk", label: "Risk Propagation", icon: ShieldAlert },
              { id: "timeline", label: "Timeline", icon: Clock },
              { id: "report", label: "Compliance Dossier", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-400 bg-amber-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: GRAPH */}
          {activeTab === "graph" && investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-relaxed">Multi-Hop Network Topology</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Origin wallet and downstream relay path up to {hopCount} hops
                  </p>
                </div>
              </div>

              {/* Visual Hop Chain */}
              <div className="p-6 rounded-lg bg-[#090c13] border border-[#1c2436] overflow-x-auto">
                <div className="flex items-center gap-4 min-w-[650px] justify-between">
                  {investigationData.graph.nodes.slice(0, 6).map((node: any, idx: number) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border font-mono ${
                            node.isRoot
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                              : node.riskScore >= 75
                              ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                              : "bg-blue-500/10 border-blue-500/40 text-blue-400"
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase">
                            {node.isRoot ? "ROOT" : `H${node.hopLevel}`}
                          </span>
                          <span className="text-xs font-semibold truncate max-w-[40px]">{node.memberId}</span>
                        </div>
                        <span className="text-xs font-medium text-white mt-2 max-w-[90px] truncate text-center leading-relaxed">
                          {node.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Risk {node.riskScore}
                        </span>
                      </div>

                      {idx < investigationData.graph.nodes.slice(0, 6).length - 1 && (
                        <div className="flex flex-col items-center justify-center px-1">
                          <ArrowRight className="text-amber-500" size={16} />
                          <span className="text-[10px] font-mono text-amber-400">
                            {investigationData.graph.edges[idx]?.amountBtc || "1.2"} BTC
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Anomaly Interpretation Box */}
              <div className="mt-6 p-4 rounded-lg bg-[#090c13] border border-[#1c2436] flex items-start gap-3">
                <Brain className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-white leading-relaxed">AI Heuristic Interpretation</h4>
                  <ul className="mt-2 space-y-1">
                    {investigationData.aiAnomalyEngine.reasons.map((r: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    {investigationData.aiAnomalyEngine.legalNotice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-HOP TRACE LEDGER */}
          {activeTab === "hops" && investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-relaxed">Sequential Multi-Hop Fund Path</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Transaction route traced across counterparties
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {investigationData.multiHopPaths.length} Transits
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Hop</th>
                      <th className="py-3 px-4">Transit Path</th>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">USD Value</th>
                      <th className="py-3 px-4 text-center">Risk</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investigationData.multiHopPaths.map((hop: any) => (
                      <tr key={hop.txId} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono text-xs">
                        <td className="py-3 px-4 font-bold text-amber-400">Hop {hop.hop}</td>
                        <td className="py-3 px-4 font-sans font-medium text-white text-xs">{hop.path}</td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-[140px]">{hop.txId}</td>
                        <td className="py-3 px-4 text-right font-bold text-white">{hop.amountBtc} BTC</td>
                        <td className="py-3 px-4 text-right text-slate-400">${hop.amountUsd.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              hop.riskScore >= 75
                                ? "text-rose-400 bg-rose-500/10"
                                : hop.riskScore >= 50
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-emerald-400 bg-emerald-500/10"
                            }`}
                          >
                            {hop.riskScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="text-emerald-400 text-xs font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> {hop.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <Link
                            to={`/transactions?search=${hop.txId}`}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RISK PROPAGATION FORMULA */}
          {activeTab === "risk" && investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <h3 className="text-base font-bold text-white mb-1 leading-relaxed">
                Risk Engine Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Weighted composite formula combining direct transaction risk, network propagation, and behavioral metrics
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436]">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    1. Direct (35%)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.directRisk}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Fee and volume anomalies
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436]">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    2. Network (25%)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.networkRisk}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Hop depth & counterparty
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436]">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    3. Behavior (15%)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.behaviorRisk}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Whale amounts & timing
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436]">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    4. Historical (15%)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.historicalAnomaly}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Deviation from baseline
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436]">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    5. Exposure (10%)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1 leading-relaxed">
                    {investigationData.riskBreakdown.connectionExposure}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Fan-in/fan-out exposure
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436] flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs font-medium text-slate-300">
                  Synthesized Score:
                </span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {investigationData.riskBreakdown.finalScore} / 100
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "timeline" && investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <h3 className="text-base font-bold text-white mb-1 leading-relaxed">
                Investigation Timeline
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Chronological ledger showing baseline behavior transitioning into alert events
              </p>

              <div className="space-y-4">
                {investigationData.behaviorTimeline.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436] flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                        item.severity === "critical"
                          ? "bg-rose-500/20 text-rose-400"
                          : item.severity === "warning"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      <Clock size={12} />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-slate-500 block">
                        {item.time}
                      </span>
                      <p className="text-sm font-medium text-slate-200 mt-0.5 leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SAR COMPLIANCE DOSSIER */}
          {activeTab === "report" && investigationData && (
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-relaxed">Suspicious Activity Report (SAR) Dossier</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Auto-compiled compliance summary for audit and archiving
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text = JSON.stringify(investigationData, null, 2);
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#090c13] hover:bg-[#141b29] text-xs font-semibold text-slate-200 border border-[#1c2436] flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>{copied ? "Copied!" : "Copy JSON"}</span>
                </button>
              </div>

              <div className="p-5 rounded-lg bg-[#090c13] border border-[#1c2436] font-mono text-xs text-slate-300 space-y-2.5">
                <div className="border-b border-[#1c2436] pb-2">
                  <span className="text-amber-400 font-bold">CASE ID:</span> SAR-AML-2026-BF-{investigationData.targetMember?.memberId || "M001"}
                </div>
                <div>
                  <span className="text-slate-500">TARGET:</span> {investigationData.targetWallet}
                </div>
                <div>
                  <span className="text-slate-500">SUBJECT:</span> {investigationData.targetMember?.name || "N/A"} ({investigationData.targetMember?.occupation || "N/A"})
                </div>
                <div>
                  <span className="text-slate-500">SCORE:</span> {investigationData.riskBreakdown.finalScore}/100 ({investigationData.riskBreakdown.riskLevel})
                </div>
                <div>
                  <span className="text-slate-500">DEPTH:</span> {investigationData.hopDepth} Hops across {investigationData.totalConnectedWallets} Nodes
                </div>
                <div>
                  <span className="text-slate-500">REASON:</span> {investigationData.aiAnomalyEngine.reasons.join(" | ")}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
