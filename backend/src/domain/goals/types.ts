export type GoalType = "trip" | "large-purchase" | "emergency-fund" | "debt-milestone";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetDate: string;
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
}

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetDate: string;
  targetAmount: number;
  savedAmount?: number;
}
