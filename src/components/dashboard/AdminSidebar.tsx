import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock, LayoutDashboard, ClipboardList, Users, Building2, MapPin, Bell, FileDown, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { alerts } from '@/data/mockData';
import { useAuth } from '@/store/AuthContext';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Fichajes', icon: ClipboardList, path: '/dashboard/records' },
  { title: 'Empleados', icon: Users, path: '/dashboard/employees' },
  { title: 'Departamentos', icon: Building2, path: '/dashboard/departments' },
  { title: 'Zonas GPS', icon: MapPin, path: '/dashboard/zones' },
  { title: 'Alertas', icon: Bell, path: '/dashboard/alerts' },
  { title: 'Reportes', icon: FileDown, path: '/dashboard/reports' },
  { title: 'Configuración', icon: Settings, path: '/dashboard/settings' },
];

export default function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;

  const planLabel = user?.plan ? user.plan.toUpperCase() : 'STARTER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`h-screen sticky top-0 bg-background border-r flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b gap-2">
        <Clock className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="font-bold text-lg">CLOCKIN</span>}
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.company}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const active = item.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative
                ${active ? 'bg-secondary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
              {item.title === 'Alertas' && unreadAlerts > 0 && (
                <span className={`bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center ${collapsed ? 'absolute -top-1 -right-1 w-4 h-4 text-[10px]' : 'ml-auto w-5 h-5'}`}>
                  {unreadAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <Badge variant="default" className="text-xs">{planLabel}</Badge>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 w-full">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 w-full">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Colapsar</span></>}
        </button>
      </div>
    </aside>
  );
}
