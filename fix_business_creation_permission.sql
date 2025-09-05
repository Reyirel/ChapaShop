-- DIAGNÓSTICO Y SOLUCIÓN PARA PERMISOS DE CREACIÓN DE NEGOCIOS
-- Este script diagnostica y corrige el problema "permission denied for table businesses"

-- PASO 1: DIAGNÓSTICO
-- Verificar el estado actual de las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses';

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'businesses';

-- PASO 2: LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Everyone can view approved businesses" ON businesses;
DROP POLICY IF EXISTS "Business users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can delete businesses" ON businesses;

-- PASO 3: RECREAR FUNCIONES AUXILIARES (por si acaso)
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
    
    -- Permitir tanto 'business' como 'person' para crear negocios
    -- Un usuario 'person' puede crear un negocio y esto lo convertirá en empresario
    RETURN COALESCE(user_role, '') IN ('business', 'admin', 'person');
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

-- PASO 4: CREAR POLÍTICAS NUEVAS Y MEJORADAS
-- Política para SELECT (ver negocios)
CREATE POLICY "users_can_view_businesses" ON businesses
    FOR SELECT USING (
        status = 'approved' OR 
        owner_id = auth.uid() OR 
        is_admin_user()
    );

-- Política para INSERT (crear negocios) - MÁS PERMISIVA
CREATE POLICY "authenticated_users_can_create_businesses" ON businesses
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        owner_id = auth.uid()
    );

-- Política para UPDATE (actualizar negocios)
CREATE POLICY "owners_can_update_businesses" ON businesses
    FOR UPDATE USING (
        owner_id = auth.uid() OR 
        is_admin_user()
    );

-- Política para DELETE (eliminar negocios)
CREATE POLICY "admins_can_delete_businesses" ON businesses
    FOR DELETE USING (is_admin_user());

-- PASO 5: ASEGURAR QUE RLS ESTÉ HABILITADO
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- PASO 6: CREAR TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE EL ROL A 'business'
-- Cuando alguien crea un negocio, automáticamente se convierte en empresario
CREATE OR REPLACE FUNCTION update_user_role_to_business()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el rol del usuario a 'business' cuando crea su primer negocio
    UPDATE profiles 
    SET 
        role = 'business',
        updated_at = NOW()
    WHERE 
        id = NEW.owner_id 
        AND role = 'person'; -- Solo actualizar si actualmente es 'person'
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS update_role_on_business_creation ON businesses;
CREATE TRIGGER update_role_on_business_creation
    AFTER INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_role_to_business();

-- PASO 7: VERIFICACIÓN FINAL
-- Mostrar las políticas creadas
SELECT 'Políticas creadas:' as status;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'businesses';

-- Mostrar el estado de RLS
SELECT 'Estado de RLS:' as status;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'businesses';

-- PASO 8: GRANT ADICIONALES PARA ASEGURAR PERMISOS
-- Asegurar que los usuarios autenticados tengan permisos básicos
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON business_categories TO authenticated;

-- PASO 9: ARREGLAR POLÍTICAS DE BUSINESS_CATEGORIES
-- Limpiar políticas existentes de categorías
DROP POLICY IF EXISTS "Todos pueden ver categorías activas" ON business_categories;
DROP POLICY IF EXISTS "Everyone can view categories" ON business_categories;
DROP POLICY IF EXISTS "Admins pueden gestionar categorías" ON business_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON business_categories;

-- Crear política simple para categorías (acceso público para lectura)
CREATE POLICY "public_can_view_active_categories" ON business_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "admins_can_manage_categories" ON business_categories
    FOR ALL USING (is_admin_user());

-- Asegurar que RLS esté habilitado en categorías
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- Mensaje final
SELECT 'Corrección completada. Los usuarios autenticados ahora pueden crear negocios y ver categorías.' as resultado;
