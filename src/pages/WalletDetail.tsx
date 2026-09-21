import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  FileCheck,
  User,
  RefreshCw,
  Pin,
  PinOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function WalletDetail() {
  const { address } = useParams<{ address: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {
    isWalletPinned,
    addWatchedWalletItem,
    removeWatchedWalletItem,
    watchedWallets,
  } = useAuth();

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/wallets/${address}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallet detail:", err);
        setLoading(false);
      });
  }, [address]);

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <RefreshCw className="animate-spin" size={16} /> Loading wallet dossier...
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main p-8 text-white">
          <h2 className="text-base font-bold">Wallet not found</h2>
          <Link to="/wallets" className="text-amber-400 mt-4 inline-block text-xs font-semibold">
            Return to Wallets Directory
          </Link>
        </main>
      </div>
    );
  }

  const member = data.member;
  const stats = data.stats;

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Regulatory Synthetic Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-[#0d111b] border border-[#1c2436] flex items-center justify-between text-xs text-amber-400">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} className="text-amber-400" />
              <span>SYNTHETIC DEMO PROFILE — BENCHMARK DATASET</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              DATA_SOURCE: BENCHMARK_EXCEL
            </span>
          </div>

          {/* Profile Overview Card */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0 font-mono">
                  {member?.name ? member.name[0] : "W"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-white leading-relaxed">{member?.name || "Subject Wallet"}</h1>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#090c13] text-amber-400 border border-[#1c2436]">
                      {member?.memberId || "M-DEMO"}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {member?.profileStatus || "Active"}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-400 mt-1">{address}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 flex-wrap">
                    <span><strong className="text-slate-300">Location:</strong> {member?.city || "Unknown"}, {member?.country || "India"}</span>
                    <span><strong className="text-slate-300">Age:</strong> {member?.age || "N/A"}</span>
                    <span><strong className="text-slate-300">Occupation:</strong> {member?.occupation || "N/A"}</span>
                    <span><strong className="text-slate-300">Account Created:</strong> {member?.profileCreated || "2026-07-01"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Risk */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436] text-center min-w-[110px]">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Risk Score
                  </span>
                  <div className={`text-xl font-bold font-mono ${stats.riskScore >= 70 ? "text-rose-400" : stats.riskScore >= 40 ? "text-amber-400" : "text-emerald-400"}`}>
                    {stats.riskScore}/100
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!address) return;
                      const pinned = isWalletPinned(address);
                      if (pinned) {
                        const rec = watchedWallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
                        if (rec) removeWatchedWalletItem(rec.id);
                      } else {
                        addWatchedWalletItem({
                          address,
                          label: member?.name ? `${member.name} (${member.memberId || "Subject"})` : `Wallet ${address.slice(0, 10)}`,
                          category: stats.riskScore >= 70 ? "SUSPECT" : "GENUINE",
                          riskScore: stats.riskScore || 50,
                          balanceBtc: stats.netBalanceBtc || 0,
                          notes: `Pinned from Dossier. Location: ${member?.city || "Unknown"}`,
                          txCount: stats.txCount || 0,
                          lastActive: "Recent Activity",
                        });
                      }
                    }}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isWalletPinned(address || "")
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-[#090c13] text-slate-300 hover:text-white border-[#1c2436]"
                    }`}
                    title={isWalletPinned(address || "") ? "Unpin wallet" : "Pin to Watchlist"}
                  >
                    {isWalletPinned(address || "") ? (
                      <>
                        <PinOff size={13} className="text-rose-400" />
                        <span>Pinned</span>
                      </>
                    ) : (
                      <>
                        <Pin size={13} className="text-amber-400" />
                        <span>Pin to Watchlist</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/investigation?target=${address}`}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert size={14} />
                    <span>Investigate</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-[#1c2436]">
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                <span className="text-[11px] text-slate-400 uppercase block font-semibold">Total Transacted</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">{stats.txCount} txs</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                <span className="text-[11px] text-slate-400 uppercase block font-semibold">Total Received</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">+{stats.totalReceived} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                <span className="text-[11px] text-slate-400 uppercase block font-semibold">Total Sent</span>
                <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">-{stats.totalSent} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                <span className="text-[11px] text-slate-400 uppercase block font-semibold">Net Balance</span>
                <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{stats.netBalance} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1c2436]">
                <span className="text-[11px] text-slate-400 uppercase block font-semibold">Counterparties</span>
                <span className="text-sm font-bold text-slate-200 font-mono mt-0.5 block">{stats.counterpartiesCount} unique</span>
              </div>
            </div>
          </div>

          {/* 3 Column Detailed Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 1. Core KYC & ID Reference */}
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <FileCheck className="text-amber-400" size={16} />
                <span>KYC & Identification</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">ID Proof Type:</span>
                  <span className="font-medium text-white">{member?.idProofType || "Aadhaar (Demo Ref)"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Synthetic ID Ref:</span>
                  <span className="font-mono text-amber-400">{member?.syntheticIdRef || "DEMO-ID-REF-XXXX"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">KYC Status:</span>
                  <span className="font-semibold text-emerald-400">{member?.kycStatus || "Verified"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Verification Date:</span>
                  <span className="text-slate-300 font-mono">{member?.verificationDate || "2026-08-01"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">KYC Case ID:</span>
                  <span className="font-mono text-slate-400">{member?.kycCaseId || "KYC-DEMO-0001"}</span>
                </div>
              </div>
            </div>

            {/* 2. Banking Gateway & Custody */}
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <Building className="text-amber-400" size={16} />
                <span>Banking & Custody</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Bank Account ID:</span>
                  <span className="font-mono text-amber-400">{member?.accountId || "DEMO-BANK-000001"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Routing Ref:</span>
                  <span className="font-mono text-slate-300">{member?.routingRef || "DEMO-IFSC-00001"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Custody Model:</span>
                  <span className="text-slate-300">{member?.custodyModel || "Synthetic Custodial Demo"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="font-semibold text-emerald-400">{member?.accountStatus || "Active"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="text-slate-300">{member?.accountType || "Bitcoin Wallet"}</span>
                </div>
              </div>
            </div>

            {/* 3. Nominee Details */}
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <User className="text-amber-400" size={16} />
                <span>Registered Intermediary</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Nominee Name:</span>
                  <span className="font-medium text-white">{member?.nomineeName || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Relationship:</span>
                  <span className="text-slate-300">{member?.nomineeRelationship || "Relative"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-mono text-slate-400">{member?.nomineePhone || "+91-91111-20000"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Nominee ID:</span>
                  <span className="font-mono text-amber-400">{member?.nomineeRef || "DEMO-NOM-0001"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Timeline */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
            <h3 className="text-base font-bold text-white leading-relaxed mb-1">
              Historical Behavior & Threat Timeline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Activity tracking from baseline inception to real-time risk classification
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.behaviorTimeline.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-[#090c13] border border-[#1c2436] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500">{item.date}</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1 leading-relaxed">{item.event}</p>
                  </div>
                  <span
                    className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded w-max ${
                      item.level === "critical"
                        ? "bg-rose-500/10 text-rose-400"
                        : item.level === "warning"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {item.level.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white leading-relaxed">Transactions Ledger</h3>
              <span className="text-xs text-slate-400 font-mono">
                {data.transactions.length} Records Found
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Counterparty</th>
                    <th className="py-3 px-4 text-right">Amount (BTC)</th>
                    <th className="py-3 px-4 text-right">USD Value</th>
                    <th className="py-3 px-4 text-center">Risk Flag</th>
                    <th className="py-3 px-4">AI Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t: any) => {
                    const isOut = t.senderAddress === address;
                    return (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono">
                        <td className="py-3 px-4 text-amber-400 font-bold">{t.id}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {t.date} {t.time}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isOut ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {isOut ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                            {isOut ? "Outgoing" : "Incoming"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans font-medium text-white">
                          {isOut ? t.receiverName : t.senderName}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">{t.amountBtc} BTC</td>
                        <td className="py-3 px-4 text-right text-slate-400">${t.amountUsd.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              t.riskFlag === "High"
                                ? "bg-rose-500/10 text-rose-400"
                                : t.riskFlag === "Review"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {t.riskFlag}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate">
                          {t.aiInterpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
