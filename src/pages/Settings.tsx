import { useState, useEffect, FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Settings as SettingsIcon,
  Save,
  Check,
  User,
  BadgeCheck,
  Lock,
  Terminal,
  FileText,
  RotateCcw,
  Sparkles,
  Award,
  KeyRound,
} from "lucide-react";
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  saveUserProfile,
} from "../utils/userProfile";

const PRESET_ORGANIZATIONAL_ROLES = [
  "Lead SOC & AML Forensics Investigator",
  "Senior Financial Crime Compliance Officer",
  "AML Transaction Monitoring Lead",
  "Cybercrime Incident Responder",
  "Blockchain Forensics & On-Chain Auditor",
  "Digital Asset Risk Analyst",
  "Regulatory Compliance & SAR Filing Officer",
  "Institutional Crypto Custody Admin",
  "Custom Role",
];

const PRESET_DEPARTMENTS = [
  "Financial Intelligence & Cyber Defense Division",
  "Special Cybercrime & Mule Containment Unit",
  "Corporate Digital Assets Treasury Desk",
  "SOC Threat Intelligence & Forensics",
  "Anti-Money Laundering Surveillance Cell",
  "Institutional Custody & Settlement Operations",
];

const PRESET_CLEARANCE_LEVELS = [
  "Level 3 - Top Secret (Autonomous Syndicate Freeze Authority)",
  "Level 2 - Secret (SAR Regulatory Filing & Mule Flagging)",
  "Level 1 - Confidential (Read-Only Monitored Audits)",
];

const PRESET_JURISDICTIONS = [
  "FIU-IND / FATF Global Standards (IN/SG/AE)",
  "FinCEN / BSA Compliance Standards (US)",
  "ESMA / MiCA Regulatory Scope (EU)",
  "MAS Digital Payment Token Regime (SG)",
  "Global Cross-Border AML/CFT Surveillance",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "TELEMETRY">("PROFILE");

  // Officer Profile State
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Telemetry Settings State
  const [endpoint, setEndpoint] = useState("https://mempool.space/api");
  const [refreshInterval, setRefreshInterval] = useState("3");
  const [currency, setCurrency] = useState("USD");
  const [whaleThreshold, setWhaleThreshold] = useState("10");
  const [telemetrySaved, setTelemetrySaved] = useState(false);

  // Load server profile on mount if available
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error");
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          const merged = { ...profile, ...data.profile };
          setProfile(merged);
          saveUserProfile(merged);
        }
      })
      .catch((err) => console.log("Server profile fallback:", err));
  }, []);

  // Sync custom role mode
  useEffect(() => {
    if (!PRESET_ORGANIZATIONAL_ROLES.includes(profile.organizationalRole)) {
      setIsCustomRole(true);
      setCustomRoleText(profile.organizationalRole);
    } else {
      setIsCustomRole(false);
    }
  }, [profile.organizationalRole]);

  // Handle Profile Form Submission
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    const updatedRole = isCustomRole ? customRoleText : profile.organizationalRole;
    const updatedProfile: UserProfile = {
      ...profile,
      organizationalRole: updatedRole,
      lastUpdated: new Date().toISOString(),
    };

    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);

    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
    } catch (err) {
      console.error("Failed to sync profile to server:", err);
    }

    setSaveMessage(
      `Officer profile for ${updatedProfile.fullName} (${updatedProfile.employeeId}) saved.`
    );
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  const handleGenerateEmployeeId = () => {
    const num = Math.floor(100 + Math.random() * 900);
    const codes = ["SOC", "AML", "SEC", "FIU", "CRYPTO"];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const newEmpId = `EMP-${code}-2026-${num}`;
    setProfile({ ...profile, employeeId: newEmpId });
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_USER_PROFILE);
    saveUserProfile(DEFAULT_USER_PROFILE);
    setSaveMessage("Profile restored to default credentials.");
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveTelemetry = (e: FormEvent) => {
    e.preventDefault();
    setTelemetrySaved(true);
    setTimeout(() => setTelemetrySaved(false), 2000);
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
                  System Settings
                </h1>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                  SESSION PERSISTENT
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Manage your SOC Investigator credentials, organizational roles, and node telemetry configurations
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-lg bg-[#090c13] p-1 border border-[#1c2436]">
              <button
                onClick={() => setActiveTab("PROFILE")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "PROFILE"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User size={13} />
                <span>Officer Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("TELEMETRY")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "TELEMETRY"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <SettingsIcon size={13} />
                <span>Node & Telemetry</span>
              </button>
            </div>
          </div>

          {activeTab === "PROFILE" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Officer Identity Dossier Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-6">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0 font-mono">
                      {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white leading-relaxed">
                        {profile.fullName}
                      </h2>
                      <div className="text-xs text-amber-400 font-mono font-semibold">
                        {profile.employeeId}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active Session
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#1c2436] text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono block">
                        Organizational Role
                      </span>
                      <div className="font-semibold text-slate-200 mt-0.5 leading-relaxed">
                        {profile.organizationalRole}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono block">
                        Department / Unit
                      </span>
                      <div className="text-slate-300 mt-0.5 leading-relaxed">{profile.department}</div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono block">
                        Clearance Level
                      </span>
                      <div className="font-mono text-emerald-400 font-semibold mt-0.5 leading-relaxed">
                        {profile.clearanceLevel}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1c2436]">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-mono block">
                          Badge Ref
                        </span>
                        <div className="font-mono text-amber-400 text-xs font-semibold mt-0.5">
                          {profile.badgeRef}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-mono block">
                          Workstation
                        </span>
                        <div className="font-mono text-slate-300 text-xs mt-0.5 truncate">
                          {profile.workstationId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulatory Signature Preview Card */}
                <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl p-6 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <FileText size={14} className="text-amber-400" />
                    <span>Regulatory SAR Sign-Off Preview</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Embedded signature for compliance exports and account hold logs:
                  </p>
                  <div className="p-3 bg-[#090c13] rounded-lg border border-[#1c2436] font-mono text-xs text-slate-300 space-y-1">
                    <div className="text-amber-400 font-semibold">
                      FIU-AML-OFFICER: {profile.fullName}
                    </div>
                    <div>EMP-ID: {profile.employeeId}</div>
                    <div className="truncate">ROLE: {profile.organizationalRole}</div>
                    <div className="text-[11px] text-slate-500">
                      STAMP: {new Date().toISOString().split("T")[0]} // BITFLOW-AUTH-SEAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Profile Settings Form */}
              <div className="lg:col-span-8">
                <div className="bg-[#0d111b] border border-[#1c2436] rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-[#1c2436] flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2 leading-relaxed">
                        <BadgeCheck size={16} className="text-amber-400" />
                        Officer Profile & Roles
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Updates your session identity, audit trails, and header credentials
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetProfile}
                      className="px-3 py-1.5 rounded-lg border border-[#1c2436] bg-[#090c13] hover:bg-[#141a27] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                    {profileSaved && (
                      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>{saveMessage}</span>
                      </div>
                    )}

                    {/* Section 1: Corporate Identity & Employee ID */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound size={13} /> 1. Personnel Identification & Staff Key
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-300">
                              Employee ID <span className="text-amber-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleGenerateEmployeeId}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
                            >
                              <Sparkles size={11} /> Auto-Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            value={profile.employeeId}
                            onChange={(e) =>
                              setProfile({ ...profile, employeeId: e.target.value })
                            }
                            required
                            placeholder="e.g. EMP-SOC-2026-007"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs font-mono text-amber-400 font-semibold outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Full Legal / Operational Name <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) =>
                              setProfile({ ...profile, fullName: e.target.value })
                            }
                            required
                            placeholder="e.g. Shanmukh Vardha"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white font-medium outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Organizational Roles */}
                    <div className="space-y-4 pt-4 border-t border-[#1c2436]">
                      <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={13} /> 2. Organizational Role & Hierarchy
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Organizational Role <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={isCustomRole ? "Custom Role" : profile.organizationalRole}
                            onChange={(e) => {
                              if (e.target.value === "Custom Role") {
                                setIsCustomRole(true);
                              } else {
                                setIsCustomRole(false);
                                setProfile({ ...profile, organizationalRole: e.target.value });
                              }
                            }}
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors font-medium"
                          >
                            {PRESET_ORGANIZATIONAL_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>

                          {isCustomRole && (
                            <input
                              type="text"
                              value={customRoleText}
                              onChange={(e) => {
                                setCustomRoleText(e.target.value);
                                setProfile({ ...profile, organizationalRole: e.target.value });
                              }}
                              placeholder="Enter custom role title..."
                              className="mt-2 w-full bg-[#090c13] border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-amber-300 outline-none"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Department / Operating Unit <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={profile.department}
                            onChange={(e) =>
                              setProfile({ ...profile, department: e.target.value })
                            }
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Security Clearance Level
                          </label>
                          <select
                            value={profile.clearanceLevel}
                            onChange={(e) =>
                              setProfile({ ...profile, clearanceLevel: e.target.value })
                            }
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_CLEARANCE_LEVELS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Surveillance Duty Shift
                          </label>
                          <select
                            value={profile.dutyShift}
                            onChange={(e) =>
                              setProfile({ ...profile, dutyShift: e.target.value })
                            }
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          >
                            <option value="24/7 Global Surveillance (Shift Alpha)">
                              24/7 Global Surveillance (Shift Alpha)
                            </option>
                            <option value="Shift Bravo (APAC / EMEA Forensic Watch)">
                              Shift Bravo (APAC / EMEA Forensic Watch)
                            </option>
                            <option value="Shift Charlie (Americas AML Custody Desk)">
                              Shift Charlie (Americas AML Custody Desk)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Contact & Terminal Details */}
                    <div className="space-y-4 pt-4 border-t border-[#1c2436]">
                      <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={13} /> 3. Terminal & Communications Credentials
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Official Email Address
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="officer@bitflow.soc"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Emergency Comms / Phone
                          </label>
                          <input
                            type="text"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+91-98765-43210"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Badge Reference ID
                          </label>
                          <input
                            type="text"
                            value={profile.badgeRef}
                            onChange={(e) => setProfile({ ...profile, badgeRef: e.target.value })}
                            placeholder="BADGE-2026-ALPHA"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            SOC Workstation ID
                          </label>
                          <input
                            type="text"
                            value={profile.workstationId}
                            onChange={(e) =>
                              setProfile({ ...profile, workstationId: e.target.value })
                            }
                            placeholder="WS-SOC-NODE-01"
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Regulatory Jurisdiction
                          </label>
                          <select
                            value={profile.jurisdiction}
                            onChange={(e) =>
                              setProfile({ ...profile, jurisdiction: e.target.value })
                            }
                            className="w-full bg-[#090c13] border border-[#1c2436] focus:border-amber-500/60 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_JURISDICTIONS.map((j) => (
                              <option key={j} value={j}>
                                {j}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-6 border-t border-[#1c2436] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Lock size={13} className="text-amber-400 shrink-0" />
                        <span>Persists across browser session & server registry</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {profileSaved ? <Check size={14} /> : <Save size={14} />}
                        <span>{profileSaved ? "Saved" : "Save Profile"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Telemetry Settings Tab */
            <div className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] max-w-3xl">
              <div className="pb-4 mb-6 border-b border-[#1c2436]">
                <h2 className="text-base font-bold text-white leading-relaxed">Node & Telemetry Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Configure upstream Bitcoin mempool endpoints and stream rates
                </p>
              </div>

              <form onSubmit={handleSaveTelemetry} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Upstream Mempool API Endpoint
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full bg-[#090c13] border border-[#1c2436] rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Default public gateway: https://mempool.space/api
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Stream Frequency
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(e.target.value)}
                      className="w-full bg-[#090c13] border border-[#1c2436] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="1">1 second (Ultra Low Latency)</option>
                      <option value="3">3 seconds (Recommended)</option>
                      <option value="5">5 seconds (Low Bandwidth)</option>
                      <option value="10">10 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Whale Threshold (BTC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={whaleThreshold}
                        onChange={(e) => setWhaleThreshold(e.target.value)}
                        className="w-full bg-[#090c13] border border-[#1c2436] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                      <span className="absolute right-3.5 top-2 text-xs text-slate-500">BTC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Display Currency
                  </label>
                  <div className="flex gap-2">
                    {["USD", "INR", "EUR", "GBP"].map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrency(curr)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          currency === curr
                            ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                            : "bg-[#090c13] text-slate-400 border-[#1c2436] hover:text-white"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1c2436] flex items-center justify-between">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {telemetrySaved ? <Check size={14} /> : <Save size={14} />}
                    <span>{telemetrySaved ? "Saved" : "Save Preferences"}</span>
                  </button>

                  {telemetrySaved && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      Preferences successfully updated!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
