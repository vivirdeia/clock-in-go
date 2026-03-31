import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { alerts } from '@/data/mockData';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/records': 'Fichajes',
  '/dashboard/employees': 'Empleados',
  '/dashboard/departments': 'Departamentos',
  '/dashboard/zones': 'Zonas GPS',
  '/dashboard/alerts': 'Alertas',
  '/dashboard/reports': 'Reportes',
  '/dashboard/settings': 'Configuración',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;
  const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-secondary/30">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">TechCorp SL</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar empleado, departamento..." className="pl-9 w-64 rounded-full bg-secondary border-0 h-9" />
            </div>
            <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadAlerts}</span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
