import { type Client, type Patient, type RetailCustomer } from "@/data/mockData";

/**
 * Generates a plain-language brief synthesised from Sales Cloud data.
 */
export function generateBrief(client: Client, sourceApp: string): string {
  const { opportunity, einsteinScore, contacts } = client.salesCloud;
  const isFinance = sourceApp === "FinanceOS";
  const decisionMaker = contacts.find(c => c.role === "Decision Maker");

  switch (client.id) {
    case "acme":
      return isFinance
        ? `${opportunity.name} is in ${opportunity.stage} at ${opportunity.probability}% probability — forecast category: ${opportunity.forecastCategory}. $18,000 overdue is tied to the same account and may block renewal closure.`
        : `The renewal opportunity is in ${opportunity.stage} with only ${client.renewalDays} days to close date and probability at ${opportunity.probability}%. ${decisionMaker?.name} is re-engaging but Einstein scores this at ${einsteinScore.score}/100 — exec engagement has been absent for 3 weeks.`;

    case "globex":
      return isFinance
        ? `${opportunity.name} is in ${opportunity.stage} at ${opportunity.probability}% probability — weighted pipeline value is ${opportunity.weightedValue}. Account is fully current with zero AR outstanding.`
        : `An expansion opportunity worth ${opportunity.amount} is in ${opportunity.stage} with ${opportunity.probability}% close probability. ${decisionMaker?.name} is actively engaged — Einstein scores this account at ${einsteinScore.score}/100 and trending up.`;

    case "initech":
      return isFinance
        ? `${opportunity.name} has been in ${opportunity.stage} for ${opportunity.daysInStage} days — forecast category moved to ${opportunity.forecastCategory}. $31,500 overdue across two cycles directly threatens the ${opportunity.amount} renewal.`
        : `This renewal is ${opportunity.daysInStage} days stalled in ${opportunity.stage} with ${client.renewalDays} days left on the contract. ${decisionMaker?.name} hasn't responded in 8 days — Einstein scores this at ${einsteinScore.score}/100 and dropping.`;

    default:
      return `${opportunity.name} is currently in ${opportunity.stage} at ${opportunity.probability}% probability, closing ${opportunity.closeDate}. Einstein score: ${einsteinScore.score}/100.`;
  }
}

/**
 * Generates a customer intelligence brief for the retail / e-commerce view.
 */
export function generateRetailBrief(customer: RetailCustomer): string {
  switch (customer.id) {
    case "caldwell":
      return `Emma is a Platinum-tier VIP with ${customer.totalOrders} orders and ${customer.lifetimeValue} lifetime value. She purchased 3 days ago and is approaching a loyalty reward threshold at ${customer.loyaltyPoints} points. Early-access campaigns convert at 2× her cohort average — highest retention confidence in the segment.`;
    case "park":
      return `Jason hasn't purchased in 69 days — his longest gap since joining. His last order was returned and he has an unresolved support ticket. Email engagement is down 40%. At-risk of churn; a win-back offer with free returns and ticket resolution is the recommended next action.`;
    case "santos":
      return `Sofia is a high-potential new customer — 3 orders in her first 7 weeks with a 100% email open rate. She's actively browsing the summer collection and recently referred a friend. Strong candidate for the Silver → Gold upgrade challenge to accelerate retention.`;
    default: {
      const openTickets = customer.supportTickets.filter(t => t.status === "Open").length;
      return `${customer.name} is a ${customer.loyaltyTier} member with ${customer.lifetimeValue} LTV across ${customer.totalOrders} orders. Last order: ${customer.lastOrderDate}.${openTickets > 0 ? ` ${openTickets} open support ticket(s) require attention.` : ""}`;
    }
  }
}

/**
 * Generates a clinical brief from patient data for the healthcare view.
 */
export function generateHealthcareBrief(patient: Patient): string {
  const criticalLabs = patient.labResults.filter(l => l.status === "critical");
  const abnormalLabs = patient.labResults.filter(l => l.status === "abnormal");

  switch (patient.id) {
    case "osei":
      return `${patient.name} is 6 weeks post left hip arthroplasty with recovery progressing well. Mild post-op anemia (Hgb 11.4) noted at last follow-up — monitor at next visit. DVT prophylaxis with Enoxaparin ends Apr 15. PT is ongoing; next session Apr 21.`;

    case "rivera":
      return `${patient.name} presents with suboptimal diabetes control — HbA1c 8.9%, above the <7% target. BP remains elevated at 148/92. Empagliflozin was added Apr 3 alongside dietary counselling referral. Early CKD (Stage 2, eGFR 68) requires careful monitoring given medication load.`;

    case "park":
      return `${patient.name} was admitted Apr 8 for acute heart failure decompensation — BNP 1,840, EF dropped to 30%. ${criticalLabs.length} critical labs active. IV diuresis ongoing. Palliative care consult scheduled Apr 12. Goals-of-care discussion with family pending discharge planning.`;

    default: {
      const labNote = criticalLabs.length
        ? `${criticalLabs.length} critical lab value(s) require attention.`
        : abnormalLabs.length
        ? `${abnormalLabs.length} abnormal lab result(s) on file.`
        : "All recent labs within normal range.";
      return `${patient.name}, ${patient.age}. Primary: ${patient.primaryDiagnosis}. ${labNote} Last seen ${patient.lastVisit}.`;
    }
  }
}
