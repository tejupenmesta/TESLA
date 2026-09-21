import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Database,
  Download,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function DataImport() {
  const [dataInfo, setDataInfo] = useState<any>(null);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlResult, setEtlResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "logs" | "quality">("pipeline");

  const loadDataSources = () => {
    fetch("/api/data-import")
      .then((res) => res.json())
      .then((d) => setDataInfo(d))
      .catch((err) => console.error("Failed to load data import info:", err));
  };

  useEffect(() => {
    loadDataSources();
  }, []);

  const runEtlPipeline = async () => {
    setEtlLoading(true);
    setEtlResult(null);
    try {
      const res = await fetch("/api/data-import/run-etl", { method: "POST" });
      const data = await res.json();
      setEtlResult(data);
      loadDataSources();
    } catch (err) {
      console.error("ETL Run failed:", err);
    } finally {
      setEtlLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Excel Data Management & ETL Pipeline</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  POSTGRESQL 16.2 SYNCHRONIZER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated ingestion, validation, deduplication, and schema mapping of BitFlow benchmark workbooks
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runEtlPipeline}
                disabled={etlLoading}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {etlLoading ? <RefreshCw className="animate-spin" size={15} /> : <Play size={15} />}
                RUN 9-STEP ETL PROCESS
              </button>
            </div>
          </div>

          {/* Excel Source Workbooks Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="slot-panel p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Transactions Dataset</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      BitFlow_100_Members_All_Transactions_Demo.xlsx
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/40 font-mono">
                  100 ROWS
                </span>
              </div>

              <div className="mt-6 text-xs space-y-2 text-slate-400 border-t border-slate-800 pt-6">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Worksheets:</span>
                  <span className="font-mono text-slate-300">Transactions_100, Risk_Metadata</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Target Table:</span>
                  <span className="font-mono text-amber-400">public.transactions</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Data Tag:</span>
                  <span className="font-mono text-emerald-400">SYNTHETIC_DEMO_EXCEL</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                <a
                  href="/api/data-import/download/transactions"
                  download
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Download .XLSX
                </a>
              </div>
            </div>

            <div className="slot-panel p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Profiles & Accounts Dataset</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 shrink-0 border border-blue-500/40 font-mono">
                  100 MEMBERS
                </span>
              </div>

              <div className="mt-6 text-xs space-y-2 text-slate-400 border-t border-slate-800 pt-6">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Worksheets:</span>
                  <span className="font-mono text-slate-300">Member_Profiles, Accounts, KYC, Nominees</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Target Tables:</span>
                  <span className="font-mono text-amber-400">members, accounts, wallets</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Data Tag:</span>
                  <span className="font-mono text-emerald-400">SYNTHETIC_DEMO_EXCEL</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                <a
                  href="/api/data-import/download/profiles"
                  download
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Download .XLSX
                </a>
              </div>
            </div>
          </div>

          {/* Data Quality Panel */}
          <div className="slot-panel p-8 sm:p-10 mb-8">
            <h3 className="text-base font-bold text-white mb-1 tracking-tight">Data Quality & Schema Verification</h3>
            <p className="text-xs text-slate-400 mb-6">
              Real-time audit metrics validating relational foreign keys and transaction integrity
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">TOTAL RECORDS</span>
                <span className="text-lg font-mono font-black text-white">
                  {etlResult?.dataQuality?.totalRecords || 200}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">VALID RECORDS</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {etlResult?.dataQuality?.validRecords || 200}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">INVALID</span>
                <span className="text-lg font-mono font-black text-slate-400">
                  {etlResult?.dataQuality?.invalidRecords || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">DUPLICATES</span>
                <span className="text-lg font-mono font-black text-slate-400">
                  {etlResult?.dataQuality?.duplicateRecords || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">MISSING WALLETS</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {etlResult?.dataQuality?.missingWalletAddresses || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">MISSING TXS</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {etlResult?.dataQuality?.missingTransactionIds || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">UNMAPPED</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {etlResult?.dataQuality?.unmappedMembers || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">FRESHNESS</span>
                <span className="text-xs font-bold text-amber-400 block mt-1.5 truncate font-mono">
                  {etlResult?.dataQuality?.dataFreshness || "Real-time"}
                </span>
              </div>
            </div>
          </div>

          {/* ETL Execution Logs Terminal */}
          <div className="slot-panel p-8 sm:p-10 mb-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                <Terminal size={16} className="text-amber-400" />
                9-Step ETL Execution Terminal
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                ETL Worker: Node.js / SheetJS Engine
              </span>
            </div>

            <div className="font-mono text-xs text-slate-300 space-y-2 max-h-64 overflow-y-auto">
              {etlResult ? (
                etlResult.etlLogs.map((log: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✔</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">
                  Click [RUN 9-STEP ETL PROCESS] above to execute live benchmark synchronization and view detailed pipeline telemetry.
                </div>
              )}
            </div>
          </div>

          {/* Ingestion History Table */}
          <div className="slot-panel p-8 sm:p-10 mb-8">
            <h3 className="text-base font-bold text-white mb-4 tracking-tight">ETL Import Audit Log</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Import ID</th>
                    <th>Source Filename</th>
                    <th>Timestamp</th>
                    <th>Records Found</th>
                    <th>Imported</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataInfo?.importedLogs?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-950 transition-colors">
                      <td className="font-mono text-xs text-amber-400">{log.id}</td>
                      <td className="font-medium text-white">{log.filename}</td>
                      <td className="text-slate-400 text-xs">{log.timestamp}</td>
                      <td className="text-slate-200 font-bold">{log.recordsFound}</td>
                      <td className="text-emerald-400 font-bold">{log.imported}</td>
                      <td>
                        <span className="text-xs font-bold text-emerald-400">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
