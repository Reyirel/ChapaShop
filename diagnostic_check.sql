-- SCRIPT DE VERIFICACIÓN RÁPIDA PARA DIAGNOSTICAR EL PROBLEMA
-- Ejecuta este script en el SQL Editor de Supabase para diagnosticar el problema

-- 1. Verificar políticas actuales en businesses
SELECT 
    'POLÍTICAS ACTUALES EN BUSINESSES' as tipo,
    policyname as nombre,
    cmd as comando,
    permissive as permisivo,
    qual as condicion
FROM pg_policies 
WHERE tablename = 'businesses'

UNION ALL

-- 2. Verificar si RLS está habilitado
SELECT 
    'ESTADO RLS' as tipo,
    'businesses' as nombre,
    CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as comando,
    '' as permisivo,
    '' as condicion
FROM pg_tables 
WHERE tablename = 'businesses'

UNION ALL

-- 3. Verificar funciones auxiliares
SELECT 
    'FUNCIONES AUXILIARES' as tipo,
    routine_name as nombre,
    routine_type as comando,
    '' as permisivo,
    '' as condicion
FROM information_schema.routines 
WHERE routine_name IN ('can_manage_business', 'is_admin_user')
    AND routine_schema = 'public';

-- 4. Verificar perfiles de usuarios (solo mostrar algunos campos)
SELECT 
    'PERFILES DE USUARIOS' as info,
    email,
    role,
    created_at::date
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar grants en la tabla businesses
SELECT 
    'PERMISOS EN BUSINESSES' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'businesses' 
    AND table_schema = 'public';
