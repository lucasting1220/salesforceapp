import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TheBriefProps {
  text: string;
  /** Restart the typewriter whenever this key changes */
  clientKey: string;
}

const SPEED_MS = 16; // ms per character

const TheBrief = ({ text, clientKey }: TheBriefProps) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, SPEED_MS);

    return () => clearInterval(timer);
  }, [clientKey, text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="rounded-xl border border-primary/25 overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.07), hsl(var(--primary) / 0.03))" }}
    >
      {/* Label row */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 border-b border-primary/10">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary tracking-wide uppercase">The Brief</span>
        {!done && (
          <span className="ml-auto flex items-center gap-1 text-[9px] text-primary/50">
            <span className="h-1 w-1 rounded-full bg-primary/50 animate-pulse" />
            generating
          </span>
        )}
      </div>

      {/* Typewriter text */}
      <div className="px-3 py-2.5">
        <p className="text-[11.5px] leading-relaxed text-foreground">
          {displayed}
          {!done && (
            <span className="inline-block w-[2px] h-[13px] bg-primary/70 ml-[1px] align-middle animate-pulse" />
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default TheBrief;
