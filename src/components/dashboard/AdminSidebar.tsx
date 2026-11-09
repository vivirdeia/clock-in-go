import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, Building2, MapPin, Bell, FileDown, Settings, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import LogoIcon from '@/components/LogoIcon';
import Wordmark from '@/components/Wordmark';
import { initials } from '@/components/brand/Avatar';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS } from '@/types';
import { cn } from '@/lib/utils';

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
  const { alerts, employees, settings } = useDataStore();
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;
  const plan = user?.plan ?? 'starter';
  const limit = PLAN_LIMITS[plan].employees;
  const company = settings.companyName || user?.company || 'Mi empresa';

  const handleLogout = () => { logout(); navigate('/'); };

  const content = (mini: boolean) => (
    <>
      <div className="h-[72px] flex items-center px-5 flex-shrink-0">
        {mini ? <LogoIcon className="w-7 h-7 mx-auto" /> : <Wordmark size="sm" />}
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="ml-auto w-10 h-10 rounded-full border flex items-center justify-center md:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!mini && (
        <div className="mx-3 mb-3 p-2 flex items-center gap-3 rounded-2xl">
          <span className="w-10 h-10 rounded-full bg-brand-tint text-brand-ink flex items-center justify-center text-sm font-semibold flex-shrink-0">{initials(company)}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{company}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path);
          const badge = item.path === '/dashboard/alerts' && unreadAlerts > 0;
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} title={mini ? item.title : undefined}
              className={cn('relative flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] font-medium transition-colors',
                mini && 'justify-center',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!mini && <span className="truncate">{item.title}</span>}
              {badge && (
                <span className={cn('rounded-full bg-danger text-danger-foreground text-[11px] font-semibold flex items-center justify-center tabular-nums',
                  mini ? 'absolute top-1 right-1 w-4 h-4 text-[10px]' : 'ml-auto min-w-5 h-5 px-1.5')}>{unreadAlerts}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1 flex-shrink-0">
        {!mini && (
          <div className="rounded-2xl bg-primary text-primary-foreground p-4 mb-2">
            <span className="inline-flex rounded-full bg-brand-tint text-brand-ink text-[11px] font-bold tracking-wide px-2.5 py-0.5">{plan.toUpperCase()}</span>
            <p className="text-[13px] text-subtle mt-2 tabular-nums">{employees.length} de {limit === Infinity ? '∞' : limit} empleados</p>
          </div>
        )}
        <button onClick={handleLogout} title={mini ? 'Cerrar sesión' : undefined}
          className={cn('flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full', mini && 'justify-center')}>
          <LogOut className="w-5 h-5" />{!mini && 'Cerrar sesión'}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={cn('hidden md:flex items-center gap-3 h-11 px-3 rounded-xl text-sm text-muted-foreground hover:bg-secondary w-full', mini && 'justify-center')}>
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" />Colapsar</>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className={cn('hidden md:flex h-screen sticky top-0 bg-background border-r flex-col transition-[width] duration-300 motion-reduce:transition-none', collapsed ? 'w-[76px]' : 'w-[248px]')}>
        {content(collapsed)}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/45" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-background flex flex-col animate-in slide-in-from-left duration-200 motion-reduce:animate-none">
            {content(false)}
          </aside>
        </div>
      )}
    </>
  );
}
