import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Vault from "@/pages/Vault";
import Navigator from "@/pages/Navigator";
import CareTeam from "@/pages/CareTeam";
import DataLogger from "@/pages/DataLogger";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Or a loading spinner
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/vault">
        <ProtectedRoute component={Vault} />
      </Route>

      <Route path="/navigator">
        <ProtectedRoute component={Navigator} />
      </Route>

      <Route path="/care-team">
        <ProtectedRoute component={CareTeam} />
      </Route>

      <Route path="/data-logger">
        <ProtectedRoute component={DataLogger} />
      </Route>

      <Route path="/chat">
        <ProtectedRoute component={Chat} />
      </Route>

      <Route path="/admin">
        <Admin />
      </Route>

      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
