# Configuración de Supabase para ChapaShop

## Pasos para configurar Supabase:

### 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Haz clic en "New Project"

### 2. Configurar el proyecto
1. Elige una organización (puedes crear una nueva)
2. Nombra tu proyecto: `chapashop` o el nombre que prefieras
3. Crea una contraseña segura para la base de datos
4. Elige la región más cercana a ti
5. Haz clic en "Create new project"

### 3. Obtener las credenciales
1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como: `https://abcdefgh.supabase.co`)
   - **anon public key** (una cadena larga que empieza con `eyJ...`)

### 4. Configurar las variables de entorno
1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de ejemplo:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 5. Crear las tablas necesarias
En el **SQL Editor** de Supabase, ejecuta estos comandos:

```sql
-- Tabla para negocios
CREATE TABLE negocios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  telefono TEXT,
  direccion TEXT,
  horario TEXT,
  imagen TEXT,
  activo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda leer los negocios activos
CREATE POLICY "Negocios públicos legibles" ON negocios
  FOR SELECT USING (activo = true);

-- Política para que los usuarios puedan crear sus propios negocios
CREATE POLICY "Usuarios pueden crear negocios" ON negocios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan editar sus propios negocios
CREATE POLICY "Usuarios pueden editar sus negocios" ON negocios
  FOR UPDATE USING (auth.uid() = user_id);
```

### 6. Configurar autenticación (opcional)
1. Ve a **Authentication** → **Settings**
2. En **Site URL**, agrega: `http://localhost:5173`
3. Para producción, agrega tu dominio de Vercel

### 7. Reiniciar el servidor de desarrollo
```bash
# Detener el servidor (Ctrl+C) y reiniciar
npm run dev
```

¡Listo! Tu aplicación ahora debería conectarse correctamente con Supabase.
