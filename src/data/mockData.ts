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
