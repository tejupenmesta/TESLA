import { useState, useEffect, type FormEvent } from "react";
import {
  X,
  User,
  ShieldAlert,
  CheckCircle2,
  Building2,
  FileText,
  Users,
  Bitcoin,
  Lock,
  Unlock,
  Bot,
  Activity,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Edit3,
  Save,
  Printer,
  FileCheck,
  Check,
  RefreshCw,
  Database,
  Bookmark,
  BookmarkCheck,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { CategorizedPerson } from "./CategorizedPersonsSection";
import { useAuth } from "../context/AuthContext";

interface PersonProfileDrawerProps {
  person: CategorizedPerson | null;
  onClose: () => void;
  onAskAI: (person: CategorizedPerson) => void;
  onProfileUpdated?: (updatedPerson: CategorizedPerson) => void;
}

export default function PersonProfileDrawer({
  person,
  onClose,
  onAskAI,
  onProfileUpdated,
}: PersonProfileDrawerProps) {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [activeTab, setActiveTab] = useState<"DETAILS" | "EDIT" | "PDF_DOSSIER" | "TRANSACTIONS" | "FIRESTORE_NOTES">("DETAILS");

  // Firebase Auth & Firestore Real-Time Persistence
  const {
    user,
    signInWithGoogle,
    watchlist,
    notes,
    addToWatchlist,
    removeFromWatchlist,
    addNote,
    deleteNote,
    isWatchlisted,
  } = useAuth();

  const [newNoteFindings, setNewNoteFindings] = useState("");
  const [newNoteSeverity, setNewNoteSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: "",
    email: "",
    occupation: "",
    city: "",
    country: "",
    accountStatus: "",
    idProofType: "",
    syntheticIdRef: "",
    kycStatus: "",
    nomineeName: "",
    nomineeRelationship: "",
    nomineePhone: "",
    nomineeEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    if (!person) {
      setProfileData(null);
      return;
    }

    const frozen = person.accountStatus.toLowerCase().includes("frozen");
    setIsFrozen(frozen);
    setActiveTab("DETAILS");
    setSaveSuccessMsg("");

    // Initialize edit form
    setEditForm({
      phone: person.phone || "",
      email: person.email || "",
      occupation: person.occupation || "",
      city: person.city || "",
      country: person.country || "",
      accountStatus: person.accountStatus || "Active",
      idProofType: person.idProofType || "Aadhaar (Demo Ref)",
      syntheticIdRef: person.syntheticIdRef || "",
      kycStatus: person.kycStatus || "Verified (Synthetic)",
      nomineeName: person.nomineeName || "",
      nomineeRelationship: person.nomineeRelationship || "Family",
      nomineePhone: person.nomineePhone || "",
      nomineeEmail: person.nomineeEmail || "",
    });

    setLoading(true);
    fetch(`/api/members/${person.memberId}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfileData(data);
        if (data.banking?.isFrozen !== undefined) {
          setIsFrozen(data.banking.isFrozen);
        }
      })
      .catch((err) => {
        console.error("Profile load error:", err);
      })
      .finally(() => setLoading(false));
  }, [person]);

  if (!person) return null;

  const isScam = person.isScammer;
  const kyc = profileData?.kyc || {
    idProofType: editForm.idProofType || person.idProofType,
    syntheticIdRef: editForm.syntheticIdRef || person.syntheticIdRef,
    kycStatus: editForm.kycStatus || person.kycStatus,
    verificationDate: person.verificationDate,
    kycCaseId: person.kycCaseId,
  };

  const banking = profileData?.banking || {
    bankName: person.bankName || "State Bank of India (Synthetic Ref)",
    accountId: person.accountId,
    routingRef: person.routingRef,
    accountStatus: isFrozen ? "Frozen for AML Review" : editForm.accountStatus || person.accountStatus,
    accountType: "Bitcoin Custody & Fiat Settlement Account",
    balanceFiat: Math.round(person.totalBtcVolume * 88750),
    dailyLimit: 500000,
  };

  const nominee = profileData?.nominee || {
    nomineeName: editForm.nomineeName || person.nomineeName,
    nomineeRelationship: editForm.nomineeRelationship || person.nomineeRelationship,
    nomineePhone: editForm.nomineePhone || person.nomineePhone,
    nomineeEmail: editForm.nomineeEmail || person.nomineeEmail,
    nomineeRef: person.nomineeRef,
  };

  const crypto = profileData?.crypto || {
    btcWalletAddress: person.btcWalletAddress,
    senderAddress: person.senderAddress,
    totalInflowBtc: person.totalBtcVolume,
    totalOutflowBtc: +(person.totalBtcVolume * 0.95).toFixed(4),
    netBalanceBtc: +(person.totalBtcVolume * 0.05).toFixed(4),
    txCount: person.txCount,
  };

  const personTransactions = profileData?.transactions || [];

  // Toggle Account Freeze
  const handleToggleFreeze = async () => {
    const nextFrozen = !isFrozen;
    setIsFrozen(nextFrozen);
    const newStatus = nextFrozen ? "Frozen for AML Review" : "Active";

    try {
      const res = await fetch(`/api/members/${person.memberId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      if (res.ok) {
        setEditForm((prev) => ({ ...prev, accountStatus: newStatus }));
        if (onProfileUpdated) {
          onProfileUpdated({
            ...person,
            accountStatus: newStatus,
          });
        }
      }
    } catch (e) {
      console.error("Failed to update freeze status:", e);
    }
  };

  // Save Changed Profile Details
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(`/api/members/${person.memberId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setSaveSuccessMsg("Profile details updated successfully!");
        setIsFrozen(editForm.accountStatus.toLowerCase().includes("frozen"));
        if (onProfileUpdated) {
          onProfileUpdated({
            ...person,
            ...editForm,
          });
        }
        setTimeout(() => setActiveTab("DETAILS"), 1200);
      } else {
        alert("Failed to update profile details. Please try again.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Error saving profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Print PDF Dossier
  const handlePrintDossier = () => {
    window.print();
  };

  const isTargetWatchlisted = person ? isWatchlisted(person.memberId) || isWatchlisted(person.name) : false;
  const currentWatchlistItem = person
    ? watchlist.find(
        (w) =>
          w.entityId.toLowerCase() === person.memberId.toLowerCase() ||
          w.entityId.toLowerCase() === person.name.toLowerCase()
      )
    : undefined;

  const personNotes = notes.filter(
    (n) =>
      n.targetAccount.toLowerCase() === person?.memberId?.toLowerCase() ||
      n.targetName.toLowerCase() === person?.name?.toLowerCase()
  );

  const handleToggleWatchlist = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (e: any) {
        if (
          e?.code !== "auth/popup-closed-by-user" &&
          e?.code !== "auth/cancelled-popup-request" &&
          !e?.message?.includes("popup-closed-by-user")
        ) {
          console.error("Sign-in failed:", e);
        }
      }
      return;
    }
    if (!person) return;
    setWatchlistLoading(true);
    try {
      if (isTargetWatchlisted && currentWatchlistItem) {
        await removeFromWatchlist(currentWatchlistItem.id);
      } else {
        await addToWatchlist({
          entityId: person.memberId,
          entityName: person.name,
          category: person.role,
          reason: person.reason || "Flagged in AML Surveillance",
          flaggedBtcAmount: person.totalBtcVolume || 0,
        });
      }
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddCaseNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteFindings.trim() || !person) return;
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (e: any) {
        if (
          e?.code !== "auth/popup-closed-by-user" &&
          e?.code !== "auth/cancelled-popup-request" &&
          !e?.message?.includes("popup-closed-by-user")
        ) {
          console.error("Sign-in failed:", e);
        }
      }
      return;
    }
    setIsSubmittingNote(true);
    try {
      await addNote({
        targetAccount: person.memberId,
        targetName: person.name,
        classification: isScam ? "SCAMMER" : "GENUINE",
        severity: newNoteSeverity,
        findings: newNoteFindings.trim(),
      });
      setNewNoteFindings("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to add note to Firestore:", err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div
      id="person-profile-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                isScam
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
              }`}
            >
              {person.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">{person.name}</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {person.memberId}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                  {isFrozen ? "FROZEN" : "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {editForm.occupation || person.occupation} • Age: {person.age} • {editForm.city || person.city}, {editForm.country || person.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              disabled={watchlistLoading}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isTargetWatchlisted
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
              title={
                isTargetWatchlisted
                  ? "Remove suspect from Firestore Cloud Watchlist"
                  : "Add suspect to Firestore Cloud Watchlist"
              }
            >
              {isTargetWatchlisted ? <BookmarkCheck size={14} className="text-slate-950" /> : <Bookmark size={14} />}
              <span>{isTargetWatchlisted ? "Watchlisted (Cloud)" : "Watchlist"}</span>
            </button>

            <button
              onClick={() => onAskAI(person)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot size={14} /> Ask AI
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Classification Banner */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between shrink-0 ${
            isScam
              ? "bg-rose-950/40 border-rose-900/50 text-rose-200"
              : "bg-emerald-950/40 border-emerald-900/50 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {isScam ? <ShieldAlert size={16} className="text-rose-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
            <div>
              <span className="text-xs font-bold block">
                {isScam ? `🚨 FLAGGED ACCOUNT: ${person.role}` : `🛡️ VERIFIED GENUINE: ${person.role}`}
              </span>
              <span className="text-[11px] opacity-80">{person.reason}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                person.riskScore >= 75
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : person.riskScore >= 50
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {person.riskScore}/100
            </span>
          </div>
        </div>

        {/* Navigation Tabs Inside Profile Slot */}
        <div className="flex items-center gap-1 px-5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-semibold overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "DETAILS"
                ? "bg-slate-800 text-white font-bold border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User size={13} /> Useful Details
          </button>

          <button
            onClick={() => setActiveTab("FIRESTORE_NOTES")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "FIRESTORE_NOTES"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database size={13} /> Case Notes ({personNotes.length})
          </button>

          <button
            onClick={() => setActiveTab("EDIT")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "EDIT"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 size={13} /> Change Profile Details
          </button>

          <button
            onClick={() => setActiveTab("PDF_DOSSIER")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "PDF_DOSSIER"
                ? "bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={13} /> PDF Dossier Report
          </button>

          <button
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "TRANSACTIONS"
                ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={13} /> Live Transactions ({personTransactions.length})
          </button>
        </div>

        {/* Tab 1: Useful Details in Profile Slot */}
        {activeTab === "DETAILS" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">AML Account Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    isFrozen
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {isFrozen ? "FROZEN FOR AML REVIEW" : "ACTIVE & UNRESTRICTED"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFreeze}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isFrozen
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {isFrozen ? <Unlock size={12} /> : <Lock size={12} />}
                  {isFrozen ? "Unfreeze Account" : "Freeze Account"}
                </button>
                <button
                  onClick={() => setActiveTab("EDIT")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit Details
                </button>
              </div>
            </div>

            {/* 1. Banking Slot (PDF / Excel Information) */}
            <div className="card p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Building2 size={14} className="text-amber-400" />
                Banking & Settlement Details (Synthetic PDF Source)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Institution</span>
                  <span className="text-slate-200 font-semibold">{banking.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account ID</span>
                  <span className="text-amber-400 font-mono font-bold">{banking.accountId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Routing / IFSC Ref</span>
                  <span className="text-slate-200 font-mono font-bold">{banking.routingRef}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Daily Transfer Limit</span>
                  <span className="text-slate-300 font-mono">₹{banking.dailyLimit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Estimated Fiat Balance</span>
                  <span className="text-white font-mono font-bold">
                    ${banking.balanceFiat.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Registered Phone</span>
                  <span className="text-slate-300 font-mono">{editForm.phone || person.phone}</span>
                </div>
              </div>
            </div>

            {/* 2. KYC Documentation Slot (PDF / Excel Information) */}
            <div className="card p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <FileText size={14} className="text-blue-400" />
                KYC & Synthetic Identity Slot
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Document Proof Type</span>
                  <span className="text-slate-200 font-semibold">{editForm.idProofType || kyc.idProofType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Document Reference No</span>
                  <span className="text-slate-200 font-mono font-bold">{editForm.syntheticIdRef || kyc.syntheticIdRef}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">KYC Verification Status</span>
                  <span
                    className={`font-semibold ${
                      (editForm.kycStatus || kyc.kycStatus).includes("Verified")
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {editForm.kycStatus || kyc.kycStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Verification Date</span>
                  <span className="text-slate-300 font-mono">{kyc.verificationDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">KYC Case ID</span>
                  <span className="text-slate-300 font-mono">{kyc.kycCaseId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email Address</span>
                  <span className="text-slate-300 font-mono truncate block">{editForm.email || person.email}</span>
                </div>
              </div>
            </div>

            {/* 3. Nominee Slot */}
            <div className="card p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Users size={14} className="text-purple-400" />
                Registered Nominee Details
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nominee Name</span>
                  <span className="text-slate-200 font-semibold">{editForm.nomineeName || nominee.nomineeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Relationship</span>
                  <span className="text-slate-300">{editForm.nomineeRelationship || nominee.nomineeRelationship}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nominee Reference</span>
                  <span className="text-slate-300 font-mono">{nominee.nomineeRef}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nominee Phone</span>
                  <span className="text-slate-300 font-mono">{editForm.nomineePhone || nominee.nomineePhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Nominee Email</span>
                  <span className="text-slate-300 font-mono truncate block">{editForm.nomineeEmail || nominee.nomineeEmail}</span>
                </div>
              </div>
            </div>

            {/* 4. Crypto Telemetry & Volume Amount */}
            <div className="card p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Bitcoin size={14} className="text-amber-400" />
                Cryptographic Wallet & Monitored Volume
              </h4>

              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Monitored</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {crypto.totalInflowBtc} BTC
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ~${Math.round(crypto.totalInflowBtc * 88750).toLocaleString()} USD
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Outflow</span>
                  <span className="text-base font-black text-white font-mono">
                    {crypto.totalOutflowBtc} BTC
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ~${Math.round(crypto.totalOutflowBtc * 88750).toLocaleString()} USD
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transactions</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {crypto.txCount} txs
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    100% Monitored
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono break-all text-slate-300 mb-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Deposit / Custody BTC Address:</span>
                {crypto.btcWalletAddress}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono break-all text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Sender / Hot Address:</span>
                {crypto.senderAddress}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Change Profile Details Form */}
        {activeTab === "EDIT" && (
          <div className="flex-1 overflow-y-auto p-5">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <span className="font-bold block mb-0.5">Modify Member Profile & Compliance Information:</span>
                Update contact information, occupation, bank status, KYC document reference, and nominee details. Changes will be saved to the database.
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                  <Check size={16} /> {saveSuccessMsg}
                </div>
              )}

              {/* Personal Section */}
              <div className="card p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <User size={14} className="text-amber-400" />
                  Personal & Demographics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Occupation</label>
                    <input
                      type="text"
                      value={editForm.occupation}
                      onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Compliance & Banking Section */}
              <div className="card p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Building2 size={14} className="text-amber-400" />
                  Account & KYC Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Account Status</label>
                    <select
                      value={editForm.accountStatus}
                      onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Active">Active (Unrestricted)</option>
                      <option value="Frozen for AML Review">Frozen for AML Review</option>
                      <option value="Flagged for Review">Flagged for Review</option>
                      <option value="Restricted Outflow">Restricted Outflow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">KYC Status</label>
                    <select
                      value={editForm.kycStatus}
                      onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Verified (Synthetic)">Verified (Synthetic)</option>
                      <option value="Pending (Synthetic)">Pending (Synthetic)</option>
                      <option value="Rejected (Fraud Alert)">Rejected (Fraud Alert)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">ID Proof Type</label>
                    <input
                      type="text"
                      value={editForm.idProofType}
                      onChange={(e) => setEditForm({ ...editForm, idProofType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Synthetic ID Reference</label>
                    <input
                      type="text"
                      value={editForm.syntheticIdRef}
                      onChange={(e) => setEditForm({ ...editForm, syntheticIdRef: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Nominee Section */}
              <div className="card p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Users size={14} className="text-purple-400" />
                  Nominee / Beneficiary Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Nominee Name</label>
                    <input
                      type="text"
                      value={editForm.nomineeName}
                      onChange={(e) => setEditForm({ ...editForm, nomineeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Relationship</label>
                    <input
                      type="text"
                      value={editForm.nomineeRelationship}
                      onChange={(e) => setEditForm({ ...editForm, nomineeRelationship: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Nominee Phone</label>
                    <input
                      type="text"
                      value={editForm.nomineePhone}
                      onChange={(e) => setEditForm({ ...editForm, nomineePhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Nominee Email</label>
                    <input
                      type="email"
                      value={editForm.nomineeEmail}
                      onChange={(e) => setEditForm({ ...editForm, nomineeEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("DETAILS")}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Official PDF Compliance Dossier Preview */}
        {activeTab === "PDF_DOSSIER" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck size={16} className="text-blue-400" />
                  PDF Compliance Dossier Report
                </h4>
                <p className="text-[11px] text-slate-400">
                  Standardized AML / KYC Compliance Audit Document (Print / Export Ready)
                </p>
              </div>
              <button
                onClick={handlePrintDossier}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              >
                <Printer size={13} /> Print / Export PDF
              </button>
            </div>

            {/* Rendered Document Sheet */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-2xl text-slate-200 text-xs space-y-5 font-sans relative overflow-hidden">
              {/* Official Seal Watermark */}
              <div className="absolute right-4 top-4 border-2 border-slate-800/80 px-3 py-1 rounded text-[10px] font-mono uppercase text-slate-500 tracking-widest font-black">
                CONFIDENTIAL • AML COMPLIANCE
              </div>

              {/* Title Section */}
              <div className="border-b border-slate-800 pb-4">
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  BITFLOW INTELLIGENCE & TELEMETRY MONITORING
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  SUSPICIOUS ACTIVITY & KYC COMPLIANCE DOSSIER
                </h2>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                  <span>Case ID: <strong className="text-white font-mono">{kyc.kycCaseId}</strong></span>
                  <span>Date: <strong className="text-white font-mono">{new Date().toISOString().slice(0, 10)}</strong></span>
                  <span>Classification: <strong className={isScam ? "text-rose-400" : "text-emerald-400"}>{person.role}</strong></span>
                </div>
              </div>

              {/* Section 1: Subject Identification */}
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-300 border-b border-slate-800/60 pb-1 mb-2">
                  1. Subject Demographics & KYC Record
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div><span className="text-slate-500 block">Full Legal Name:</span><span className="font-bold text-white">{person.name}</span></div>
                  <div><span className="text-slate-500 block">Member Identifier:</span><span className="font-mono font-bold text-amber-400">{person.memberId}</span></div>
                  <div><span className="text-slate-500 block">Age & Occupation:</span><span>{person.age} yrs • {editForm.occupation || person.occupation}</span></div>
                  <div><span className="text-slate-500 block">Jurisdiction:</span><span>{editForm.city || person.city}, {editForm.country || person.country}</span></div>
                  <div><span className="text-slate-500 block">Document Type:</span><span>{editForm.idProofType || kyc.idProofType}</span></div>
                  <div><span className="text-slate-500 block">Document ID Ref:</span><span className="font-mono">{editForm.syntheticIdRef || kyc.syntheticIdRef}</span></div>
                  <div><span className="text-slate-500 block">KYC Status:</span><span className="font-bold text-emerald-400">{editForm.kycStatus || kyc.kycStatus}</span></div>
                  <div><span className="text-slate-500 block">Verification Officer:</span><span>AML-DESK-42 (Synthetic)</span></div>
                  <div><span className="text-slate-500 block">Contact Phone:</span><span className="font-mono">{editForm.phone || person.phone}</span></div>
                </div>
              </div>

              {/* Section 2: Financial & Banking Infrastructure */}
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-300 border-b border-slate-800/60 pb-1 mb-2">
                  2. Banking Settlement & Blockchain Wallets
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div><span className="text-slate-500 block">Settlement Bank:</span><span className="font-semibold text-white">{banking.bankName}</span></div>
                  <div><span className="text-slate-500 block">Account Number:</span><span className="font-mono font-bold text-white">{banking.accountId}</span></div>
                  <div><span className="text-slate-500 block">IFSC / Routing Code:</span><span className="font-mono text-white">{banking.routingRef}</span></div>
                  <div><span className="text-slate-500 block">Account Status:</span><span className="font-bold text-rose-400">{isFrozen ? "FROZEN (SAR ORDER)" : "ACTIVE"}</span></div>
                  <div><span className="text-slate-500 block">Estimated Fiat Value:</span><span className="font-mono text-white">${banking.balanceFiat.toLocaleString()} USD</span></div>
                  <div><span className="text-slate-500 block">Daily Limit:</span><span className="font-mono text-slate-300">₹{banking.dailyLimit.toLocaleString()}</span></div>
                </div>
                <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono break-all text-slate-300">
                  <span className="text-slate-500 block">Bitcoin Deposit Address:</span>
                  {crypto.btcWalletAddress}
                </div>
              </div>

              {/* Section 3: Registered Nominee / Beneficiary */}
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-300 border-b border-slate-800/60 pb-1 mb-2">
                  3. Nominee & Beneficiary Registration
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div><span className="text-slate-500 block">Nominee Name:</span><span className="font-bold text-white">{editForm.nomineeName || nominee.nomineeName}</span></div>
                  <div><span className="text-slate-500 block">Relationship:</span><span>{editForm.nomineeRelationship || nominee.nomineeRelationship}</span></div>
                  <div><span className="text-slate-500 block">Reference ID:</span><span className="font-mono">{nominee.nomineeRef}</span></div>
                  <div><span className="text-slate-500 block">Phone:</span><span className="font-mono">{editForm.nomineePhone || nominee.nomineePhone}</span></div>
                  <div className="col-span-2"><span className="text-slate-500 block">Email:</span><span className="font-mono">{editForm.nomineeEmail || nominee.nomineeEmail}</span></div>
                </div>
              </div>

              {/* Section 4: Forensic AML Findings & Threat Score */}
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-300 border-b border-slate-800/60 pb-1 mb-2">
                  4. Heuristic Threat Assessment & Action Order
                </h3>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Calculated Risk Index:</span>
                    <span className="font-mono font-bold text-rose-400">{person.riskScore}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Investigation Finding: </span>
                    <span className="text-slate-200">{person.reason}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Total Monitored Throughput: </span>
                    <span className="text-amber-400 font-mono font-bold">{crypto.totalInflowBtc} BTC (~${Math.round(crypto.totalInflowBtc * 88750).toLocaleString()} USD)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-slate-400">
                    <span className="font-bold text-white">Compliance Recommendation: </span>
                    {isScam
                      ? "Designate account for mandatory forensic audit, freeze fiat settlement gateways, and report to Financial Intelligence Unit (FIU)."
                      : "Account compliant with KYC guidelines. Continue regular risk monitoring."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Live Transactions for This Person */}
        {activeTab === "TRANSACTIONS" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-400" />
                Live Transactions Involving {person.name} ({personTransactions.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Sorted by latest block timestamp
              </span>
            </div>

            {personTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                No individual live transactions recorded yet for this person.
              </div>
            ) : (
              personTransactions.map((tx: any) => {
                const isSender = tx.memberId === person.memberId || tx.senderName === person.name;
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSender
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {isSender ? "OUTGOING (SENT)" : "INCOMING (RECEIVED)"}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {tx.date} • {tx.time}
                        </span>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          tx.riskScore >= 75
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : tx.riskScore >= 50
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        Risk: {tx.riskScore}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs my-1.5">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Counterparty:</span>
                        <span className="font-bold text-white">
                          {isSender ? tx.receiverName : tx.senderName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {tx.amountBtc} BTC
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ${tx.amountUsd?.toLocaleString() || Math.round(tx.amountBtc * 88750).toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono truncate max-w-[280px]">Tx: {tx.id}</span>
                      <span className="font-mono">{tx.paymentStatus || "Confirmed"} • {tx.confirmations || 3} confs</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 5: Firestore Case Notes & Watchlist Persistence */}
        {activeTab === "FIRESTORE_NOTES" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Firestore Cloud Sync Header */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Database size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Cloud Firestore Persistent Dossier
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE CLOUD SYNC
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Case notes & watchlist status stored securely in Google Cloud Firestore
                  </p>
                </div>
              </div>

              {user ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Logged in as:</span>
                  <span className="text-xs font-semibold text-amber-300 font-mono">{user.email}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signInWithGoogle().catch((e) => {
                      if (
                        e?.code !== "auth/popup-closed-by-user" &&
                        e?.code !== "auth/cancelled-popup-request" &&
                        !e?.message?.includes("popup-closed-by-user")
                      ) {
                        console.error(e);
                      }
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow flex items-center gap-1.5"
                >
                  <User size={13} /> Sign In
                </button>
              )}
            </div>

            {/* Watchlist Status Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isTargetWatchlisted ? (
                  <BookmarkCheck size={16} className="text-amber-400" />
                ) : (
                  <Bookmark size={16} className="text-slate-500" />
                )}
                <div>
                  <span className="font-bold text-white block">
                    {isTargetWatchlisted ? "Active in Firestore Cloud Watchlist" : "Not in Cloud Watchlist"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isTargetWatchlisted
                      ? `Added ${currentWatchlistItem ? new Date(currentWatchlistItem.addedAt).toLocaleDateString() : "recently"}`
                      : "Add suspect to your cloud watchlist to monitor across devices"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isTargetWatchlisted
                    ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-amber-500 text-slate-950 hover:bg-amber-600"
                }`}
              >
                {isTargetWatchlisted ? "Remove from Watchlist" : "+ Add to Watchlist"}
              </button>
            </div>

            {/* Note Creation Form */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusCircle size={14} className="text-amber-400" />
                Record New Investigation Finding in Firestore
              </h4>

              {!user && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  ⚠️ You must sign in with Google to save notes to Firestore. Click the Sign In button above.
                </div>
              )}

              <form onSubmit={handleAddCaseNote} className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Investigation Target</label>
                    <input
                      type="text"
                      disabled
                      value={`${person.name} (${person.memberId})`}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Threat / Severity Rating</label>
                    <select
                      value={newNoteSeverity}
                      onChange={(e) => setNewNoteSeverity(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="CRITICAL">CRITICAL - Severe Risk</option>
                      <option value="HIGH">HIGH - Probable Laundering</option>
                      <option value="MEDIUM">MEDIUM - Suspicious Flow</option>
                      <option value="LOW">LOW - Routine Surveillance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Forensic Findings & Evidence Summary</label>
                  <textarea
                    rows={3}
                    value={newNoteFindings}
                    onChange={(e) => setNewNoteFindings(e.target.value)}
                    placeholder="Enter detailed intelligence (e.g., linked mixing hops, false KYC documentation, synthetic identity pattern, SAR filed)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {noteSuccess && (
                  <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                    <Check size={14} /> Note successfully saved to Google Cloud Firestore!
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteFindings.trim() || !user}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save size={13} />
                    {isSubmittingNote ? "Saving to Firestore..." : "Save Note to Firestore"}
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Firestore Notes List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Recorded Case Notes ({personNotes.length})</span>
                <span className="text-[10px] text-slate-500 font-normal font-mono">Synced from collection /investigationNotes</span>
              </h4>

              {personNotes.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                  No investigator case notes recorded for this person yet. Enter your findings above to persist them in Firestore.
                </div>
              ) : (
                personNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                            n.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : n.severity === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : n.severity === "MEDIUM"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {n.severity}
                        </span>

                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteNote(n.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete note from Firestore"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-slate-200 leading-relaxed text-xs whitespace-pre-wrap">{n.findings}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Investigator: {n.userEmail || "Anonymous"}</span>
                      <span>ID: {n.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
