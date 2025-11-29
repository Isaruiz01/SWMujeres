/*
  # Función para asignar rol de administrador
  
  Esta migración crea:
  - Una función para asignar fácilmente el rol de admin a usuarios
  - Instrucciones para uso desde la consola SQL de Supabase
  
  Para usar esta función después de registrarte:
  1. Regístrate normalmente en la aplicación
  2. Ve a Supabase Dashboard > SQL Editor
  3. Ejecuta: SELECT assign_admin_role('tu-email@ejemplo.com');
*/

-- Función para asignar rol de admin a un usuario por email
CREATE OR REPLACE FUNCTION assign_admin_role(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar el ID del usuario por email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', user_email;
  END IF;
  
  -- Insertar o actualizar el rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'Rol de admin asignado exitosamente a: %', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;