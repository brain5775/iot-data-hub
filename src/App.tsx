import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "@/components/layout/MainLayout";
import { DeviceProvider } from "@/contexts/DeviceContext";
import Index from "./pages/Index";
import DevicePage from "./pages/Device";
import DeviceDetailPage from "./pages/DeviceDetail";
import HistoryPage from "./pages/History";
import ReportPage from "./pages/Report";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DeviceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/device" element={<DevicePage />} />
                <Route path="/device/:deviceId" element={<DeviceDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </DeviceProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
