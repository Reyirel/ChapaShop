import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Referencias para evitar operaciones duplicadas
  const initializingRef = useRef(false)
  const fetchingProfileRef = useRef(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initializingRef.current) return
    initializingRef.current = true

    // Función para inicializar la autenticación
    const initializeAuth = async () => {
      try {
        
        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error obteniendo sesión:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setIsInitialized(true)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }

      } catch (error) {
        console.error('Error inicializando autenticación:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
        setIsInitialized(true)
        initializingRef.current = false
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        // Evitar procesar si aún estamos inicializando
        if (initializingRef.current) return
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
          cleanupStorage()
        } else if (session?.user && event !== 'TOKEN_REFRESHED') {
          // Solo actualizar en eventos significativos, no en refresh de token
          setUser(session.user)
          if (!fetchingProfileRef.current) {
            await fetchProfile(session.user.id)
          }
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Chequeo periódico de sesión más simple y menos frecuente
  useEffect(() => {
    if (!user || !isInitialized) return

    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session && user) {
          setUser(null)
          setProfile(null)
          cleanupStorage()
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
      }
    }, 120000) // Cada 2 minutos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user, isInitialized])

  // Función para limpiar almacenamiento
  const cleanupStorage = () => {
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('sb-auth-token')
    sessionStorage.clear()
  }

  const fetchProfile = async (userId) => {
    // Evitar múltiples peticiones simultáneas
    if (fetchingProfileRef.current) {
      return
    }

    fetchingProfileRef.current = true

    try {
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null)
          return
        }
        
        console.error('Error obteniendo perfil:', error)
        setProfile(null)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error inesperado obteniendo perfil:', error)
      setProfile(null)
    } finally {
      fetchingProfileRef.current = false
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      
      // Limpiar estado local inmediatamente
      setUser(null)
      setProfile(null)
      cleanupStorage()
      
      // Intentar cerrar sesión en Supabase con timeout
      const logoutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 3000)
      )
      
      try {
        const { error } = await Promise.race([logoutPromise, timeoutPromise])
        
        if (error) {
          console.error('Error cerrando sesión:', error)
        }
      } catch (timeoutError) {
        console.error('Timeout en logout:', timeoutError)
      }
      
      // Redireccionar siempre
      setTimeout(() => {
        window.location.replace('/')
      }, 100)
      
      return { error: null }
    } catch (error) {
      console.error('Error inesperado en signOut:', error)
      // Ejecutar logout forzado
      forceSignOut()
      return { error }
    }
  }

  const forceSignOut = () => {
    
    setUser(null)
    setProfile(null)
    
    // Limpiar todo
    localStorage.clear()
    sessionStorage.clear()
    
    // Redireccionar
    window.location.replace('/')
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No hay usuario logueado')

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const isBusiness = () => {
    return profile?.role === 'business'
  }

  const isPerson = () => {
    return profile?.role === 'person'
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    forceSignOut,
    updateProfile,
    isAdmin,
    isBusiness,
    isPerson,
    isInitialized
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
