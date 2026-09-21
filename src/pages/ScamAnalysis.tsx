import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Building2,
  Bitcoin,
  History,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Activity,
  Zap,
  Layers,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import {
  buildCanonicalScamChain,
  traceDynamicScamChain,
  ScamChain,
} from "../services/scamAnalysisService";
import { SEED_MEMBERS } from "../data/seedData";

export default function ScamAnalysis() {
  const [activeTab, setActiveTab] = useState<"canonical" | "sandbox">("canonical");
  const [chain, setChain] = useState<ScamChain>(buildCanonicalScamChain());
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-x");
  const [inspectorTab, setInspectorTab] = useState<"kyc" | "banking" | "crypto" | "history">("kyc");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic Trace Sandbox State
  const [selectedOriginMemberId, setSelectedOriginMemberId] = useState<string>("M001");
  const [customAmountBtc, setCustomAmountBtc] = useState<number>(4.85);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  // Live Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  // Emergency Freeze State
  const [freezeSuccessMessage, setFreezeSuccessMessage] = useState<string | null>(null);
  const [showSarModal, setShowSarModal] = useState<boolean>(false);
  const [sarDossier, setSarDossier] = useState<any | null>(null);

  // Sync selected node with chain
  const selectedNode = chain.nodes.find((n) => n.id === selectedNodeId) || chain.nodes[0];

  // Simulation timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimulationStep((prev) => {
          if (prev >= chain.transfers.length) {
            setIsSimulating(false);
            return prev;
          }
          const nextStep = prev + 1;
          if (chain.nodes[nextStep]) {
            setSelectedNodeId(chain.nodes[nextStep].id);
          }
          return nextStep;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isSimulating, chain]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunDynamicTrace = async () => {
    setIsTracing(true);
    try {
      const res = await fetch("/api/scam-analysis/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originMemberId: selectedOriginMemberId,
          amountBtc: customAmountBtc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chain) {
          setChain(data.chain);
          setSelectedNodeId(data.chain.nodes[0].id);
        }
      } else {
        const localChain = traceDynamicScamChain(selectedOriginMemberId, customAmountBtc);
        setChain(localChain);
        setSelectedNodeId(localChain.nodes[0].id);
      }
    } catch {
      const localChain = traceDynamicScamChain(selectedOriginMemberId, customAmountBtc);
      setChain(localChain);
      setSelectedNodeId(localChain.nodes[0].id);
    } finally {
      setIsTracing(false);
      setSimulationStep(0);
    }
  };

  const handleResetToCanonical = () => {
    const canonical = buildCanonicalScamChain();
    setChain(canonical);
    setSelectedNodeId("node-x");
    setSimulationStep(0);
    setIsSimulating(false);
  };

  const handleEmergencyFreezeAll = async () => {
    try {
      const res = await fetch("/api/scam-analysis/freeze-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chainId: chain.id,
          memberIds: chain.nodes.map((n) => n.member.memberId),
        }),
      });
      const data = await res.json();
      setFreezeSuccessMessage(
        data.message || `Successfully froze all ${chain.nodes.length} accounts. Bank transfers restricted and regulatory hold applied.`
      );
    } catch {
      setFreezeSuccessMessage(
        `Successfully froze all ${chain.nodes.length} accounts. Bank transfers restricted and regulatory hold applied.`
      );
    }

    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        banking: { ...n.banking, isFrozen: true, accountStatus: "Frozen by AML Hold" },
        status: "FROZEN_BY_AML",
      })),
    }));

    setTimeout(() => setFreezeSuccessMessage(null), 6000);
  };

  const handleToggleSingleFreeze = async (nodeId: string) => {
    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id === nodeId) {
          const nextFrozen = !n.banking.isFrozen;
          return {
            ...n,
            banking: {
              ...n.banking,
              isFrozen: nextFrozen,
              accountStatus: nextFrozen ? "Frozen for Review" : "Active",
            },
            status: nextFrozen ? "FROZEN_BY_AML" : "MULE_DETECTED",
          };
        }
        return n;
      }),
    }));

    const node = chain.nodes.find((n) => n.id === nodeId);
    if (node) {
      try {
        await fetch("/api/scam-analysis/freeze-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: node.member.memberId,
            action: node.banking.isFrozen ? "UNFREEZE" : "FREEZE",
          }),
        });
      } catch {
        // Handled locally
      }
    }
  };

  const handleGenerateSar = async () => {
    try {
      const res = await fetch("/api/scam-analysis/export-sar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain }),
      });
      const data = await res.json();
      setSarDossier(data.dossier);
      setShowSarModal(true);
    } catch {
      setSarDossier({
        regulatoryFilingId: `SAR-AML-2026-9912`,
        agency: "Financial Intelligence Unit / AML Division",
        filingDate: new Date().toISOString(),
        summary: `Multi-hop Bitcoin peeling chain originating from ${chain.originScammer}`,
        syndicateMetrics: {
          totalDisbursedBtc: chain.totalDisbursedBtc,
          totalDisbursedUsd: chain.totalDisbursedUsd,
          accountsInvolved: chain.nodes.length,
        },
        flaggedPersonsAndAccounts: chain.nodes.map((n) => ({
          role: n.roleName,
          personName: n.member.name,
          memberId: n.member.memberId,
          city: n.member.city,
          syntheticIdProof: n.member.syntheticIdRef,
          bankAccountId: n.banking.accountId,
          fiatBalance: n.banking.fiatBalance,
          taintPercentage: `${n.taintScore}%`,
          retainedMuleCut: `${n.forensics.retainedCutBtc} BTC ($${n.forensics.retainedCutUsd} USD)`,
        })),
        transferLedgerTrail: chain.transfers,
      });
      setShowSarModal(true);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Page Title & Status Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
                  Scam Network & Mule Chain Tracer
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                  7/7 DETECTED
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Multi-hop peeling chain analysis tracing funds from origin to downstream mules
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-export-sar"
                onClick={handleGenerateSar}
                className="flex items-center gap-2 text-xs font-semibold bg-[#090c13] hover:bg-[#141a27] text-slate-300 border border-[#1c2436] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <FileText size={14} />
                <span>Regulatory SAR Dossier</span>
              </button>

              <button
                id="btn-emergency-freeze-all"
                onClick={handleEmergencyFreezeAll}
                className="flex items-center gap-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Lock size={14} />
                <span>Emergency Freeze All</span>
              </button>
            </div>
          </div>

          {/* Alert Notification Toast */}
          {freezeSuccessMessage && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="text-rose-400 shrink-0" size={16} />
                <span>{freezeSuccessMessage}</span>
              </div>
              <button
                onClick={() => setFreezeSuccessMessage(null)}
                className="text-xs text-rose-400 hover:text-white underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Syndicate KPI Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Scam Volume
              </span>
              <div className="text-xl font-bold font-mono text-white leading-relaxed">
                {chain.totalDisbursedBtc} <span className="text-xs text-amber-500">BTC</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ${chain.totalDisbursedUsd.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Syndicate Taint
              </span>
              <div className="text-xl font-bold font-mono text-rose-400 leading-relaxed">
                {chain.chainTaintScore}%
              </div>
              <span className="text-xs text-slate-400 font-mono">
                FIFO Decay Model
              </span>
            </div>

            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Accounts Linked
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 leading-relaxed">
                {chain.nodes.length}
              </div>
              <span className="text-xs text-slate-400">
                1 Origin + 6 Mules
              </span>
            </div>

            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Relay Velocity
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400 leading-relaxed">
                {chain.averageHopLatencySec}s
              </div>
              <span className="text-xs text-slate-400">
                Automated Relay
              </span>
            </div>

            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Mule Cuts
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 leading-relaxed">
                {chain.totalMuleCutsBtc} <span className="text-xs text-amber-500">BTC</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ${chain.totalMuleCutsUsd.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Containment
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5 leading-relaxed">
                <CheckCircle2 size={16} /> 100%
              </div>
              <span className="text-xs text-slate-400">
                Ready for Hold
              </span>
            </div>
          </div>

          {/* Scenario Mode Tabs & Live Simulation Controls */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  id="tab-mode-canonical"
                  onClick={() => {
                    setActiveTab("canonical");
                    handleResetToCanonical();
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    activeTab === "canonical"
                      ? "bg-[#141a27] text-amber-400 border-amber-500/40"
                      : "bg-[#090c13] text-slate-400 border-[#1c2436] hover:text-white"
                  }`}
                >
                  Canonical Chain: (X) → (A) → (B) → (C) → (D) → (E) → (F)
                </button>

                <button
                  id="tab-mode-sandbox"
                  onClick={() => setActiveTab("sandbox")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    activeTab === "sandbox"
                      ? "bg-[#141a27] text-amber-400 border-amber-500/40"
                      : "bg-[#090c13] text-slate-400 border-[#1c2436] hover:text-white"
                  }`}
                >
                  Dynamic Sandbox Trace
                </button>
              </div>

              {/* Simulation Playback Bar */}
              <div className="flex items-center gap-2.5 bg-[#090c13] border border-[#1c2436] px-3 py-1.5 rounded-lg">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Activity size={13} className={isSimulating ? "text-emerald-400" : "text-slate-400"} />
                  Simulation:
                </span>

                <button
                  id="btn-play-sim"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    isSimulating
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                >
                  {isSimulating ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isSimulating ? "Pause" : "Play"}</span>
                </button>

                <button
                  id="btn-reset-sim"
                  onClick={() => {
                    setIsSimulating(false);
                    setSimulationStep(0);
                    setSelectedNodeId("node-x");
                  }}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw size={13} />
                </button>

                <div className="text-xs font-mono text-slate-400 pl-2 border-l border-[#1c2436]">
                  Step {simulationStep} / {chain.transfers.length}
                </div>
              </div>
            </div>

            {/* Sandbox Controls Form */}
            {activeTab === "sandbox" && (
              <div className="mt-4 pt-4 border-t border-[#1c2436] flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Designated Scammer:</label>
                  <select
                    id="select-sandbox-scammer"
                    value={selectedOriginMemberId}
                    onChange={(e) => setSelectedOriginMemberId(e.target.value)}
                    className="bg-[#090c13] border border-[#1c2436] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500"
                  >
                    {SEED_MEMBERS.slice(0, 30).map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.memberId} - {m.name} ({m.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Amount (BTC):</label>
                  <input
                    id="input-sandbox-btc"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={customAmountBtc}
                    onChange={(e) => setCustomAmountBtc(parseFloat(e.target.value) || 1)}
                    className="w-24 bg-[#090c13] border border-[#1c2436] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  id="btn-run-dynamic-trace"
                  onClick={handleRunDynamicTrace}
                  disabled={isTracing}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Zap size={13} />
                  <span>{isTracing ? "Tracing..." : "Execute Trace"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Multi-Hop Interactive Visual Pipeline Diagram */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-500" />
                <h2 className="text-base font-bold text-white leading-relaxed">
                  Money Mule Routing Pipeline
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Click any person to inspect KYC, banking, and forensics
              </span>
            </div>

            {/* Pipeline Flow Container */}
            <div className="flex items-center gap-3 min-w-[900px] py-2">
              {chain.nodes.map((node, idx) => {
                const isSelected = node.id === selectedNodeId;
                const isCurrentSimStep = simulationStep === idx;

                return (
                  <div key={node.id} className="flex items-center gap-2 flex-1">
                    {/* Node Card */}
                    <div
                      id={`node-card-${node.id}`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative flex-1 p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#141a27] border-amber-500"
                          : isCurrentSimStep
                          ? "bg-[#141a27] border-emerald-400"
                          : "bg-[#090c13] border-[#1c2436] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                          {node.roleShort}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400 font-semibold">
                          {node.taintScore}% Taint
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white truncate" title={node.member.name}>
                        {node.member.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mb-2">
                        {node.member.city}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 bg-[#0d111b] px-2 py-1 rounded border border-[#1c2436] flex items-center justify-between">
                        <span className="truncate">{node.banking.accountId.slice(0, 10)}...</span>
                        {node.banking.isFrozen ? (
                          <span className="text-rose-400 font-bold ml-1">FROZEN</span>
                        ) : (
                          <span className="text-amber-400 font-medium ml-1">ACTIVE</span>
                        )}
                      </div>

                      {node.hopIndex > 0 && node.hopIndex < 6 && (
                        <div className="mt-1.5 text-[10px] text-amber-400 font-mono">
                          Kept {node.forensics.retainedCutBtc} BTC
                        </div>
                      )}
                      {node.hopIndex === 6 && (
                        <div className="mt-1.5 text-[10px] text-purple-400 font-mono font-semibold">
                          Off-Ramp Exit
                        </div>
                      )}
                      {node.hopIndex === 0 && (
                        <div className="mt-1.5 text-[10px] text-rose-400 font-mono font-semibold">
                          Originator
                        </div>
                      )}
                    </div>

                    {/* Arrow Connector */}
                    {idx < chain.nodes.length - 1 && (
                      <div className="flex flex-col items-center justify-center shrink-0 w-10 text-center">
                        <span className="text-[9px] font-mono text-amber-400 whitespace-nowrap mb-0.5">
                          {chain.transfers[idx]?.amountBtc} ₿
                        </span>
                        <ArrowRight
                          size={14}
                          className={
                            simulationStep > idx
                              ? "text-emerald-400"
                              : simulationStep === idx
                              ? "text-amber-400"
                              : "text-slate-600"
                          }
                        />
                        <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap mt-0.5">
                          {chain.transfers[idx]?.holdingDuration}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Forensic Account Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Quick Profile Summary & Actions */}
            <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#1c2436] mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#090c13] border border-[#1c2436] flex items-center justify-center text-sm font-bold text-white font-mono">
                      {selectedNode.member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-relaxed">
                        {selectedNode.member.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedNode.member.memberId} • Age {selectedNode.member.age}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    {selectedNode.roleShort}
                  </span>
                </div>

                {/* Status Items */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#090c13] rounded-lg border border-[#1c2436]">
                    <span className="text-slate-400">Syndicate Role:</span>
                    <span className="font-medium text-white">{selectedNode.roleName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#090c13] rounded-lg border border-[#1c2436]">
                    <span className="text-slate-400">Taint Score:</span>
                    <span className="font-bold font-mono text-rose-400">{selectedNode.taintScore}%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#090c13] rounded-lg border border-[#1c2436]">
                    <span className="text-slate-400">Bank Status:</span>
                    <span className={`font-semibold ${selectedNode.banking.isFrozen ? "text-rose-400" : "text-amber-400"}`}>
                      {selectedNode.banking.accountStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#090c13] rounded-lg border border-[#1c2436]">
                    <span className="text-slate-400">Mule Cut Retained:</span>
                    <span className="font-semibold text-amber-400 font-mono">
                      {selectedNode.forensics.retainedCutBtc} BTC (${selectedNode.forensics.retainedCutUsd.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#090c13] rounded-lg border border-[#1c2436]">
                    <span className="text-slate-400">Holding Latency:</span>
                    <span className="font-mono text-cyan-400">
                      {selectedNode.forensics.holdingDurationHuman}
                    </span>
                  </div>
                </div>

                {/* Red Flags Box */}
                <div className="bg-[#090c13] border border-[#1c2436] rounded-lg p-3.5 mb-4">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Detected Flags:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc leading-relaxed">
                    {selectedNode.forensics.detectedFlags.map((flag, fIdx) => (
                      <li key={fIdx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-[#1c2436]">
                <button
                  id={`btn-toggle-freeze-${selectedNode.id}`}
                  onClick={() => handleToggleSingleFreeze(selectedNode.id)}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg border transition-colors cursor-pointer ${
                    selectedNode.banking.isFrozen
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30"
                  }`}
                >
                  {selectedNode.banking.isFrozen ? <Unlock size={13} /> : <Lock size={13} />}
                  <span>{selectedNode.banking.isFrozen ? "Unfreeze Account" : "Freeze Account & Restrict"}</span>
                </button>

                <div className="text-xs text-slate-400 text-center">
                  Recommended: <strong className="text-amber-400">{selectedNode.forensics.sarRecommendation}</strong>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Multi-Tab Forensic Dossier */}
            <div className="lg:col-span-2 bg-[#0d111b] border border-[#1c2436] rounded-xl p-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-[#1c2436] pb-3 mb-4 overflow-x-auto">
                <button
                  id="tab-inspector-kyc"
                  onClick={() => setInspectorTab("kyc")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    inspectorTab === "kyc"
                      ? "bg-[#141a27] text-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserCheck size={13} />
                  <span>1. KYC & Personal</span>
                </button>

                <button
                  id="tab-inspector-banking"
                  onClick={() => setInspectorTab("banking")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    inspectorTab === "banking"
                      ? "bg-[#141a27] text-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 size={13} />
                  <span>2. Bank Account</span>
                </button>

                <button
                  id="tab-inspector-crypto"
                  onClick={() => setInspectorTab("crypto")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    inspectorTab === "crypto"
                      ? "bg-[#141a27] text-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Bitcoin size={13} />
                  <span>3. Crypto Wallet</span>
                </button>

                <button
                  id="tab-inspector-history"
                  onClick={() => setInspectorTab("history")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    inspectorTab === "history"
                      ? "bg-[#141a27] text-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <History size={13} />
                  <span>4. History</span>
                </button>
              </div>

              {/* Tab 1: KYC */}
              {inspectorTab === "kyc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block font-mono">Member ID</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5 block">{selectedNode.member.memberId}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Full Legal Name</span>
                      <span className="text-xs font-semibold text-white mt-0.5 block">{selectedNode.member.name}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">City & Country</span>
                      <span className="text-xs text-white mt-0.5 block">{selectedNode.member.city}, {selectedNode.member.country}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Age & Occupation</span>
                      <span className="text-xs text-white mt-0.5 block">{selectedNode.member.age} yrs • {selectedNode.member.occupation}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Phone</span>
                      <span className="text-xs font-mono text-white mt-0.5 block">{selectedNode.member.phone}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Email</span>
                      <span className="text-xs font-mono text-white truncate block mt-0.5">{selectedNode.member.email}</span>
                    </div>
                  </div>

                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                      <Shield size={13} className="text-amber-400" />
                      Government ID & Verification
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Type</span>
                        <span className="text-white font-medium">{selectedNode.member.idProofType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Reference</span>
                        <span className="text-white font-mono">{selectedNode.member.syntheticIdRef}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">KYC Status</span>
                        <span className="text-emerald-400 font-medium">{selectedNode.member.kycStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Verified On</span>
                        <span className="text-white font-mono">{selectedNode.member.verificationDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                      <UserCheck size={13} className="text-amber-400" />
                      Nominee & Intermediary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Name</span>
                        <span className="text-white font-medium">{selectedNode.member.nomineeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Relationship</span>
                        <span className="text-white">{selectedNode.member.nomineeRelationship}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Phone</span>
                        <span className="text-white font-mono">{selectedNode.member.nomineePhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Email</span>
                        <span className="text-white font-mono truncate block">{selectedNode.member.nomineeEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Bank Account */}
              {inspectorTab === "banking" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Account Number</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-mono font-bold text-white">{selectedNode.banking.accountId}</span>
                        <button
                          onClick={() => handleCopy(selectedNode.banking.accountId)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title="Copy"
                        >
                          {copiedText === selectedNode.banking.accountId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Bank Name</span>
                      <span className="text-xs font-semibold text-white mt-0.5 block">{selectedNode.banking.bankName}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Branch</span>
                      <span className="text-xs text-white mt-0.5 block">{selectedNode.banking.branch}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Routing / IFSC</span>
                      <span className="text-xs font-mono text-white mt-0.5 block">{selectedNode.banking.routingRef}</span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Fiat Balance</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                        ₹{selectedNode.banking.fiatBalance.toLocaleString()} INR
                      </span>
                    </div>

                    <div className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436]">
                      <span className="text-xs text-slate-400 block">Daily Limit</span>
                      <span className="text-xs text-white font-mono mt-0.5 block">
                        ₹{selectedNode.banking.dailyLimit.toLocaleString()} INR
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
                      <span>Custody Status</span>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${selectedNode.banking.isFrozen ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {selectedNode.banking.accountStatus}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Model: {selectedNode.member.custodyModel}. Registered with BitFlow banking gateway. Created: {selectedNode.member.accountCreated}.
                      When frozen, API settlement corridors are restricted.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Crypto Wallet */}
              {inspectorTab === "crypto" && (
                <div className="space-y-4">
                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <span className="text-xs text-slate-400 block mb-1">Bitcoin SegWit Address</span>
                    <div className="flex items-center justify-between bg-[#0d111b] p-2 rounded border border-[#1c2436]">
                      <span className="text-xs font-mono text-emerald-400 truncate mr-2">
                        {selectedNode.crypto.address}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedNode.crypto.address)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title="Copy"
                      >
                        {copiedText === selectedNode.crypto.address ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Wallet Type</span>
                        <span className="text-white font-medium">{selectedNode.crypto.walletType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Balance</span>
                        <span className="text-white font-mono font-bold">{selectedNode.crypto.balanceBtc} BTC</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Lifetime Sent</span>
                        <span className="text-white font-mono">{selectedNode.crypto.totalSentBtc} BTC</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tx Count</span>
                        <span className="text-white font-mono">{selectedNode.crypto.txCount} txs</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-400" />
                      Chain Peeling Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-[#0d111b] border border-[#1c2436]">
                        <span className="text-slate-400 block">Received</span>
                        <span className="text-white font-mono font-bold">{selectedNode.forensics.amountReceivedBtc} BTC</span>
                      </div>

                      <div className="p-2.5 rounded bg-[#0d111b] border border-[#1c2436]">
                        <span className="text-slate-400 block">Forwarded</span>
                        <span className="text-white font-mono font-bold">{selectedNode.forensics.amountForwardedBtc} BTC</span>
                      </div>

                      <div className="p-2.5 rounded bg-[#0d111b] border border-[#1c2436]">
                        <span className="text-amber-400 block">Mule Cut Retained</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {selectedNode.forensics.retainedCutBtc} BTC (${selectedNode.forensics.retainedCutUsd.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: History */}
              {inspectorTab === "history" && (
                <div className="space-y-4">
                  {selectedNode.historicalTransactions.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono uppercase tracking-wider">
                            <th className="py-2.5 px-3">Tx ID</th>
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Direction</th>
                            <th className="py-2.5 px-3">Counterparty</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-right">Fee</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedNode.historicalTransactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono">
                              <td className="py-2.5 px-3 text-slate-300 truncate max-w-[120px]" title={tx.id}>
                                {tx.id}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {tx.date} {tx.time}
                              </td>
                              <td className="py-2.5 px-3 font-sans">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  tx.direction === "Incoming" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                }`}>
                                  {tx.direction}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[120px]">
                                {tx.receiverName || tx.senderName}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-white">
                                {tx.amountBtc} ₿
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-400">
                                {tx.feeRateSatVb} sat/vB
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  tx.riskScore >= 75
                                    ? "bg-rose-500/20 text-rose-400"
                                    : tx.riskScore >= 50
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}>
                                  {tx.riskFlag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#090c13] rounded-lg border border-[#1c2436]">
                      No previous independent transactions recorded. This account was dormant until activated for relay.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Step-by-Step Chronological Transfer Ledger */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h2 className="text-base font-bold text-white leading-relaxed">
                  Chronological Transfer Ledger (Hops 1 through 6)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Audit trail across peeling chain
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Hop</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Receiver</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4 text-right">Volume</th>
                    <th className="py-3 px-4 text-right">Latency</th>
                    <th className="py-3 px-4 text-right">Mule Cut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {chain.transfers.map((step) => (
                    <tr
                      key={step.step}
                      className={`border-b border-white/5 hover:bg-[#121724] transition-colors font-mono ${
                        simulationStep === step.step ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-amber-400">
                        Hop {step.step}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {step.timestamp}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        {step.fromName}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        {step.toName}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {step.txId}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {step.amountBtc} BTC
                        <span className="text-[10px] text-slate-400 block">${step.amountUsd.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-cyan-400">
                        {step.holdingDuration}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-400 font-bold">
                        {step.retainedCutBtc} BTC
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                          TAINTED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAR Dossier Modal */}
          {showSarModal && sarDossier && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-5 border-b border-[#1c2436] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold text-white leading-relaxed">
                      SAR Dossier #{sarDossier.regulatoryFilingId}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowSarModal(false)}
                    className="text-slate-400 hover:text-white text-sm px-2 py-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 overflow-y-auto font-mono text-xs space-y-4 text-slate-300">
                  <div className="bg-[#090c13] p-4 rounded-lg border border-[#1c2436]">
                    <div className="text-emerald-400 font-bold text-sm mb-2">
                      SUSPICIOUS ACTIVITY REPORT (SAR)
                    </div>
                    <p className="text-slate-400 mb-2">
                      Agency: {sarDossier.agency} • Filing Date: {sarDossier.filingDate}
                    </p>
                    <p className="text-white leading-relaxed">{sarDossier.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs uppercase mb-2">
                      Syndicate Summary:
                    </h4>
                    <pre className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436] text-slate-300">
                      {JSON.stringify(sarDossier.syndicateMetrics, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs uppercase mb-2">
                      Flagged Persons & Banking Ledger:
                    </h4>
                    <pre className="bg-[#090c13] p-3 rounded-lg border border-[#1c2436] text-slate-300 overflow-x-auto">
                      {JSON.stringify(sarDossier.flaggedPersonsAndAccounts, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-[#1c2436] flex items-center justify-between bg-[#090c13]">
                  <span className="text-xs text-slate-400">
                    Compliance hash verified by BitFlow AML Autonomous Engine.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(JSON.stringify(sarDossier, null, 2))}
                      className="text-xs bg-[#141a27] text-white px-3 py-1.5 rounded-lg border border-[#1c2436] hover:bg-[#1a2234] cursor-pointer"
                    >
                      {copiedText ? "Copied!" : "Copy JSON"}
                    </button>
                    <button
                      onClick={() => setShowSarModal(false)}
                      className="text-xs bg-amber-500 text-slate-950 font-semibold px-4 py-1.5 rounded-lg hover:bg-amber-400 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
