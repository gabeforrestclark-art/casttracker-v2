import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TripLog from "./pages/TripLog";
import JourneyMap from "./pages/JourneyMap";
import Social from "./pages/Social";
import Sponsors from "./pages/Sponsors";
import Fundraising from "./pages/Fundraising";
import Analytics from "./pages/Analytics";
import ContentCalendar from "./pages/ContentCalendar";
import MediaCampaign from "./pages/MediaCampaign";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/trips" component={TripLog} />
        <Route path="/map" component={JourneyMap} />
        <Route path="/social" component={Social} />
        <Route path="/sponsors" component={Sponsors} />
        <Route path="/fundraising" component={Fundraising} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/calendar" component={ContentCalendar} />
        <Route path="/campaign" component={MediaCampaign} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
