import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import WeddingSettingsPage from "@/pages/wedding-settings-page";
import HelpCenterPage from "@/pages/help-center-page";
import TasksPage from "@/pages/tasks-page";
import GuestsPage from "@/pages/guests-page";
import BudgetPage from "@/pages/budget-page";
import VendorsPage from "@/pages/vendors-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Protected routes */}
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/wedding-settings" component={WeddingSettingsPage} />
      <ProtectedRoute path="/help-center" component={HelpCenterPage} />
      <ProtectedRoute path="/tasks" component={() => import("./pages/tasks-page").then(module => ({ default: module.default }))} />
      <ProtectedRoute path="/guests" component={() => import("./pages/guests-page").then(module => ({ default: module.default }))} />
      <ProtectedRoute path="/budget" component={() => import("./pages/budget-page").then(module => ({ default: module.default }))} />
      <ProtectedRoute path="/vendors" component={() => import("./pages/vendors-page").then(module => ({ default: module.default }))} />
      
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
