import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén configuradas
const isConfigured = supabaseUrl && 
                    supabaseKey && 
                    supabaseUrl !== 'your_supabase_project_url' && 
                    supabaseKey !== 'your_supabase_anon_key' &&
                    supabaseUrl !== 'undefined' &&
                    supabaseKey !== 'undefined'

let supabase

if (!isConfigured) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas correctamente')
  console.warn('📝 Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env')
  console.warn('🔧 Usando modo demo con datos de ejemplo')
  
  // Crear un cliente mock para evitar errores
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Modo demo - Configurar Supabase para funcionalidad completa' } 
      }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Modo demo - Configurar Supabase para funcionalidad completa' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { 
          subscription: { 
            unsubscribe: () => console.log('Mock subscription unsubscribed') 
          } 
        }
      })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null })
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  }
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    
    console.log('✅ Supabase inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando Supabase:', error)
    // Fallback al cliente mock en caso de error
    supabase = {
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Error de conexión con Supabase' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Error de conexión con Supabase' } }),
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
  }
}

// Manejar errores de runtime del navegador
if (typeof window !== 'undefined') {
  // Prevenir que errores de extensiones del navegador afecten la aplicación
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('Extension context invalidated') ||
        event.error?.message?.includes('message channel closed') ||
        event.error?.message?.includes('listener indicated an asynchronous response')) {
      event.preventDefault()
      console.warn('🔌 Browser extension error ignored:', event.error?.message)
      return false
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Extension context invalidated') ||
        event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('listener indicated an asynchronous response')) {
      event.preventDefault()
      console.warn('🔌 Browser extension promise rejection ignored:', event.reason?.message)
      return false
    }
  })
}

export { supabase, isConfigured }
