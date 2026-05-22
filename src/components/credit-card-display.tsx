import { CreditCard as CreditCardType } from "../lib/store";
import { cn } from "../lib/utils";
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";

interface CreditCardDisplayProps {
  card: CreditCardType;
  className?: string;
  onClick?: () => void;
}

export function CreditCardDisplay({ card, className, onClick }: CreditCardDisplayProps) {
  const getCardStyle = (issuer: string) => {
    switch (issuer) {
      case "Chase": return "card-chase";
      case "Capital One": return "card-capital-one";
      case "Discover": return "card-discover";
      case "Amex": return "card-amex";
      case "Citi": return "card-citi";
      default: return "card-default";
    }
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "Visa": return <SiVisa className="w-8 h-8 opacity-80" />;
      case "Mastercard": return <SiMastercard className="w-8 h-8 opacity-80" />;
      case "Amex": return <SiAmericanexpress className="w-8 h-8 opacity-80" />;
      case "Discover": return <SiDiscover className="w-8 h-8 opacity-80" />;
      default: return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PRIMARY": return "bg-blue-500/20 text-blue-200 border-blue-500/30";
      case "AT RISK": return "bg-red-500/20 text-red-200 border-red-500/30 animate-pulse";
      case "VIRTUAL": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
      default: return "bg-white/10 text-white/80 border-white/20";
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative rounded-2xl w-full aspect-[1.58] p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl",
        getCardStyle(card.issuer),
        className
      )}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="font-semibold text-lg tracking-wide text-white/90">{card.nickname}</span>
          <span className="text-xs text-white/70 mt-1">{card.issuer}</span>
        </div>
        <div className={cn("text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-md", getStatusBadgeColor(card.status))}>
          {card.status}
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col gap-4">
        {/* Chip */}
        <div className="w-10 h-7 bg-gradient-to-br from-amber-200 to-amber-500 rounded flex items-center justify-center opacity-80">
          <div className="w-6 h-4 border border-amber-800/30 rounded-sm" />
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-xs text-white/60 mb-1">•••• •••• •••• {card.last4}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-medium tracking-tight">${card.balance.toLocaleString()}</span>
              <span className="text-xs text-white/60">/ ${card.limit.toLocaleString()} limit</span>
            </div>
          </div>
          <div>
            {getNetworkIcon(card.network)}
          </div>
        </div>
      </div>
    </div>
  );
}
