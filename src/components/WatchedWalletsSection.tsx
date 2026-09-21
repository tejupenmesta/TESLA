import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Pin,
  PinOff,
  Search,
  Plus,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ShieldAlert,
  Database,
  RefreshCw,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { WatchedWallet } from "../lib/firebase";

interface WatchedWalletsSectionProps {
  btcPriceUsd?: number;
}

export default function WatchedWalletsSection({ btcPriceUsd = 64250 }: WatchedWalletsSectionProps) {
  const {
    user,
    watchedWallets,
    addWatchedWalletItem,
    removeWatchedWalletItem,
  } = useAuth();

  const [liveBtcPrice, setLiveBtcPrice] = useState<number>(btcPriceUsd);

  useEffect(() => {
    fetch("/api/bitcoin/market")
      .then((res) => res.json())
      .then((data) => {
        if (data?.currentPrice?.usd) {
          setLiveBtcPrice(data.currentPrice.usd);
        }
      })
      .catch((e) => console.warn("Live BTC price fetch warning:", e));
  }, []);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [sortBy, setSortBy] = useState<"RISK_DESC" | "BALANCE_DESC" | "NAME_ASC">("RISK_DESC");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<WatchedWallet["category"]>("SUSPECT");
  const [newRiskScore, setNewRiskScore] = useState<number>(75);
  const [newBalance, setNewBalance] = useState<string>("12.50");
  const [newNotes, setNewNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isPinModalOpen && availableWallets.length === 0) {
      fetch("/api/wallets")
        .then((res) => res.json())
        .then((data) => {
          if (data.wallets) {
            setAvailableWallets(data.wallets.slice(0, 10));
          }
        })
        .catch((err) => console.error("Could not fetch candidate wallets:", err));
    }
  }, [isPinModalOpen, availableWallets.length]);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handlePickCandidate = (w: any) => {
    setNewAddress(w.address);
    setNewLabel(`${w.demoPerson || "Target"} (${w.memberId || "Node"})`);
    setNewRiskScore(w.riskScore || 50);
    setNewCategory(w.riskScore >= 70 ? "SUSPECT" : "GENUINE");
    setNewBalance(((w.totalReceived || 0) - (w.totalSent || 0)).toFixed(2));
    setNewNotes(`Flagged in automated surveillance. Cluster: ${w.city || "Global"}`);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newAddress.trim()) {
      setFormError("Please enter a valid Bitcoin wallet address.");
      return;
    }

    if (!newLabel.trim()) {
      setFormError("Please provide a label for this wallet.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addWatchedWalletItem({
        address: newAddress.trim(),
        label: newLabel.trim(),
        category: newCategory,
        riskScore: Number(newRiskScore) || 50,
        balanceBtc: parseFloat(newBalance) || 0,
        notes: newNotes.trim() || undefined,
        txCount: Math.floor(Math.random() * 80) + 12,
        lastActive: "Just now",
      });

      setNewAddress("");
      setNewLabel("");
      setNewCategory("SUSPECT");
      setNewRiskScore(75);
      setNewBalance("12.50");
      setNewNotes("");
      setIsPinModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to pin wallet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWallets = watchedWallets
    .filter((w) => {
      const matchesSearch =
        search.trim() === "" ||
        w.label.toLowerCase().includes(search.toLowerCase()) ||
        w.address.toLowerCase().includes(search.toLowerCase()) ||
        (w.notes && w.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" || w.category?.toUpperCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "RISK_DESC") return (b.riskScore || 0) - (a.riskScore || 0);
      if (sortBy === "BALANCE_DESC") return (b.balanceBtc || 0) - (a.balanceBtc || 0);
      return a.label.localeCompare(b.label);
    });

  const totalBtcMonitored = watchedWallets.reduce(
    (acc, curr) => acc + (curr.balanceBtc || 0),
    0
  );
  const highRiskCount = watchedWallets.filter((w) => (w.riskScore || 0) >= 70).length;

  return (
    <div id="watched-wallets-section" className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] mb-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1c2436]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Pin size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-relaxed">
                Watched Wallets Ledger
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#141a27] text-amber-400 font-medium border border-[#1e293b]">
                {watchedWallets.length} Pinned
              </span>
              {user && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  <Database size={11} />
                  Firestore Synced
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Targeted Bitcoin addresses pinned for continuous balance and threat monitoring
            </p>
          </div>
        </div>

        {/* Stats & Pin Action */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 px-3.5 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block font-mono">High Risk</span>
              <strong className="text-rose-400 font-mono text-sm">{highRiskCount} Flagged</strong>
            </div>
            <div className="w-px h-6 bg-[#1c2436]"></div>
            <div>
              <span className="text-slate-500 text-[11px] block font-mono">Total Volume</span>
              <strong className="text-amber-400 font-mono text-sm">{totalBtcMonitored.toFixed(2)} BTC</strong>
            </div>
          </div>

          <button
            id="pin-new-wallet-btn"
            onClick={() => setIsPinModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Pin Wallet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 py-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by label, address, notes..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#090c13] border border-[#1c2436] rounded-lg text-xs font-mono">
            {["ALL", "SUSPECT", "MIXER", "EXCHANGE", "WHALE"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-[#090c13] border border-[#1c2436] rounded-lg px-2 py-1 text-xs font-mono">
            <ArrowUpDown size={12} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs border-none outline-none py-1 pr-1 cursor-pointer"
            >
              <option value="RISK_DESC" className="bg-[#0e121b] text-white">Risk: High → Low</option>
              <option value="BALANCE_DESC" className="bg-[#0e121b] text-white">Balance: High → Low</option>
              <option value="NAME_ASC" className="bg-[#0e121b] text-white">Name: A → Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#090c13] border border-[#1c2436] rounded-lg text-xs">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "GRID" ? "bg-[#1c2436] text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Card Grid"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "TABLE" ? "bg-[#1c2436] text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Table"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Presentation */}
      {filteredWallets.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-[#090c13] border border-[#1c2436] my-2">
          <p className="text-sm font-semibold text-slate-300">No watched wallets match your criteria</p>
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Pin a Wallet
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map((wallet) => {
            const usdValue = (wallet.balanceBtc || 0) * liveBtcPrice;
            const isHighRisk = (wallet.riskScore || 0) >= 70;

            return (
              <div
                key={wallet.id}
                id={`watched-wallet-card-${wallet.id}`}
                className="p-6 rounded-xl bg-[#090c13] border border-[#1c2436] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#141a27] text-slate-300">
                      {wallet.category || "WATCHED"}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isHighRisk ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
                        }`}
                      >
                        Risk {wallet.riskScore || 0}/100
                      </span>

                      <button
                        onClick={() => removeWatchedWalletItem(wallet.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Unpin wallet"
                      >
                        <PinOff size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base truncate tracking-tight mb-2 leading-relaxed" title={wallet.label}>
                    {wallet.label}
                  </h3>

                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0e121b] border border-[#1e293b]">
                    <span className="font-mono text-xs text-slate-300 truncate" title={wallet.address}>
                      {wallet.address}
                    </span>
                    <button
                      onClick={() => handleCopy(wallet.address)}
                      className="text-slate-500 hover:text-amber-400 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedAddress === wallet.address ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  {wallet.notes && (
                    <p className="text-sm text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {wallet.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#1c2436]">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[11px] uppercase font-mono text-slate-500 block">Balance</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        {(wallet.balanceBtc || 0).toFixed(4)} BTC
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-mono text-slate-500 block">USD Value</span>
                      <span className="text-sm font-semibold text-slate-300 font-mono">
                        ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#141a27] text-xs">
                    <span className="font-mono text-slate-500">
                      {wallet.txCount || 1} transactions
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/investigation?target=${wallet.address}`}
                        className="font-medium text-slate-400 hover:text-white"
                      >
                        Trace
                      </Link>
                      <Link
                        to={`/wallet/${wallet.address}`}
                        className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Streamlined Enterprise Table */
        <div className="overflow-x-auto rounded-lg border border-[#1c2436] bg-[#090c13]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1c2436] bg-[#0d111b] text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-right">USD Value</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.map((wallet) => {
                const usdValue = (wallet.balanceBtc || 0) * liveBtcPrice;
                const isHighRisk = (wallet.riskScore || 0) >= 70;
                return (
                  <tr key={wallet.id} className="border-b border-white/5 hover:bg-[#121724] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white max-w-[160px] truncate leading-relaxed">
                      {wallet.label}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-300">
                      {wallet.category || "WATCHED"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isHighRisk ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                        {wallet.riskScore || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[150px]">{wallet.address}</span>
                        <button
                          onClick={() => handleCopy(wallet.address)}
                          className="text-slate-500 hover:text-amber-400 cursor-pointer"
                        >
                          {copiedAddress === wallet.address ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {(wallet.balanceBtc || 0).toFixed(4)} BTC
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/wallet/${wallet.address}`}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => removeWatchedWalletItem(wallet.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <PinOff size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pin New Wallet Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#1c2436] flex items-center justify-between bg-[#090c13]">
              <h3 className="text-base font-bold text-white">Pin Wallet</h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              {availableWallets.length > 0 && (
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1.5">
                    Quick Pick Candidate:
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto">
                    {availableWallets.slice(0, 4).map((w, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handlePickCandidate(w)}
                        className="text-left p-2 rounded-lg bg-[#090c13] hover:bg-[#141b29] border border-[#1c2436] text-xs cursor-pointer truncate"
                      >
                        <span className="font-semibold text-white block truncate">{w.demoPerson || "Entity"}</span>
                        <span className="font-mono text-slate-500 text-[10px] block truncate">{w.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Bitcoin Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter Bitcoin address"
                    className="w-full px-3 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-white font-mono text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Target Mule"
                      className="w-full px-3 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-white text-xs focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-white text-xs focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="SUSPECT">SUSPECT</option>
                      <option value="MIXER">MIXER</option>
                      <option value="EXCHANGE">EXCHANGE</option>
                      <option value="WHALE">WHALE</option>
                      <option value="GENUINE">GENUINE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Risk Score: {newRiskScore}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newRiskScore}
                      onChange={(e) => setNewRiskScore(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Balance (BTC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090c13] border border-[#1c2436] text-white font-mono text-xs focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Pin size={13} />}
                    <span>Pin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
