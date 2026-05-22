import { ollamaClient } from "../../lib/ollama.js";
import { openaiClient } from "../../lib/openai.js";
import { env } from "../../config/env.js";

export const aiService = {
  // Complex financial reasoning and user-facing recommendation language.
  async analyzeDecision(input: {
    purchaseAmount: number;
    cardOptions: Array<{ nickname: string; apr: number; projectedUtilization: number }>;
    context: string;
  }): Promise<string> {
    if (!openaiClient) {
      return "Decision insight unavailable (OpenAI not configured).";
    }

    const response = await openaiClient.responses.create({
      model: env.openaiModel,
      input: [
        {
          role: "system",
          content:
            "You are a financial assistant. Give one concise recommendation with tradeoffs, no legal advice, no fluff.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      max_output_tokens: 220,
    });

    return response.output_text?.trim() || "No additional decision insight generated.";
  },

  // Lightweight local extraction for quick card-related parsing from text.
  async extractCardDataFromStatement(statementText: string): Promise<Record<string, unknown>> {
    const category = await ollamaClient.classifyTransaction(statementText.slice(0, 120));
    return {
      probableCategory: category ?? "other",
      sample: statementText.slice(0, 140),
    };
  },
};
