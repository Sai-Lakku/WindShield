import { Button } from "@/components/ui/button";
import { Calendar, Plus, Gift, FileText, GraduationCap } from "lucide-react";

const EVENTS = [
  { id: 1, title: "Tax Refund", date: "April 15, 2026", amount: 1200, type: "income", icon: FileText, applied: true },
  { id: 2, title: "Quarterly Bonus", date: "July 01, 2026", amount: 2500, type: "income", icon: Gift, applied: false },
  { id: 3, title: "Tuition Payment", date: "August 15, 2026", amount: -2450, type: "expense", icon: GraduationCap, applied: true },
];

export default function LifeEvents() {
  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Life Events</h1>
            <p className="text-muted-foreground mt-1">Lumpy income and large expenses.</p>
          </div>
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </header>

        <div className="bg-card/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Timeline impact</h2>
              <p className="text-sm text-muted-foreground">Adding events helps Windshield predict exactly when you'll be debt free.</p>
            </div>
          </div>

          <div className="space-y-4">
            {EVENTS.map((event) => {
              const Icon = event.icon;
              const isIncome = event.type === "income";
              return (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/20 border border-white/5 p-5 rounded-2xl gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                    <div className="text-left sm:text-right">
                      <span className={`font-bold text-xl ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : ''}{event.amount < 0 ? `-$${Math.abs(event.amount)}` : `$${event.amount}`}
                      </span>
                    </div>
                    {event.applied ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        In Plan
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                        Apply to Plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
