import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Clock from "./pages/Clock.tsx";
import DashboardLayout from "./pages/DashboardLayout.tsx";
import DashboardHome from "./pages/dashboard/DashboardHome.tsx";
import ClockRecords from "./pages/dashboard/ClockRecords.tsx";
import EmployeesPage from "./pages/dashboard/EmployeesPage.tsx";
import DepartmentsPage from "./pages/dashboard/DepartmentsPage.tsx";
import GpsZonesPage from "./pages/dashboard/GpsZonesPage.tsx";
import AlertsPage from "./pages/dashboard/AlertsPage.tsx";
import ReportsPage from "./pages/dashboard/ReportsPage.tsx";
import SettingsPage from "./pages/dashboard/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clock" element={<Clock />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="records" element={<ClockRecords />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="zones" element={<GpsZonesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
