export type CardNetwork = "Visa" | "Mastercard" | "Amex" | "Discover";
export type CardIssuer = "Chase" | "Capital One" | "Amex" | "Discover" | "Citi" | "Other";

export interface Card {
  id: string;
  userId: string;
  nickname: string;
  issuer: CardIssuer;
  network: CardNetwork;
  limit: number;
  balance: number;
  apr: number;
  minPayment: number;
  statementClose: number;
  paymentDue: number;
  status: "PRIMARY" | "AT RISK" | "VIRTUAL" | "ACTIVE";
  createdAt: string;
}

export interface CreateCardInput {
  nickname: string;
  issuer: CardIssuer;
  network: CardNetwork;
  limit: number;
  balance: number;
  apr: number;
  minPayment: number;
  statementClose: number;
  paymentDue: number;
  status?: Card["status"];
}
