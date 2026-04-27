// Mock data — modelled after Salesforce Sales Cloud objects

// ── Connected sources data (aggregated from integrated tools) ─────────────────

export interface ConnectedSources {
  zendesk: {
    openTickets: number;
    tickets: { id: string; subject: string; status: "Open" | "Pending" | "Solved"; priority: "Low" | "Normal" | "High" | "Urgent"; age: string }[];
  };
  slack: {
    channels: { name: string; lastMessage: string; author: string; time: string; unread: number }[];
  };
  gmail: {
    openThreads: number;
    lastInbound: string;
    lastOutbound: string;
  };
}

// ── Sales Cloud data per account ─────────────────────────────────────────────

export interface OpportunityStage {
  name: string;
  index: number; // 0-based position in pipeline
}

export const PIPELINE_STAGES: OpportunityStage[] = [
  { name: "Prospecting",       index: 0 },
  { name: "Qualification",     index: 1 },
  { name: "Needs Analysis",    index: 2 },
  { name: "Proposal",          index: 3 },
  { name: "Negotiation",       index: 4 },
  { name: "Closed Won",        index: 5 },
];

export interface SalesCloudData {
  opportunity: {
    name: string;
    stage: string;
    stageIndex: number;        // maps to PIPELINE_STAGES
    amount: string;
    closeDate: string;
    probability: number;       // 0–100
    forecastCategory: "Pipeline" | "Best Case" | "Commit" | "Omitted";
    daysInStage: number;
    nextStep: string;
    weightedValue: string;     // probability × amount
  };
  contacts: {
    name: string;
    title: string;
    role: "Decision Maker" | "Champion" | "Influencer" | "Blocker" | "End User";
    lastContact: string;
    engagementScore: number;   // 0–100
  }[];
  forecast: {
    repQuota: string;
    quotaAttainment: number;   // percentage of quota currently at
    pipelineCoverage: number;  // pipeline / quota ratio
    callCategory: "Above Quota" | "At Quota" | "At Risk" | "Below Quota";
  };
  pendingAutomation: {
    task: string;
    type: "Follow-up Email" | "Approval" | "Data Entry" | "Alert";
    due: string;
    automated: boolean;
  }[];
  einsteinScore: {
    score: number;             // 0–100
    trend: "up" | "down" | "stable";
    topFactors: string[];
  };
}

export interface Client {
  id: string;
  name: string;
  domain: string;
  contractValue: string;
  renewalDays: number;
  health: "healthy" | "at-risk" | "critical";
  outstanding: string;
  owner: string;
  ownerRole: string;
  execSponsor: string;
  execSponsorTitle: string;
  openTickets: number;
  lastTouch: string;
  healthScore: number;
  invoices: { id: string; amount: string; status: string; date: string }[];
  auditTrail: { action: string; tool: string; user: string; time: string }[];
  suggestedAction: string;
  salesCloud: SalesCloudData;
  connectedSources: ConnectedSources;
}

export const clients: Record<string, Client> = {
  acme: {
    id: "acme",
    name: "Acme Corp",
    domain: "acmecorp.com",
    contractValue: "$240,000",
    renewalDays: 47,
    health: "at-risk",
    outstanding: "$18,000",
    owner: "James Torres",
    ownerRole: "Account Executive",
    execSponsor: "Linda Park",
    execSponsorTitle: "CFO",
    openTickets: 3,
    lastTouch: "2 days ago",
    healthScore: 42,
    invoices: [
      { id: "INV-4021", amount: "$12,000", status: "Overdue", date: "Mar 15, 2026" },
      { id: "INV-4087", amount: "$6,000",  status: "Overdue", date: "Mar 28, 2026" },
      { id: "INV-3998", amount: "$24,000", status: "Paid",    date: "Feb 15, 2026" },
    ],
    auditTrail: [
      { action: "Email viewed",        tool: "Gmail",      user: "Maya Chen",    time: "2:28 PM" },
      { action: "Slack message sent",  tool: "Slack",      user: "Maya Chen",    time: "2:31 PM" },
      { action: "Portal record opened",tool: "FinanceOS",  user: "Maya Chen",    time: "2:45 PM" },
      { action: "Note logged",         tool: "Fabric",     user: "Maya Chen",    time: "2:46 PM" },
    ],
    suggestedAction: "Align with sales before replying — renewal at risk",
    salesCloud: {
      opportunity: {
        name: "Acme Corp — Annual Renewal 2026",
        stage: "Negotiation",
        stageIndex: 4,
        amount: "$240,000",
        closeDate: "May 26, 2026",
        probability: 35,
        forecastCategory: "Best Case",
        daysInStage: 12,
        nextStep: "Pending exec-to-exec call on contract terms",
        weightedValue: "$84,000",
      },
      contacts: [
        { name: "Rebecca Liu",  title: "Director of Procurement", role: "Decision Maker", lastContact: "Today",      engagementScore: 48 },
        { name: "Linda Park",   title: "CFO",                     role: "Influencer",     lastContact: "3 weeks ago", engagementScore: 21 },
        { name: "James Torres", title: "Account Executive",       role: "Champion",       lastContact: "2 days ago",  engagementScore: 60 },
      ],
      forecast: {
        repQuota: "$1,200,000",
        quotaAttainment: 51,
        pipelineCoverage: 1.8,
        callCategory: "At Risk",
      },
      pendingAutomation: [
        { task: "Send renewal reminder to Rebecca Liu",    type: "Follow-up Email", due: "Today",     automated: true  },
        { task: "Log call outcome from last week",        type: "Data Entry",      due: "Overdue",   automated: false },
        { task: "Escalation approval for contract change",type: "Approval",        due: "This week", automated: false },
      ],
      einsteinScore: {
        score: 34,
        trend: "down",
        topFactors: [
          "No exec engagement in 21 days",
          "Overdue invoices linked to this account",
          "Stage duration 2× the team average",
        ],
      },
    },
    connectedSources: {
      zendesk: {
        openTickets: 3,
        tickets: [
          { id: "TKT-8821", subject: "SSO login failures after March update",  status: "Open",    priority: "High",   age: "4 days" },
          { id: "TKT-8756", subject: "Export report timing out on large sets",  status: "Pending", priority: "Normal", age: "9 days" },
          { id: "TKT-8701", subject: "Billing portal access issue",             status: "Open",    priority: "Normal", age: "12 days" },
        ],
      },
      slack: {
        channels: [
          { name: "#acq-acme-corp",   lastMessage: "Rebecca mentioned contract terms again — flagging for James", author: "Maya Chen",    time: "2h ago",     unread: 4 },
          { name: "#renewals-q2",     lastMessage: "Acme is on the at-risk board for this quarter",               author: "James Torres", time: "Yesterday",  unread: 1 },
        ],
      },
      gmail: { openThreads: 2, lastInbound: "Today, 2:24 PM", lastOutbound: "2 days ago" },
    },
  },

  globex: {
    id: "globex",
    name: "Globex Industries",
    domain: "globex.io",
    contractValue: "$580,000",
    renewalDays: 112,
    health: "healthy",
    outstanding: "$0",
    owner: "Sarah Kim",
    ownerRole: "Senior AE",
    execSponsor: "Mark Chen",
    execSponsorTitle: "VP Engineering",
    openTickets: 1,
    lastTouch: "Yesterday",
    healthScore: 88,
    invoices: [
      { id: "INV-4102", amount: "$48,000", status: "Paid", date: "Mar 30, 2026" },
      { id: "INV-4055", amount: "$48,000", status: "Paid", date: "Feb 28, 2026" },
    ],
    auditTrail: [
      { action: "QBR completed",          tool: "Zoom",       user: "Sarah Kim",    time: "Yesterday" },
      { action: "Contract amended",       tool: "Salesforce", user: "Sarah Kim",    time: "3 days ago" },
      { action: "Support ticket resolved",tool: "Zendesk",    user: "Support Team", time: "Last week"  },
    ],
    suggestedAction: "Schedule expansion discussion — usage growing 23% MoM",
    salesCloud: {
      opportunity: {
        name: "Globex — Seat Expansion Q3 2026",
        stage: "Proposal",
        stageIndex: 3,
        amount: "$174,000",
        closeDate: "Jun 30, 2026",
        probability: 75,
        forecastCategory: "Commit",
        daysInStage: 3,
        nextStep: "Send enterprise pricing proposal with ROI model",
        weightedValue: "$130,500",
      },
      contacts: [
        { name: "Mark Chen",  title: "VP Engineering", role: "Decision Maker", lastContact: "Yesterday",   engagementScore: 91 },
        { name: "Sarah Kim",  title: "Senior AE",      role: "Champion",      lastContact: "Yesterday",   engagementScore: 88 },
        { name: "Priya Nair", title: "Eng Manager",    role: "End User",      lastContact: "Last week",   engagementScore: 74 },
      ],
      forecast: {
        repQuota: "$1,500,000",
        quotaAttainment: 78,
        pipelineCoverage: 2.4,
        callCategory: "Above Quota",
      },
      pendingAutomation: [
        { task: "Send proposal doc to Mark Chen",       type: "Follow-up Email", due: "Tomorrow",  automated: true  },
        { task: "Update opportunity amount post-call",  type: "Data Entry",      due: "Today",     automated: false },
      ],
      einsteinScore: {
        score: 87,
        trend: "up",
        topFactors: [
          "High exec engagement — 3 touches in 7 days",
          "Inbound expansion signal from decision maker",
          "Zero financial friction — fully paid account",
        ],
      },
    },
    connectedSources: {
      zendesk: {
        openTickets: 1,
        tickets: [
          { id: "TKT-9102", subject: "Webhook latency spike — engineering investigating", status: "Pending", priority: "Normal", age: "2 days" },
        ],
      },
      slack: {
        channels: [
          { name: "#acq-globex",      lastMessage: "QBR went great — Mark is ready to sign expansion",   author: "Sarah Kim", time: "Yesterday", unread: 0 },
          { name: "#expansion-leads", lastMessage: "Globex flagged as top expansion target for Q3",      author: "Sales Ops", time: "3 days ago", unread: 2 },
        ],
      },
      gmail: { openThreads: 1, lastInbound: "Today, 1:45 PM", lastOutbound: "Yesterday" },
    },
  },

  initech: {
    id: "initech",
    name: "Initech Solutions",
    domain: "initech.com",
    contractValue: "$95,000",
    renewalDays: 14,
    health: "critical",
    outstanding: "$31,500",
    owner: "David Park",
    ownerRole: "Account Executive",
    execSponsor: "Bill Lumbergh",
    execSponsorTitle: "CEO",
    openTickets: 7,
    lastTouch: "8 days ago",
    healthScore: 18,
    invoices: [
      { id: "INV-3945", amount: "$15,750", status: "Overdue", date: "Feb 28, 2026" },
      { id: "INV-3901", amount: "$15,750", status: "Overdue", date: "Jan 31, 2026" },
      { id: "INV-3856", amount: "$15,750", status: "Paid",    date: "Dec 31, 2025" },
    ],
    auditTrail: [
      { action: "Escalation flag set",    tool: "Salesforce", user: "David Park",   time: "3 days ago" },
      { action: "Payment reminder sent",  tool: "Gmail",      user: "Finance Team", time: "5 days ago" },
      { action: "Call attempted",         tool: "Phone",      user: "David Park",   time: "8 days ago" },
    ],
    suggestedAction: "URGENT: Escalate to exec sponsor — churn risk imminent",
    salesCloud: {
      opportunity: {
        name: "Initech — Renewal + Recovery 2026",
        stage: "Negotiation",
        stageIndex: 4,
        amount: "$95,000",
        closeDate: "Apr 23, 2026",
        probability: 15,
        forecastCategory: "Omitted",
        daysInStage: 22,
        nextStep: "Exec escalation required — rep unable to reach decision maker",
        weightedValue: "$14,250",
      },
      contacts: [
        { name: "Bill Lumbergh", title: "CEO",              role: "Decision Maker", lastContact: "8 days ago", engagementScore: 9  },
        { name: "David Park",    title: "Account Executive", role: "Champion",      lastContact: "3 days ago", engagementScore: 40 },
      ],
      forecast: {
        repQuota: "$900,000",
        quotaAttainment: 38,
        pipelineCoverage: 0.9,
        callCategory: "Below Quota",
      },
      pendingAutomation: [
        { task: "Escalation alert to VP of Sales",          type: "Alert",           due: "Overdue",   automated: true  },
        { task: "Payment demand notice to AP contact",      type: "Follow-up Email", due: "Overdue",   automated: true  },
        { task: "Log 3 unanswered call attempts",           type: "Data Entry",      due: "Overdue",   automated: false },
        { task: "Update forecast category to Omitted",     type: "Data Entry",      due: "Today",     automated: false },
      ],
      einsteinScore: {
        score: 11,
        trend: "down",
        topFactors: [
          "Decision maker dark for 8 days",
          "Stage duration 3× team average — stalled",
          "$31,500 overdue across 2 billing cycles",
        ],
      },
    },
    connectedSources: {
      zendesk: {
        openTickets: 7,
        tickets: [
          { id: "TKT-7701", subject: "Data migration broken — production blocked",      status: "Open",    priority: "Urgent", age: "1 day"   },
          { id: "TKT-7688", subject: "Permission errors for 12 users after role change", status: "Open",    priority: "High",   age: "3 days"  },
          { id: "TKT-7654", subject: "Reports not refreshing — stale data showing",      status: "Open",    priority: "High",   age: "5 days"  },
          { id: "TKT-7621", subject: "API rate limit errors on bulk import",             status: "Pending", priority: "Normal", age: "8 days"  },
          { id: "TKT-7590", subject: "Mobile app crash on iOS 17.4",                    status: "Open",    priority: "Normal", age: "11 days" },
        ],
      },
      slack: {
        channels: [
          { name: "#escalations",   lastMessage: "Initech is going dark — David flagged churn risk",     author: "David Park",   time: "3 days ago", unread: 6 },
          { name: "#acq-initech",   lastMessage: "Bill isn't picking up. Tried 3 times this week.",      author: "David Park",   time: "8 days ago", unread: 0 },
          { name: "#cs-critical",   lastMessage: "Initech added to critical watchlist — exec review needed", author: "CS Lead", time: "2 days ago", unread: 3 },
        ],
      },
      gmail: { openThreads: 3, lastInbound: "Today, 11:30 AM", lastOutbound: "5 days ago" },
    },
  },
};

// ── Email mock data ───────────────────────────────────────────────────────────

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  clientId?: string;
}

export const emails: Email[] = [
  {
    id: "1",
    from: "Rebecca Liu",
    fromEmail: "rebecca.liu@acmecorp.com",
    subject: "Re: Outstanding Invoice #4021 — Payment Timeline",
    preview: "Hi Maya, I wanted to follow up on the two outstanding invoices. Our AP team is reviewing...",
    body: `Hi Maya,

I wanted to follow up on the two outstanding invoices (INV-4021 and INV-4087). Our AP team is reviewing them and we expect to process payment within the next 10 business days.

I also wanted to flag that our renewal discussion is coming up soon. Could we schedule some time to review the contract terms? There are a few adjustments we'd like to propose.

Best,
Rebecca Liu
Director of Procurement, Acme Corp`,
    time: "2:24 PM",
    read: false,
    starred: false,
    clientId: "acme",
  },
  {
    id: "2",
    from: "Mark Chen",
    fromEmail: "mark.chen@globex.io",
    subject: "Expansion Discussion — Q3 Planning",
    preview: "Hey team, wanted to get ahead of our Q3 planning. Usage has been growing significantly and we'd like...",
    body: `Hey team,

Wanted to get ahead of our Q3 planning. Usage has been growing significantly and we'd like to explore adding 50 more seats across our engineering org.

Can we set up a call next week to discuss pricing tiers for the expansion?

Thanks,
Mark Chen
VP Engineering, Globex Industries`,
    time: "1:45 PM",
    read: true,
    starred: true,
    clientId: "globex",
  },
  {
    id: "3",
    from: "Bill Lumbergh",
    fromEmail: "bill@initech.com",
    subject: "Re: Re: Overdue Payment — Urgent",
    preview: "Yeah... I'm going to need you to hold off on any service changes. We're working through some internal...",
    body: `Yeah... I'm going to need you to hold off on any service changes. We're working through some internal budget reallocation.

I'll have an update by end of next week.

Bill Lumbergh
CEO, Initech Solutions`,
    time: "11:30 AM",
    read: false,
    starred: false,
    clientId: "initech",
  },
  {
    id: "4",
    from: "Sarah Kim",
    fromEmail: "sarah.kim@company.com",
    subject: "Team Standup Notes — April 9",
    preview: "Hey everyone, here are the notes from today's standup. Action items below...",
    body: `Hey everyone,

Here are the notes from today's standup:
- Q2 targets review next Monday
- New hire onboarding schedule updated
- Client escalation process doc shared

Action items assigned in Asana.

Sarah`,
    time: "10:15 AM",
    read: true,
    starred: false,
  },
  {
    id: "5",
    from: "Newsletter",
    fromEmail: "digest@techcrunch.com",
    subject: "TechCrunch Daily — AI Funding Roundup",
    preview: "Today's top stories: Series B funding hits record levels in Q1 2026...",
    body: `TechCrunch Daily Digest

Today's top stories:
• Series B funding hits record levels in Q1 2026
• New AI regulations proposed in EU
• Startup layoffs slow for first time in 18 months`,
    time: "8:00 AM",
    read: true,
    starred: false,
  },
];

// ── Healthcare patient mock data ─────────────────────────────────────────────

export interface PatientBilling {
  system: string;                   // e.g. "MedBill Pro"
  claimNumber: string;
  claimStatus: "Approved" | "Pending" | "Under Review" | "Denied";
  billedAmount: string;
  insurancePays: string;
  patientResponsibility: string;
  amountPaid: string;
  outstandingBalance: string;
  priorAuths: { item: string; status: "Approved" | "Pending" | "Denied"; note?: string }[];
  billingAlerts: string[];
}

export interface PatientSources {
  ehr:        { system: string; lastSync: string };
  billing:    { system: string; lastSync: string };
  lab:        { system: string; lastSync: string };
  scheduling: { system: string; lastSync: string };
}

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  bloodType: string;
  insurance: { provider: string; memberId: string; group: string };
  riskLevel: "stable" | "monitor" | "critical";
  primaryDiagnosis: string;
  conditions: string[];
  allergies: string[];
  medications: { name: string; dose: string; frequency: string; prescriber: string }[];
  recentVisits: { date: string; type: string; provider: string; summary: string }[];
  upcomingAppointments: { date: string; type: string; provider: string; location: string }[];
  labResults: { test: string; value: string; reference: string; status: "normal" | "abnormal" | "critical"; date: string }[];
  careTeam: { name: string; role: string }[];
  alerts: string[];
  lastVisit: string;
  billing: PatientBilling;
  sources: PatientSources;
}

export const patients: Record<string, Patient> = {
  osei: {
    id: "osei",
    name: "Margaret Osei",
    mrn: "MRN-004821",
    dob: "Mar 12, 1958",
    age: 67,
    gender: "Female",
    bloodType: "A+",
    insurance: { provider: "BlueCross BlueShield", memberId: "BCB-4821-X", group: "GRP-7740" },
    riskLevel: "stable",
    primaryDiagnosis: "Post-op Hip Replacement (Recovery)",
    conditions: ["Total hip arthroplasty (L)", "Osteoporosis", "Hypertension (controlled)", "Hyperlipidemia"],
    allergies: ["Penicillin (rash)", "NSAIDs (GI intolerance)"],
    medications: [
      { name: "Amlodipine",    dose: "5mg",    frequency: "Once daily",   prescriber: "Dr. Patel" },
      { name: "Atorvastatin",  dose: "40mg",   frequency: "Once nightly", prescriber: "Dr. Patel" },
      { name: "Calcium + D3",  dose: "600mg",  frequency: "Twice daily",  prescriber: "Dr. Nguyen" },
      { name: "Enoxaparin",    dose: "40mg SC",frequency: "Once daily",   prescriber: "Dr. Nguyen" },
    ],
    recentVisits: [
      { date: "Apr 7, 2026",  type: "Post-op Follow-up",   provider: "Dr. Nguyen (Ortho)", summary: "6-week post-op check. Incision healed, PT progressing well. Pain 2/10." },
      { date: "Mar 15, 2026", type: "Pre-op Assessment",   provider: "Dr. Patel (Primary)", summary: "Cleared for surgery. BP stable, lipids managed. DVT prophylaxis ordered." },
      { date: "Feb 20, 2026", type: "Orthopedic Consult",  provider: "Dr. Nguyen (Ortho)", summary: "Surgery scheduled. Reviewed risks, patient consented." },
    ],
    upcomingAppointments: [
      { date: "Apr 21, 2026", type: "Physical Therapy",     provider: "Sarah Mills, PT",      location: "Rehab Center, 3rd Floor" },
      { date: "May 5, 2026",  type: "Ortho Follow-up",      provider: "Dr. Nguyen",           location: "Orthopedics Clinic, Bldg B" },
      { date: "May 19, 2026", type: "Annual Wellness Visit", provider: "Dr. Patel",           location: "Primary Care, Bldg A" },
    ],
    labResults: [
      { test: "INR",           value: "1.2",    reference: "0.8–1.2",     status: "normal",   date: "Apr 7, 2026" },
      { test: "CBC — WBC",     value: "7.1",    reference: "4.5–11.0",    status: "normal",   date: "Apr 7, 2026" },
      { test: "Hemoglobin",    value: "11.4",   reference: "12.0–16.0",   status: "abnormal", date: "Apr 7, 2026" },
      { test: "LDL",           value: "88",     reference: "<100 mg/dL",  status: "normal",   date: "Mar 15, 2026" },
      { test: "Blood Pressure",value: "128/82", reference: "<130/80",     status: "abnormal", date: "Apr 7, 2026" },
    ],
    careTeam: [
      { name: "Dr. Anika Patel",    role: "Primary Care Physician" },
      { name: "Dr. James Nguyen",   role: "Orthopedic Surgeon" },
      { name: "Sarah Mills",        role: "Physical Therapist" },
      { name: "Nurse R. Thompson",  role: "Post-op Care Coordinator" },
    ],
    alerts: ["Mild anemia post-op — monitor Hgb at next visit", "DVT prophylaxis ends Apr 15"],
    lastVisit: "Apr 7, 2026",
    billing: {
      system: "MedBill Pro",
      claimNumber: "CLM-482110",
      claimStatus: "Approved",
      billedAmount: "$42,800",
      insurancePays: "$38,520",
      patientResponsibility: "$4,280",
      amountPaid: "$2,140",
      outstandingBalance: "$2,140",
      priorAuths: [
        { item: "Physical Therapy (12 sessions)", status: "Approved", note: "Expires Jun 30, 2026" },
        { item: "Follow-up MRI — Left Hip",       status: "Pending",  note: "Awaiting BCBS review" },
      ],
      billingAlerts: [
        "Outstanding balance $2,140 — payment plan in place",
        "MRI prior auth pending — do not schedule until approved",
      ],
    },
    sources: {
      ehr:        { system: "eClinicalWorks", lastSync: "Apr 7, 2026 — 3:12 PM" },
      billing:    { system: "MedBill Pro",    lastSync: "Apr 7, 2026 — 4:00 PM" },
      lab:        { system: "LabConnect",     lastSync: "Apr 7, 2026 — 2:48 PM" },
      scheduling: { system: "MedSched",       lastSync: "Apr 7, 2026 — 1:00 PM" },
    },
  },

  rivera: {
    id: "rivera",
    name: "Carlos Rivera",
    mrn: "MRN-007163",
    dob: "Jun 28, 1973",
    age: 52,
    gender: "Male",
    bloodType: "O+",
    insurance: { provider: "Aetna", memberId: "AET-7163-Y", group: "GRP-3310" },
    riskLevel: "monitor",
    primaryDiagnosis: "Type 2 Diabetes Mellitus — Suboptimal Control",
    conditions: ["Type 2 Diabetes (HbA1c 8.9%)", "Hypertension (Stage 2)", "Obesity (BMI 34.1)", "Early-stage CKD (Stage 2)", "Depression"],
    allergies: ["Sulfa drugs (anaphylaxis)"],
    medications: [
      { name: "Metformin",    dose: "1000mg",  frequency: "Twice daily w/ meals", prescriber: "Dr. Hoffman" },
      { name: "Lisinopril",   dose: "20mg",    frequency: "Once daily",           prescriber: "Dr. Hoffman" },
      { name: "Empagliflozin",dose: "10mg",    frequency: "Once daily",           prescriber: "Dr. Hoffman" },
      { name: "Sertraline",   dose: "50mg",    frequency: "Once daily",           prescriber: "Dr. Reyes (Psych)" },
      { name: "Rosuvastatin", dose: "20mg",    frequency: "Once nightly",         prescriber: "Dr. Hoffman" },
    ],
    recentVisits: [
      { date: "Apr 3, 2026",  type: "Diabetes Management",  provider: "Dr. Hoffman (Internal Med)", summary: "HbA1c 8.9% — not at target. Empagliflozin added. Dietary counselling referral placed." },
      { date: "Feb 18, 2026", type: "Nephrology Consult",   provider: "Dr. Chen (Nephrology)",      summary: "eGFR 68 — Stage 2 CKD confirmed. Continue lisinopril, reduce NSAID exposure." },
      { date: "Jan 10, 2026", type: "Psychiatric Follow-up", provider: "Dr. Reyes (Psych)",         summary: "Depression stable on sertraline. PHQ-9 score 7, down from 12." },
    ],
    upcomingAppointments: [
      { date: "Apr 17, 2026", type: "Diabetes Educator",      provider: "Maria Lopez, RD",         location: "Endocrine Clinic, Suite 210" },
      { date: "May 2, 2026",  type: "Nephrology Follow-up",   provider: "Dr. Chen",                location: "Nephrology, 4th Floor" },
      { date: "May 16, 2026", type: "Internal Med Follow-up", provider: "Dr. Hoffman",             location: "Primary Care, Bldg A" },
    ],
    labResults: [
      { test: "HbA1c",         value: "8.9%",  reference: "<7.0%",         status: "abnormal", date: "Apr 3, 2026" },
      { test: "eGFR",          value: "68",    reference: ">60 mL/min",    status: "abnormal", date: "Apr 3, 2026" },
      { test: "Blood Pressure",value: "148/92",reference: "<130/80",       status: "critical", date: "Apr 3, 2026" },
      { test: "LDL",           value: "112",   reference: "<100 mg/dL",    status: "abnormal", date: "Apr 3, 2026" },
      { test: "Creatinine",    value: "1.18",  reference: "0.74–1.35",     status: "normal",   date: "Apr 3, 2026" },
      { test: "Urine Albumin", value: "42",    reference: "<30 mg/g",      status: "abnormal", date: "Apr 3, 2026" },
    ],
    careTeam: [
      { name: "Dr. Kevin Hoffman",  role: "Internal Medicine (Primary)" },
      { name: "Dr. Lisa Chen",      role: "Nephrologist" },
      { name: "Dr. Marco Reyes",    role: "Psychiatrist" },
      { name: "Maria Lopez",        role: "Registered Dietitian" },
    ],
    alerts: [
      "HbA1c 8.9% — above target, medication adjusted Apr 3",
      "BP 148/92 — hypertension uncontrolled, reassess in 6 weeks",
      "Microalbuminuria detected — CKD monitoring protocol active",
    ],
    lastVisit: "Apr 3, 2026",
    billing: {
      system: "MedBill Pro",
      claimNumber: "CLM-716305",
      claimStatus: "Under Review",
      billedAmount: "$1,840",
      insurancePays: "$1,160",
      patientResponsibility: "$680",
      amountPaid: "$0",
      outstandingBalance: "$680",
      priorAuths: [
        { item: "Empagliflozin (Jardiance)",    status: "Pending", note: "Aetna formulary exception — filed Apr 3" },
        { item: "Nephrology consult — Apr",     status: "Approved" },
        { item: "Diabetes Educator (4 sessions)", status: "Approved" },
      ],
      billingAlerts: [
        "Empagliflozin prior auth PENDING — prescription cannot be filled until approved",
        "Outstanding balance $680 — no payment plan on file",
        "Claim under review — Aetna requested additional documentation Apr 5",
      ],
    },
    sources: {
      ehr:        { system: "eClinicalWorks", lastSync: "Apr 3, 2026 — 2:10 PM" },
      billing:    { system: "MedBill Pro",    lastSync: "Apr 5, 2026 — 9:00 AM" },
      lab:        { system: "LabConnect",     lastSync: "Apr 3, 2026 — 1:45 PM" },
      scheduling: { system: "MedSched",       lastSync: "Apr 3, 2026 — 3:00 PM" },
    },
  },

  park: {
    id: "park",
    name: "Helen Park",
    mrn: "MRN-002290",
    dob: "Sep 3, 1947",
    age: 78,
    gender: "Female",
    bloodType: "B-",
    insurance: { provider: "Medicare Part B", memberId: "MCR-2290-Z", group: "N/A" },
    riskLevel: "critical",
    primaryDiagnosis: "Acute Decompensated Heart Failure (NYHA Class III)",
    conditions: ["Acute decompensated HF (EF 30%)", "Atrial fibrillation (persistent)", "Type 2 Diabetes", "CKD Stage 3", "Anemia of chronic disease"],
    allergies: ["ACE inhibitors (cough)", "Contrast dye (nephrotoxicity risk)"],
    medications: [
      { name: "Furosemide",    dose: "80mg IV",  frequency: "Twice daily",         prescriber: "Dr. Wallace (Cardio)" },
      { name: "Carvedilol",    dose: "3.125mg",  frequency: "Twice daily",         prescriber: "Dr. Wallace (Cardio)" },
      { name: "Sacubitril/Valsartan", dose: "24/26mg", frequency: "Twice daily",  prescriber: "Dr. Wallace (Cardio)" },
      { name: "Apixaban",      dose: "5mg",      frequency: "Twice daily",         prescriber: "Dr. Wallace (Cardio)" },
      { name: "Insulin Glargine",dose: "20 units",frequency: "Once nightly",       prescriber: "Dr. Hoffman" },
      { name: "Darbepoetin alfa",dose: "60mcg SC",frequency: "Weekly",             prescriber: "Dr. Chen (Nephro)" },
    ],
    recentVisits: [
      { date: "Apr 8, 2026",  type: "ED Admission — Heart Failure",  provider: "Dr. Wallace (Cardio)", summary: "Admitted for acute HF decompensation. +8kg fluid overload. IV diuresis initiated. Echo: EF 30%, worsened from 38%." },
      { date: "Mar 12, 2026", type: "Cardiology Follow-up",           provider: "Dr. Wallace",          summary: "Functional decline noted. NYHA upgraded II→III. Sacubitril/Valsartan dose optimized." },
      { date: "Feb 5, 2026",  type: "Nephrology + Cardiology Joint",  provider: "Dr. Chen + Dr. Wallace","summary": "Fluid balance strategy adjusted. Cautious diuresis given CKD Stage 3. eGFR trending down." },
    ],
    upcomingAppointments: [
      { date: "Apr 10, 2026", type: "Cardiology Inpatient Round",    provider: "Dr. Wallace",          location: "CCU — Room 408" },
      { date: "Apr 12, 2026", type: "Palliative Care Consult",       provider: "Dr. Santos (Palliative)","location": "CCU — Room 408" },
      { date: "Apr 15, 2026", type: "Discharge Planning",            provider: "Social Work + Cardio",  location: "CCU — Room 408" },
    ],
    labResults: [
      { test: "BNP",          value: "1,840",  reference: "<100 pg/mL",    status: "critical", date: "Apr 8, 2026" },
      { test: "Creatinine",   value: "2.1",    reference: "0.5–1.1",       status: "critical", date: "Apr 8, 2026" },
      { test: "eGFR",         value: "28",     reference: ">60 mL/min",    status: "critical", date: "Apr 8, 2026" },
      { test: "Hemoglobin",   value: "9.2",    reference: "12.0–16.0",     status: "abnormal", date: "Apr 8, 2026" },
      { test: "Potassium",    value: "5.4",    reference: "3.5–5.0 mEq/L", status: "abnormal", date: "Apr 8, 2026" },
      { test: "Sodium",       value: "131",    reference: "135–145 mEq/L", status: "abnormal", date: "Apr 8, 2026" },
    ],
    careTeam: [
      { name: "Dr. Robert Wallace",  role: "Cardiologist (Attending)" },
      { name: "Dr. Lisa Chen",       role: "Nephrologist" },
      { name: "Dr. Elena Santos",    role: "Palliative Care" },
      { name: "Dr. Kevin Hoffman",   role: "Internal Medicine" },
      { name: "Nurse B. Okafor",     role: "CCU Primary Nurse" },
    ],
    alerts: [
      "CRITICAL: BNP 1,840 — severe decompensation",
      "CRITICAL: eGFR 28 — cardiorenal syndrome developing",
      "Palliative care consult ordered — goals of care discussion pending",
      "Hyperkalemia risk — monitor potassium with diuresis",
    ],
    lastVisit: "Apr 8, 2026",
    billing: {
      system: "MedBill Pro",
      claimNumber: "CLM-229048",
      claimStatus: "Pending",
      billedAmount: "$5,600",
      insurancePays: "$5,040",
      patientResponsibility: "$560",
      amountPaid: "$0",
      outstandingBalance: "$0",
      priorAuths: [
        { item: "IV Furosemide — inpatient",       status: "Approved" },
        { item: "Palliative Care consult",         status: "Pending",  note: "Medicare review — standard 24–48h" },
        { item: "Echocardiogram (repeat)",         status: "Approved" },
        { item: "Darbepoetin alfa (weekly × 4)",  status: "Approved" },
      ],
      billingAlerts: [
        "Inpatient admission claim in progress — accruing at $2,800/day",
        "Palliative care prior auth pending — consult Apr 12 may be delayed",
        "Social Work flagged for financial hardship review — Medicare supplement gap",
      ],
    },
    sources: {
      ehr:        { system: "eClinicalWorks", lastSync: "Apr 8, 2026 — 11:20 AM" },
      billing:    { system: "MedBill Pro",    lastSync: "Apr 8, 2026 — 12:00 PM" },
      lab:        { system: "LabConnect",     lastSync: "Apr 8, 2026 — 10:55 AM" },
      scheduling: { system: "MedSched",       lastSync: "Apr 8, 2026 — 9:30 AM"  },
    },
  },
};

// ── Finance portal mock data ──────────────────────────────────────────────────

export interface FinanceRecord {
  clientId: string;
  name: string;
  totalAR: string;
  overdueAR: string;
  lastPayment: string;
  paymentTrend: "improving" | "declining" | "stable";
  dso: number;
}

export const financeRecords: FinanceRecord[] = [
  { clientId: "acme",   name: "Acme Corp",         totalAR: "$18,000", overdueAR: "$18,000", lastPayment: "Feb 15, 2026", paymentTrend: "declining", dso: 62 },
  { clientId: "globex", name: "Globex Industries",  totalAR: "$0",      overdueAR: "$0",      lastPayment: "Mar 30, 2026", paymentTrend: "stable",   dso: 28 },
  { clientId: "initech",name: "Initech Solutions",  totalAR: "$31,500", overdueAR: "$31,500", lastPayment: "Dec 31, 2025", paymentTrend: "declining", dso: 98 },
];

// ── Retail / e-commerce customer mock data ───────────────────────────────────

export interface RetailOrder {
  id: string;
  date: string;
  items: string;
  total: string;
  status: "Delivered" | "Processing" | "Shipped" | "Returned" | "Cancelled";
}

export interface RetailCustomer {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  loyaltyPoints: number;
  lifetimeValue: string;
  totalOrders: number;
  avgOrderValue: string;
  segment: "VIP" | "Loyal" | "At Risk" | "New" | "Churned";
  lastOrderDate: string;
  orders: RetailOrder[];
  returns: { orderId: string; item: string; reason: string; date: string; refund: string }[];
  supportTickets: { id: string; subject: string; status: "Open" | "Resolved" | "Pending"; date: string }[];
  signals: string[];
  recommendedActions: string[];
}

export const retailCustomers: Record<string, RetailCustomer> = {
  caldwell: {
    id: "caldwell",
    name: "Emma Caldwell",
    email: "emma.caldwell@gmail.com",
    memberSince: "Mar 2021",
    loyaltyTier: "Platinum",
    loyaltyPoints: 4820,
    lifetimeValue: "$8,240",
    totalOrders: 38,
    avgOrderValue: "$217",
    segment: "VIP",
    lastOrderDate: "Apr 6, 2026",
    orders: [
      { id: "#ORD-9841", date: "Apr 6, 2026",  items: "Linen Blazer, Silk Scarf",        total: "$284",  status: "Processing" },
      { id: "#ORD-9612", date: "Mar 18, 2026", items: "Merino Sweater × 2",              total: "$198",  status: "Delivered"  },
      { id: "#ORD-9388", date: "Feb 28, 2026", items: "Canvas Tote, Leather Wallet",     total: "$145",  status: "Delivered"  },
      { id: "#ORD-9100", date: "Jan 14, 2026", items: "Winter Coat",                     total: "$420",  status: "Delivered"  },
    ],
    returns: [],
    supportTickets: [
      { id: "TKT-221", subject: "Wrong size sent on ORD-9388", status: "Resolved", date: "Mar 2, 2026" },
    ],
    signals: [
      "38 orders over 3 years — highest frequency in cohort",
      "Zero churn risk — last purchase 3 days ago",
      "Responds well to early-access campaigns (2× CTR)",
      "4,820 loyalty points — approaching Platinum reward threshold",
    ],
    recommendedActions: [
      "Send exclusive Platinum early-access invite for summer drop",
      "Offer complimentary gift wrap on next order",
      "Nominate for VIP loyalty milestone reward",
    ],
  },

  park: {
    id: "park",
    name: "Jason Park",
    email: "jason.park@outlook.com",
    memberSince: "Aug 2022",
    loyaltyTier: "Gold",
    loyaltyPoints: 1140,
    lifetimeValue: "$2,610",
    totalOrders: 14,
    avgOrderValue: "$186",
    segment: "At Risk",
    lastOrderDate: "Jan 30, 2026",
    orders: [
      { id: "#ORD-9201", date: "Jan 30, 2026", items: "Wool Trousers",                   total: "$178",  status: "Returned"   },
      { id: "#ORD-8990", date: "Dec 10, 2025", items: "Puffer Jacket",                   total: "$310",  status: "Delivered"  },
      { id: "#ORD-8741", date: "Oct 22, 2025", items: "Oxford Shirt × 3",                total: "$195",  status: "Delivered"  },
      { id: "#ORD-8504", date: "Aug 15, 2025", items: "Chino Shorts, Canvas Belt",       total: "$112",  status: "Delivered"  },
    ],
    returns: [
      { orderId: "#ORD-9201", item: "Wool Trousers", reason: "Fit issue — too slim", date: "Feb 4, 2026", refund: "$178" },
    ],
    supportTickets: [
      { id: "TKT-418", subject: "Return label not received",          status: "Resolved", date: "Feb 5, 2026"  },
      { id: "TKT-402", subject: "Wrong item colour in ORD-8990",      status: "Resolved", date: "Dec 14, 2025" },
      { id: "TKT-389", subject: "Loyalty points not credited",        status: "Open",     date: "Feb 8, 2026"  },
    ],
    signals: [
      "No purchase in 69 days — longest gap since joining",
      "Last order returned — negative experience signal",
      "3 support tickets in 3 months — friction accumulating",
      "Email open rate dropped 40% since January",
    ],
    recommendedActions: [
      "Send win-back offer: 20% off + free returns on next order",
      "Resolve open loyalty-points ticket before outreach",
      "Flag for customer success review — churn risk high",
    ],
  },

  santos: {
    id: "santos",
    name: "Sofia Santos",
    email: "sofia.santos@icloud.com",
    memberSince: "Feb 2026",
    loyaltyTier: "Silver",
    loyaltyPoints: 380,
    lifetimeValue: "$412",
    totalOrders: 3,
    avgOrderValue: "$137",
    segment: "New",
    lastOrderDate: "Apr 4, 2026",
    orders: [
      { id: "#ORD-9804", date: "Apr 4, 2026",  items: "Floral Midi Dress, Sandals",      total: "$196",  status: "Shipped"    },
      { id: "#ORD-9680", date: "Mar 12, 2026", items: "Linen Co-ord Set",                total: "$148",  status: "Delivered"  },
      { id: "#ORD-9540", date: "Feb 20, 2026", items: "Crossbody Bag",                   total: "$68",   status: "Delivered"  },
    ],
    returns: [],
    supportTickets: [],
    signals: [
      "3 orders in first 7 weeks — strong early adoption",
      "100% email open rate — highly engaged with campaigns",
      "Browsed summer collection × 6 sessions this week",
      "Referred 1 friend via share link last week",
    ],
    recommendedActions: [
      "Enrol in new-customer nurture sequence — upsell summer edit",
      "Send referral incentive — high sharing propensity",
      "Offer Silver → Gold upgrade challenge to deepen retention",
    ],
  },
};
