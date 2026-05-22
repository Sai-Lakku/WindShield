import { decisionsRepository, DecisionLog } from "./repository.js";

export const decisionService = {
  async log(userId: string, type: DecisionLog["type"], payload: unknown, idempotencyKey?: string) {
    return decisionsRepository.create(userId, type, payload, idempotencyKey);
  },
  async list(userId: string) {
    return decisionsRepository.list(userId);
  },
};
