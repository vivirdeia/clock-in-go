-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cif text,
  plan text NOT NULL DEFAULT 'starter',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  department_id uuid,
  shift_id uuid,
  pin text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  consent_accepted_at timestamptz,
  needs_onboarding boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profiles_company_idx ON public.profiles(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') AND public.current_company_id() = _company_id;
$$;

CREATE OR REPLACE FUNCTION public.haversine_m(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
  SELECT 6371000 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ DEPARTMENTS ============
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  default_shift_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX departments_company_idx ON public.departments(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- ============ SHIFTS ============
CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_time text NOT NULL DEFAULT '',
  end_time text NOT NULL DEFAULT '',
  break_minutes integer NOT NULL DEFAULT 0,
  late_tolerance_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shifts_company_idx ON public.shifts(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_department_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_shift_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD CONSTRAINT departments_shift_fk FOREIGN KEY (default_shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;

-- ============ WORK ZONES ============
CREATE TABLE public.work_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 100,
  assigned_to text[] NOT NULL DEFAULT ARRAY['all']::text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_zones_company_idx ON public.work_zones(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_zones TO authenticated;
GRANT ALL ON public.work_zones TO service_role;
ALTER TABLE public.work_zones ENABLE ROW LEVEL SECURITY;

-- ============ CHECK INS ============
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entry','exit')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  address text NOT NULL DEFAULT '',
  accuracy integer NOT NULL DEFAULT 0,
  in_zone boolean NOT NULL DEFAULT false,
  zone_id uuid REFERENCES public.work_zones(id) ON DELETE SET NULL,
  device text,
  corrects_id uuid REFERENCES public.check_ins(id) ON DELETE SET NULL,
  edited_by_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX check_ins_company_idx ON public.check_ins(company_id, occurred_at DESC);
CREATE INDEX check_ins_user_idx ON public.check_ins(user_id, occurred_at DESC);
GRANT SELECT, INSERT ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- ============ ALERTS ============
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('out_of_zone','late','absent','overtime')),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','resolved')),
  resolved_note text,
  check_in_id uuid REFERENCES public.check_ins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX alerts_company_idx ON public.alerts(company_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
CREATE POLICY "Members can view their company" ON public.companies FOR SELECT TO authenticated
  USING (id = public.current_company_id());
CREATE POLICY "Admins can update their company" ON public.companies FOR UPDATE TO authenticated
  USING (public.is_company_admin(id)) WITH CHECK (public.is_company_admin(id));

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Admins can view company profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_company_admin(company_id));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can manage company profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_company_admin(company_id)) WITH CHECK (public.is_company_admin(company_id));
CREATE POLICY "Admins can delete company profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_company_admin(company_id) AND id <> auth.uid());

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Members can view company departments" ON public.departments FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
CREATE POLICY "Admins manage company departments" ON public.departments FOR ALL TO authenticated
  USING (public.is_company_admin(company_id)) WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Members can view company shifts" ON public.shifts FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
CREATE POLICY "Admins manage company shifts" ON public.shifts FOR ALL TO authenticated
  USING (public.is_company_admin(company_id)) WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Members can view company zones" ON public.work_zones FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
CREATE POLICY "Admins manage company zones" ON public.work_zones FOR ALL TO authenticated
  USING (public.is_company_admin(company_id)) WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Users can view their own check ins" ON public.check_ins FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can view company check ins" ON public.check_ins FOR SELECT TO authenticated
  USING (public.is_company_admin(company_id));
CREATE POLICY "Users can create their own check ins" ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND company_id = public.current_company_id());
CREATE POLICY "Admins can create company check ins" ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can view company alerts" ON public.alerts FOR SELECT TO authenticated
  USING (public.is_company_admin(company_id));
CREATE POLICY "Members can create company alerts" ON public.alerts FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id());
CREATE POLICY "Admins can update company alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (public.is_company_admin(company_id)) WITH CHECK (public.is_company_admin(company_id));
CREATE POLICY "Admins can delete company alerts" ON public.alerts FOR DELETE TO authenticated
  USING (public.is_company_admin(company_id));

-- ============ UPDATED_AT TRIGGERS ============
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER work_zones_updated_at BEFORE UPDATE ON public.work_zones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NEW USER HANDLER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_role public.app_role := COALESCE(NULLIF(meta->>'role','')::public.app_role, 'admin');
  v_company uuid;
BEGIN
  IF v_role = 'employee' AND NULLIF(meta->>'company_id','') IS NOT NULL THEN
    v_company := (meta->>'company_id')::uuid;
  ELSE
    INSERT INTO public.companies (name, cif)
    VALUES (COALESCE(NULLIF(meta->>'company_name',''), 'Mi empresa'), NULLIF(meta->>'cif',''))
    RETURNING id INTO v_company;

    INSERT INTO public.shifts (company_id, name, start_time, end_time, break_minutes, late_tolerance_minutes) VALUES
      (v_company, 'Mañana', '08:30', '17:00', 30, 5),
      (v_company, 'Tarde', '14:00', '22:00', 30, 5),
      (v_company, 'Flexible', '', '', 0, 0);
  END IF;

  INSERT INTO public.profiles (id, company_id, full_name, email, phone, department_id, shift_id, pin, needs_onboarding)
  VALUES (
    NEW.id,
    v_company,
    COALESCE(NULLIF(meta->>'full_name',''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NULLIF(meta->>'phone',''),
    NULLIF(meta->>'department_id','')::uuid,
    NULLIF(meta->>'shift_id','')::uuid,
    NULLIF(meta->>'pin',''),
    v_role = 'admin'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ GEOFENCING + AUTO ALERT ============
CREATE OR REPLACE FUNCTION public.check_in_apply_geofence()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dept uuid;
  v_zone uuid;
BEGIN
  SELECT department_id INTO v_dept FROM public.profiles WHERE id = NEW.user_id;

  SELECT z.id INTO v_zone
  FROM public.work_zones z
  WHERE z.company_id = NEW.company_id
    AND z.active
    AND ('all' = ANY (z.assigned_to) OR (v_dept IS NOT NULL AND v_dept::text = ANY (z.assigned_to)))
    AND public.haversine_m(NEW.lat, NEW.lng, z.lat, z.lng) <= z.radius_meters
  ORDER BY public.haversine_m(NEW.lat, NEW.lng, z.lat, z.lng) ASC
  LIMIT 1;

  NEW.zone_id := v_zone;
  NEW.in_zone := v_zone IS NOT NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_ins_geofence BEFORE INSERT ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.check_in_apply_geofence();

CREATE OR REPLACE FUNCTION public.check_in_out_of_zone_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text;
  v_nearest_name text;
  v_nearest_dist double precision;
  v_detail text;
BEGIN
  IF NEW.in_zone THEN RETURN NEW; END IF;

  SELECT full_name INTO v_name FROM public.profiles WHERE id = NEW.user_id;

  SELECT z.name, public.haversine_m(NEW.lat, NEW.lng, z.lat, z.lng)
    INTO v_nearest_name, v_nearest_dist
  FROM public.work_zones z
  WHERE z.company_id = NEW.company_id AND z.active
  ORDER BY public.haversine_m(NEW.lat, NEW.lng, z.lat, z.lng) ASC
  LIMIT 1;

  IF v_nearest_name IS NULL THEN
    v_detail := 'sin zonas configuradas';
  ELSIF v_nearest_dist < 1000 THEN
    v_detail := 'a ' || round(v_nearest_dist)::text || 'm de ' || v_nearest_name;
  ELSE
    v_detail := 'a ' || round((v_nearest_dist / 1000)::numeric, 1)::text || 'km de ' || v_nearest_name;
  END IF;

  INSERT INTO public.alerts (company_id, user_id, type, description, check_in_id, created_at)
  VALUES (
    NEW.company_id,
    NEW.user_id,
    'out_of_zone',
    COALESCE(v_name, 'Empleado') || ' fichó ' || CASE WHEN NEW.type = 'entry' THEN 'entrada' ELSE 'salida' END
      || ' fuera de zona — ' || COALESCE(NULLIF(NEW.address, ''), 'ubicación desconocida') || ' (' || v_detail || ')',
    NEW.id,
    NEW.occurred_at
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_ins_out_of_zone_alert AFTER INSERT ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.check_in_out_of_zone_alert();