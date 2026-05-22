import { CreateCardInput } from "./types.js";
import { cardsRepository } from "./repository.js";

export const cardService = {
  async create(userId: string, input: CreateCardInput, idempotencyKey?: string) {
    return cardsRepository.create(userId, input, idempotencyKey);
  },
  async list(userId: string) {
    return cardsRepository.list(userId);
  },
  async update(userId: string, cardId: string, patch: Partial<CreateCardInput>) {
    return cardsRepository.update(userId, cardId, patch);
  },
};
