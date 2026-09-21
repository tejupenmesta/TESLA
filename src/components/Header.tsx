import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Activity,
  X,
  LogIn,
  LogOut,
  Database,
  CheckCircle2,
  Menu,
  Command,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loadUserProfile, UserProfile } from "../utils/userProfile";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle, signOut, watchlist, notes } = useAuth();

  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) setUserProfile(e.detail);
    };
    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("user-profile-updated", handleProfileUpdate);
  }, []);

  // Keyboard shortcut '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchValue.trim() }),
        });
        const data = await res.json();
        setSearchResults(data.results);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target as Node)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (path: string) => {
    setIsOpen(false);
    setSearchValue("");
    navigate(path);
  };

  return (
    <header
      id="app-header"
      className="h-16 px-4 sm:px-8 bg-[#090c13]/90 backdrop-blur-md border-b border-[#1a2333] sticky top-0 z-30 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Mobile menu trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-[#0e121b] border border-[#1e293b] shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Global Search Box */}
        <div
          className="relative flex-1"
          id="search-box-container"
          ref={searchRef}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#0e121b] border border-[#1e293b] rounded-xl focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />

            <input
              ref={searchInputRef}
              id="header-search-input"
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search Tx hash, Bitcoin address, entity, threat alert..."
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 font-sans"
            />

            {searchValue ? (
              <button
                onClick={() => {
                  setSearchValue("");
                  setIsOpen(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                <span>/</span>
              </div>
            )}
          </div>

          {/* Global Search Dropdown Popup */}
          {isOpen && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d111b] border border-[#1c2436] rounded-xl shadow-2xl p-3 max-h-96 overflow-y-auto z-50 text-xs">
              {/* Members / Wallets */}
              {searchResults.members?.length > 0 && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5 px-1">
                    Entities & Wallets ({searchResults.members.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.members.map((m: any) => (
                      <div
                        key={m.memberId}
                        onClick={() => handleSelectResult(`/investigation?target=${m.memberId}`)}
                        className="p-2.5 rounded-lg hover:bg-[#151c2c] cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-[#232d42]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Wallet size={15} className="text-amber-400 shrink-0" />
                          <span className="font-semibold text-white truncate">{m.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold shrink-0">
                            {m.memberId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.city && <span className="text-[10px] text-slate-400 hidden sm:inline">{m.city}</span>}
                          <span className="text-[11px] font-mono text-slate-400">
                            {m.senderAddress?.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              {searchResults.transactions?.length > 0 && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5 px-1">
                    Transactions ({searchResults.transactions.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.transactions.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectResult(`/transactions`)}
                        className="p-2.5 rounded-lg hover:bg-[#151c2c] cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-[#232d42]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Activity size={15} className="text-blue-400 shrink-0" />
                          <span className="font-mono text-slate-200 truncate">{t.id}</span>
                        </div>
                        <span className="font-bold text-amber-400 font-mono shrink-0">
                          {t.amountBtc} BTC
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Threat Alerts */}
              {searchResults.alerts?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5 px-1">
                    Threat Alerts ({searchResults.alerts.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.alerts.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => handleSelectResult(`/alerts`)}
                        className="p-2.5 rounded-lg hover:bg-[#151c2c] cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-[#232d42]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ShieldAlert size={15} className="text-rose-400 shrink-0" />
                          <span className="text-white font-medium truncate">{a.title}</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-rose-400 shrink-0 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          {a.riskScore}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.members?.length === 0 &&
                searchResults.transactions?.length === 0 &&
                searchResults.alerts?.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No entities found matching "{searchValue}". Try "M001" or a transaction hash.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions & Status Indicators */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Network Status Badge */}
        <div
          id="live-network-indicator"
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0e121b] border border-[#1e293b] text-emerald-400 text-xs font-mono font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>BTC SOC ONLINE</span>
        </div>

        {/* Firestore Persistence Sync Badge */}
        <div
          id="firestore-cloud-status"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono"
          title="Google Cloud Firestore Real-Time Database Connected"
        >
          <Database size={13} className="text-emerald-400" />
          <span>Firestore Synced</span>
        </div>

        {/* Alerts Center Notification Bell */}
        <Link
          to="/alerts"
          id="notification-bell-btn"
          className="p-2 rounded-xl bg-[#0e121b] border border-[#1e293b] text-slate-300 hover:text-white hover:border-[#2b3954] transition-colors relative"
          aria-label="Threat Alerts Center"
          title="Threat Alerts Center"
        >
          <Bell size={18} />
          <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </Link>

        {/* Firebase Authentication & User Profile */}
        {authLoading ? (
          <div className="w-24 h-9 bg-slate-800/60 rounded-xl animate-pulse"></div>
        ) : !user ? (
          <button
            id="google-signin-btn"
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            title="Sign in with Google using Firebase Auth"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">Sign In</span>
          </button>
        ) : (
          <div className="relative" ref={authDropdownRef}>
            <button
              id="user-profile-btn"
              onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl bg-[#0e121b] border border-[#1e293b] hover:border-amber-500/40 transition-colors cursor-pointer"
              aria-label="User profile"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Investigator"}
                  className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0 text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={14} />}
                </div>
              )}
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-xs font-semibold block text-white truncate max-w-[110px]">
                  {user.displayName || "Investigator"}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Analyst Verified
                </span>
              </div>
            </button>

            {/* User Dropdown */}
            {authDropdownOpen && (
              <div
                id="auth-profile-dropdown"
                className="absolute right-0 mt-2 w-72 bg-[#0d111b] border border-[#1c2436] rounded-xl shadow-2xl z-50 p-3 text-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-[#1c2436]">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-base">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-white truncate">{user.displayName || "Investigator"}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                    <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 mt-1 border border-amber-500/20">
                      UID: {user.uid.substring(0, 10)}...
                    </span>
                  </div>
                </div>

                {/* Firestore Real-Time Persistence Stats */}
                <div className="py-3 space-y-2 border-b border-[#1c2436] text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Database size={13} className="text-amber-400" />
                      Firestore Watchlist:
                    </span>
                    <strong className="text-white font-mono">{watchlist.length} saved</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Investigation Notes:
                    </span>
                    <strong className="text-white font-mono">{notes.length} notes</strong>
                  </div>
                </div>

                <div className="pt-2.5 flex items-center justify-between">
                  <Link
                    to="/settings"
                    onClick={() => setAuthDropdownOpen(false)}
                    className="text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    SOC Settings
                  </Link>

                  <button
                    onClick={() => {
                      setAuthDropdownOpen(false);
                      signOut().catch((e) => console.error(e));
                    }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
