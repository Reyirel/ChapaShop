import { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session')
        
        if (event === 'SIGNED_OUT' || !session) {
          // Limpiar estado completamente
          setUser(null)
          setProfile(null)
          localStorage.removeItem('supabase.auth.token')
          localStorage.removeItem('sb-auth-token')
          sessionStorage.clear()
        } else if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
        
        setLoading(false)
      }
    )

    // Chequear estado de sesión periódicamente para detectar sesiones inválidas
    const sessionCheckInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (user && !session) {
        console.log('Session expired detected, cleaning up')
        setUser(null)
        setProfile(null)
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('sb-auth-token')
        sessionStorage.clear()
      } else if (session && !user) {
        console.log('New session detected, updating state')
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
    }, 30000) // Chequear cada 30 segundos

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
    }
  }, [user])

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        // Si hay error obteniendo la sesión, limpiar estado
        await cleanupAuthState()
        return
      }
      
      if (session?.user) {
        // Verificar que la sesión sea realmente válida
        const isValidSession = await verifySession(session)
        
        if (isValidSession) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log('Invalid session detected, cleaning up')
          await cleanupAuthState()
        }
      } else {
        // No hay sesión válida
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Error getting initial session:', error)
      // En caso de error, limpiar estado
      await cleanupAuthState()
    } finally {
      setLoading(false)
    }
  }

  // Función para verificar si una sesión es válida
  const verifySession = async (session) => {
    try {
      // Intentar hacer una consulta simple para verificar que la sesión funcione
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      // Si la consulta falla por autenticación, la sesión no es válida
      if (error && (error.code === 'PGRST301' || error.message.includes('JWT'))) {
        return false
      }
      
      return true
    } catch (error) {
      console.error('Session verification failed:', error)
      return false
    }
  }

  // Función para limpiar estado de autenticación
  const cleanupAuthState = async () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('sb-auth-token')
    sessionStorage.clear()
    
    // Intentar logout silencioso en Supabase
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // Ignorar errores en cleanup silencioso
      console.log('Silent cleanup signout failed (expected):', error.message)
    }
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si el perfil no existe (PGRST116), no es un error crítico
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user may need to complete setup')
          setProfile(null)
          return
        }
        
        // Para otros errores, intentar una vez más
        console.error('Error fetching profile (retrying once):', error)
        
        // Retry una vez después de un breve delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          
        if (retryError && retryError.code !== 'PGRST116') {
          throw retryError
        }
        
        setProfile(retryData)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // En caso de error persistente, mantener el usuario pero sin perfil
      setProfile(null)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    try {
      console.log('Starting logout process...')
      
      // Limpiar estado local inmediatamente para evitar estado inconsistente
      setUser(null)
      setProfile(null)
      
      // Limpiar almacenamiento local antes de intentar logout
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-auth-token')
      sessionStorage.clear()
      
      // Intentar cerrar sesión en Supabase con timeout
      const logoutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      )
      
      try {
        const { error } = await Promise.race([logoutPromise, timeoutPromise])
        
        if (error) {
          console.error('Error signing out from Supabase:', error)
          // Continuar con limpieza local incluso si Supabase falla
        } else {
          console.log('Successfully signed out from Supabase')
        }
      } catch (timeoutError) {
        console.error('Logout timeout, proceeding with local cleanup:', timeoutError)
        // Continuar con limpieza local si hay timeout
      }
      
      // Limpiar cookies relacionadas con autenticación
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      console.log('Logout cleanup completed, redirecting...')
      
      // Usar replace en lugar de href para evitar problemas de historial
      window.location.replace('/')
      
      return { error: null }
    } catch (error) {
      console.error('Unexpected error during signOut:', error)
      
      // En caso de error crítico, ejecutar limpieza forzada
      forceSignOut()
      
      return { error }
    }
  }

  const forceSignOut = () => {
    console.log('Executing force logout...')
    
    // Función de logout forzado que no espera respuesta de Supabase
    setUser(null)
    setProfile(null)
    
    // Limpiar todo el almacenamiento local
    localStorage.clear()
    sessionStorage.clear()
    
    // Limpiar específicamente tokens de Supabase con diferentes variantes
    const supabaseKeys = [
      'supabase.auth.token',
      'sb-auth-token',
      'sb-' + window.location.hostname + '-auth-token'
    ]
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
    // Limpiar todas las cookies relacionadas con Supabase y autenticación
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    // Limpiar cookies específicas de Supabase
    const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token']
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
    })
    
    console.log('Force logout completed, redirecting...')
    
    // Usar replace para evitar que el usuario regrese con el botón atrás
    window.location.replace('/')
  }

  // Función de diagnóstico y auto-reparación para problemas de autenticación
  const diagnoseAndRepair = async () => {
    console.log('Running authentication diagnosis...')
    
    try {
      // 1. Verificar estado actual
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Current session state:', {
        hasSession: !!session,
        hasUser: !!user,
        hasProfile: !!profile,
        sessionError: error?.message
      })
      
      // 2. Verificar almacenamiento local
      const localTokens = {
        supabaseAuthToken: localStorage.getItem('supabase.auth.token'),
        sbAuthToken: localStorage.getItem('sb-auth-token'),
        sessionData: sessionStorage.length
      }
      
      console.log('Local storage state:', localTokens)
      
      // 3. Si hay inconsistencias, limpiar
      if (user && !session) {
        console.log('Inconsistent state detected: user exists but no session')
        await cleanupAuthState()
        return { repaired: true, issue: 'inconsistent_state' }
      }
      
      if (!user && session) {
        console.log('Inconsistent state detected: session exists but no user')
        setUser(session.user)
        await fetchProfile(session.user.id)
        return { repaired: true, issue: 'missing_user_state' }
      }
      
      // 4. Verificar validez de sesión si existe
      if (session && user) {
        const isValid = await verifySession(session)
        if (!isValid) {
          console.log('Invalid session detected')
          await cleanupAuthState()
          return { repaired: true, issue: 'invalid_session' }
        }
      }
      
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

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

  // Función de diagnóstico y auto-reparación para problemas de autenticación
  const diagnoseAndRepair = async () => {
    console.log('Running authentication diagnosis...')
    
    try {
      // 1. Verificar estado actual
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Current session state:', {
        hasSession: !!session,
        hasUser: !!user,
        hasProfile: !!profile,
        sessionError: error?.message
      })
      
      // 2. Verificar almacenamiento local
      const localTokens = {
        supabaseAuthToken: localStorage.getItem('supabase.auth.token'),
        sbAuthToken: localStorage.getItem('sb-auth-token'),
        sessionData: sessionStorage.length
      }
      
      console.log('Local storage state:', localTokens)
      
      // 3. Si hay inconsistencias, limpiar
      if (user && !session) {
        console.log('Inconsistent state detected: user exists but no session')
        await cleanupAuthState()
        return { repaired: true, issue: 'inconsistent_state' }
      }
      
      if (!user && session) {
        console.log('Inconsistent state detected: session exists but no user')
        setUser(session.user)
        await fetchProfile(session.user.id)
        return { repaired: true, issue: 'missing_user_state' }
      }
      
      // 4. Verificar validez de sesión si existe
      if (session && user) {
        const isValid = await verifySession(session)
        if (!isValid) {
          console.log('Invalid session detected')
          await cleanupAuthState()
          return { repaired: true, issue: 'invalid_session' }
        }
      }
      
      console.log('Authentication state is healthy')
      return { repaired: false, issue: null }
      
    } catch (error) {
      console.error('Diagnosis failed:', error)
      await cleanupAuthState()
      return { repaired: true, issue: 'diagnosis_failed' }
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
    fetchProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
