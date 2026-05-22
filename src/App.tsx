import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout";
import { StoreProvider } from "./lib/store";
import NotFound from "@/pages/not-found";

import Dashboard from "./pages/dashboard";
import Cards from "./pages/cards";
import ForwardPlan from "./pages/forward-plan";
import Scenarios from "./pages/scenarios";
import Transactions from "./pages/transactions";
import DebtTracker from "./pages/debt-tracker";
import GoalsTrips from "./pages/goals-trips";
import LifeEvents from "./pages/life-events";
import SpotPay from "./pages/spot-pay";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cards" component={Cards} />
        <Route path="/forward-plan" component={ForwardPlan} />
        <Route path="/scenarios" component={Scenarios} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/debt-tracker" component={DebtTracker} />
        <Route path="/goals-trips" component={GoalsTrips} />
        <Route path="/life-events" component={LifeEvents} />
        <Route path="/spot-pay" component={SpotPay} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster theme="dark" />
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
