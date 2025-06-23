import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import KenoGame from "@/pages/keno";
import AdminDashboard from "@/pages/admin";
import BettingCalculator from "@/pages/betting-calculator";
import WalletPage from "@/pages/wallet";
import PayoutAdmin from "@/pages/payout-admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={KenoGame} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/betting" component={BettingCalculator} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/payout-admin" component={PayoutAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
