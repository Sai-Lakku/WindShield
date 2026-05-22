import { CreateGoalInput } from "./types.js";
import { goalsRepository } from "./repository.js";

export const goalService = {
  async create(userId: string, input: CreateGoalInput, idempotencyKey?: string) {
    return goalsRepository.create(userId, input, idempotencyKey);
  },
  async list(userId: string) {
    return goalsRepository.list(userId);
  },
  async update(userId: string, goalId: string, patch: Partial<CreateGoalInput>) {
    return goalsRepository.update(userId, goalId, patch);
  },
};
