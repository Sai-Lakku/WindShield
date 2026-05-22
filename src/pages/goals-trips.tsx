import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plane, Home, Laptop, Plus } from "lucide-react";

const GOALS = [
  { id: 1, title: "Chicago trip", icon: Plane, current: 185, target: 400, color: "bg-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: 2, title: "Emergency Fund", icon: Home, current: 1500, target: 5000, color: "bg-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: 3, title: "New MacBook", icon: Laptop, current: 450, target: 1200, color: "bg-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export default function GoalsTrips() {
  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Goals & Trips</h1>
            <p className="text-muted-foreground mt-1">Save for what matters while paying down debt.</p>
          </div>
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Goal
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id} className={`rounded-3xl p-6 border ${goal.border} ${goal.bg} backdrop-blur-sm relative overflow-hidden group`}>
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${goal.color} text-white flex items-center justify-center shadow-lg shadow-black/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-white/60 bg-black/20 px-2.5 py-1 rounded-full">
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{goal.title}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-white">${goal.current}</span>
                  <span className="text-sm text-muted-foreground">/ ${goal.target}</span>
                </div>
                
                <Progress value={progress} className={`h-2 bg-black/20 [&>div]:${goal.color}`} />
                
                <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 -ml-2">Edit</Button>
                  <Button size="sm" className={goal.color}>Add Funds</Button>
                </div>
              </div>
            );
          })}

          <div className="rounded-3xl p-6 border-2 border-dashed border-white/10 bg-card/10 hover:bg-card/20 transition-colors flex flex-col items-center justify-center min-h-[280px] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/5 text-muted-foreground flex items-center justify-center mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-white">Create a goal</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">Set aside money safely without derailing your debt plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
