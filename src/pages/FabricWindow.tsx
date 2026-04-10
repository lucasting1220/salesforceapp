import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import FabricPanel from "@/components/FabricPanel";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";

const STORAGE_KEY = "fabric_onboarded";
const PENDING_KEY = "robin_pending_client";

type View = "panel" | "settings";

const FabricWindow = () => {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState("Gmail");
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<View>("panel");

  useEffect(() => {
    if (window.fabricAPI) {
      // Electron mode — IPC bridge
      window.fabricAPI.onLoadClient(({ clientId, activeApp }) => {
        setClientId(clientId);
        setActiveApp(activeApp);
      });
      window.fabricAPI.onSetExpanded((val) => setExpanded(val));
    } else {
      // Web popup mode — read initial state from localStorage then listen via BroadcastChannel
      const pending = localStorage.getItem(PENDING_KEY);
      if (pending) {
        try {
          const { clientId, activeApp } = JSON.parse(pending);
          setClientId(clientId);
          setActiveApp(activeApp);
        } catch {}
      }

      const bc = new BroadcastChannel("robin");
      bc.onmessage = (e) => {
        if (e.data.type === "client-detected") {
          setClientId(e.data.clientId);
          setActiveApp(e.data.activeApp);
        } else if (e.data.type === "client-cleared") {
          setClientId(null);
        }
      };
      // Signal to the opener that we're ready to receive messages
      bc.postMessage({ type: "popup-ready" });
      return () => bc.close();
    }
  }, []);

  const handleOnboardingComplete = (email: string) => {
    localStorage.setItem(STORAGE_KEY, email);
    setOnboarded(true);
  };

  const handleClose = () => {
    if (window.fabricAPI) {
      window.fabricAPI.close();
    } else {
      window.close();
    }
  };

  const handleLogout = () => {
    setOnboarded(false);
    setView("panel");
  };

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-card">
      <AnimatePresence mode="wait">
        {view === "settings" ? (
          <Settings
            key="settings"
            onBack={() => setView("panel")}
            onLogout={handleLogout}
          />
        ) : (
          <FabricPanel
            key="panel"
            clientId={clientId}
            activeApp={activeApp}
            onClose={handleClose}
            onSettings={() => setView("settings")}
            expanded={expanded}
            standalone
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FabricWindow;
