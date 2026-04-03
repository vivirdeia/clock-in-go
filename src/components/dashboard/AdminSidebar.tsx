import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, Building2, MapPin, Bell, FileDown, Settings, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import LogoIcon from '@/components/LogoIcon';
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

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;

  const planLabel = user?.plan ? user.plan.toUpperCase() : 'STARTER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b gap-2">
        <LogoIcon className="w-5 h-5 flex-shrink-0" />
        {(!collapsed || mobileOpen) && <span className="font-bold text-lg">CLOCKIN</span>}
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto md:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      {(!collapsed || mobileOpen) && user && (
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
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative
                ${active ? 'bg-secondary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>{item.title}</span>}
              {item.title === 'Alertas' && unreadAlerts > 0 && (
                <span className={`bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center ${collapsed && !mobileOpen ? 'absolute -top-1 -right-1 w-4 h-4 text-[10px]' : 'ml-auto w-5 h-5'}`}>
                  {unreadAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-2">
        {(!collapsed || mobileOpen) && (
          <div className="px-3 py-2">
            <Badge variant="default" className="text-xs">{planLabel}</Badge>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 w-full">
          <LogOut className="w-4 h-4" />
          {(!collapsed || mobileOpen) && <span>Cerrar sesión</span>}
        </button>
        <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 w-full">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Colapsar</span></>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex h-screen sticky top-0 bg-background border-r flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background border-r flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
