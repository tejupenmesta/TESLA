import { useState, useMemo } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Search,
  Eye,
  Bot,
  User,
  Building2,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";

export interface CategorizedPerson {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  age: number;
  occupation: string;
  profileStatus: string;
  accountId: string;
  bankName: string;
  routingRef: string;
  btcWalletAddress: string;
  senderAddress: string;
  accountStatus: string;
  idProofType: string;
  syntheticIdRef: string;
  kycStatus: string;
  verificationDate: string;
  kycCaseId: string;
  nomineeName: string;
  nomineeRelationship: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeRef: string;
  isScammer: boolean;
  role: string;
  riskScore: number;
  subCategory?: "SCAM_ORIGINATOR" | "PEELING_MULE" | "EXPLOITED_VICTIM" | "MIXER_AGGREGATOR" | "VERIFIED_GENUINE";
  reason: string;
  txCount: number;
  totalBtcVolume: number;
}

export type CategoryFilterType =
  | "ALL"
  | "ALL_SCAMMERS"
  | "ORIGINATORS"
  | "PEELING_MULES"
  | "VICTIMS"
  | "MIXERS"
  | "GENUINE";

interface CategorizedPersonsSectionProps {
  scammers: CategorizedPerson[];
  genuine: CategorizedPerson[];
  selectedCategory?: string;
  onSelectCategory?: (cat: any) => void;
  onSelectPerson: (person: CategorizedPerson) => void;
  onAskAI: (person: CategorizedPerson) => void;
}

export default function CategorizedPersonsSection({
  scammers,
  genuine,
  onSelectPerson,
  onAskAI,
}: CategorizedPersonsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>("ALL_SCAMMERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  // Calculate counts for categories
  const originatorsCount = scammers.filter((s) => s.subCategory === "SCAM_ORIGINATOR" || s.role.includes("Originator") || s.role.includes("Kingpin")).length;
  const peelingMulesCount = scammers.filter((s) => s.subCategory === "PEELING_MULE" || s.role.includes("Mule") || s.role.includes("Intermediary")).length;
  const victimsCount = scammers.filter((s) => s.subCategory === "EXPLOITED_VICTIM" || s.role.includes("Victim")).length;
  const mixersCount = scammers.filter((s) => s.subCategory === "MIXER_AGGREGATOR" || s.role.includes("Aggregator") || s.role.includes("Mixer")).length;

  const filteredList = useMemo(() => {
    let list: CategorizedPerson[] = [];

    switch (activeCategory) {
      case "ALL":
        list = [...scammers, ...genuine];
        break;
      case "ALL_SCAMMERS":
        list = [...scammers];
        break;
      case "ORIGINATORS":
        list = scammers.filter((s) => s.subCategory === "SCAM_ORIGINATOR" || s.role.includes("Originator") || s.role.includes("Kingpin"));
        break;
      case "PEELING_MULES":
        list = scammers.filter((s) => s.subCategory === "PEELING_MULE" || s.role.includes("Mule") || s.role.includes("Intermediary"));
        break;
      case "VICTIMS":
        list = scammers.filter((s) => s.subCategory === "EXPLOITED_VICTIM" || s.role.includes("Victim"));
        break;
      case "MIXERS":
        list = scammers.filter((s) => s.subCategory === "MIXER_AGGREGATOR" || s.role.includes("Aggregator") || s.role.includes("Mixer"));
        break;
      case "GENUINE":
        list = [...genuine];
        break;
      default:
        list = [...scammers];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.memberId.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.occupation.toLowerCase().includes(q) ||
          p.accountId.toLowerCase().includes(q) ||
          p.syntheticIdRef.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
      );
    }

    if (riskFilter === "CRITICAL") {
      list = list.filter((p) => p.riskScore >= 75);
    } else if (riskFilter === "HIGH") {
      list = list.filter((p) => p.riskScore >= 50 && p.riskScore < 75);
    } else if (riskFilter === "NORMAL") {
      list = list.filter((p) => p.riskScore < 50);
    }

    return list;
  }, [scammers, genuine, activeCategory, searchQuery, riskFilter]);

  const getRoleBadgeStyle = (person: CategorizedPerson) => {
    if (!person.isScammer) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    if (person.subCategory === "SCAM_ORIGINATOR" || person.role.includes("Originator") || person.role.includes("Kingpin")) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/50";
    }
    if (person.subCategory === "PEELING_MULE" || person.role.includes("Mule")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/50";
    }
    if (person.subCategory === "EXPLOITED_VICTIM" || person.role.includes("Victim")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/50";
    }
    if (person.subCategory === "MIXER_AGGREGATOR" || person.role.includes("Mixer") || person.role.includes("Aggregator")) {
      return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    }
    return "bg-red-500/20 text-red-300 border-red-500/40";
  };

  return (
    <div id="categorized-persons-section" className="slot-panel p-8 sm:p-10 mb-12">
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              <ShieldAlert size={20} className="text-rose-400" />
              Divided Categories of Scammed & Genuine Accounts
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
              FORENSIC TAXONOMY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accounts categorized into scam originators, peeling mules, victims, mixing relays, and genuine users
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, M001, bank, IFSC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical (≥75)</option>
            <option value="HIGH">High (50-74)</option>
            <option value="NORMAL">Normal (&lt;50)</option>
          </select>
        </div>
      </div>

      {/* Divided Category Pills / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveCategory("ALL_SCAMMERS")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "ALL_SCAMMERS"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <ShieldAlert size={14} className="text-rose-400" />
          All Scammers & Mules
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
            {scammers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("ORIGINATORS")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "ORIGINATORS"
              ? "bg-red-600/30 text-red-200 border border-red-500"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🚨 Scam Originators
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-bold">
            {originatorsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("PEELING_MULES")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "PEELING_MULES"
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/50"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🔄 Peeling Chain Mules
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">
            {peelingMulesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("VICTIMS")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "VICTIMS"
              ? "bg-purple-500/20 text-purple-200 border border-purple-500/50"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🎯 Scam Victims
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">
            {victimsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("MIXERS")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "MIXERS"
              ? "bg-blue-500/20 text-blue-200 border border-blue-500/50"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🌪️ Mixer Aggregators
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">
            {mixersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("GENUINE")}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeCategory === "GENUINE"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <CheckCircle2 size={14} className="text-emerald-400" />
          Genuine Accounts
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
            {genuine.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("ALL")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeCategory === "ALL"
              ? "bg-slate-800 text-white border border-slate-700"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          All (100)
        </button>
      </div>

      {/* Grid of Profile Cards with Doubled Whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
        {filteredList.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
            No accounts matching the selected category or search filter.
          </div>
        ) : (
          filteredList.map((person) => {
            const isScam = person.isScammer;
            return (
              <div
                key={person.memberId}
                className={`p-6 rounded-xl border transition-all flex flex-col justify-between ${
                  isScam
                    ? "bg-slate-950 border-slate-800 hover:border-rose-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                <div>
                  {/* Top Row: Avatar, Name, Member ID, Role Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 ${
                          isScam
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {person.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold">
                            {person.memberId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {person.occupation} • {person.city}, {person.country}
                        </p>
                      </div>
                    </div>

                    {/* Threat Score Pill */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border shrink-0 flex items-center gap-1.5 ${
                        person.riskScore >= 75
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : person.riskScore >= 50
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {isScam ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                      {person.riskScore}/100
                    </span>
                  </div>

                  {/* Role & Bank Account Row with Label-and-Value Structure */}
                  <div className="flex items-center gap-2.5 flex-wrap mb-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(
                        person
                      )}`}
                    >
                      {person.role}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      Bank: {person.accountId}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      IFSC: {person.routingRef}
                    </span>
                  </div>

                  {/* Forensic Heuristic Reason */}
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 mb-4 leading-relaxed">
                    <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono mb-1">Forensic Heuristic</span>
                    {person.reason}
                  </div>
                </div>

                {/* Bottom Row: Volume Stats & Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold mb-0.5">
                      Monitored Volume
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {person.totalBtcVolume} BTC
                    </span>
                    <span className="text-slate-400 text-xs ml-1.5 font-mono">
                      (~${Math.round(person.totalBtcVolume * 88750).toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAskAI(person)}
                      title="Analyze with AI Detective"
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bot size={13} />
                      AI Audit
                    </button>
                    <button
                      onClick={() => onSelectPerson(person)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      Profile Slot
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
