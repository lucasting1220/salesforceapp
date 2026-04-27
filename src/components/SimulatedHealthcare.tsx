import { useState } from "react";
import { Search, Activity, LayoutDashboard, Users, Stethoscope, CreditCard, CalendarClock, Filter, Download, ChevronLeft, ChevronRight, UserPlus, Ambulance, FlaskConical } from "lucide-react";
import { patients } from "@/data/mockData";

interface Props {
  onClientDetected: (clientId: string | null) => void;
}

// ── Nav ──────────────────────────────────────────────────────────────────────

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard"       },
  { icon: Users,           label: "Patient Details" },
  { icon: Stethoscope,     label: "Doctor Details"  },
  { icon: CreditCard,      label: "Payment Details" },
  { icon: CalendarClock,   label: "E-Channeling"    },
];

// ── Table rows (3 real + 5 display-only) ─────────────────────────────────────

const TABLE_ROWS = [
  { id: "osei",   name: "Margaret Osei",  phone: "(555) 421-8830", lastVisit: "Apr 7, 2026",  doctor: "Dr. J. Nguyen",   dept: "Orthopedics",    risk: "stable"   as const },
  { id: "rivera", name: "Carlos Rivera",  phone: "(555) 673-2214", lastVisit: "Apr 3, 2026",  doctor: "Dr. K. Hoffman",  dept: "Internal Med.",  risk: "monitor"  as const },
  { id: "park",   name: "Helen Park",     phone: "(555) 890-4421", lastVisit: "Apr 8, 2026",  doctor: "Dr. R. Wallace",  dept: "Cardiology",     risk: "critical" as const },
  { id: null,     name: "Thomas Adeyemi", phone: "(555) 234-5678", lastVisit: "Apr 5, 2026",  doctor: "Dr. A. Patel",    dept: "Primary Care",   risk: "stable"   as const },
  { id: null,     name: "Linda Morrison", phone: "(555) 345-6789", lastVisit: "Apr 4, 2026",  doctor: "Dr. L. Chen",     dept: "Nephrology",     risk: "monitor"  as const },
  { id: null,     name: "Kevin Walsh",    phone: "(555) 456-7890", lastVisit: "Apr 2, 2026",  doctor: "Dr. M. Reyes",    dept: "Psychiatry",     risk: "stable"   as const },
  { id: null,     name: "Priya Sharma",   phone: "(555) 567-8901", lastVisit: "Mar 31, 2026", doctor: "Dr. J. Nguyen",   dept: "Orthopedics",    risk: "stable"   as const },
  { id: null,     name: "David O'Brien",  phone: "(555) 678-9012", lastVisit: "Mar 28, 2026", doctor: "Dr. K. Hoffman",  dept: "Internal Med.",  risk: "monitor"  as const },
];

// ── Doctors ───────────────────────────────────────────────────────────────────

const DOCTORS = [
  { name: "Dr. Anika Patel",    specialty: "Primary Care",  initials: "AP", color: "bg-[#e8f0fe] text-[#1a73e8]"  },
  { name: "Dr. James Nguyen",   specialty: "Orthopedics",   initials: "JN", color: "bg-[#e6f4ea] text-[#188038]"  },
  { name: "Dr. Kevin Hoffman",  specialty: "Internal Med.", initials: "KH", color: "bg-[#fef7e0] text-[#e37400]"  },
  { name: "Dr. Robert Wallace", specialty: "Cardiology",    initials: "RW", color: "bg-[#fce8e6] text-[#d93025]"  },
  { name: "Dr. Lisa Chen",      specialty: "Nephrology",    initials: "LC", color: "bg-[#ede9fe] text-[#5b21b6]"  },
  { name: "Dr. Marco Reyes",    specialty: "Psychiatry",    initials: "MR", color: "bg-primary/15 text-primary"    },
];

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: CalendarClock, label: "Total Appointments", value: "140", color: "text-primary"    },
  { icon: Users,         label: "Total Patients",     value: "370", color: "text-[#188038]"  },
  { icon: Activity,      label: "Active Alerts",      value: "070", color: "text-[#d93025]"  },
  { icon: Stethoscope,   label: "Avg per Doctor",     value: "120", color: "text-[#e37400]"  },
];

// ── Action cards ──────────────────────────────────────────────────────────────

const ACTIONS = [
  { icon: UserPlus,    label: "ADMIT NEW",  sub: "PATIENT",  bg: "bg-[#e8f0fe]", iconBg: "bg-[#1a73e8]" },
  { icon: Ambulance,   label: "EMERGENCY",  sub: "ROOM",     bg: "bg-[#e6f4ea]", iconBg: "bg-[#188038]" },
  { icon: FlaskConical,label: "LAB",        sub: "RESULTS",  bg: "bg-[#ede9fe]", iconBg: "bg-[#5b21b6]" },
];

const riskDot: Record<string, string> = {
  stable:   "bg-[#188038]",
  monitor:  "bg-[#e37400]",
  critical: "bg-[#d93025]",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SimulatedHealthcare({ onClientDetected }: Props) {
  const [activeNav, setActiveNav]     = useState(1); // "Patient Details" default
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  const filtered = TABLE_ROWS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.dept.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (row: typeof TABLE_ROWS[0]) => {
    if (!row.id) return; // display-only rows don't trigger Robin
    if (selectedId === row.id) {
      setSelectedId(null);
      onClientDetected(null);
    } else {
      setSelectedId(row.id);
      onClientDetected(row.id);
    }
  };

  return (
    <div className="h-full flex rounded-xl border border-border bg-card overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="w-36 shrink-0 flex flex-col border-r border-border bg-secondary/20">
        {/* Logo */}
        <div className="px-3 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-foreground leading-tight">Northside</p>
              <p className="text-[9px] text-muted-foreground leading-tight">Medical Center</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {NAV.map((item, i) => {
            const Icon = item.icon;
            const active = activeNav === i;
            return (
              <button key={i} onClick={() => setActiveNav(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "bg-primary/10 border-r-2 border-primary text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status dot */}
        <div className="px-3 py-3 border-t border-border shrink-0 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#188038] animate-pulse" />
          <span className="text-[9px] text-muted-foreground">EMR Online</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Title */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Healthcare</p>
          <h1 className="text-base font-bold text-foreground">Management System</h1>
        </div>

        {/* Controls */}
        <div className="px-5 pb-2 shrink-0 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
            <Filter className="h-3 w-3" /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
            <Download className="h-3 w-3" /> Export
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <button className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <span className="text-[10px] text-muted-foreground px-1">Page 1 of 2</span>
            <button className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-5 pb-2">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide w-8" />
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide">Name</th>
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide">Phone</th>
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide">Last Visit</th>
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide">Doctor</th>
                <th className="text-left py-2 font-semibold text-muted-foreground uppercase text-[9px] tracking-wide">Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const isSelected = selectedId === row.id;
                const isReal     = !!row.id;
                const patient    = row.id ? patients[row.id] : null;
                const initials   = row.name.split(" ").map(n => n[0]).join("").slice(0, 2);
                return (
                  <tr key={i}
                    onClick={() => handleRowClick(row)}
                    className={`border-b border-border transition-colors ${
                      isReal ? "cursor-pointer" : "cursor-default"
                    } ${
                      isSelected
                        ? "bg-primary/5"
                        : isReal
                        ? "hover:bg-secondary/50"
                        : "opacity-70"
                    }`}>
                    {/* Avatar */}
                    <td className="py-2.5 pr-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}>
                        {initials}
                      </div>
                    </td>
                    {/* Name + risk dot */}
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${riskDot[row.risk]}`} />
                        <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{row.name}</span>
                        {isReal && patient && (
                          <span className="text-[8px] text-muted-foreground font-mono">{patient.mrn}</span>
                        )}
                        {isReal && patient && patient.billing.outstandingBalance !== "$0" && (
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#fce8e6] text-[#d93025]" title="Outstanding balance">
                            $ {patient.billing.outstandingBalance}
                          </span>
                        )}
                        {isReal && patient && patient.billing.priorAuths.some(a => a.status === "Pending") && (
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#fef7e0] text-[#e37400]" title="Pending prior auth">
                            Auth pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{row.phone}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{row.lastVisit}</td>
                    <td className="py-2.5 pr-3 font-medium text-foreground">{row.doctor}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[9px] font-medium">{row.dept}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">No patients match your search.</div>
          )}
        </div>

        {/* Action cards */}
        <div className="px-5 py-3 shrink-0 border-t border-border flex gap-3">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className={`flex-1 flex items-center gap-3 rounded-xl ${a.bg} px-3 py-2.5 cursor-pointer hover:opacity-90 transition-opacity`}>
                <div className={`h-8 w-8 rounded-full ${a.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium">{a.label}</p>
                  <p className="text-[11px] font-bold text-foreground">{a.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-48 shrink-0 flex flex-col border-l border-border overflow-y-auto">

        {/* Stats grid */}
        <div className="p-3 grid grid-cols-2 gap-2 shrink-0 border-b border-border">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-2.5 flex flex-col gap-1">
                <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Available doctors */}
        <div className="p-3 flex-1">
          <p className="text-[10px] font-bold text-foreground mb-2">Available Doctors</p>
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input placeholder="Search…"
              className="w-full pl-6 pr-2 py-1 text-[10px] rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DOCTORS.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold ${d.color}`}>
                  {d.initials}
                </div>
                <p className="text-[8px] font-semibold text-primary leading-tight line-clamp-2">{d.name}</p>
                <p className="text-[7px] text-muted-foreground leading-tight">{d.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
