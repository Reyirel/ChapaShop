# ChapaShop - Sistema de Negocios Locales

## Funcionalidades Implementadas

### 1. Sistema de Registro Mejorado
- **Tipos de Usuario**: Persona y Negocio
- **Validación de Contraseñas**: Indicador de fortaleza
- **Confirmación de Contraseña**: Validación en tiempo real
- **Botón de Admin (Solo Desarrollo)**: Crea usuario admin automáticamente

### 2. Sistema de Roles
- **Persona**: Puede ver y calificar negocios
- **Negocio**: Puede crear y gestionar negocios
- **Admin**: Aprueba/rechaza negocios y gestiona el sistema

### 3. Dashboard de Negocios
- **Crear Negocios**: Formulario completo con información del negocio
- **Gestión de Negocios**: Ver estado (pendiente/aprobado/rechazado)
- **Estadísticas**: Total, aprobados, pendientes, rating promedio
- **Edición**: Editar información del negocio

### 4. Panel de Administración
- **Revisar Negocios**: Aprobar o rechazar solicitudes
- **Gestión Completa**: Ver todos los negocios del sistema
- **Notas del Admin**: Agregar razones de aprobación/rechazo
- **Estadísticas Generales**: Dashboard completo del sistema

### 5. Sistema de Autenticación Mejorado
- **Context API**: Manejo global del estado de autenticación
- **Redirección Inteligente**: Según el rol del usuario
- **Protección de Rutas**: Solo usuarios autorizados acceden a cada sección

## Configuración de Supabase

### Paso 1: Ejecutar el Schema SQL
Ejecuta el archivo `supabase_schema.sql` en tu consola SQL de Supabase. Esto creará:

- **Tablas**: profiles, businesses, business_hours, products, reviews, change_requests
- **Políticas RLS**: Seguridad a nivel de fila para cada tabla
- **Triggers**: Para actualizar timestamps automáticamente
- **Funciones**: Para crear perfiles automáticamente

### Paso 2: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Paso 3: Habilitar Autenticación por Email
En tu panel de Supabase:
1. Ve a Authentication > Settings
2. Habilita "Enable email confirmations"
3. Configura los templates de email si es necesario

## Rutas del Sistema

### Públicas
- `/` - Página de inicio
- `/login` - Iniciar sesión
- `/register` - Registro de usuarios
- `/negocios` - Lista de negocios aprobados

### Protegidas por Rol
- `/business-dashboard` - Dashboard para usuarios tipo 'business'
- `/admin-panel` - Panel para usuarios tipo 'admin'

## Flujo de Trabajo

### Para Usuarios Tipo Negocio:
1. Se registran seleccionando "Negocio"
2. Acceden a `/business-dashboard`
3. Crean negocios que quedan en estado "pendiente"
4. Esperan aprobación del admin
5. Una vez aprobados, aparecen en la lista pública

### Para Administradores:
1. Acceden a `/admin-panel`
2. Ven todos los negocios pendientes
3. Pueden aprobar/rechazar con notas
4. Gestión completa del sistema

### Para Usuarios Persona:
1. Se registran como "Persona"
2. Pueden ver negocios aprobados
3. Pueden dejar reseñas y calificaciones

## Estructura de Base de Datos

### Tabla `profiles`
- Información básica del usuario
- Rol (person/business/admin)
- Datos de contacto

### Tabla `businesses`
- Información del negocio
- Estado (pending/approved/rejected)
- Datos de contacto y ubicación
- Redes sociales

### Tabla `business_hours`
- Horarios de atención
- Por día de la semana

### Tabla `products`
- Productos/servicios del negocio
- Precios y disponibilidad

### Tabla `reviews`
- Calificaciones y comentarios
- Un usuario puede dejar una reseña por negocio

### Tabla `change_requests`
- Solicitudes de cambios a negocios aprobados
- Requieren aprobación del admin

## Próximos Pasos Sugeridos

1. **Sistema de Productos**: Implementar gestión completa de productos
2. **Horarios de Atención**: Formulario para configurar horarios
3. **Geolocalización**: Integración con Google Maps
4. **Sistema de Reseñas**: Interfaz para que usuarios dejen comentarios
5. **Notificaciones**: Sistema de notificaciones por email
6. **Upload de Imágenes**: Integración con Supabase Storage
7. **Sistema de Búsqueda**: Filtros avanzados para negocios
8. **Chat/Mensajería**: Comunicación entre usuarios y negocios

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## Tecnologías Utilizadas

- **React 18** - Framework frontend
- **Vite** - Herramienta de desarrollo
- **React Router** - Navegación
- **Supabase** - Backend como servicio
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Context API** - Gestión de estado global

## Seguridad Implementada

- **Row Level Security (RLS)** en todas las tablas
- **Políticas específicas** por rol de usuario
- **Validación en frontend y backend**
- **Protección de rutas** por tipo de usuario

## Notas Importantes

- El botón para crear admin solo aparece en modo desarrollo (`import.meta.env.DEV`)
- Las políticas RLS aseguran que cada usuario solo vea sus datos
- Los negocios deben ser aprobados por un admin antes de aparecer públicamente
- El sistema está preparado para escalabilidad y nuevas funcionalidades
