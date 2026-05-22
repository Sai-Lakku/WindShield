import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Lightbulb, TrendingDown, Clock } from "lucide-react";

export default function Scenarios() {
  const { cards } = useStore();
  const [extraPayment, setExtraPayment] = useState([200]);
  
  const totalDebt = cards.reduce((acc, c) => acc + c.balance, 0);
  
  // Fake calculation
  const currentMonths = Math.ceil(totalDebt / 300); 
  const newMonths = Math.ceil(totalDebt / (300 + extraPayment[0]));
  const monthsSaved = currentMonths - newMonths;
  const interestSaved = monthsSaved * 45; // arbitrary fake math

  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Scenarios</h1>
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">New</span>
          </div>
          <p className="text-muted-foreground mt-1">See how small changes impact your debt timeline.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-card/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-6">What if I pay extra each month?</h3>
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-muted-foreground">Extra payment</span>
                  <span className="text-3xl font-bold text-white">${extraPayment[0]}</span>
                </div>
                <Slider 
                  value={extraPayment} 
                  onValueChange={setExtraPayment} 
                  max={1000} 
                  step={50}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>$0</span>
                  <span>$1,000</span>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target strategy</span>
                  <span className="text-white font-medium">Avalanche (Highest APR)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target card</span>
                  <span className="text-primary font-medium">Capital One</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6">
              <div className="flex gap-4">
                <div className="bg-primary/20 p-3 rounded-xl h-fit text-primary"><Lightbulb className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Smart Tip</h4>
                  <p className="text-sm text-primary/80 mb-4">Applying this $200 specifically to Capital One yields the highest return because of its 29.9% APR.</p>
                  <Button variant="secondary" className="w-full bg-primary text-white hover:bg-primary/90">Apply to Plan</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-xl font-semibold text-white mb-8">Your New Reality</h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-medium">Time Saved</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-white">{monthsSaved} <span className="text-2xl text-muted-foreground font-normal">months</span></span>
                </div>
                <p className="text-sm text-emerald-400 mt-2">Debt free by {newMonths} months from now.</p>
              </div>
              
              <div className="h-px w-full bg-white/5"></div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-medium">Interest Saved</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-white">${interestSaved}</span>
                </div>
                <p className="text-sm text-emerald-400 mt-2">Money staying in your pocket.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
