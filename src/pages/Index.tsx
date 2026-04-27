import { useState, useCallback, useEffect } from "react";
import { Mail, BarChart3, Info, Activity, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SimulatedGmail from "@/components/SimulatedGmail";
import SimulatedFinancePortal from "@/components/SimulatedFinancePortal";
import SimulatedHealthcare from "@/components/SimulatedHealthcare";
import SimulatedRetail from "@/components/SimulatedRetail";
import FabricPanel from "@/components/FabricPanel";
import { fabricBridge } from "@/lib/fabricBridge";

type AppTab = "gmail" | "finance" | "healthcare" | "retail";

const APP_LABELS: Record<AppTab, string> = {
  gmail:      "Gmail",
  finance:    "FinanceOS",
  healthcare: "Healthcare",
  retail:     "Retail",
};

const PANEL_STATUS_POLL_MS = 1000;

const Index = () => {
  const [activeApp, setActiveApp] = useState<AppTab>("gmail");
  const [detectedClient, setDetectedClient] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [panelLive, setPanelLive] = useState(false);

  const appLabel = APP_LABELS[activeApp];

  useEffect(() => {
    fabricBridge.connect();
    fabricBridge.onFabricClosed(() => {
      setDetectedClient(null);
      setPanelLive(false);
    });
    const interval = setInterval(() => {
      setPanelLive(fabricBridge.connected);
    }, PANEL_STATUS_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleClientDetected = useCallback((clientId: string | null) => {
    setDetectedClient(clientId);
    if (clientId) {
      setShowTip(false);
      if (fabricBridge.connected) fabricBridge.sendClientDetected(clientId, appLabel);
    } else {
      if (fabricBridge.connected) fabricBridge.sendClientCleared();
    }
  }, [appLabel]);

  const handleSwitchApp = (app: AppTab) => {
    setActiveApp(app);
    setDetectedClient(null);
    if (fabricBridge.connected) fabricBridge.sendClientCleared();
  };

  const handleClosePanel = () => {
    setDetectedClient(null);
    if (fabricBridge.connected) fabricBridge.sendClientCleared();
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="currentColor" className="text-primary-foreground" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">Robin</span>
            <span className="text-xs text-muted-foreground ml-2">Interactive Demo</span>
          </div>
        </div>

        {/* App switcher */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => handleSwitchApp("gmail")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeApp === "gmail" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-4 w-4" /> Gmail
          </button>
          <button
            onClick={() => handleSwitchApp("finance")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeApp === "finance" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" /> FinanceOS
          </button>
          <button
            onClick={() => handleSwitchApp("healthcare")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeApp === "healthcare" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" /> Healthcare
          </button>
          <button
            onClick={() => handleSwitchApp("retail")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeApp === "retail" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Retail
          </button>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
            detectedClient ? "bg-accent animate-pulse" :
            panelLive ? "bg-green-500" : "bg-muted-foreground"
          }`} />
          <span className="text-xs text-muted-foreground">
            {detectedClient ? "Panel active" : panelLive ? "Panel ready" : "Web demo"}
          </span>
        </div>
      </div>

      {/* Tip banner */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              <strong>Try it:</strong> Click on a client email in Gmail or a row in FinanceOS — the Robin panel will appear as a sidebar.
            </p>
            <button onClick={() => setShowTip(false)} className="text-xs text-muted-foreground hover:text-foreground shrink-0">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-3 flex gap-3">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeApp === "gmail" ? (
              <motion.div key="gmail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SimulatedGmail onClientDetected={handleClientDetected} />
              </motion.div>
            ) : activeApp === "finance" ? (
              <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SimulatedFinancePortal onClientDetected={handleClientDetected} />
              </motion.div>
            ) : activeApp === "healthcare" ? (
              <motion.div key="healthcare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SimulatedHealthcare onClientDetected={handleClientDetected} />
              </motion.div>
            ) : (
              <motion.div key="retail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SimulatedRetail onClientDetected={handleClientDetected} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inline panel — rendered when Electron is not running */}
        {!panelLive && (
          <AnimatePresence>
            {detectedClient && (
              <motion.div
                key={detectedClient}
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="h-full shrink-0 rounded-xl border border-border overflow-hidden"
                style={{ width: "340px" }}
              >
                <FabricPanel
                  clientId={detectedClient}
                  activeApp={appLabel}
                  onClose={handleClosePanel}
                  standalone={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Index;
