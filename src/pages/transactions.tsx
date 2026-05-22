import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShoppingBag, Coffee, Home, Zap, Car } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_TRANSACTIONS = [
  { id: 1, merchant: "Whole Foods Market", category: "Groceries", amount: 142.50, date: "May 12, 2026", cardId: "1", icon: ShoppingBag },
  { id: 2, merchant: "Starbucks", category: "Coffee", amount: 6.45, date: "May 12, 2026", cardId: "1", icon: Coffee },
  { id: 3, merchant: "Netflix", category: "Entertainment", amount: 15.99, date: "May 11, 2026", cardId: "2", icon: Zap },
  { id: 4, merchant: "Chevron", category: "Gas", amount: 45.00, date: "May 10, 2026", cardId: "2", icon: Car },
  { id: 5, merchant: "Target", category: "Shopping", amount: 89.99, date: "May 09, 2026", cardId: "1", icon: ShoppingBag },
  { id: 6, merchant: "Con Edison", category: "Utilities", amount: 112.30, date: "May 08, 2026", cardId: "3", icon: Home },
  { id: 7, merchant: "Uber", category: "Transit", amount: 24.50, date: "May 08, 2026", cardId: "1", icon: Car },
];

export default function Transactions() {
  const { cards } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTx = MOCK_TRANSACTIONS.filter(tx => 
    tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
            <p className="text-muted-foreground mt-1">Review activity across all your cards.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search merchants..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card/20 border-white/10"
              />
            </div>
            <Button variant="outline" size="icon" className="border-white/10 bg-white/5"><Filter className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="bg-card/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-5 sm:col-span-4 pl-2">Merchant</div>
            <div className="col-span-3 hidden sm:block">Date</div>
            <div className="col-span-3 hidden md:block">Card</div>
            <div className="col-span-4 sm:col-span-2 text-right pr-2">Amount</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {filteredTx.length > 0 ? filteredTx.map((tx) => {
              const card = cards.find(c => c.id === tx.cardId) || cards[0];
              const Icon = tx.icon;
              return (
                <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="col-span-7 sm:col-span-4 flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.merchant}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{tx.date}</p>
                    </div>
                  </div>
                  <div className="col-span-3 hidden sm:block text-sm text-muted-foreground">{tx.date}</div>
                  <div className="col-span-3 hidden md:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                    <span className="text-sm text-white/80">{card?.nickname}</span>
                  </div>
                  <div className="col-span-5 sm:col-span-2 text-right pr-2">
                    <span className="font-medium text-white">${tx.amount.toFixed(2)}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center text-muted-foreground">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
