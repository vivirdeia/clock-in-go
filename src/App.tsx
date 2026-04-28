import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { DataStoreProvider } from "@/store/dataStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Clock from "./pages/Clock.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import SelectPlan from "./pages/SelectPlan.tsx";
import Onboarding from "./pages/Onboarding.tsx";
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

/**
 * Wraps the app in a DataStoreProvider scoped to the current admin
 * (or to the admin that owns the logged-in employee). Switches dataset
 * automatically on login/logout.
 */
function ScopedDataStore({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const adminId = user?.role === 'admin' ? user.id : user?.adminId ?? null;
  return (
    <DataStoreProvider adminId={adminId} fallbackCompany={user?.company || ''} fallbackCif={user?.cif}>
      {children}
    </DataStoreProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ScopedDataStore>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/select-plan" element={<SelectPlan />} />
              <Route path="/onboarding" element={<ProtectedRoute role="admin"><Onboarding /></ProtectedRoute>} />
              <Route path="/clock" element={<Clock />} />
              <Route path="/dashboard" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
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
      </ScopedDataStore>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
