import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, FileText, TrendingUp, TrendingDown, Minus, Zap, CheckCircle2, Circle, AlertCircle, Settings } from "lucide-react";
import { clients, PIPELINE_STAGES } from "@/data/mockData";
import { useState } from "react";
import TheBrief from "@/components/TheBrief";
import { generateBrief } from "@/lib/generateBrief";

interface FabricPanelProps {
  clientId: string | null;
  activeApp: string;
  onClose: () => void;
  onSettings?: () => void;
  standalone?: boolean;
  expanded?: boolean;
}

const healthColor = (h: string) => {
  if (h === "healthy")  return { bg: "bg-[#e6f4ea]", text: "text-[#188038]", label: "Healthy" };
  if (h === "at-risk")  return { bg: "bg-[#fef7e0]", text: "text-[#e37400]", label: "At Risk" };
  return { bg: "bg-[#fce8e6]", text: "text-[#d93025]", label: "Critical" };
};

const forecastColor = (cat: string) => {
  if (cat === "Commit")    return "text-[#188038] bg-[#e6f4ea]";
  if (cat === "Best Case") return "text-[#e37400] bg-[#fef7e0]";
  if (cat === "Omitted")   return "text-[#d93025] bg-[#fce8e6]";
  return "text-foreground bg-secondary";
};

const callColor = (cat: string) => {
  if (cat === "Above Quota") return "text-[#188038]";
  if (cat === "At Quota")    return "text-foreground";
  if (cat === "At Risk")     return "text-[#e37400]";
  return "text-destructive";
};

const engagementLabel = (score: number) => {
  if (score >= 70) return { label: "High",   color: "text-[#188038]" };
  if (score >= 40) return { label: "Medium", color: "text-[#e37400]" };
  return { label: "Low", color: "text-destructive" };
};

const roleColor = (role: string) => {
  if (role === "Decision Maker") return "bg-primary/15 text-primary";
  if (role === "Champion")       return "bg-[#e6f4ea] text-[#188038]";
  if (role === "Influencer")     return "bg-[#fef7e0] text-[#e37400]";
  if (role === "Blocker")        return "bg-[#fce8e6] text-[#d93025]";
  return "bg-secondary text-muted-foreground";
};

const AutoIcon = ({ automated }: { automated: boolean }) =>
  automated
    ? <CheckCircle2 className="h-3 w-3 text-[#188038] shrink-0" />
    : <Circle className="h-3 w-3 text-muted-foreground shrink-0" />;

const taskDueColor = (due: string) =>
  due === "Overdue" ? "text-destructive" : due === "Today" ? "text-[#e37400]" : "text-muted-foreground";

const FabricPanel = ({ clientId, activeApp, onClose, onSettings, standalone = false, expanded = false }: FabricPanelProps) => {
  const client = clientId ? clients[clientId] : null;
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  if (!client) {
    if (!standalone) return null;
    return (
      <div className="w-full h-full flex flex-col bg-card">
        <div className="drag-region px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="currentColor" className="text-primary-foreground" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-foreground">Salesforce Fabric</span>
          </div>
          <div className="no-drag flex items-center gap-2">
            {onSettings && (
              <Settings className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={onSettings} />
            )}
            <X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={onClose} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Click a contact to load insights</p>
        </div>
      </div>
    );
  }

  const { salesCloud } = client;
  const { opportunity, contacts, forecast, pendingAutomation, einsteinScore } = salesCloud;
  const health = healthColor(client.health);

  const handleSaveNote = () => {
    if (!note.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
    setNote("");
  };

  return (
    <AnimatePresence>
      <motion.div
        key={clientId}
        initial={standalone ? { opacity: 0, scale: 0.97 } : { x: 320, opacity: 0 }}
        animate={standalone ? { opacity: 1, scale: 1 }   : { x: 0, opacity: 1 }}
        exit={standalone    ? { opacity: 0, scale: 0.97 } : { x: 320, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={standalone ? "w-full h-full flex flex-col overflow-hidden" : "w-80 h-full border-l flex flex-col overflow-hidden"}
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        {/* ── Header ── */}
        <div className="drag-region px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="currentColor" className="text-primary-foreground" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-foreground">Salesforce Fabric</span>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">
                Sales Cloud
              </motion.span>
            )}
          </div>
          <div className="no-drag flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground">{expanded ? "F1 to collapse" : "F1 for full view"}</span>
            {onSettings && (
              <Settings className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={onSettings} />
            )}
            <X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={onClose} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Compact column ── */}
          <div className="flex flex-col overflow-y-auto p-4 space-y-4" style={{ width: expanded ? "380px" : "100%", minWidth: expanded ? "380px" : undefined }}>

            {/* The Brief */}
            <TheBrief text={generateBrief(client, activeApp)} clientKey={`${client.id}-${activeApp}`} />

            {/* Account header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{client.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {[
                      { label: "G", color: "#EA4335" },
                      { label: "S", color: "#4A154B" },
                      { label: "Z", color: "#03363D" },
                    ].map(src => (
                      <div key={src.label} title={src.label === "G" ? "Gmail" : src.label === "S" ? "Slack" : "Zendesk"}
                        className="h-3.5 w-3.5 rounded text-white text-[7px] font-bold flex items-center justify-center"
                        style={{ background: src.color }}>
                        {src.label}
                      </div>
                    ))}
                    <span className="text-[10px] text-muted-foreground">3 sources</span>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${health.bg} ${health.text}`}>
                  {health.label}
                </span>
              </div>
            </motion.div>

            {/* Opportunity card */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-lg border border-border bg-secondary/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Opportunity</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${forecastColor(opportunity.forecastCategory)}`}>
                  {opportunity.forecastCategory}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground mb-2 leading-snug">{opportunity.name}</p>

              {/* Stage bar */}
              <div className="flex items-center gap-1 mb-2">
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={s.name} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={`h-1 w-full rounded-full ${i <= opportunity.stageIndex ? "bg-primary" : "bg-muted"}`} />
                    {i === opportunity.stageIndex && (
                      <span className="text-[8px] text-primary font-medium whitespace-nowrap">{s.name}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Amount</p>
                  <p className="text-xs font-semibold text-foreground">{opportunity.amount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Close</p>
                  <p className={`text-xs font-semibold ${client.renewalDays <= 30 ? "text-destructive" : "text-foreground"}`}>
                    {opportunity.closeDate.split(",")[0]}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Probability</p>
                  <p className={`text-xs font-semibold ${opportunity.probability < 40 ? "text-destructive" : opportunity.probability < 70 ? "text-[#e37400]" : "text-[#188038]"}`}>
                    {opportunity.probability}%
                  </p>
                </div>
              </div>

              {opportunity.nextStep && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground">Next Step</p>
                  <p className="text-[11px] text-foreground leading-snug mt-0.5">{opportunity.nextStep}</p>
                </div>
              )}
            </motion.div>

            {/* Account & Contact Management */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Contacts</span>
              </div>
              <div className="space-y-1.5">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground truncate block">{c.name}</span>
                      <span className="text-muted-foreground text-[10px]">{c.lastContact}</span>
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0 ${roleColor(c.role)}`}>{c.role}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Finance if FinanceOS */}
            {activeApp === "FinanceOS" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Invoices</span>
                </div>
                <div className="space-y-1.5">
                  {client.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-xs rounded-md bg-secondary px-2.5 py-1.5">
                      <span className="font-mono text-muted-foreground">{inv.id}</span>
                      <span className="font-medium text-foreground">{inv.amount}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${inv.status === "Overdue" ? "bg-destructive/10 text-destructive" : "bg-[#e6f4ea] text-[#188038]"}`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Activity timeline */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Activity History</span>
              </div>
              <div className="space-y-1">
                {client.auditTrail.slice(0, 4).map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-muted-foreground shrink-0 w-16 font-mono">{entry.time}</span>
                    <span className="text-foreground">{entry.action}</span>
                    <span className="text-muted-foreground shrink-0 ml-auto">via {entry.tool}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Log note */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="pb-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a note to Salesforce..."
                className="w-full h-14 rounded-lg bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleSaveNote}
                className="w-full mt-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                {noteSaved ? "✓ Logged to Salesforce" : "Log to Salesforce"}
              </button>
            </motion.div>
          </div>

          {/* ── Expanded: full Sales Cloud view ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                key="salescloud"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ type: "spring", damping: 28, stiffness: 220, delay: 0.05 }}
                className="flex-1 border-l border-border overflow-y-auto p-4 space-y-5"
              >

                {/* Einstein AI Score */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Einstein Opportunity Score</span>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-3xl font-bold tabular-nums ${
                        einsteinScore.score > 65 ? "text-[#188038]" : einsteinScore.score > 35 ? "text-[#e37400]" : "text-destructive"
                      }`}>{einsteinScore.score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      <span className="ml-auto flex items-center gap-1 text-xs">
                        {einsteinScore.trend === "up"   && <><TrendingUp   className="h-3.5 w-3.5 text-[#188038]" /><span className="text-[#188038]">Improving</span></>}
                        {einsteinScore.trend === "down" && <><TrendingDown className="h-3.5 w-3.5 text-destructive" /><span className="text-destructive">Declining</span></>}
                        {einsteinScore.trend === "stable" && <><Minus      className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Stable</span></>}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${einsteinScore.score}%` }}
                        transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${einsteinScore.score > 65 ? "bg-[#188038]" : einsteinScore.score > 35 ? "bg-[#e37400]" : "bg-destructive"}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Top Factors</p>
                      {einsteinScore.topFactors.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px]">
                          <AlertCircle className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pipeline Visibility */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Pipeline Visibility</span>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 space-y-2">
                    {PIPELINE_STAGES.map((stage, i) => (
                      <div key={stage.name} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${i < opportunity.stageIndex ? "bg-[#188038]" : i === opportunity.stageIndex ? "bg-primary" : "bg-muted"}`} />
                        <span className={`text-[11px] flex-1 ${i === opportunity.stageIndex ? "text-foreground font-semibold" : i < opportunity.stageIndex ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                          {stage.name}
                        </span>
                        {i === opportunity.stageIndex && (
                          <span className="text-[10px] text-primary font-medium">{opportunity.daysInStage}d here</span>
                        )}
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Weighted Value</span>
                        <span className="font-semibold text-foreground">{opportunity.weightedValue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Engagement */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Contact Engagement</span>
                  </div>
                  <div className="space-y-2">
                    {contacts.map((c, i) => {
                      const eng = engagementLabel(c.engagementScore);
                      return <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                          className="rounded-lg bg-secondary p-2.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-foreground truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.title}</p>
                            </div>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${roleColor(c.role)}`}>{c.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${c.engagementScore}%` }}
                                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                                className={`h-full rounded-full ${c.engagementScore >= 70 ? "bg-[#188038]" : c.engagementScore >= 40 ? "bg-[#e37400]" : "bg-destructive"}`}
                              />
                            </div>
                            <span className={`text-[10px] font-medium shrink-0 ${eng.color}`}>{eng.label}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Last contact: {c.lastContact}</p>
                        </motion.div>;
                    })}
                  </div>
                </div>

                {/* Forecasting */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Forecasting</span>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Rep Quota</span>
                      <span className="font-semibold text-foreground">{forecast.repQuota}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Attainment</span>
                        <span className={`font-semibold ${callColor(forecast.callCategory)}`}>{forecast.quotaAttainment}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(forecast.quotaAttainment, 100)}%` }}
                          transition={{ delay: 0.4, duration: 0.7 }}
                          className={`h-full rounded-full ${forecast.quotaAttainment >= 90 ? "bg-[#188038]" : forecast.quotaAttainment >= 60 ? "bg-[#e37400]" : "bg-destructive"}`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Pipeline Coverage</span>
                      <span className={`font-semibold ${forecast.pipelineCoverage >= 2 ? "text-[#188038]" : forecast.pipelineCoverage >= 1 ? "text-[#e37400]" : "text-destructive"}`}>
                        {forecast.pipelineCoverage}×
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-border">
                      <span className="text-muted-foreground">Forecast Call</span>
                      <span className={`font-semibold ${callColor(forecast.callCategory)}`}>{forecast.callCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Connected Sources */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#188038] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Connected Sources</span>
                  </div>

                  {/* Gmail */}
                  <div className="rounded-xl border border-border overflow-hidden mb-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/60">
                      <div className="h-5 w-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: "#EA4335" }}>G</div>
                      <span className="text-[11px] font-semibold text-foreground flex-1">Gmail</span>
                      <span className="text-[10px] text-muted-foreground">{client.connectedSources.gmail.openThreads} open threads</span>
                    </div>
                    <div className="px-3 py-2 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Last inbound</span>
                        <span className="text-foreground font-medium">{client.connectedSources.gmail.lastInbound}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Last outbound</span>
                        <span className="text-foreground font-medium">{client.connectedSources.gmail.lastOutbound}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slack */}
                  <div className="rounded-xl border border-border overflow-hidden mb-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/60">
                      <div className="h-5 w-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: "#4A154B" }}>S</div>
                      <span className="text-[11px] font-semibold text-foreground flex-1">Slack</span>
                      <span className="text-[10px] text-muted-foreground">{client.connectedSources.slack.channels.length} channels</span>
                    </div>
                    <div className="divide-y divide-border">
                      {client.connectedSources.slack.channels.map((ch, i) => (
                        <div key={i} className="px-3 py-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-mono text-primary">{ch.name}</span>
                            <div className="flex items-center gap-1.5">
                              {ch.unread > 0 && (
                                <span className="h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">{ch.unread}</span>
                              )}
                              <span className="text-[9px] text-muted-foreground">{ch.time}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                            <span className="font-medium text-foreground">{ch.author}:</span> {ch.lastMessage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zendesk */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/60">
                      <div className="h-5 w-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: "#03363D" }}>Z</div>
                      <span className="text-[11px] font-semibold text-foreground flex-1">Zendesk</span>
                      <span className={`text-[10px] font-medium ${client.connectedSources.zendesk.openTickets > 3 ? "text-destructive" : "text-muted-foreground"}`}>
                        {client.connectedSources.zendesk.openTickets} open
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {client.connectedSources.zendesk.tickets.slice(0, 3).map((t, i) => (
                        <div key={i} className="px-3 py-2 flex items-start gap-2">
                          <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">{t.id}</span>
                          <p className="text-[10px] text-foreground flex-1 leading-snug line-clamp-1">{t.subject}</p>
                          <span className={`text-[9px] font-semibold shrink-0 ${t.priority === "Urgent" ? "text-destructive" : t.priority === "High" ? "text-[#e37400]" : "text-muted-foreground"}`}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                      {client.connectedSources.zendesk.tickets.length > 3 && (
                        <div className="px-3 py-1.5 text-center">
                          <span className="text-[10px] text-muted-foreground">+{client.connectedSources.zendesk.tickets.length - 3} more tickets</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Automation */}
                <div className="pb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Automation Queue</span>
                  </div>
                  <div className="space-y-1.5">
                    {pendingAutomation.map((task, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                        className="flex items-start gap-2 rounded-lg bg-secondary px-2.5 py-2">
                        <AutoIcon automated={task.automated} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground leading-snug">{task.task}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-muted-foreground">{task.type}</span>
                            <span className="text-[9px] text-muted-foreground">·</span>
                            <span className={`text-[9px] font-medium ${taskDueColor(task.due)}`}>{task.due}</span>
                          </div>
                        </div>
                        {task.automated && (
                          <span className="text-[9px] text-[#188038] bg-[#e6f4ea] px-1.5 py-0.5 rounded shrink-0">Auto</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FabricPanel;
