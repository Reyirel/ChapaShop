-- Script para corregir los permisos de la tabla businesses
-- Este script arregla los permisos RLS para permitir que usuarios business puedan crear negocios

-- Primero, eliminamos todas las políticas existentes de la tabla businesses
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'businesses' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON businesses', policy_record.policyname);
    END LOOP;
END $$;

-- Función para verificar si un usuario puede crear negocios
CREATE OR REPLACE FUNCTION can_manage_business()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Verificar si el usuario está autenticado
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- Obtener el rol del usuario
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Permitir a usuarios business y admin
    RETURN COALESCE(user_role, '') IN ('business', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, '') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para la tabla businesses

-- Permitir que todos los usuarios autenticados puedan ver negocios aprobados
CREATE POLICY "Everyone can view approved businesses" ON businesses
    FOR SELECT USING (
        status = 'approved' OR 
        owner_id = auth.uid() OR 
        is_admin_user()
    );

-- Permitir que usuarios business y admin puedan crear negocios
CREATE POLICY "Business users can create businesses" ON businesses
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        owner_id = auth.uid() AND 
        can_manage_business()
    );

-- Permitir que los propietarios puedan actualizar sus propios negocios
CREATE POLICY "Owners can update their businesses" ON businesses
    FOR UPDATE USING (
        owner_id = auth.uid() OR 
        is_admin_user()
    );

-- Permitir que solo los admins puedan eliminar negocios
CREATE POLICY "Admins can delete businesses" ON businesses
    FOR DELETE USING (is_admin_user());

-- Asegurar que RLS esté habilitado
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- También verificar que la tabla profiles tenga las políticas correctas
-- Primero eliminar políticas existentes para evitar conflictos
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
        AND policyname IN ('Users can view all profiles', 'Users can insert own profile', 'Users can update own profile', 'Admins can manage all profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Política para que los usuarios puedan ver todos los perfiles (necesario para las relaciones)
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

-- Asegurar que los usuarios puedan crear su perfil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Asegurar que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir que los admins gestionen todos los perfiles
CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (is_admin_user());

-- Política para business_categories (permitir lectura a todos, escritura solo a admins)
-- Primero eliminar políticas existentes para evitar conflictos
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'business_categories' AND schemaname = 'public'
        AND policyname IN ('Everyone can view categories', 'Admins can manage categories')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON business_categories', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone can view categories" ON business_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON business_categories
    FOR ALL USING (is_admin_user());

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

COMMIT;
