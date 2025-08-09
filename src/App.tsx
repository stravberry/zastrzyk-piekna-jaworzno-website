
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
import { Suspense, useEffect, useState } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();
  return <AppRoutes />;
};

const DeferredMetrics = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) return;
    const enable = () => setEnabled(true);
    const events: Array<keyof WindowEventMap> = ["click", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, enable, { once: true, passive: true } as AddEventListenerOptions));

    const idleHandle: number | undefined = (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(() => setEnabled(true), { timeout: 3000 })
      : window.setTimeout(() => setEnabled(true), 3000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, enable));
      if (idleHandle) window.clearTimeout(idleHandle as number);
    };
  }, [enabled]);

  return enabled ? (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  ) : null;
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
        <DeferredMetrics />
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
