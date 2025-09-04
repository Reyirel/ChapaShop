# ChapaShop

Una plataforma para descubrir y conectar con negocios locales.

## Características

- 🏠 **Home**: Página de bienvenida con información sobre la plataforma
- 🏪 **Negocios**: Listado de todos los negocios disponibles
- 🔍 **Detalle de Negocio**: Información detallada de cada negocio
- 👤 **Autenticación**: Sistema de login y registro de usuarios
- ⚙️ **Panel Admin**: Gestión de usuarios y negocios
- 🎨 **Tailwind CSS**: Diseño moderno y responsivo
- 🛡️ **Supabase**: Backend como servicio para autenticación y base de datos

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia tu `Project URL` y `anon public` key
5. Renombra `.env.example` a `.env` y añade tus credenciales:

```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Desarrollo

```bash
npm run dev
```

### 4. Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
npm run deploy
```

## Estructura del Proyecto

```
src/
├── components/
│   └── Navbar.jsx          # Barra de navegación
├── pages/
│   ├── Home.jsx            # Página de inicio
│   ├── Negocios.jsx        # Listado de negocios
│   ├── NegocioDetail.jsx   # Detalle de negocio
│   ├── Login.jsx           # Página de login
│   ├── Register.jsx        # Página de registro
│   └── Admin.jsx           # Panel de administración
├── services/
│   └── supabase.js         # Configuración de Supabase
└── App.jsx                 # Componente principal con routing
```

## Tecnologías Utilizadas

- **React** - Framework de UI
- **React Router DOM** - Navegación entre páginas
- **Tailwind CSS** - Framework de CSS (CDN)
- **Supabase** - Backend como servicio
- **Vite** - Herramienta de desarrollo
- **Vercel** - Plataforma de despliegue

## Variables de Entorno

Asegúrate de configurar las siguientes variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Próximos Pasos

1. Configurar las tablas en Supabase:
   - Tabla `usuarios` para gestión de usuarios
   - Tabla `negocios` para almacenar información de negocios
2. Implementar autenticación real con Supabase
3. Conectar la base de datos con las páginas
4. Añadir funcionalidades específicas según tus necesidades+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
