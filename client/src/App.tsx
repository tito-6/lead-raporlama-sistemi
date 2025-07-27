import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import ChatDrawer from "@/components/ChatDrawer";
import { FilterProvider } from "@/contexts/filter-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatDrawer />
        </TooltipProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}

export default App;
