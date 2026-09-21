import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ReactNode;
  isPositive?: boolean;
  badge?: string;
}

export default function KPICard({
  title,
  value,
  change,
  icon,
  isPositive = true,
  badge,
}: KPICardProps) {
  const isNeutral = change === "Latest" || change.includes("Stable") || change.includes("Synced");
  const changeColorClass = isNeutral
    ? "text-slate-400"
    : isPositive
    ? "text-emerald-400"
    : "text-rose-400";

  return (
    <div
      id={`kpi-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className="p-6 rounded-xl bg-[#0d111b] border border-[#1c2436] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="text-amber-400 p-1.5 rounded-lg bg-[#141a27] text-sm">
          {icon}
        </div>
      </div>

      <div className="my-1">
        <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight leading-relaxed">
          {value}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#1c2436] flex items-center justify-between gap-2 text-xs">
        <span className={`font-mono font-medium ${changeColorClass}`}>
          {change}
        </span>
        {badge && (
          <span className="text-[11px] font-mono text-slate-500">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
