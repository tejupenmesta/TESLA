import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Search,
  Wallet,
  ShieldAlert,
  Bell,
  Settings,
  ChevronRight,
  Radio,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

const menu: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    description: "Real-time market & monitored wallets",
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Activity,
    badge: "Mempool",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    description: "Live mempool & ledger flows",
  },
  {
    name: "Investigation",
    path: "/investigation",
    icon: Search,
    description: "Multi-hop graph & route tracing",
  },
  {
    name: "Scam & Mule Analysis",
    path: "/scam-analysis",
    icon: ShieldAlert,
    badge: "Alerts",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    description: "Peeling chain & mule detection",
  },
  {
    name: "Wallet Intelligence",
    path: "/wallets",
    icon: Wallet,
    description: "Cluster profiles & behavioral risk",
  },
  {
    name: "Alerts Center",
    path: "/alerts",
    icon: Bell,
    badge: "Critical",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    description: "Automated surveillance triggers",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    description: "SOC policies, API & system config",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for mobile open event dispatched by Header
  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    window.addEventListener("close-mobile-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleToggle);
      window.removeEventListener("close-mobile-sidebar", handleClose);
    };
  }, []);

  // Close on route change on mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Enterprise Sidebar */}
      <aside
        id="sidebar-nav"
        className={`fixed top-0 left-0 bottom-0 z-50 w-[270px] bg-[#090c13] border-r border-[#1a2333] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Logo & Enterprise Brand Section */}
        <div className="p-5 border-b border-[#1a2333]/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg shrink-0">
                ₿
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    BitFlow
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                  Cyber Intelligence SOC
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Operations & Analysis
          </div>

          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  id={`nav-item-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-[#121724]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          size={18}
                          className={`shrink-0 transition-colors ${
                            isActive
                              ? "text-amber-400"
                              : "text-slate-400 group-hover:text-amber-400/80"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge ? (
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight size={14} className="text-amber-400/60 shrink-0" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom SOC Live Telemetry Box */}
        <div className="p-3.5 border-t border-[#1a2333]/90 bg-[#07090e]">
          <div className="p-3 rounded-xl bg-[#0f1420] border border-[#1e293b] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  Mainnet Connected
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                24ms
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Block Height</span>
              <span className="font-mono text-slate-200 font-semibold">884,120</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Mempool State</span>
              <span className="text-emerald-400 font-mono font-medium">Optimal</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
