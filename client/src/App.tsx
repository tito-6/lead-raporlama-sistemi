import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { FilterProvider } from "@/contexts/filter-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGlobalDataSync } from "@/hooks/use-global-data-sync";
import { GlobalDataProvider } from "@/contexts/global-data-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Component that initializes global data sync inside QueryClientProvider
function AppWithGlobalSync() {
  // Initialize global data synchronization (now inside QueryClientProvider)
  useGlobalDataSync();
  
  return (
    <GlobalDataProvider>
      <AuthProvider>
        <FilterProvider>
          <TooltipProvider>
            <Toaster />
            <ProtectedRoute>
              <Router />
            </ProtectedRoute>
          </TooltipProvider>
        </FilterProvider>
      </AuthProvider>
    </GlobalDataProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithGlobalSync />
    </QueryClientProvider>
  );
}

export default App;
