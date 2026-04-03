import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnimatedOutlet from '@/components/AnimatedOutlet';
import { Bell, Search, ChevronRight, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { alerts } from '@/data/mockData';
import { useAuth } from '@/store/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;
  const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-secondary/30 overflow-x-hidden">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-14 md:h-16 bg-background border-b flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-secondary">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-muted-foreground hidden sm:inline">{user?.company || 'TechCorp SL'}</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground hidden sm:inline" />
            <span className="font-medium">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar empleado, departamento..." className="pl-9 w-64 rounded-full bg-secondary border-0 h-9" />
            </div>
            <button className="relative p-2 rounded-full hover:bg-secondary transition-colors" onClick={() => navigate('/dashboard/alerts')}>
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadAlerts}</span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
