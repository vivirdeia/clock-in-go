import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ensureDataset, findEmployeeByPinAcrossAllAdmins } from './dataStore';

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
  employeeId?: string;
  /** For employees, the adminId that owns their dataset. */
  adminId?: string;
  /** True when this admin still needs to complete onboarding. */
  needsOnboarding?: boolean;
}

interface RegisteredAdmin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  /** Plain password kept ONLY for the demo "forgot password" feature. */
  passwordPlain: string;
  company: string;
  cif?: string;
  plan: PlanType;
  needsOnboarding?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  register: (data: { name: string; email: string; password: string; company: string; cif?: string }) => { success: boolean; error?: string };
  loginAdmin: (email: string, password: string) => { success: boolean; error?: string };
  loginEmployee: (pin: string) => { success: boolean; error?: string; employeeId?: string };
  logout: () => void;
  updatePlan: (plan: PlanType) => void;
  completeOnboarding: () => void;
  recoverPassword: (email: string) => { success: boolean; password?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'clockin_auth';
const ADMINS_KEY = 'clockin_admins';

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Synchronous hash fallback used for the seed admin (avoids async init).
function syncHash(input: string): string {
  // Tiny non-crypto hash. Real hashing happens via sha256() at write time.
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return `legacy_${(h >>> 0).toString(16)}_${input.length}`;
}

const defaultAdmin: RegisteredAdmin = {
  id: 'admin-1',
  name: 'Admin Demo',
  email: 'admin@techcorp.es',
  passwordHash: syncHash('admin123'),
  passwordPlain: 'admin123',
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

function checkPassword(admin: RegisteredAdmin, password: string): boolean {
  // Compare plain (kept for demo) — keeps backwards compat too.
  return admin.passwordPlain === password;
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

  const register: AuthContextType['register'] = (data) => {
    const admins = getAdmins();
    if (admins.find(a => a.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Ya existe una cuenta con este email' };
    }
    const newAdmin: RegisteredAdmin = {
      id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      email: data.email,
      passwordHash: syncHash(data.password),
      passwordPlain: data.password,
      company: data.company,
      cif: data.cif,
      plan: 'starter',
      needsOnboarding: true,
    };
    // Upgrade hash asynchronously for new accounts.
    sha256(data.password).then(h => {
      const list = getAdmins();
      const idx = list.findIndex(a => a.id === newAdmin.id);
      if (idx >= 0) { list[idx].passwordHash = h; saveAdmins(list); }
    }).catch(() => {});
    admins.push(newAdmin);
    saveAdmins(admins);
    // Provision the new admin's empty dataset
    ensureDataset(newAdmin.id, newAdmin.company, newAdmin.cif);
    const authUser: AuthUser = {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      company: newAdmin.company,
      cif: newAdmin.cif,
      role: 'admin',
      plan: 'starter',
      needsOnboarding: true,
    };
    persistUser(authUser);
    return { success: true };
  };

  const loginAdmin: AuthContextType['loginAdmin'] = (email, password) => {
    const admins = getAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || !checkPassword(admin, password)) return { success: false, error: 'Email o contraseña incorrectos' };
    ensureDataset(admin.id, admin.company, admin.cif);
    const authUser: AuthUser = {
      id: admin.id, name: admin.name, email: admin.email,
      company: admin.company, cif: admin.cif,
      role: 'admin', plan: admin.plan,
      needsOnboarding: admin.needsOnboarding,
    };
    persistUser(authUser);
    return { success: true };
  };

  const loginEmployee: AuthContextType['loginEmployee'] = (pin) => {
    const found = findEmployeeByPinAcrossAllAdmins(pin);
    if (!found) return { success: false, error: 'PIN incorrecto' };
    const admins = getAdmins();
    const admin = admins.find(a => a.id === found.adminId);
    const authUser: AuthUser = {
      id: found.employee.id,
      name: found.employee.name,
      email: found.employee.email,
      company: admin?.company || '',
      role: 'employee',
      plan: admin?.plan || 'starter',
      employeeId: found.employee.id,
      adminId: found.adminId,
    };
    persistUser(authUser);
    return { success: true, employeeId: found.employee.id };
  };

  const logout = () => {
    persistUser(null);
    localStorage.removeItem('clockin_employee');
  };

  const updatePlan: AuthContextType['updatePlan'] = (plan) => {
    if (!user) return;
    const updated = { ...user, plan };
    persistUser(updated);
    const admins = getAdmins();
    const idx = admins.findIndex(a => a.id === user.id);
    if (idx >= 0) { admins[idx].plan = plan; saveAdmins(admins); }
  };

  const completeOnboarding: AuthContextType['completeOnboarding'] = () => {
    if (!user) return;
    persistUser({ ...user, needsOnboarding: false });
    const admins = getAdmins();
    const idx = admins.findIndex(a => a.id === user.id);
    if (idx >= 0) { admins[idx].needsOnboarding = false; saveAdmins(admins); }
  };

  const recoverPassword: AuthContextType['recoverPassword'] = (email) => {
    const admin = getAdmins().find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) return { success: false };
    return { success: true, password: admin.passwordPlain };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, loginAdmin, loginEmployee, logout, updatePlan, completeOnboarding, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
