import { useState } from 'react';
import AnimatedOutlet from '@/components/AnimatedOutlet';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import Wordmark from '@/components/Wordmark';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-panel overflow-x-hidden">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 bg-background border-b flex items-center justify-between px-4 sticky top-0 z-40">
          <Wordmark size="sm" />
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú" className="w-11 h-11 rounded-full border flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  );
}
