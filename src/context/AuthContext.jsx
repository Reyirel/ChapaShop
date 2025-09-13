import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import dbService from '../services/database'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  // Initialize demo data on first load (mejorado para evitar errores de permisos)
  const initializeDemoData = async () => {
    try {
      // Check if we have proper Firebase configuration
      if (!db || typeof db.collection !== 'function') {
        
        return
      }

      // Check if demo data already exists
      const businessesSnapshot = await getDocs(collection(db, 'businesses'))
      if (!businessesSnapshot.empty) {
        
        return
      }

      // Only initialize demo data in development mode
      if (import.meta.env.PROD) {
        
        return
      }

      

      // Crear negocios demo
      const businesses = [
        {
          ownerId: 'demo-business',
          name: 'Restaurante Demo',
          description: 'Un restaurante de ejemplo para mostrar las funcionalidades de ChapaShop',
          category: 'Restaurante',
          address: 'Calle Principal 123, Ciudad Demo',
          location: {
            lat: 19.4326,
            lng: -99.1332
          },
          phone: '+52 55 1234 5678',
          email: 'contacto@restaurantedemo.com',
          status: 'approved',
          images: [],
          rating: 4.5,
          totalReviews: 12,
          businessHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          ownerId: 'demo-business',
          name: 'Tienda en Revisión',
          description: 'Esta tienda está esperando aprobación del administrador',
          category: 'Tienda',
          address: 'Avenida Secundaria 456, Ciudad Demo',
          location: {
            lat: 19.4400,
            lng: -99.1300
          },
          phone: '+52 55 9876 5432',
          email: 'info@tiendademo.com',
          status: 'pending',
          images: [],
          rating: 0,
          totalReviews: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]
      for (const business of businesses) {
        await addDoc(collection(db, 'businesses'), business)
      }

      
    } catch (error) {
      console.warn('⚠️ No se pudieron crear los datos de demostración:', error.message)
      // No lanzar el error, solo loggearlo como advertencia
    }
  }

  // Sign up with email and password
  const signup = async (email, password, displayName, role = 'client') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      const userProfile = {
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)
      
      return { user, profile: userProfile }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Función para crear usuarios demo en Firebase Auth y Firestore (SIN auto-login)
  const createDemoUsers = async () => {
    try {
      

      const demoUsers = [
        {
          email: 'admin@chapashop.com',
          password: 'admin123',
          displayName: 'Administrador ChapaShop',
          role: 'admin'
        },
        {
          email: 'negocio@chapashop.com',
          password: 'negocio123',
          displayName: 'Dueño de Negocio',
          role: 'business'
        },
        {
          email: 'cliente@chapashop.com',
          password: 'cliente123',
          displayName: 'Cliente Demo',
          role: 'client'
        }
      ]

      const createdUsers = []

      for (const userData of demoUsers) {
        try {
          // Crear usuario en Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          )
          
          const user = userCredential.user

          // Crear perfil en Firestore
          const userProfile = {
            email: user.email,
            displayName: userData.displayName,
            role: userData.role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }

          await setDoc(doc(db, 'users', user.uid), userProfile)
          
          createdUsers.push({
            email: userData.email,
            role: userData.role,
            uid: user.uid
          })

        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            
          } else {
            console.error(`❌ Error creando ${userData.email}:`, error.message)
          }
        }
      }

      
      return { 
        success: true, 
        message: `Usuarios demo creados/verificados. Puedes iniciar sesión normalmente.`,
        users: createdUsers
      }

    } catch (error) {
      console.error('❌ Error general al crear usuarios demo:', error)
      return { success: false, message: error.message }
    }
  }

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Get user profile from Firestore
  const getUserProfile = async (userId) => {
    try {
      return await dbService.getUserProfile(userId)
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  const updateProfile = async (userId, updates) => {
    try {
      await dbService.updateUserProfile(userId, updates)
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }))
      
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Función para crear datos demo de manera segura (solo cuando el usuario esté autenticado como admin)
  const createSafeDemoData = async () => {
    try {
      // Verificar que el usuario esté autenticado y sea admin
      if (!user || !userProfile || userProfile.role !== 'admin') {
        console.warn('⚠️ Solo los administradores pueden crear datos de demostración')
        return { success: false, message: 'Permisos insuficientes' }
      }

      

      // Crear negocios demo
      const businesses = [
        {
          ownerId: user.uid,
          name: 'Restaurante La Plaza',
          description: 'Comida tradicional mexicana en el corazón de la ciudad',
          category: 'Restaurante',
          address: 'Plaza Principal 123, Centro',
          location: { lat: 19.4326, lng: -99.1332 },
          phone: '+52 55 1234 5678',
          email: 'contacto@laplaza.com',
          status: 'approved',
          images: [],
          rating: 4.5,
          totalReviews: 25,
          businessHours: {
            monday: { open: '08:00', close: '22:00', closed: false },
            tuesday: { open: '08:00', close: '22:00', closed: false },
            wednesday: { open: '08:00', close: '22:00', closed: false },
            thursday: { open: '08:00', close: '22:00', closed: false },
            friday: { open: '08:00', close: '23:00', closed: false },
            saturday: { open: '09:00', close: '23:00', closed: false },
            sunday: { open: '09:00', close: '21:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          ownerId: user.uid,
          name: 'Café & Books',
          description: 'Librería café con ambiente acogedor',
          category: 'Café',
          address: 'Avenida Reforma 456, Roma Norte',
          location: { lat: 19.4200, lng: -99.1650 },
          phone: '+52 55 9876 5432',
          email: 'hola@cafeandbooks.com',
          status: 'pending',
          images: [],
          rating: 0,
          totalReviews: 0,
          businessHours: {
            monday: { open: '07:00', close: '20:00', closed: false },
            tuesday: { open: '07:00', close: '20:00', closed: false },
            wednesday: { open: '07:00', close: '20:00', closed: false },
            thursday: { open: '07:00', close: '20:00', closed: false },
            friday: { open: '07:00', close: '21:00', closed: false },
            saturday: { open: '08:00', close: '21:00', closed: false },
            sunday: { open: '08:00', close: '19:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]

      // Crear los negocios en Firestore
      for (const business of businesses) {
        await addDoc(collection(db, 'businesses'), business)
      }

      return { success: true, message: 'Datos demo creados correctamente' }

    } catch (error) {
      console.error('❌ Error al crear datos demo:', error)
      return { success: false, message: error.message }
    }
  }

  // Función temporal para crear datos de prueba básicos sin autenticación
  const createBasicDemoData = async () => {
    try {

      // Verificar si ya hay datos
      const businessesSnapshot = await getDocs(collection(db, 'businesses'))
      if (!businessesSnapshot.empty) {
        
        return { success: true, message: 'Datos ya existen' }
      }

      // Crear algunos negocios de ejemplo
      const sampleBusinesses = [
        {
          ownerId: 'demo-owner-1',
          name: 'Restaurante El Buen Sabor',
          description: 'Comida tradicional mexicana con los mejores ingredientes',
          category: 'Restaurante',
          address: 'Av. Juárez 123, Centro Histórico',
          location: { lat: 19.4326, lng: -99.1332 },
          phone: '+52 55 1234 5678',
          email: 'contacto@elbuensabor.com',
          status: 'approved',
          images: [],
          rating: 4.5,
          totalReviews: 28,
          businessHours: {
            monday: { open: '08:00', close: '22:00', closed: false },
            tuesday: { open: '08:00', close: '22:00', closed: false },
            wednesday: { open: '08:00', close: '22:00', closed: false },
            thursday: { open: '08:00', close: '22:00', closed: false },
            friday: { open: '08:00', close: '23:00', closed: false },
            saturday: { open: '09:00', close: '23:00', closed: false },
            sunday: { open: '09:00', close: '21:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          ownerId: 'demo-owner-2',
          name: 'Café Luna',
          description: 'Café artesanal y postres caseros en ambiente acogedor',
          category: 'Café',
          address: 'Roma Norte 456, Colonia Roma',
          location: { lat: 19.4200, lng: -99.1650 },
          phone: '+52 55 8765 4321',
          email: 'hola@cafeluna.com',
          status: 'pending',
          images: [],
          rating: 0,
          totalReviews: 0,
          businessHours: {
            monday: { open: '07:00', close: '19:00', closed: false },
            tuesday: { open: '07:00', close: '19:00', closed: false },
            wednesday: { open: '07:00', close: '19:00', closed: false },
            thursday: { open: '07:00', close: '19:00', closed: false },
            friday: { open: '07:00', close: '20:00', closed: false },
            saturday: { open: '08:00', close: '20:00', closed: false },
            sunday: { open: '08:00', close: '18:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          ownerId: 'demo-owner-3',
          name: 'Librería & Té',
          description: 'Librería independiente con una amplia selección de tés',
          category: 'Librería',
          address: 'Condesa 789, La Condesa',
          location: { lat: 19.4100, lng: -99.1700 },
          phone: '+52 55 2468 1357',
          email: 'info@libreriayté.com',
          status: 'approved',
          images: [],
          rating: 4.8,
          totalReviews: 15,
          businessHours: {
            monday: { open: '09:00', close: '20:00', closed: false },
            tuesday: { open: '09:00', close: '20:00', closed: false },
            wednesday: { open: '09:00', close: '20:00', closed: false },
            thursday: { open: '09:00', close: '20:00', closed: false },
            friday: { open: '09:00', close: '21:00', closed: false },
            saturday: { open: '10:00', close: '21:00', closed: false },
            sunday: { open: '11:00', close: '19:00', closed: false }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]

      // Crear los negocios en Firestore
      for (const business of sampleBusinesses) {
        await addDoc(collection(db, 'businesses'), business)
      }

      
      return { success: true, message: 'Datos demo creados correctamente' }

    } catch (error) {
      console.warn('⚠️ No se pudieron crear los datos básicos:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Función para crear datos mock cuando hay problemas de permisos
  const createMockData = () => {
    const mockBusinesses = [
      {
        id: 'mock-1',
        ownerId: 'demo-owner-1',
        name: 'Restaurante El Buen Sabor',
        description: 'Comida tradicional mexicana con los mejores ingredientes',
        category: 'Restaurante',
        address: 'Av. Juárez 123, Centro Histórico',
        location: { lat: 19.4326, lng: -99.1332 },
        phone: '+52 55 1234 5678',
        email: 'contacto@elbuensabor.com',
        status: 'approved',
        images: [],
        rating: 4.5,
        totalReviews: 28,
        businessHours: {
          monday: { open: '08:00', close: '22:00', closed: false },
          tuesday: { open: '08:00', close: '22:00', closed: false },
          wednesday: { open: '08:00', close: '22:00', closed: false },
          thursday: { open: '08:00', close: '22:00', closed: false },
          friday: { open: '08:00', close: '23:00', closed: false },
          saturday: { open: '09:00', close: '23:00', closed: false },
          sunday: { open: '09:00', close: '21:00', closed: false }
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'mock-2',
        ownerId: 'demo-owner-2',
        name: 'Café Luna',
        description: 'Café artesanal y postres caseros en ambiente acogedor',
        category: 'Café',
        address: 'Roma Norte 456, Colonia Roma',
        location: { lat: 19.4200, lng: -99.1650 },
        phone: '+52 55 8765 4321',
        email: 'hola@cafeluna.com',
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        businessHours: {
          monday: { open: '07:00', close: '19:00', closed: false },
          tuesday: { open: '07:00', close: '19:00', closed: false },
          wednesday: { open: '07:00', close: '19:00', closed: false },
          thursday: { open: '07:00', close: '19:00', closed: false },
          friday: { open: '07:00', close: '20:00', closed: false },
          saturday: { open: '08:00', close: '20:00', closed: false },
          sunday: { open: '08:00', close: '18:00', closed: false }
        },
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: 'mock-3',
        ownerId: 'demo-owner-3',
        name: 'Librería & Té',
        description: 'Librería independiente con una amplia selección de tés',
        category: 'Librería',
        address: 'Condesa 789, La Condesa',
        location: { lat: 19.4100, lng: -99.1700 },
        phone: '+52 55 2468 1357',
        email: 'info@libreriayté.com',
        status: 'approved',
        images: [],
        rating: 4.8,
        totalReviews: 15,
        businessHours: {
          monday: { open: '09:00', close: '20:00', closed: false },
          tuesday: { open: '09:00', close: '20:00', closed: false },
          wednesday: { open: '09:00', close: '20:00', closed: false },
          thursday: { open: '09:00', close: '20:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '10:00', close: '21:00', closed: false },
          sunday: { open: '11:00', close: '19:00', closed: false }
        },
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      }
    ]

    return mockBusinesses
  }

  // Helper functions to check user roles
  const isAdmin = () => {
    return userProfile?.role === 'admin'
  }

  const isBusiness = () => {
    return userProfile?.role === 'business'
  }

  const isClient = () => {
    return userProfile?.role === 'client'
  }

  useEffect(() => {
    let mounted = true
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && mounted) {
          // Usuario autenticado
          
          setUser(user)
          
          // Obtener perfil del usuario
          try {
            const profile = await getUserProfile(user.uid)
            if (mounted) {
              setUserProfile(profile)
            }
          } catch (error) {
            console.warn('⚠️ Error cargando perfil:', error.message)
            if (mounted) {
              setUserProfile(null)
            }
          }
        } else if (mounted) {
          // Usuario no autenticado
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('❌ Error en onAuthStateChanged:', error)
        if (mounted) {
          setUser(null)
          setUserProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    // Initialize demo data only if needed and user has permissions
    // initializeDemoData() // Comentado para evitar errores de permisos

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  // Función completa para inicializar toda la base de datos (usuarios + negocios)
  const initializeCompleteDatabase = async () => {
    try {

      // 1. Crear usuarios demo
      const usersResult = await createDemoUsers()
      
      // 2. Crear datos de negocios
      const businessResult = await createBasicDemoData()

      if (usersResult.success && businessResult.success) {
        return {
          success: true,
          message: 'Base de datos inicializada con usuarios y negocios demo. Ahora puedes iniciar sesión con:\n\n📧 admin@chapashop.com / admin123\n📧 negocio@chapashop.com / negocio123\n📧 cliente@chapashop.com / cliente123'
        }
      } else {
        return {
          success: false,
          message: 'Error parcial en la inicialización. Revisa la consola para detalles.'
        }
      }

    } catch (error) {
      console.error('❌ Error en inicialización completa:', error)
      return { success: false, message: error.message }
    }
  }

  const value = {
    user,
    userProfile,
    signup,
    signin,
    logout,
    createDemoUsers, // Crear usuarios demo (sin auto-login)
    getUserProfile,
    updateProfile,
    initializeDemoData, // Exponemos la función para uso manual si es necesario
    createSafeDemoData, // Nueva función para crear datos demo de manera segura
    createBasicDemoData, // Función para crear datos básicos sin autenticación estricta
    createMockData, // Función para crear datos mock cuando hay problemas de permisos
    initializeCompleteDatabase, // Función completa para inicializar todo
    loading,
    isAdmin,
    isBusiness,
    isClient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
