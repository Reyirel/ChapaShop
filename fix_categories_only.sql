-- SCRIPT ESPECÍFICO PARA ARREGLAR EL PROBLEMA DE CATEGORÍAS
-- Ejecuta este script si las categorías no aparecen en el selector

-- Verificar el estado actual de business_categories
SELECT 'DIAGNÓSTICO CATEGORÍAS' as info;
SELECT COUNT(*) as total_categorias FROM business_categories;
SELECT COUNT(*) as categorias_activas FROM business_categories WHERE is_active = true;

-- Verificar políticas actuales
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'business_categories';

-- Limpiar todas las políticas de categorías
DROP POLICY IF EXISTS "Todos pueden ver categorías activas" ON business_categories;
DROP POLICY IF EXISTS "Everyone can view categories" ON business_categories;
DROP POLICY IF EXISTS "Admins pueden gestionar categorías" ON business_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON business_categories;
DROP POLICY IF EXISTS "public_can_view_active_categories" ON business_categories;
DROP POLICY IF EXISTS "admins_can_manage_categories" ON business_categories;

-- Crear política simple y funcional
CREATE POLICY "allow_public_read_categories" ON business_categories
    FOR SELECT USING (true); -- Permitir a todos leer categorías

-- También permitir a admins gestionar
CREATE POLICY "allow_admin_manage_categories" ON business_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Asegurar RLS habilitado
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- Grant explícito
GRANT SELECT ON business_categories TO authenticated;
GRANT SELECT ON business_categories TO anon;

-- Verificar que hay categorías
SELECT 'CATEGORÍAS DISPONIBLES:' as info;
SELECT id, name, is_active FROM business_categories ORDER BY name;

SELECT 'Problema de categorías solucionado. Ahora deberían aparecer en el selector.' as resultado;
