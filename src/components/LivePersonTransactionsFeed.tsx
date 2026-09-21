import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Bitcoin,
  DollarSign,
  User,
  Filter,
  Eye,
} from "lucide-react";

export interface LivePersonTransaction {
  id: string;
  date: string;
  time: string;
  amountBtc: number;
  amountUsd: number;
  riskScore: number;
  riskFlag: string;
  txType: string;
  paymentStatus: string;
  senderMember: {
    memberId: string;
    name: string;
    occupation: string;
    isScammer: boolean;
    role: string;
    riskScore: number;
    accountId: string;
  };
  receiverMember: {
    memberId: string;
    name: string;
    occupation: string;
    isScammer: boolean;
    role: string;
    riskScore: number;
    accountId: string;
  };
  isScammerInvolved: boolean;
  aiInterpretation?: string;
}

interface LivePersonTransactionsFeedProps {
  transactions: LivePersonTransaction[];
  onSelectPersonById: (memberId: string) => void;
}

export default function LivePersonTransactionsFeed({
  transactions,
  onSelectPersonById,
}: LivePersonTransactionsFeedProps) {
  const [filter, setFilter] = useState<"ALL" | "SCAMMER_FLOWS" | "GENUINE_ONLY">("ALL");

  const filteredTxs = transactions.filter((tx) => {
    if (filter === "SCAMMER_FLOWS") return tx.isScammerInvolved;
    if (filter === "GENUINE_ONLY") return !tx.isScammerInvolved;
    return true;
  });

  return (
    <div id="live-person-transactions" className="slot-panel p-8 sm:p-10 mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              <Activity size={20} className="text-emerald-400" />
              Live Transactions of Persons
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              REAL-TIME FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Person-to-person cryptographic transfers with instantaneous scammer vs genuine counterparty classification
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Live ({transactions.length})
          </button>
          <button
            onClick={() => setFilter("SCAMMER_FLOWS")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filter === "SCAMMER_FLOWS"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert size={13} className="text-rose-400" />
            Scammer Flows
          </button>
          <button
            onClick={() => setFilter("GENUINE_ONLY")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filter === "GENUINE_ONLY"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={13} className="text-emerald-400" />
            Genuine Only
          </button>
        </div>
      </div>

      {/* Live Transaction Stream List with Generous Spacing */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {filteredTxs.slice(0, 20).map((tx, idx) => {
          const isThreat = tx.isScammerInvolved || tx.riskScore >= 60;
          return (
            <div
              key={tx.id || `live-tx-${idx}`}
              className={`p-6 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                isThreat
                  ? "bg-slate-950 border-rose-900/60 hover:border-rose-700"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Person Transfer Path (Sender -> Receiver) */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Sender Person */}
                <div
                  onClick={() => onSelectPersonById(tx.senderMember.memberId)}
                  className="flex items-center gap-3 cursor-pointer group shrink-0"
                  title={`Click to preview full profile of ${tx.senderMember.name}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.senderMember.isScammer
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {tx.senderMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {tx.senderMember.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({tx.senderMember.memberId})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {tx.senderMember.isScammer ? (
                        <span className="text-red-400 font-semibold flex items-center gap-0.5">
                          🚨 Scammer / Mule
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          🛡️ Genuine User
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transfer Arrow & Flow Info */}
                <div className="flex flex-col items-center justify-center px-3 shrink-0">
                  <div className="text-[10px] font-mono text-slate-400 mb-0.5">{tx.txType || "Transfer"}</div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="w-5 h-0.5 bg-slate-700"></span>
                    <ArrowRight size={14} className={isThreat ? "text-amber-400" : "text-slate-400"} />
                  </div>
                </div>

                {/* Receiver Person */}
                <div
                  onClick={() => onSelectPersonById(tx.receiverMember.memberId)}
                  className="flex items-center gap-3 cursor-pointer group shrink-0"
                  title={`Click to preview full profile of ${tx.receiverMember.name}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.receiverMember.isScammer
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {tx.receiverMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {tx.receiverMember.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({tx.receiverMember.memberId})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {tx.receiverMember.isScammer ? (
                        <span className="text-red-400 font-semibold">🚨 Flagged Mule</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">🛡️ Genuine User</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount, Time, Risk & Profile Preview Button */}
              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                <div className="text-right">
                  <div className="text-base font-bold text-white font-mono flex items-center justify-end gap-1">
                    <Bitcoin size={15} className="text-amber-400" />
                    {tx.amountBtc.toFixed(4)} BTC
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ${tx.amountUsd.toLocaleString()} USD
                  </div>
                </div>

                {/* Risk Tag */}
                <div className="text-right">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border inline-block ${
                      tx.riskScore >= 75
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : tx.riskScore >= 50
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    Risk: {tx.riskScore}/100
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {tx.time || "Live"}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPersonById(tx.senderMember.memberId)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors border border-slate-800 cursor-pointer"
                  title="Preview Sender Profile"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTxs.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-xs">
          No live transactions matching the selected filter.
        </div>
      )}
    </div>
  );
}
