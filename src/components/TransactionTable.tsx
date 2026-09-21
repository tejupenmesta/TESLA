import { BitcoinTransaction } from "../services/bitcoinFeed";

interface TransactionTableProps {
  transactions: BitcoinTransaction[];
  title?: string;
  subtitle?: string;
  showWhaleOnly?: boolean;
  onToggleWhaleOnly?: () => void;
  limit?: number;
}

export default function TransactionTable({
  transactions,
  title = "Live Transactions",
  subtitle = "Incoming Bitcoin transactions",
  showWhaleOnly = false,
  onToggleWhaleOnly,
  limit,
}: TransactionTableProps) {
  const filteredTransactions = transactions
    .filter((tx) => (showWhaleOnly ? tx.whale : true))
    .slice(0, limit || transactions.length);

  return (
    <div id="transaction-panel" className="slot-panel mb-12">
      <div className="slot-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 sm:p-10 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {onToggleWhaleOnly && (
            <button
              id="filter-whale-btn"
              onClick={onToggleWhaleOnly}
              className={`text-xs px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                showWhaleOnly
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              Whale Filter: {showWhaleOnly ? "ON" : "OFF"}
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LIVE
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-4 gap-4 px-8 py-4 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          <span>Transaction Hash</span>
          <span>Amount</span>
          <span>Fee</span>
          <span>Status</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No transactions found matching current criteria.
          </div>
        ) : (
          filteredTransactions.map((tx, index) => (
            <TransactionRow
              key={`${tx.id}-${index}`}
              id={tx.id}
              amount={tx.amount}
              fee={tx.fee}
              whale={tx.whale}
              status={tx.status}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TransactionRowProps {
  key?: string;
  id: string;
  amount: string;
  fee: string;
  whale?: boolean;
  status?: string;
}

export function TransactionRow({
  id,
  amount,
  fee,
  whale,
  status = "Pending",
}: TransactionRowProps) {
  return (
    <div className="grid grid-cols-4 gap-4 px-8 py-5 border-b border-slate-850 hover:bg-slate-900/40 transition-colors items-center text-xs">
      <span className="font-mono text-slate-300 truncate flex items-center gap-2">
        {id}
        {whale && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            WHALE
          </span>
        )}
      </span>

      <span className={`font-mono ${whale ? "font-bold text-amber-400 text-sm" : "text-white font-medium"}`}>
        {amount}
      </span>

      <span className="font-mono text-slate-400">{fee}</span>

      <span className="flex items-center gap-2 text-slate-300 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {status}
      </span>
    </div>
  );
}
