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
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'

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

  // Initialize demo data on first load
  const initializeDemoData = async () => {
    try {
      // Check if demo data already exists
      const adminDoc = await getDoc(doc(db, 'users', 'demo-admin'))
      if (adminDoc.exists()) {
        console.log('Demo data already exists')
        return
      }

      console.log('🔧 Inicializando datos de demostración...')

      // Create demo admin user
      const adminProfile = {
        email: 'admin@chapashop.com',
        displayName: 'Administrador ChapaShop',
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(doc(db, 'users', 'demo-admin'), adminProfile)

      // Create demo business user
      const businessProfile = {
        email: 'negocio@chapashop.com',
        displayName: 'Dueño de Negocio',
        role: 'business',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(doc(db, 'users', 'demo-business'), businessProfile)

      // Create demo client user
      const clientProfile = {
        email: 'cliente@chapashop.com',
        displayName: 'Cliente Demo',
        role: 'client',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(doc(db, 'users', 'demo-client'), clientProfile)

      // Create demo business
      const demoBusiness = {
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
      }
      await addDoc(collection(db, 'businesses'), demoBusiness)

      // Create demo pending business
      const pendingBusiness = {
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
      await addDoc(collection(db, 'businesses'), pendingBusiness)

      console.log('✅ Datos de demostración creados exitosamente')
    } catch (error) {
      console.error('Error creating demo data:', error)
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

  // Demo login function
  const demoLogin = async (userType) => {
    const demoUsers = {
      admin: {
        uid: 'demo-admin',
        email: 'admin@chapashop.com',
        displayName: 'Administrador ChapaShop'
      },
      business: {
        uid: 'demo-business',
        email: 'negocio@chapashop.com',
        displayName: 'Dueño de Negocio'
      },
      client: {
        uid: 'demo-client',
        email: 'cliente@chapashop.com',
        displayName: 'Cliente Demo'
      }
    }

    const selectedUser = demoUsers[userType]
    if (selectedUser) {
      setUser(selectedUser)
      
      // Get user profile
      const profileDoc = await getDoc(doc(db, 'users', selectedUser.uid))
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data())
      }
      
      return selectedUser
    }
    throw new Error('Tipo de usuario no válido')
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
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        console.log('No user profile found')
        return null
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  const updateProfile = async (userId, updates) => {
    try {
      const docRef = doc(db, 'users', userId)
      await setDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Initialize demo data
    initializeDemoData()

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    signup,
    signin,
    logout,
    demoLogin,
    getUserProfile,
    updateProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
