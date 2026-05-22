import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function SpotPay() {
  const { cards } = useStore();
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState<string>("");

  const handlePay = () => {
    toast.success(`Payment of $${amount} recorded`, { 
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      description: "Your debt timeline has been updated."
    });
    setAmount("");
    setSelectedCard("");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-background min-h-full">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Spot Pay</h1>
          <p className="text-muted-foreground mt-2">Have extra cash? Drop it on a card instantly.</p>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-6 h-6" />
                <Input 
                  type="number" 
                  className="pl-12 h-16 text-3xl font-bold bg-black/40 border-white/10" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Apply to card</label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger className="h-14 bg-black/40 border-white/10 text-lg">
                  <SelectValue placeholder="Select a card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nickname} •••• {c.last4}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white"
              disabled={!amount || !selectedCard}
              onClick={handlePay}
            >
              Record Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
