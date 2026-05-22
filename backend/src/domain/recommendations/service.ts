import { cardsRepository } from "../cards/repository.js";
import { planEngine } from "../shared/plan-engine.js";
import { aiService } from "../ai/service.js";

interface RecommendationInput {
  userId: string;
  amount: number;
  merchant?: string;
}

function categoryFromMerchant(merchant?: string): string {
  const text = (merchant ?? "").toLowerCase();
  if (/(grocery|market|whole foods|kroger)/.test(text)) return "groceries";
  if (/(gas|shell|chevron|exxon)/.test(text)) return "gas";
  if (/(restaurant|cafe|coffee|doordash)/.test(text)) return "dining";
  return "other";
}

function cashbackBoost(category: string, issuer: string): number {
  if (issuer === "Capital One" && category === "dining") return 12;
  if (issuer === "Amex" && category === "groceries") return 12;
  if (issuer === "Chase" && (category === "travel" || category === "dining")) return 10;
  return 3;
}

export const recommendationsService = {
  async recommend(input: RecommendationInput) {
    const [cards, plan] = await Promise.all([
      cardsRepository.list(input.userId),
      planEngine.generatePlan({ userId: input.userId }),
    ]);
    const category = categoryFromMerchant(input.merchant);

    const ranked = cards
      .map((card) => {
        const utilization = ((card.balance + input.amount) / Math.max(card.limit, 1)) * 100;
        const dueSoonPenalty = card.paymentDue <= 5 ? 8 : 0;
        const aprPenalty = card.apr * 0.45;
        const utilizationPenalty = utilization > 60 ? 24 : utilization > 30 ? 12 : 4;
        const payoffConflictPenalty = card.status === "AT RISK" ? 20 : 0;
        const rewards = cashbackBoost(category, card.issuer);
        const score = Number((100 + rewards - aprPenalty - utilizationPenalty - dueSoonPenalty - payoffConflictPenalty).toFixed(2));
        return {
          cardId: card.id,
          nickname: card.nickname,
          issuer: card.issuer,
          apr: card.apr,
          projectedUtilization: Number(utilization.toFixed(2)),
          score,
          reason:
            utilization > 60
              ? "High utilization risk after purchase."
              : aprPenalty > 11
                ? "Higher APR makes this less ideal."
                : "Best timing and utilization profile for this purchase.",
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      recommendation: ranked[0] ?? null,
      alternatives: ranked.slice(1, 3),
      avoid: ranked.filter((item) => item.projectedUtilization > 65).slice(0, 2),
      planContext: {
        debtFreeDate: plan.debtFreeDate,
        monthlyIncome: plan.monthlyIncome,
        monthlyExpenses: plan.monthlyExpenses,
      },
      insight: await aiService.analyzeDecision({
        purchaseAmount: input.amount,
        context: input.merchant ?? "General purchase",
        cardOptions: ranked.slice(0, 3).map((item) => ({
          nickname: item.nickname,
          apr: item.apr,
          projectedUtilization: item.projectedUtilization,
        })),
      }),
    };
  },
};
