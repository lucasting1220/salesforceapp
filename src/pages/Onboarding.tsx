import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Mail, ArrowRight, Loader2, X } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  color: string;
  letter: string;
  description: string;
}

const TOOLS: Tool[] = [
  { id: "gmail",    name: "Gmail",    color: "#EA4335", letter: "G",  description: "Email threads & contact history"    },
  { id: "slack",    name: "Slack",    color: "#4A154B", letter: "S",  description: "Channel activity & account mentions" },
  { id: "zendesk",  name: "Zendesk",  color: "#03363D", letter: "Z",  description: "Support tickets & customer health"   },
  { id: "hubspot",  name: "HubSpot",  color: "#FF7A59", letter: "H",  description: "Contact records & deal activity"     },
  { id: "zoom",     name: "Zoom",     color: "#2D8CFF", letter: "Z",  description: "Meeting history & call transcripts"  },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", letter: "in", description: "Relationship signals & job changes"  },
];

const CONNECTION_ANIMATION_MS = 1200;
const STAGGER_DELAY_MS = 300;
const SYNC_STEP_MS = 800;
const SYNC_COMPLETE_DELAY_MS = 400;
const ONBOARDING_COMPLETE_DELAY_MS = 1800;
const SYNC_TICK_MS = 120;
const SYNC_INCREMENT_MIN = 4;
const SYNC_INCREMENT_MAX = 18;

const stepVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

type Step = "email" | "connect" | "connecting" | "done";

interface OnboardingProps {
  onComplete: (email: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStep("connect");
  };

  const handleConnect = (toolId: string) => {
    if (connected.has(toolId) || connecting) return;
    setConnecting(toolId);
    setTimeout(() => {
      setConnected(prev => new Set([...prev, toolId]));
      setConnecting(null);
    }, CONNECTION_ANIMATION_MS);
  };

  const handleConnectAll = () => {
    const remaining = TOOLS.filter(t => !connected.has(t.id));
    if (remaining.length === 0) return;
    let i = 0;
    const connectNext = () => {
      if (i >= remaining.length) return;
      setConnecting(remaining[i].id);
      setTimeout(() => {
        setConnected(prev => new Set([...prev, remaining[i].id]));
        setConnecting(null);
        i++;
        if (i < remaining.length) setTimeout(connectNext, STAGGER_DELAY_MS);
      }, SYNC_STEP_MS);
    };
    connectNext();
  };

  const handleFinish = () => {
    setStep("connecting");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * SYNC_INCREMENT_MAX + SYNC_INCREMENT_MIN;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep("done"), SYNC_COMPLETE_DELAY_MS);
        setTimeout(() => onComplete(email), ONBOARDING_COMPLETE_DELAY_MS);
      }
      setProgress(Math.min(p, 100));
    }, SYNC_TICK_MS);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-card overflow-hidden">
      <div className="drag-region flex items-center justify-end px-3 py-2 shrink-0">
        <button
          className="no-drag text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => window.fabricAPI?.close()}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">

        {step === "email" && (
          <motion.div key="email" {...stepVariants}
            className="flex flex-col items-center justify-center flex-1 px-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-foreground mb-1">Robin</h1>
            <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
              Your work email connects everything.<br/>One identity across every tool you use.
            </p>
            <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                disabled={!email.includes("@")}>
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}

        {step === "connect" && (
          <motion.div key="connect" {...stepVariants}
            className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">✓</div>
                <p className="text-[11px] text-muted-foreground font-mono truncate">{email}</p>
              </div>
              <h2 className="text-base font-bold text-foreground">Connect your tools</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Robin surfaces context from every connected app — without you switching tabs.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
              <button onClick={handleConnectAll}
                className="w-full py-2 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors mb-3">
                Connect all at once
              </button>

              {TOOLS.map((tool) => {
                const isConnected = connected.has(tool.id);
                const isConnecting = connecting === tool.id;
                return (
                  <motion.div key={tool.id} layout
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      isConnected ? "border-[#188038]/30 bg-[#e6f4ea]/50" : "border-border bg-secondary/50 hover:bg-secondary"
                    }`}
                    onClick={() => handleConnect(tool.id)}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: tool.color }}>
                      {tool.letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                    </div>
                    <div className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center">
                      {isConnecting && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                      {isConnected  && <Check className="h-4 w-4 text-[#188038]" />}
                      {!isConnected && !isConnecting && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-5 pb-5 shrink-0 border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground text-center mb-2">
                {connected.size === 0
                  ? "Connect at least one tool to continue"
                  : `${connected.size} of ${TOOLS.length} connected`}
              </p>
              <button onClick={handleFinish} disabled={connected.size === 0}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center justify-center gap-2">
                Launch Robin <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "connecting" && (
          <motion.div key="syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground mb-1">Syncing your workspace</h2>
              <p className="text-[11px] text-muted-foreground">Indexing contacts across {connected.size} connected tools…</p>
            </div>
            <div className="w-full">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">{Math.round(progress)}%</p>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
              className="h-14 w-14 rounded-2xl bg-[#188038] flex items-center justify-center">
              <Check className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-sm font-bold text-foreground mb-1">You're connected</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Robin is running. Click any contact<br/>in {connected.has("gmail") ? "Gmail" : "your apps"} to see their full context.
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
