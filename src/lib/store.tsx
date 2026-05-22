import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CardNetwork = "Visa" | "Mastercard" | "Amex" | "Discover";
export type CardIssuer = "Chase" | "Capital One" | "Amex" | "Discover" | "Citi" | "Other";

export interface CreditCard {
  id: string;
  nickname: string;
  issuer: CardIssuer;
  network: CardNetwork;
  limit: number;
  balance: number;
  apr: number;
  minPayment: number;
  statementClose: number;
  paymentDue: number;
  last4: string;
  status: "PRIMARY" | "AT RISK" | "VIRTUAL" | "ACTIVE";
}

const DEFAULT_CARDS: CreditCard[] = [
  {
    id: "1",
    nickname: "Chase Sapphire",
    issuer: "Chase",
    network: "Visa",
    balance: 2140,
    limit: 8500,
    apr: 25,
    minPayment: 140,
    statementClose: 7,
    paymentDue: 23,
    last4: "4092",
    status: "PRIMARY"
  },
  {
    id: "2",
    nickname: "Capital One Quicksilver",
    issuer: "Capital One",
    network: "Mastercard",
    balance: 3200,
    limit: 5000,
    apr: 29.9,
    minPayment: 110,
    statementClose: 15,
    paymentDue: 2,
    last4: "8812",
    status: "AT RISK"
  },
  {
    id: "3",
    nickname: "Discover Student",
    issuer: "Discover",
    network: "Discover",
    balance: 500,
    limit: 2000,
    apr: 18.2,
    minPayment: 35,
    statementClose: 18,
    paymentDue: 5,
    last4: "1190",
    status: "VIRTUAL"
  }
];

interface StoreContextType {
  cards: CreditCard[];
  addCard: (card: Omit<CreditCard, "id" | "last4">) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("windshield.cards");
      if (stored) {
        setCards(JSON.parse(stored));
      } else {
        setCards(DEFAULT_CARDS);
        localStorage.setItem("windshield.cards", JSON.stringify(DEFAULT_CARDS));
      }
    } catch {
      setCards(DEFAULT_CARDS);
      try {
        localStorage.setItem("windshield.cards", JSON.stringify(DEFAULT_CARDS));
      } catch {
        /* private mode / blocked storage */
      }
    }
    setIsLoaded(true);
  }, []);

  const addCard = (card: Omit<CreditCard, "id" | "last4">) => {
    const newCard: CreditCard = {
      ...card,
      id: Math.random().toString(36).substring(7),
      last4: Math.floor(1000 + Math.random() * 9000).toString()
    };
    const updated = [...cards, newCard];
    setCards(updated);
    localStorage.setItem("windshield.cards", JSON.stringify(updated));
  };

  if (!isLoaded) return null;

  return (
    <StoreContext.Provider value={{ cards, addCard }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
