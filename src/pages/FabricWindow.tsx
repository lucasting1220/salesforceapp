import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import FabricPanel from "@/components/FabricPanel";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";

const STORAGE_KEY = "fabric_onboarded";

type View = "panel" | "settings";

const FabricWindow = () => {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState("Gmail");
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<View>("panel");

  useEffect(() => {
    if (!window.fabricAPI) return;
    window.fabricAPI.onLoadClient(({ clientId, activeApp }) => {
      setClientId(clientId);
      setActiveApp(activeApp);
    });
    window.fabricAPI.onSetExpanded((val) => setExpanded(val));
  }, []);

  const handleOnboardingComplete = (email: string) => {
    localStorage.setItem(STORAGE_KEY, email);
    setOnboarded(true);
  };

  const handleClose = () => {
    window.fabricAPI?.close();
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
