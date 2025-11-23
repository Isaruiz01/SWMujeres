-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table for admin management
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON public.user_roles FOR SELECT
  USING (true);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create solicitudes (applications) table
CREATE TABLE public.solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_emprendimiento TEXT NOT NULL CHECK (char_length(nombre_emprendimiento) <= 100),
  descripcion TEXT NOT NULL CHECK (char_length(descripcion) <= 300),
  categoria TEXT NOT NULL CHECK (categoria IN ('Moda', 'Belleza', 'Alimentos', 'Servicios', 'Tecnología', 'Artesanías', 'Otros')),
  instagram TEXT,
  whatsapp TEXT,
  sitio_web TEXT,
  logo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solicitudes"
  ON public.solicitudes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create solicitudes"
  ON public.solicitudes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all solicitudes"
  ON public.solicitudes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update solicitudes"
  ON public.solicitudes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create emprendimientos (businesses) table
CREATE TABLE public.emprendimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID REFERENCES public.solicitudes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_emprendimiento TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  instagram TEXT,
  whatsapp TEXT,
  sitio_web TEXT,
  logo_url TEXT NOT NULL,
  publicado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emprendimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published emprendimientos"
  ON public.emprendimientos FOR SELECT
  USING (publicado = true);

CREATE POLICY "Admins can insert emprendimientos"
  ON public.emprendimientos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update emprendimientos"
  ON public.emprendimientos FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete emprendimientos"
  ON public.emprendimientos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Storage policies
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND
    auth.role() = 'authenticated'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_solicitudes_updated_at
  BEFORE UPDATE ON public.solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emprendimientos_updated_at
  BEFORE UPDATE ON public.emprendimientos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();