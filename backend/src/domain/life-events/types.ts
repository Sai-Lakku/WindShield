export type LifeEventType = "expense" | "goal" | "income-change";

export interface LifeEvent {
  id: string;
  userId: string;
  name: string;
  date: string;
  amount: number;
  type: LifeEventType;
  createdAt: string;
}

export interface CreateLifeEventInput {
  name: string;
  date: string;
  amount: number;
  type: LifeEventType;
}
