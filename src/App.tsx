import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Investigation from "./pages/Investigation";
import Wallets from "./pages/Wallets";
import WalletDetail from "./pages/WalletDetail";
import Alerts from "./pages/Alerts";
import ScamAnalysis from "./pages/ScamAnalysis";
import DataImport from "./pages/DataImport";
import DatabaseExplorer from "./pages/DatabaseExplorer";
import Settings from "./pages/Settings";
import AIAssistantDrawer from "./components/AIAssistantDrawer";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/wallet/:address" element={<WalletDetail />} />
          <Route path="/network-graph" element={<Navigate to="/scam-analysis" replace />} />
          <Route path="/scam-analysis" element={<ScamAnalysis />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/members" element={<Navigate to="/scam-analysis" replace />} />
          <Route path="/analytics" element={<Navigate to="/transactions" replace />} />
          <Route path="/reports" element={<Navigate to="/investigation" replace />} />
          <Route path="/system" element={<Navigate to="/settings" replace />} />
          <Route path="/data-import" element={<DataImport />} />
          <Route path="/database" element={<DatabaseExplorer />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <AIAssistantDrawer />
      </AuthProvider>
    </BrowserRouter>
  );
}
