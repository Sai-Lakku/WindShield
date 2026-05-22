import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Calendar, ArrowRight, Zap, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const avalancheData = [
  { month: 'Apr', balance: 5840 },
  { month: 'May', balance: 5120 },
  { month: 'Jun', balance: 4300 },
  { month: 'Jul', balance: 3400 },
  { month: 'Aug', balance: 2200 },
  { month: 'Sep', balance: 1100 },
  { month: 'Oct', balance: 0 },
];

const snowballData = [
  { month: 'Apr', balance: 5840 },
  { month: 'May', balance: 5200 },
  { month: 'Jun', balance: 4500 },
  { month: 'Jul', balance: 3600 },
  { month: 'Aug', balance: 2400 },
  { month: 'Sep', balance: 1400 },
  { month: 'Oct', balance: 300 },
  { month: 'Nov', balance: 0 },
];

export default function DebtTracker() {
  const { cards } = useStore();
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  
  const totalDebt = cards.reduce((acc, c) => acc + c.balance, 0);
  const data = strategy === "avalanche" ? avalancheData : snowballData;

  // Sort cards based on strategy
  const sortedCards = [...cards].sort((a, b) => {
    if (strategy === "avalanche") return b.apr - a.apr; // Highest APR first
    return a.balance - b.balance; // Lowest balance first
  });

  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Debt Tracker</h1>
            <p className="text-muted-foreground mt-1">Visualize your path to zero.</p>
          </div>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
            <button 
              onClick={() => setStrategy("avalanche")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-2 ${strategy === "avalanche" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              <Zap className="w-4 h-4" /> Avalanche
            </button>
            <button 
              onClick={() => setStrategy("snowball")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-2 ${strategy === "snowball" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              <Target className="w-4 h-4" /> Snowball
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white">Projected Payoff</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {strategy === "avalanche" 
                    ? "Saves the most money on interest." 
                    : "Gets quick wins to build momentum."}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Debt Free By</span>
                <span className="text-xl font-bold text-emerald-400">
                  {strategy === "avalanche" ? "Oct 2026" : "Nov 2026"}
                </span>
              </div>
            </div>
            
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  />
                  <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Target Order</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
              {sortedCards.map((card, index) => (
                <div key={card.id} className="relative flex items-center justify-between bg-card/30 border border-white/5 p-4 rounded-2xl backdrop-blur-sm z-10">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center border-4 border-background">
                    {index + 1}
                  </div>
                  <div className="pl-4">
                    <p className="font-medium text-white">{card.nickname}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {strategy === "avalanche" ? `${card.apr}% APR` : `$${card.balance} balance`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium text-white">${card.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
