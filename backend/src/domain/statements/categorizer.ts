import { ollamaClient } from "../../lib/ollama.js";
import { NormalizedTransaction } from "./types.js";

export async function enrichCategoriesWithOllama(
  transactions: NormalizedTransaction[],
): Promise<NormalizedTransaction[]> {
  const enriched: NormalizedTransaction[] = [];

  // Keep this bounded to avoid long upload latency for very large statements.
  const maxClassifications = 150;
  for (let i = 0; i < transactions.length; i += 1) {
    const tx = transactions[i];
    if (i >= maxClassifications) {
      enriched.push(tx);
      continue;
    }

    const category = await ollamaClient.classifyTransaction(tx.description);
    enriched.push(category ? { ...tx, category } : tx);
  }

  return enriched;
}
