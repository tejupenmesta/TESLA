import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Bell, ShieldAlert, CheckCircle2, Sliders } from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
  type: "whale" | "fee" | "block";
}

export default function Alerts() {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "Whale Transfer Alert",
      condition: "Trigger when single transaction >= 50 BTC",
      enabled: true,
      type: "whale",
    },
    {
      id: "2",
      name: "Fee Spike Warning",
      condition: "Trigger when recommended fee surpasses 35 sat/vB",
      enabled: true,
      type: "fee",
    },
    {
      id: "3",
      name: "New Block Notification",
      condition: "Trigger on each new verified Bitcoin block header",
      enabled: false,
      type: "block",
    },
    {
      id: "4",
      name: "Mempool Congestion Alert",
      condition: "Trigger when mempool memory usage exceeds 280 MB",
      enabled: true,
      type: "fee",
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
                  Network Alerts Center
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  MONITORING LIVE
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated triggers for mempool anomalies, fee surges, and whale movements
              </p>
            </div>

            <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#0d111b] border border-[#1c2436] text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Watcher Engine Active</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1c2436]">
              <div>
                <h2 className="text-base font-bold text-white leading-relaxed">Configured Trigger Rules</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Manage notifications dispatched to your workspace</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Sliders size={13} />
                <span>{rules.length} Rules Configured</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="py-4 flex items-center justify-between hover:bg-[#090c13] px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
                        rule.enabled
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-[#090c13] text-slate-500 border border-[#1c2436]"
                      }`}
                    >
                      {rule.type === "whale" ? "🐋" : <Bell size={16} />}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white leading-relaxed">{rule.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{rule.condition}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      rule.enabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-[#090c13] text-slate-400 border-[#1c2436] hover:text-white"
                    }`}
                  >
                    {rule.enabled ? "Active" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
            <div className="pb-4 mb-4 border-b border-[#1c2436]">
              <h2 className="text-base font-bold text-white leading-relaxed">Recent Trigger Log</h2>
              <p className="text-xs text-slate-400 leading-relaxed">Historical audit of dispatched trigger events</p>
            </div>

            <div className="space-y-3">
              <div className="bg-[#090c13] border border-[#1c2436] rounded-lg p-4 flex items-start justify-between text-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="font-semibold text-white text-sm block leading-relaxed">Whale Transfer Detected</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">Tx f19c82...aa72 broadcasted with 124.50 BTC ($10.2M USD)</p>
                  </div>
                </div>
                <span className="text-slate-500 font-mono">5m ago</span>
              </div>

              <div className="bg-[#090c13] border border-[#1c2436] rounded-lg p-4 flex items-start justify-between text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="font-semibold text-white text-sm block leading-relaxed">Block Height Milestone</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">Block #912,345 confirmed by Foundry USA Pool (3,120 txs)</p>
                  </div>
                </div>
                <span className="text-slate-500 font-mono">14m ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
