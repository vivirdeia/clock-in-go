import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { employees } from '@/data/mockData';

export type UserRole = 'admin' | 'employee';
export type PlanType = 'starter' | 'business' | 'enterprise';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  company: string;
  cif?: string;
  role: UserRole;
  plan: PlanType;
  employeeId?: string; // only for employee role
}

interface RegisteredAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
  company: string;
  cif?: string;
  plan: PlanType;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  register: (data: { name: string; email: string; password: string; company: string; cif?: string }) => { success: boolean; error?: string };
  loginAdmin: (email: string, password: string) => { success: boolean; error?: string };
  loginEmployee: (pin: string) => { success: boolean; error?: string; employeeId?: string };
  logout: () => void;
  updatePlan: (plan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'clockin_auth';
const ADMINS_KEY = 'clockin_admins';

// Default admin seeded
const defaultAdmin: RegisteredAdmin = {
  id: 'admin-1',
  name: 'Admin Demo',
  email: 'admin@techcorp.es',
  password: 'admin123',
  company: 'TechCorp SL',
  cif: 'B12345678',
  plan: 'business',
};

function getAdmins(): RegisteredAdmin[] {
  try {
    const stored = localStorage.getItem(ADMINS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = [defaultAdmin];
  localStorage.setItem(ADMINS_KEY, JSON.stringify(initial));
  return initial;
}

function saveAdmins(admins: RegisteredAdmin[]) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const register = (data: { name: string; email: string; password: string; company: string; cif?: string }) => {
    const admins = getAdmins();
    if (admins.find(a => a.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Ya existe una cuenta con este email' };
    }
    const newAdmin: RegisteredAdmin = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      company: data.company,
      cif: data.cif,
      plan: 'starter',
    };
    admins.push(newAdmin);
    saveAdmins(admins);
    const authUser: AuthUser = {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      company: newAdmin.company,
      cif: newAdmin.cif,
      role: 'admin',
      plan: 'starter',
    };
    persistUser(authUser);
    return { success: true };
  };

  const loginAdmin = (email: string, password: string) => {
    const admins = getAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!admin) return { success: false, error: 'Email o contraseña incorrectos' };
    const authUser: AuthUser = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      company: admin.company,
      cif: admin.cif,
      role: 'admin',
      plan: admin.plan,
    };
    persistUser(authUser);
    return { success: true };
  };

  const loginEmployee = (pin: string) => {
    const emp = employees.find(e => e.pin === pin);
    if (!emp) return { success: false, error: 'PIN incorrecto' };
    const authUser: AuthUser = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      company: 'TechCorp SL',
      role: 'employee',
      plan: 'business',
      employeeId: emp.id,
    };
    persistUser(authUser);
    return { success: true, employeeId: emp.id };
  };

  const logout = () => {
    persistUser(null);
    localStorage.removeItem('clockin_employee');
  };

  const updatePlan = (plan: PlanType) => {
    if (!user) return;
    const updated = { ...user, plan };
    persistUser(updated);
    // Also update in admins store
    const admins = getAdmins();
    const idx = admins.findIndex(a => a.id === user.id);
    if (idx >= 0) {
      admins[idx].plan = plan;
      saveAdmins(admins);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, loginAdmin, loginEmployee, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
