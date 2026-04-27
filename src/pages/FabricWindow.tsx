import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import FabricPanel from "@/components/FabricPanel";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";
import { STORAGE_KEY } from "@/lib/constants";

const EXPAND_KEY = "e";

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== EXPAND_KEY) return;
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      window.fabricAPI?.toggleExpand();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
