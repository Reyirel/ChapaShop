-- Script simplificado para corregir permisos de businesses
-- Ejecutar paso a paso en el SQL Editor de Supabase

-- PASO 1: Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "Business users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can do everything on businesses" ON businesses;
DROP POLICY IF EXISTS "Everyone can view approved businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can delete businesses" ON businesses;

-- PASO 2: Crear funciones auxiliares
CREATE OR REPLACE FUNCTION can_manage_business()
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
    
    RETURN COALESCE(user_role, '') IN ('business', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- PASO 3: Crear nuevas políticas para businesses
CREATE POLICY "Everyone can view approved businesses" ON businesses
    FOR SELECT USING (
        status = 'approved' OR 
        owner_id = auth.uid() OR 
        is_admin_user()
    );

CREATE POLICY "Business users can create businesses" ON businesses
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        owner_id = auth.uid() AND 
        can_manage_business()
    );

CREATE POLICY "Owners can update their businesses" ON businesses
    FOR UPDATE USING (
        owner_id = auth.uid() OR 
        is_admin_user()
    );

CREATE POLICY "Admins can delete businesses" ON businesses
    FOR DELETE USING (is_admin_user());

-- PASO 4: Habilitar RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
