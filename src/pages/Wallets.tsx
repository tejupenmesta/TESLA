import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Search,
  ChevronRight,
  RefreshCw,
  Pin,
  PinOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Wallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const {
    isWalletPinned,
    addWatchedWalletItem,
    removeWatchedWalletItem,
    watchedWallets,
  } = useAuth();

  useEffect(() => {
    fetch("/api/wallets")
      .then((res) => res.json())
      .then((data) => {
        setWallets(data.wallets || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallets:", err);
        setLoading(false);
      });
  }, []);

  const filtered = wallets.filter((w) => {
    const matchesSearch =
      search.trim() === "" ||
      w.address.toLowerCase().includes(search.toLowerCase()) ||
      w.demoPerson.toLowerCase().includes(search.toLowerCase()) ||
      w.memberId.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL"
        ? true
        : riskFilter === "HIGH"
        ? w.riskScore >= 70
        : riskFilter === "MEDIUM"
        ? w.riskScore >= 40 && w.riskScore < 70
        : w.riskScore < 40;

    return matchesSearch && matchesRisk;
  });

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
                  Wallet Intelligence Directory
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                  100 BENCHMARK WALLETS
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Profiling counterparty clusters, risk propagation, and historical velocity deviations
              </p>
            </div>

            <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#0d111b] border border-[#1c2436] text-amber-400">
              SYNTHETIC DEMO PROFILES
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wallet address, person name, member ID, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Risk:</span>
              <div className="flex bg-[#090c13] p-1 rounded-lg border border-[#1c2436]">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      riskFilter === lvl ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436]">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-400 gap-2 text-sm">
                <RefreshCw className="animate-spin" size={16} /> Loading wallet directory...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono uppercase tracking-wider">
                      <th className="py-3 px-4">Member ID</th>
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Bitcoin Address</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-center">Txs</th>
                      <th className="py-3 px-4 text-right">Received</th>
                      <th className="py-3 px-4 text-right">Sent</th>
                      <th className="py-3 px-4 text-center">Risk Score</th>
                      <th className="py-3 px-4 text-center">KYC Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w) => (
                      <tr key={w.address} className="border-b border-white/5 hover:bg-[#121724] transition-colors font-mono">
                        <td className="py-3 px-4 font-bold text-amber-400">{w.memberId}</td>
                        <td className="py-3 px-4 font-sans font-medium text-white">{w.demoPerson}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {w.address.slice(0, 12)}...{w.address.slice(-6)}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300">{w.city}</td>
                        <td className="py-3 px-4 text-center text-white font-bold">{w.txCount}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-semibold">+{w.totalReceived} BTC</td>
                        <td className="py-3 px-4 text-right text-rose-400 font-semibold">-{w.totalSent} BTC</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              w.riskScore >= 75
                                ? "text-rose-400 bg-rose-500/10"
                                : w.riskScore >= 50
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-emerald-400 bg-emerald-500/10"
                            }`}
                          >
                            {w.riskScore}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="text-slate-300 font-medium">
                            {w.kycStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const pinned = isWalletPinned(w.address);
                                if (pinned) {
                                  const rec = watchedWallets.find((item) => item.address.toLowerCase() === w.address.toLowerCase());
                                  if (rec) removeWatchedWalletItem(rec.id);
                                } else {
                                  addWatchedWalletItem({
                                    address: w.address,
                                    label: `${w.demoPerson} (${w.memberId})`,
                                    category: w.riskScore >= 70 ? "SUSPECT" : "GENUINE",
                                    riskScore: w.riskScore,
                                    balanceBtc: Math.max(0, (w.totalReceived || 0) - (w.totalSent || 0)),
                                    notes: `Monitored from Directory. City: ${w.city}`,
                                    txCount: w.txCount,
                                    lastActive: "Monitored",
                                  });
                                }
                              }}
                              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                                isWalletPinned(w.address)
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-[#0d111b] text-slate-400 hover:text-white border-[#1c2436]"
                              }`}
                              title={isWalletPinned(w.address) ? "Unpin wallet" : "Pin to Watchlist"}
                            >
                              {isWalletPinned(w.address) ? <PinOff size={13} className="text-rose-400" /> : <Pin size={13} className="text-amber-400" />}
                            </button>

                            <Link
                              to={`/wallet/${w.address}`}
                              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
