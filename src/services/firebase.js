// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase config from environment variables - NUNCA hardcodear credenciales
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Verificar que las variables de entorno estén configuradas
const isConfigured = firebaseConfig.apiKey && 
                    firebaseConfig.authDomain && 
                    firebaseConfig.projectId &&
                    firebaseConfig.apiKey !== 'undefined' &&
                    firebaseConfig.authDomain !== 'undefined' &&
                    firebaseConfig.projectId !== 'undefined'

let app, auth, db, storage, analytics

if (!isConfigured) {
  console.warn('⚠️ Variables de entorno de Firebase no configuradas correctamente')
  console.warn('📝 Por favor, configura las variables VITE_FIREBASE_* en tu archivo .env')
  console.warn('🔧 Usando modo demo con datos locales')
  
  // Create mock objects for demo mode
  auth = {
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
    createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (callback) => {
      // Simular cambio de estado después de un momento
      setTimeout(() => callback(null), 100)
      return () => {} // unsubscribe function
    }
  }
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'demo-id' }),
      where: () => ({
        orderBy: () => ({
          get: () => Promise.resolve({ empty: true, docs: [] })
        }),
        get: () => Promise.resolve({ empty: true, docs: [] })
      }),
      orderBy: () => ({
        get: () => Promise.resolve({ empty: true, docs: [] })
      }),
      get: () => Promise.resolve({ empty: true, docs: [] })
    })
  }
  
  storage = {
    ref: () => ({
      child: () => ({
        put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('demo-url') } })
      })
    })
  }
} else {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)
    
    // Initialize Firebase services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Configure auth persistence (this ensures users stay logged in on refresh)
    // Firebase Web SDK uses LOCAL persistence by default, but let's be explicit
    if (auth) {
      // The persistence is automatically set to LOCAL for web apps
      // This means the auth state persists across browser sessions
      console.log('🔒 Persistencia de autenticación configurada (LOCAL)')
    }
    
    // Initialize Analytics (only in production or when needed)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app)
      } catch (analyticsError) {
        console.warn('⚠️ Analytics no se pudo inicializar:', analyticsError.message)
      }
    }
    
    console.log('🔥 Firebase inicializado correctamente')
    console.log('📊 Proyecto:', firebaseConfig.projectId)
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error)
    throw error
  }
}

// Helper function to handle authentication state
export const onAuthStateChange = (callback) => {
  if (!isConfigured) {
    // Mock auth state change for demo
    setTimeout(() => callback(null), 100)
    return () => {}
  }
  
  return auth.onAuthStateChanged(callback)
}

// Export Firebase services
export { auth, db, storage, analytics, isConfigured }
export default app
