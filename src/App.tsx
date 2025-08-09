
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import AppRoutes from "./AppRoutes";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { Suspense } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();
  return <AppRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<div className="container-custom py-10 text-sm text-muted-foreground">Ładowanie...</div>}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
