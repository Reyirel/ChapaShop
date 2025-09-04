# Reglas de Supabase para ChapaShop (Actualizado con Categorías)

## 📋 Schema de Base de Datos

### 1. Ejecutar el SQL Schema
Ejecuta el archivo `supabase_schema.sql` completo en tu consola SQL de Supabase. Esto incluye:

#### Nuevas Tablas:
- `business_categories` - Categorías de negocios con colores e iconos
- `profiles` - Perfiles de usuario con roles
- `businesses` - Negocios con referencia a categorías
- `business_hours` - Horarios de atención
- `products` - Productos/servicios
- `reviews` - Reseñas y calificaciones
- `change_requests` - Solicitudes de cambios

#### Categorías Predeterminadas:
- **Restaurantes** 🍴 (Restaurantes, cafeterías, comida rápida)
- **Retail** 🏪 (Tiendas, boutiques, supermercados)
- **Servicios** 💼 (Servicios profesionales, consultorías)
- **Belleza** ✨ (Salones de belleza, spas, estética)
- **Tecnología** 💻 (Reparación de equipos, servicios IT)
- **Salud** ❤️ (Clínicas, farmacias, medicina)
- **Educación** 🎓 (Academias, escuelas, cursos)
- **Transporte** 🚗 (Taxis, delivery, logística)
- **Entretenimiento** 🎵 (Cines, parques, eventos)
- **Hogar** 🏠 (Ferretería, decoración, jardinería)
- **Deportes** 🏋️ (Gimnasios, equipos deportivos)
- **Otros** 📦 (Otros servicios no categorizados)

## 🔐 Políticas de Seguridad (RLS)

### Categorías de Negocios
```sql
-- Todos pueden ver categorías activas
CREATE POLICY "Todos pueden ver categorías activas" ON business_categories
    FOR SELECT USING (is_active = true);

-- Solo admins pueden gestionar categorías
CREATE POLICY "Admins pueden gestionar categorías" ON business_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Perfiles de Usuario
```sql
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins pueden ver todos los perfiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Negocios
```sql
-- Todos pueden ver negocios aprobados
CREATE POLICY "Todos pueden ver negocios aprobados" ON businesses
    FOR SELECT USING (status = 'approved');

-- Los propietarios pueden ver sus propios negocios
CREATE POLICY "Propietarios pueden ver sus negocios" ON businesses
    FOR SELECT USING (owner_id = auth.uid());

-- Solo usuarios tipo 'business' pueden crear negocios
CREATE POLICY "Usuarios business pueden crear negocios" ON businesses
    FOR INSERT WITH CHECK (
        owner_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('business', 'admin')
        )
    );

-- Los propietarios pueden editar negocios pendientes
CREATE POLICY "Propietarios pueden actualizar sus negocios pendientes" ON businesses
    FOR UPDATE USING (
        owner_id = auth.uid() AND status = 'pending'
    );

-- Los admins tienen control total
CREATE POLICY "Admins pueden hacer todo con negocios" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## 🔧 Configuración en Supabase Dashboard

### 1. Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 2. Configuración de Autenticación
En Supabase Dashboard > Authentication > Settings:

- ✅ Enable email confirmations
- ✅ Enable secure email change
- ✅ Enable manual linking of identities
- 🔄 Configure email templates (opcional)

### 3. Configuración de Políticas RLS
En Supabase Dashboard > Authentication > Policies:

- ✅ Verificar que todas las tablas tengan RLS habilitado
- ✅ Verificar que las políticas están activas
- ✅ Probar las políticas con diferentes usuarios

### 4. Storage (Opcional para imágenes)
Si planeas usar imágenes:
```sql
-- Crear bucket para imágenes de negocios
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- Política para subir imágenes
CREATE POLICY "Usuarios pueden subir imágenes" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'business-images' AND auth.uid() IS NOT NULL);

-- Política para ver imágenes públicas
CREATE POLICY "Imágenes son públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-images');
```

## 🎯 Funcionalidades Implementadas

### Botón de Admin (Solo Desarrollo)
- ✅ Solo aparece cuando `import.meta.env.DEV` es `true`
- ✅ Crea usuario admin con email: `admin@chapashop.com`
- ✅ Password: `Admin123!`
- ✅ Maneja casos donde el usuario ya existe
- ✅ Crea perfil con rol 'admin' automáticamente

### Sistema de Categorías
- ✅ 12 categorías predefinidas con colores únicos
- ✅ Cada negocio debe seleccionar una categoría
- ✅ Los admins pueden gestionar categorías
- ✅ Visualización con colores en dashboard y admin panel

### Roles de Usuario
- **Person**: Puede ver y calificar negocios
- **Business**: Puede crear y gestionar negocios
- **Admin**: Control total del sistema

## 🚀 Flujo de Trabajo Actualizado

### 1. Registro de Usuario Negocio:
1. Selecciona tipo "Negocio" en registro
2. Accede a `/business-dashboard`
3. Crea negocio seleccionando categoría obligatoria
4. Negocio queda en estado "pendiente"
5. Espera aprobación del admin

### 2. Administración:
1. Admin accede a `/admin-panel`
2. Ve negocios pendientes con sus categorías
3. Puede aprobar/rechazar con notas
4. Gestiona todo el sistema

### 3. Usuarios Finales:
1. Ven negocios aprobados con categorías
2. Pueden filtrar por categoría (futuro)
3. Dejan reseñas y calificaciones

## ⚠️ Notas Importantes

### Seguridad:
- Todas las tablas tienen RLS habilitado
- Las políticas previenen acceso no autorizado
- Los triggers mantienen timestamps actualizados

### Desarrollo vs Producción:
- El botón de admin solo aparece en desarrollo
- En producción debes crear el admin manualmente
- Las variables de entorno deben estar configuradas

### Datos de Prueba:
Para crear el admin en producción, ejecuta en SQL Editor:
```sql
-- Primero crear el usuario en Authentication (manualmente)
-- Luego ejecutar:
INSERT INTO profiles (id, email, full_name, role) 
VALUES ('uuid-del-usuario-auth', 'admin@chapashop.com', 'Administrador', 'admin');
```

## 📈 Próximas Mejoras Sugeridas

1. **Filtros por Categoría**: Implementar filtros en la vista pública
2. **Subida de Imágenes**: Integrar Supabase Storage
3. **Geolocalización**: Agregar mapas interactivos
4. **Notificaciones**: Sistema de notificaciones por email
5. **Análisis**: Dashboard de estadísticas avanzadas
6. **API de Categorías**: CRUD completo para categorías

## 🔍 Verificación del Sistema

Para verificar que todo funciona:

1. ✅ Ejecutar el SQL schema
2. ✅ Configurar variables de entorno
3. ✅ Probar registro como "Negocio"
4. ✅ Crear negocio con categoría
5. ✅ Usar botón "Crear Admin" (desarrollo)
6. ✅ Aprobar negocio desde admin panel
7. ✅ Verificar que aparece en lista pública

¡El sistema está listo para escalar con más funcionalidades!
