import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Upload, ChevronRight, TrendingUp, TrendingDown, Target, AlertCircle, Calendar, Zap, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CreditCardDisplay } from "@/components/credit-card-display";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const chartData = [
  { name: 'Apr', value: 5840 },
  { name: 'May', value: 5120, highlight: true },
  { name: 'Jun', value: 4300 },
  { name: 'Jul', value: 3400 },
  { name: 'Aug', value: 2200 },
  { name: 'Sep', value: 1100 },
];

export default function Dashboard() {
  const { cards } = useStore();
  
  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Good morning, Jordan <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10"><Upload className="w-4 h-4 mr-2" /> Upload statement</Button>
            </div>
          </header>

          {/* Banner */}
          <div className="bg-card/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className={`h-1.5 w-6 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-white/10'}`} />)}
              </div>
              <p className="text-sm font-medium text-white">Your plan is 60% complete — Add your credit cards to unlock the debt timeline and card recommender.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              <Link href="/cards">Add cards <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          {/* Hero Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-card/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <TrendingUp className="w-24 h-24 text-emerald-500" />
              </div>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs mb-2">Total Debt</p>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-5xl font-black text-white tracking-tighter">$5,840</h2>
                <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full text-sm inline-flex items-center gap-1 whitespace-nowrap">
                  <TrendingDown className="w-3.5 h-3.5" /> $220 this month
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold border border-primary/30">
                <Target className="w-4 h-4" /> Debt-free Aug 14, 2026
              </div>
            </div>

            {/* 4-up Stats */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Monthly breathing room</p>
                <p className="text-2xl font-bold text-white">$640 <span className="text-sm font-normal text-muted-foreground">after expenses</span></p>
              </div>
              <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Interest this month</p>
                <p className="text-2xl font-bold text-rose-400">$94 <span className="text-sm font-normal text-muted-foreground">highest Card B</span></p>
              </div>
              <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Next payment due</p>
                <p className="text-2xl font-bold text-amber-400">May 23 <span className="text-sm font-normal text-muted-foreground">Chase $140</span></p>
              </div>
              <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Chicago trip fund</p>
                <div>
                  <p className="text-2xl font-bold text-white mb-1">$185 <span className="text-sm font-normal text-muted-foreground">/ $400</span></p>
                  <Progress value={46} className="h-1.5 bg-white/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Forward Plan Chart */}
            <div className="bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Forward Plan</h3>
                <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                  <button className="px-3 py-1 text-xs font-medium bg-white/10 text-white rounded-full">6 mo</button>
                  <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-white rounded-full">12 mo</button>
                  <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-white rounded-full">Paychecks</button>
                </div>
              </div>
              
              <div className="h-[200px] w-full mb-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.highlight ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3 mt-auto">
                <div className="bg-primary/20 p-2 rounded-lg text-primary mt-0.5"><Calendar className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-white">Tuition due — $2,450 on Card B</p>
                  <p className="text-xs text-muted-foreground mt-0.5">May 15th · Your plan accounts for this spike.</p>
                </div>
              </div>
            </div>

            {/* Debt Breakdown & Recs */}
            <div className="flex flex-col gap-6">
              
              <div className="bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Debt Breakdown</h3>
                  <Button variant="link" className="text-xs text-primary h-auto p-0">Edit strategy <ArrowRight className="w-3 h-3 ml-1" /></Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-white">Chase Sapphire <span className="text-muted-foreground ml-1">24.9%</span></span><span className="font-medium">$2,140</span></div>
                    <Progress value={36} className="h-2 bg-white/5 [&>div]:bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-white">Capital One <span className="text-muted-foreground ml-1">29.9%</span></span><span className="font-medium">$3,200</span></div>
                    <Progress value={55} className="h-2 bg-white/5 [&>div]:bg-red-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-white">Discover Student <span className="text-muted-foreground ml-1">18.2%</span></span><span className="font-medium">$500</span></div>
                    <Progress value={9} className="h-2 bg-white/5 [&>div]:bg-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm flex-1">
                <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                    <div className="bg-red-500/20 text-red-400 p-2 rounded-full h-fit"><AlertCircle className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Pay Capital One first</p>
                      <p className="text-xs text-muted-foreground">Highest interest rate at 29.9%.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                    <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full h-fit"><Calendar className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Chase closes in 7 days</p>
                      <p className="text-xs text-muted-foreground">Keep balance low to help credit score.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                    <div className="bg-green-500/20 text-green-400 p-2 rounded-full h-fit"><Zap className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Tax refund incoming</p>
                      <p className="text-xs text-muted-foreground">Apply $800 to Capital One to save $120.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Right Sidebar (Sticky) */}
      <div className="hidden xl:flex flex-col w-96 border-l border-white/5 bg-black/20 backdrop-blur-2xl p-6 space-y-8 overflow-y-auto">
        
        {/* Your Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Your Cards</h3>
            <Link href="/cards" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center">Manage <ArrowRight className="w-3 h-3 ml-1" /></Link>
          </div>
          
          <WalletStack cards={cards.slice(0, 3)} />
        </div>

        {/* Weekly Check-in Chat */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Weekly Check-in</h3>
            <button className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center">SMS settings <ArrowRight className="w-3 h-3 ml-1" /></button>
          </div>
          
          <div className="flex-1 bg-card/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 text-sm font-medium">
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-primary/20 mt-1">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px]">W</AvatarFallback>
              </Avatar>
              <div className="bg-white/10 text-white p-3 rounded-2xl rounded-tl-sm max-w-[85%] leading-snug">
                Hey Jordan, payday was today. Expected $1,240. Did it land? Reply YES or send the actual amount.
              </div>
            </div>
            <div className="text-center text-[10px] text-muted-foreground/50 my-1">Today 9:41 AM</div>
            
            <div className="flex gap-2 justify-end">
              <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                yes
              </div>
            </div>
            
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-primary/20 mt-1">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px]">W</AvatarFallback>
              </Avatar>
              <div className="bg-white/10 text-white p-3 rounded-2xl rounded-tl-sm max-w-[85%] leading-snug">
                Got it. Plan updated ✓<br/><br/>You have $640 breathing room this month. Capital One payment due in 3 days — $140 min.
              </div>
            </div>
            
            <div className="mt-auto relative">
              <div className="bg-black/50 border border-white/10 rounded-full py-2 px-4 text-muted-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4 opacity-50" />
                <span className="text-xs">Reply to Windshield...</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function WalletStack({ cards }: { cards: ReturnType<typeof useStore>["cards"] }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const COLLAPSED = 56;
  const FANNED = 220;
  const CARD_H = 200;
  const n = cards.length;

  const handleEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 250);
  };
  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  const height = open
    ? (n - 1) * FANNED + CARD_H
    : (n - 1) * COLLAPSED + CARD_H;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        height: `${height}px`,
        transition: "height 600ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="absolute inset-x-0"
          style={{
            top: `${i * (open ? FANNED : COLLAPSED)}px`,
            zIndex: i + 1,
            transition: "top 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1)",
            transform: open ? "scale(1)" : `scale(${1 - i * 0.02})`,
            filter: open ? "none" : i > 0 ? `brightness(${1 - i * 0.08})` : "none",
          }}
        >
          <CreditCardDisplay card={card} />
        </div>
      ))}
    </div>
  );
}

