import { type Client } from "@/data/mockData";

/**
 * Generates a plain-language brief synthesised from Sales Cloud data.
 * Surfaces what matters most — opportunity status, financial position, engagement.
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

    default: {
      return `${opportunity.name} is currently in ${opportunity.stage} at ${opportunity.probability}% probability, closing ${opportunity.closeDate}. Einstein score: ${einsteinScore.score}/100.`;
    }
  }
}
