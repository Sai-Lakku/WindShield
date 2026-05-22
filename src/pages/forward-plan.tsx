import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { Calendar, Info, TrendingUp, AlertCircle } from "lucide-react";

const chartData = [
  { name: 'Apr', income: 5200, expenses: 3800, debt: 800, remaining: 600 },
  { name: 'May', income: 5200, expenses: 3800, debt: 1200, remaining: 200, event: "Tuition" },
  { name: 'Jun', income: 5200, expenses: 3800, debt: 800, remaining: 600 },
  { name: 'Jul', income: 6000, expenses: 3800, debt: 1600, remaining: 600, event: "Bonus" },
  { name: 'Aug', income: 5200, expenses: 3800, debt: 800, remaining: 600 },
  { name: 'Sep', income: 5200, expenses: 3800, debt: 800, remaining: 600 },
];

export default function ForwardPlan() {
  const [view, setView] = useState<"6mo" | "12mo">("6mo");

  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Forward Plan</h1>
            <p className="text-muted-foreground mt-1">Cashflow projection and timeline.</p>
          </div>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
            <button 
              onClick={() => setView("6mo")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${view === "6mo" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              6 Months
            </button>
            <button 
              onClick={() => setView("12mo")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${view === "12mo" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              12 Months
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Income vs Expenses vs Debt</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="expenses" fill="rgba(255,255,255,0.1)" radius={[0, 0, 0, 0]} stackId="b" />
                  <Bar dataKey="debt" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} stackId="b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-muted-foreground">Income</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/10"></div><span className="text-muted-foreground">Fixed Expenses</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div><span className="text-muted-foreground">Debt Payoff</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {chartData.filter(d => d.event).map((d, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-colors">
                    <div className="bg-primary/20 text-primary p-2.5 rounded-xl h-fit"><Calendar className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-white group-hover:text-primary transition-colors">{d.event}</p>
                      <p className="text-sm text-muted-foreground">{d.name} 2026</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-white/10">Add Life Event</Button>
            </div>

            <div className="bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Breathing Room</h3>
              <p className="text-muted-foreground text-sm mb-4">Your average left-over cash each month.</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">$566</span>
                <span className="text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12% vs last</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                <Info className="w-3 h-3" /> Safe to increase debt payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
