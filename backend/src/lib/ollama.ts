import { env } from "../config/env.js";

interface OllamaGenerateResponse {
  response: string;
}

const CATEGORY_SET = [
  "income",
  "housing",
  "transport",
  "groceries",
  "dining",
  "subscription",
  "education",
  "health",
  "entertainment",
  "shopping",
  "utilities",
  "other",
] as const;

export const ollamaClient = {
  // Classifies one statement line item using a local Ollama model.
  async classifyTransaction(description: string): Promise<string | null> {
    try {
      const prompt =
        `Classify this financial transaction into one category.\n` +
        `Allowed categories: ${CATEGORY_SET.join(", ")}.\n` +
        `Return only one category word.\n` +
        `Transaction: "${description}"`;

      const response = await fetch(`${env.ollamaBaseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: env.ollamaModel,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) return null;
      const payload = (await response.json()) as OllamaGenerateResponse;
      const result = payload.response.trim().toLowerCase();
      return CATEGORY_SET.includes(result as (typeof CATEGORY_SET)[number]) ? result : null;
    } catch {
      return null;
    }
  },
};
