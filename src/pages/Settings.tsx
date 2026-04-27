import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Mail, Shield, Wifi } from "lucide-react";
import { STORAGE_KEY } from "@/lib/constants";

const CONNECTED_TOOLS = [
  { label: "Gmail",   color: "#EA4335", letter: "G" },
  { label: "Slack",   color: "#4A154B", letter: "S" },
  { label: "Zendesk", color: "#03363D", letter: "Z" },
];

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function Settings({ onBack, onLogout }: SettingsProps) {
  const email = localStorage.getItem(STORAGE_KEY) ?? "unknown@company.com";
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    onLogout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", damping: 28, stiffness: 240 }}
      className="h-full flex flex-col bg-card"
    >
      <div className="drag-region px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="no-drag text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-foreground">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* User card */}
        <div className="rounded-xl border border-border bg-secondary/40 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{email.split("@")[0]}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Connected sources */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Connected Sources</span>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            {CONNECTED_TOOLS.map((tool, i) => (
              <div key={tool.label} className={`flex items-center gap-3 px-3 py-2.5 ${i < CONNECTED_TOOLS.length - 1 ? "border-b border-border" : ""}`}>
                <div className="h-6 w-6 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                  style={{ background: tool.color }}>
                  {tool.letter}
                </div>
                <span className="text-[12px] font-medium text-foreground flex-1">{tool.label}</span>
                <span className="text-[10px] text-[#188038] font-medium">Connected</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Account</span>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-[12px] text-foreground">Plan</span>
              <span className="text-[11px] text-muted-foreground">Robin Enterprise</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[12px] text-foreground">Version</span>
              <span className="text-[11px] text-muted-foreground">1.0.0</span>
            </div>
          </div>
        </div>

      </div>

      <div className="px-4 pb-5 shrink-0 border-t border-border pt-3">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-lg border border-destructive/40 text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </motion.div>
  );
}
