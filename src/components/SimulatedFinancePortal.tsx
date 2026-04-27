import { useState } from "react";
import { Search, Filter, Download, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { financeRecords, clients } from "@/data/mockData";
import { motion } from "framer-motion";

interface SimulatedFinancePortalProps {
  onClientDetected: (clientId: string | null) => void;
}

const trendIcon = (trend: string) => {
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-[#d93025]" />;
  if (trend === "improving") return <TrendingUp className="h-4 w-4 text-[#188038]" />;
  return <Minus className="h-4 w-4 text-[#5f6368]" />;
};

const SimulatedFinancePortal = ({ onClientDetected }: SimulatedFinancePortalProps) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleRowClick = (clientId: string) => {
    setSelectedClient(clientId);
    onClientDetected(clientId);
  };

  const client = selectedClient ? clients[selectedClient] : null;
  const record = selectedClient ? financeRecords.find(r => r.clientId === selectedClient) : null;

  return (
    <div className="flex flex-col h-full bg-[#f9fafb] rounded-lg overflow-hidden">
      {/* Portal header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1e293b] text-[#f8fafc]">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-[#3b82f6] flex items-center justify-center text-xs font-bold">F</div>
          <span className="text-sm font-semibold">FinanceOS</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
          <span>Accounts Receivable</span>
          <span>Reports</span>
          <span>Settings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!selectedClient ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">Accounts Receivable</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#fff] border border-[#e2e8f0] rounded-lg px-3 py-1.5">
                  <Search className="h-4 w-4 text-[#94a3b8] mr-2" />
                  <span className="text-sm text-[#94a3b8]">Search accounts...</span>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-sm text-[#475569] bg-[#fff]">
                  <Filter className="h-3.5 w-3.5" /> Filter
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-sm text-[#475569] bg-[#fff]">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] mb-1">Total Outstanding</p>
                <p className="text-2xl font-bold text-[#1e293b]">$49,500</p>
              </div>
              <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] mb-1">Overdue</p>
                <p className="text-2xl font-bold text-[#d93025]">$49,500</p>
              </div>
              <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] mb-1">Avg DSO</p>
                <p className="text-2xl font-bold text-[#1e293b]">63 days</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-left text-xs text-[#94a3b8] uppercase">
                    <th className="px-4 py-3 font-medium">Account</th>
                    <th className="px-4 py-3 font-medium">Total AR</th>
                    <th className="px-4 py-3 font-medium">Overdue</th>
                    <th className="px-4 py-3 font-medium">Last Payment</th>
                    <th className="px-4 py-3 font-medium">Trend</th>
                    <th className="px-4 py-3 font-medium">DSO</th>
                  </tr>
                </thead>
                <tbody>
                  {financeRecords.map((rec) => (
                    <tr
                      key={rec.clientId}
                      onClick={() => handleRowClick(rec.clientId)}
                      className="border-b border-[#f1f5f9] cursor-pointer hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[#1e293b]">{rec.name}</td>
                      <td className="px-4 py-3 text-[#475569]">{rec.totalAR}</td>
                      <td className={`px-4 py-3 font-medium ${rec.overdueAR !== "$0" ? "text-[#d93025]" : "text-[#188038]"}`}>
                        {rec.overdueAR}
                      </td>
                      <td className="px-4 py-3 text-[#475569]">{rec.lastPayment}</td>
                      <td className="px-4 py-3">{trendIcon(rec.paymentTrend)}</td>
                      <td className={`px-4 py-3 font-mono ${rec.dso > 60 ? "text-[#d93025]" : "text-[#475569]"}`}>
                        {rec.dso}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : client && record ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => { setSelectedClient(null); onClientDetected(null); }}
              className="text-sm text-[#3b82f6] mb-4 hover:underline"
            >
              ← Back to Accounts
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-[#f8fafc] font-bold">
                {client.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1e293b]">{client.name}</h2>
                <span className="text-xs text-[#94a3b8]">Account #{client.id.toUpperCase()}-001</span>
              </div>
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] mb-1">Outstanding Balance</p>
                <p className={`text-2xl font-bold ${record.overdueAR !== "$0" ? "text-[#d93025]" : "text-[#188038]"}`}>{record.totalAR}</p>
              </div>
              <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] mb-1">Days Sales Outstanding</p>
                <p className={`text-2xl font-bold ${record.dso > 60 ? "text-[#d93025]" : "text-[#1e293b]"}`}>{record.dso} days</p>
              </div>
            </div>

            {/* Invoice table */}
            <div className="bg-[#fff] border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0]">
                <h3 className="text-sm font-semibold text-[#1e293b]">Invoices</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-left text-xs text-[#94a3b8] uppercase">
                    <th className="px-4 py-2 font-medium">Invoice</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {client.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#f1f5f9]">
                      <td className="px-4 py-2.5 font-mono text-[#475569]">{inv.id}</td>
                      <td className="px-4 py-2.5 text-[#1e293b] font-medium">{inv.amount}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === "Overdue" ? "bg-[#fce8e6] text-[#d93025]" : "bg-[#e6f4ea] text-[#188038]"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#94a3b8]">{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default SimulatedFinancePortal;
