import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén configuradas
const isConfigured = supabaseUrl && 
                    supabaseKey && 
                    supabaseUrl !== 'your_supabase_project_url' && 
                    supabaseKey !== 'your_supabase_anon_key'

let supabase

if (!isConfigured) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas correctamente')
  console.warn('📝 Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env')
  
  // Crear un cliente mock para evitar errores
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Configurar Supabase primero' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Configurar Supabase primero' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export { supabase }
