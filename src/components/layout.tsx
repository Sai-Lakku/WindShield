import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  SplitSquareHorizontal, 
  CreditCard, 
  ListOrdered, 
  Target, 
  CalendarDays, 
  Zap,
  PieChart
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "./ui/sidebar";
import { NotificationBell } from "./NotificationBell";
import { Avatar, AvatarFallback } from "./ui/avatar";

const NAV_ITEMS = [
  {
    title: "OVERVIEW",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "PLANNING",
    items: [
      { title: "Forward Plan", url: "/forward-plan", icon: TrendingUp },
      { title: "Scenarios", url: "/scenarios", icon: SplitSquareHorizontal, badge: "New" },
    ]
  },
  {
    title: "MONEY",
    items: [
      { title: "Cards", url: "/cards", icon: CreditCard },
      { title: "Transactions", url: "/transactions", icon: ListOrdered },
      { title: "Debt Tracker", url: "/debt-tracker", icon: PieChart },
    ]
  },
  {
    title: "PLAN",
    items: [
      { title: "Goals & Trips", url: "/goals-trips", icon: Target },
      { title: "Life Events", url: "/life-events", icon: CalendarDays },
      { title: "Spot Pay", url: "/spot-pay", icon: Zap },
    ]
  }
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-background">
        <Sidebar className="border-r border-white/5 bg-background/50 backdrop-blur-xl">
          <SidebarHeader className="p-4 pt-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Windshield</h2>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Stop looking backwards</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {NAV_ITEMS.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild
                          isActive={location === item.url}
                          tooltip={item.title}
                          className="hover:bg-white/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-white/5 bg-background/40 px-4 backdrop-blur-sm">
            <NotificationBell />
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">WS</AvatarFallback>
            </Avatar>
          </header>
          <div className="flex-1 min-h-0 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
