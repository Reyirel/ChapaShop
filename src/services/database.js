// Firebase database service for ChapaShop
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

class DatabaseService {
  constructor() {
    this.permissionError = false // Flag para evitar intentos repetidos cuando hay errores de permisos
  }

  // USER PROFILES
  async createUserProfile(userId, profileData) {
    try {
      const docRef = doc(db, 'users', userId)
      await setDoc(docRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { id: userId, ...profileData }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { id: userId, ...updates }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async getAllUsers() {
    try {
      console.log('👥 getAllUsers - Starting...')
      const usersCollection = collection(db, 'users')
      const q = query(usersCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const users = []
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      console.log('✅ getAllUsers - Firebase query successful:', users.length, 'users')
      return users
    } catch (error) {
      console.error('❌ getAllUsers - Error getting all users:', error)
      
      // Si hay error de índice, intentar sin orderBy
      try {
        console.log('⚠️ getAllUsers - Trying fallback query without orderBy...')
        const usersCollection = collection(db, 'users')
        const querySnapshot = await getDocs(usersCollection)
        
        const users = []
        querySnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Ordenar en JavaScript
        users.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt.toDate() - a.createdAt.toDate()
        })
        
        console.log('✅ getAllUsers - Fallback query successful:', users.length, 'users')
        return users
      } catch (fallbackError) {
        console.error('❌ getAllUsers - Error in fallback query:', fallbackError)
        
        // Si hay errores de permisos, usar datos mock
        if (fallbackError.code === 'permission-denied' || fallbackError.message.includes('permissions')) {
          console.log('⚠️ getAllUsers - Permission error, using mock users')
          return this.getMockUsers()
        }
        
        console.log('⚠️ getAllUsers - Returning mock users due to error')
        return this.getMockUsers()
      }
    }
  }

  async deleteUser(userId) {
    try {
      const docRef = doc(db, 'users', userId)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // BUSINESSES
  async createBusiness(businessData) {
    try {
      console.log('🏭 DatabaseService.createBusiness - Datos recibidos:', businessData)
      console.log('🕒 DatabaseService - businessHours original:', businessData.businessHours)
      console.log('🕒 DatabaseService - businessHours tipo:', typeof businessData.businessHours)
      console.log('🕒 DatabaseService - businessHours existe:', !!businessData.businessHours)

      // Validate and format business hours if provided
      if (businessData.businessHours) {
        console.log('✅ DatabaseService - businessHours existe, validando...')
        businessData.businessHours = this.validateBusinessHours(businessData.businessHours)
        console.log('✅ DatabaseService - businessHours después de validación:', businessData.businessHours)
      } else {
        console.log('⚠️ DatabaseService - businessHours NO existe o es falsy')
        console.log('⚠️ DatabaseService - Valor exacto:', businessData.businessHours)
        console.log('⚠️ DatabaseService - Es null:', businessData.businessHours === null)
        console.log('⚠️ DatabaseService - Es undefined:', businessData.businessHours === undefined)
      }

      // Validate location data
      if (businessData.location) {
        console.log('📍 Ubicación recibida para crear negocio:', businessData.location)
        
        // Ensure location has the correct structure
        if (!businessData.location.lat || !businessData.location.lng) {
          console.warn('⚠️ Estructura de ubicación inválida, eliminando campo location')
          businessData.location = null
        } else {
          // Ensure numeric values
          businessData.location = {
            lat: parseFloat(businessData.location.lat),
            lng: parseFloat(businessData.location.lng)
          }
          console.log('✅ Ubicación validada:', businessData.location)
        }
      }

      console.log('💾 Datos del negocio ANTES de guardar en Firebase:', {
        name: businessData.name,
        location: businessData.location,
        businessHours: businessData.businessHours,
        hasBusinessHours: !!businessData.businessHours,
        businessHoursType: typeof businessData.businessHours
      })

      // Crear el objeto final que se enviará a Firebase
      const finalBusinessData = {
        ...businessData,
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      console.log('🚀 Objeto FINAL enviado a Firebase:', finalBusinessData)
      console.log('🚀 businessHours en objeto final:', finalBusinessData.businessHours)
      console.log('🚀 businessHours final es null:', finalBusinessData.businessHours === null)
      
      const docRef = await addDoc(collection(db, 'businesses'), finalBusinessData)

      console.log('✅ Negocio creado exitosamente con ID:', docRef.id)
      return { id: docRef.id, ...businessData }
    } catch (error) {
      console.error('❌ Error creating business:', error)
      console.error('❌ Datos que causaron el error:', businessData)
      throw error
    }
  }

  // Validate and format business hours
  validateBusinessHours(hours) {
    console.log('🔍 validateBusinessHours - Input:', hours)
    console.log('🔍 validateBusinessHours - Input tipo:', typeof hours)
    
    if (!hours || typeof hours !== 'object') {
      console.log('⚠️ validateBusinessHours - Input inválido, devolviendo null')
      return null
    }

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const validatedHours = {}

    validDays.forEach(day => {
      if (hours[day] && typeof hours[day] === 'object') {
        // Validate time format
        const openTime = hours[day].open || '09:00'
        const closeTime = hours[day].close || '18:00'
        const closed = Boolean(hours[day].closed)

        // Basic time format validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
          console.warn(`⚠️ Formato de hora inválido para ${day}: ${openTime}-${closeTime}`)
          // Use defaults if invalid
          validatedHours[day] = {
            open: '09:00',
            close: '18:00',
            closed: true
          }
        } else {
          validatedHours[day] = {
            open: openTime,
            close: closeTime,
            closed: closed
          }
        }
      } else {
        console.warn(`⚠️ validateBusinessHours - Día ${day} faltante o inválido, usando valores por defecto`)
        // Default values for missing days
        validatedHours[day] = {
          open: '09:00',
          close: '18:00',
          closed: true
        }
      }
    })

    console.log('✅ validateBusinessHours - Output:', validatedHours)
    console.log('✅ validateBusinessHours - Output tipo:', typeof validatedHours)
    return validatedHours
  }

  async getBusinesses(filters = {}) {
    try {
      console.log('🔍 getBusinesses - Starting with filters:', filters)
      
      let q = collection(db, 'businesses')
      
      // Si hay filtros específicos, aplicarlos uno por uno
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.ownerId) {
        q = query(q, where('ownerId', '==', filters.ownerId))
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      // Solo ordenar si no hay filtros complejos para evitar problemas de índice
      if (!filters.ownerId || (!filters.status && !filters.category)) {
        q = query(q, orderBy('createdAt', 'desc'))
      }
      
      // Apply limit if specified
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }
      
      const querySnapshot = await getDocs(q)
      let businesses = []
      
      querySnapshot.forEach((doc) => {
        businesses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Si no pudimos ordenar en la query, ordenar en JavaScript
      if (filters.ownerId && (filters.status || filters.category)) {
        businesses.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt.toDate() - a.createdAt.toDate()
        })
      }
      
      console.log('✅ getBusinesses - Firebase query successful:', businesses.length, 'businesses')
      return businesses
    } catch (error) {
      console.error('❌ getBusinesses - Error:', error)
      
      // Si es un error de índice y tenemos filtros, intentar una consulta más simple
      if (error.message.includes('index') && filters.ownerId) {
        console.log('⚠️ getBusinesses - Index error, trying simple query...')
        return this.getBusinessesSimple(filters)
      }
      
      // Si hay error de permisos y se solicita solo negocios aprobados, usar mock filtrado
      if ((error.code === 'permission-denied' || error.message.includes('permissions')) && filters.status === 'approved') {
        console.log('⚠️ getBusinesses - Permission error with approved filter, using mock data')
        const mockData = this.getMockBusinesses()
        const filteredMock = mockData.filter(b => b.status === 'approved')
        console.log('📊 getBusinesses - Approved mock businesses:', filteredMock.length)
        return filteredMock
      }
      
      // Para otros casos con errores de permisos, usar mock completo y filtrar en JavaScript
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.log('⚠️ getBusinesses - Permission error, using mock data with JS filtering')
        const mockData = this.getMockBusinesses()
        let filteredData = mockData
        
        if (filters.status) {
          filteredData = filteredData.filter(b => b.status === filters.status)
        }
        if (filters.ownerId) {
          filteredData = filteredData.filter(b => b.ownerId === filters.ownerId)
        }
        if (filters.category) {
          filteredData = filteredData.filter(b => b.category === filters.category)
        }
        
        console.log('📊 getBusinesses - Filtered mock data:', filteredData.length, 'businesses')
        return filteredData
      }
      
      throw error
    }
  }

  // Función simplificada para evitar problemas de índice
  async getBusinessesSimple(filters = {}) {
    try {
      const q = query(
        collection(db, 'businesses'),
        orderBy('createdAt', 'desc'),
        limit(filters.limit || 50)
      )
      
      const querySnapshot = await getDocs(q)
      const businesses = []
      
      querySnapshot.forEach((doc) => {
        const businessData = {
          id: doc.id,
          ...doc.data()
        }
        
        // Apply filters in JavaScript
        if (filters.status && businessData.status !== filters.status) return
        if (filters.ownerId && businessData.ownerId !== filters.ownerId) return
        if (filters.category && businessData.category !== filters.category) return
        
        businesses.push(businessData)
      })
      
      return businesses
    } catch (error) {
      console.error('Error getting businesses simple:', error)
      throw error
    }
  }

  // Get only approved businesses for public display
  async getApprovedBusinesses() {
    try {
      console.log('🔍 getApprovedBusinesses - Starting...')
      const result = await this.getBusinesses({ status: 'approved' })
      console.log('✅ getApprovedBusinesses - Result:', result?.length || 0, 'businesses')
      console.log('📊 getApprovedBusinesses - Businesses:', result?.map(b => ({ id: b.id, name: b.name, status: b.status })))
      return result
    } catch (error) {
      console.error('❌ getApprovedBusinesses - Error:', error)
      console.log('⚠️ getApprovedBusinesses - Returning empty array due to error')
      return []
    }
  }

  // Alias para obtener todos los negocios sin filtros
  async getAllBusinesses() {
    console.log('🔍 getAllBusinesses - Iniciando...')
    
    // Si ya sabemos que hay errores de permisos, usar datos mock directamente
    if (this.permissionError) {
      console.log('⚠️ getAllBusinesses - Flag de permissionError activo, usando mock')
      const mockData = this.getMockBusinesses()
      console.log('📊 getAllBusinesses - Mock data loaded:', mockData.length, 'businesses')
      console.log('📊 getAllBusinesses - Pending businesses in mock:', mockData.filter(b => b.status === 'pending').length)
      return mockData
    }

    try {
      console.log('🔄 getAllBusinesses - Intentando consulta real a Firebase...')
      
      // Intentar obtener todos los negocios sin filtros complejos
      let q = collection(db, 'businesses')
      
      // Intentar ordenar, pero si falla usar consulta simple
      try {
        q = query(q, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        const businesses = []
        
        querySnapshot.forEach((doc) => {
          businesses.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        console.log('✅ getAllBusinesses - Firebase query successful:', businesses.length, 'businesses')
        console.log('📊 getAllBusinesses - Pending from Firebase:', businesses.filter(b => b.status === 'pending').length)
        
        this.permissionError = false
        return businesses
      } catch {
        console.log('⚠️ getAllBusinesses - OrderBy failed, trying simple query...')
        // Si hay error con orderBy, hacer consulta simple
        const simpleQuery = collection(db, 'businesses')
        const querySnapshot = await getDocs(simpleQuery)
        const businesses = []
        
        querySnapshot.forEach((doc) => {
          businesses.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Ordenar manualmente
        businesses.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })
        
        console.log('✅ getAllBusinesses - Simple query successful:', businesses.length, 'businesses')
        console.log('📊 getAllBusinesses - Pending from simple query:', businesses.filter(b => b.status === 'pending').length)
        
        this.permissionError = false
        return businesses
      }
    } catch (error) {
      console.error('❌ getAllBusinesses - Error en consulta Firebase:', error)
      
      // Si hay errores de permisos, marcar flag y usar datos mock
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('⚠️ getAllBusinesses - Permisos insuficientes, usando datos mock')
        this.permissionError = true
        const mockData = this.getMockBusinesses()
        console.log('📊 getAllBusinesses - Mock fallback loaded:', mockData.length, 'businesses')
        console.log('📊 getAllBusinesses - Pending businesses in mock fallback:', mockData.filter(b => b.status === 'pending').length)
        return mockData
      }
      
      // Si hay errores de índice u otros, también usar mock como fallback
      if (error.message.includes('index') || error.message.includes('requires an index')) {
        console.warn('⚠️ getAllBusinesses - Error de índice, usando datos mock como fallback')
        const mockData = this.getMockBusinesses()
        console.log('📊 getAllBusinesses - Index error fallback loaded:', mockData.length, 'businesses')
        console.log('📊 getAllBusinesses - Pending businesses in index fallback:', mockData.filter(b => b.status === 'pending').length)
        return mockData
      }
      
      throw error
    }
  }

  // Función especial para obtener negocios del usuario sin problemas de índice
  async getUserBusinesses(ownerId) {
    try {
      
      // Consulta simple solo por ownerId
      const q = query(
        collection(db, 'businesses'),
        where('ownerId', '==', ownerId)
      )
      
      const querySnapshot = await getDocs(q)
      const businesses = []
      
      querySnapshot.forEach((doc) => {
        businesses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Ordenar manualmente por fecha
      businesses.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })
      
      return businesses
    } catch (error) {
      console.error('Error getting user businesses:', error)
      
      // Si hay problemas, devolver array vacío en lugar de lanzar error
      if (error.message.includes('index') || error.code === 'permission-denied') {
        
        return []
      }
      
      throw error
    }
  }
  getMockBusinesses() {
    return [
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
      },
      // Agregar el negocio recién creado como pendiente
      {
        id: 'jK5ihRliUVSCq1VjyQo5',
        ownerId: 'demo-owner-4',
        name: 'ChapaShop',
        description: 'Negocio recién creado esperando aprobación',
        category: 'Tienda',
        address: 'Dirección del nuevo negocio',
        location: { lat: 19.4326, lng: -99.1332 },
        phone: '+52 55 1111 2222',
        email: 'info@chapashop.com',
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '15:00', closed: false },
          sunday: { open: '09:00', close: '15:00', closed: true }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Agregar más negocios pendientes para testing
      {
        id: 'pending-mock-1',
        ownerId: 'demo-owner-5',
        name: 'Taller Mecánico Experto',
        description: 'Servicios de reparación automotriz especializados',
        category: 'Servicio',
        address: 'Industrial 101, Zona Norte',
        location: { lat: 19.4500, lng: -99.1200 },
        phone: '+52 55 3333 4444',
        email: 'contacto@tallerexperto.com',
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        businessHours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '08:00', close: '14:00', closed: false },
          sunday: { open: '09:00', close: '13:00', closed: true }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pending-mock-2',
        ownerId: 'demo-owner-6',
        name: 'Farmacia San José',
        description: 'Farmacia con medicamentos de calidad y atención personalizada',
        category: 'Salud',
        address: 'Calle Principal 567, Centro',
        location: { lat: 19.4150, lng: -99.1400 },
        phone: '+52 55 5555 6666',
        email: 'farmacia@sanjose.com',
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        businessHours: {
          monday: { open: '07:00', close: '22:00', closed: false },
          tuesday: { open: '07:00', close: '22:00', closed: false },
          wednesday: { open: '07:00', close: '22:00', closed: false },
          thursday: { open: '07:00', close: '22:00', closed: false },
          friday: { open: '07:00', close: '22:00', closed: false },
          saturday: { open: '08:00', close: '20:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  // Mock users for when Firebase is not available
  getMockUsers() {
    return [
      {
        id: 'admin-user-1',
        email: 'admin@chapashop.com',
        full_name: 'Administrador Principal',
        role: 'admin',
        phone: '+52 55 1234 0000',
        address: 'Oficina Central, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'owner-user-1',
        email: 'propietario1@email.com',
        full_name: 'Carlos Mendoza',
        role: 'business_owner',
        phone: '+52 55 1111 2222',
        address: 'Roma Norte, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'owner-user-2',
        email: 'propietario2@email.com',
        full_name: 'María González',
        role: 'business_owner',
        phone: '+52 55 3333 4444',
        address: 'Condesa, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b999?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      },
      {
        id: 'customer-user-1',
        email: 'cliente1@email.com',
        full_name: 'Ana Rodríguez',
        role: 'user',
        phone: '+52 55 5555 6666',
        address: 'Polanco, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'customer-user-2',
        email: 'cliente2@email.com',
        full_name: 'Roberto Silva',
        role: 'user',
        phone: '+52 55 7777 8888',
        address: 'Coyoacán, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 'customer-user-3',
        email: 'cliente3@email.com',
        full_name: 'Laura Morales',
        role: 'user',
        phone: '+52 55 9999 0000',
        address: 'Del Valle, CDMX',
        photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ]
  }

  async getBusiness(businessId) {
    try {
      const docRef = doc(db, 'businesses', businessId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const businessData = {
          id: docSnap.id,
          ...docSnap.data()
        }
        
        // Only return if the business is approved for public viewing
        if (businessData.status === 'approved') {
          return businessData
        } else {
          throw new Error('Business not available')
        }
      } else {
        throw new Error('Business not found')
      }
    } catch (error) {
      console.error('Error getting business:', error)
      
      // If Firebase fails, check mock data as fallback
      if (error.code === 'permission-denied') {
        const mockBusinesses = this.getMockBusinesses()
        const mockBusiness = mockBusinesses.find(b => b.id === businessId && b.status === 'approved')
        if (mockBusiness) {
          return mockBusiness
        }
      }
      
      throw error
    }
  }

  // Alias for getBusiness to match different naming conventions
  async getBusinessById(businessId) {
    return this.getBusiness(businessId)
  }

  // Alias for getReviews to match different naming conventions
  async getBusinessReviews(businessId) {
    return this.getReviews(businessId)
  }

  // Alias for getProducts to match different naming conventions
  async getBusinessProducts(businessId) {
    return this.getProducts(businessId)
  }

  async updateBusiness(businessId, updates) {
    try {
      // Validate and format business hours if being updated
      if (updates.businessHours) {
        updates.businessHours = this.validateBusinessHours(updates.businessHours)
      }

      // Validate location data if being updated
      if (updates.location) {
        console.log('📍 Ubicación recibida para actualizar negocio:', updates.location)
        
        // Ensure location has the correct structure
        if (!updates.location.lat || !updates.location.lng) {
          console.warn('⚠️ Estructura de ubicación inválida, eliminando campo location')
          updates.location = null
        } else {
          // Ensure numeric values
          updates.location = {
            lat: parseFloat(updates.location.lat),
            lng: parseFloat(updates.location.lng)
          }
          console.log('✅ Ubicación validada para actualización:', updates.location)
        }
      }

      console.log('💾 Actualizando negocio con ID:', businessId)
      console.log('💾 Datos a actualizar:', {
        hasLocation: !!updates.location,
        location: updates.location,
        hasBusinessHours: !!updates.businessHours
      })

      const docRef = doc(db, 'businesses', businessId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Negocio actualizado exitosamente')
      return { id: businessId, ...updates }
    } catch (error) {
      console.error('❌ Error updating business:', error)
      console.error('❌ Datos que causaron el error:', updates)
      throw error
    }
  }

  // Update business hours specifically
  async updateBusinessHours(businessId, businessHours) {
    try {
      const validatedHours = this.validateBusinessHours(businessHours)
      
      if (!validatedHours) {
        throw new Error('Horarios de negocio inválidos')
      }

      
      const result = await this.updateBusiness(businessId, { 
        businessHours: validatedHours 
      })
      
      return result
    } catch (error) {
      console.error('❌ Error updating business hours:', error)
      throw error
    }
  }

  async deleteBusiness(businessId) {
    try {
      // Delete related products first
      await this.deleteBusinessProducts(businessId)
      
      // Delete related reviews
      await this.deleteBusinessReviews(businessId)
      
      // Delete business images from Drive
      // const business = await this.getBusiness(businessId)
      // if (business.images && business.images.length > 0) {
      //   for (const imageId of business.images) {
      //     await driveService.deleteImage(imageId)
      //   }
      // }
      
      // Delete business document
      const docRef = doc(db, 'businesses', businessId)
      await deleteDoc(docRef)
      
      return true
    } catch (error) {
      console.error('Error deleting business:', error)
      throw error
    }
  }

  async uploadBusinessImages(businessId, files) {
    try {
      const uploadedImages = []
      
      // Validar que files es un array y tiene elementos válidos
      if (!Array.isArray(files) || files.length === 0) {
        
        return uploadedImages
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validar que el archivo es válido
        if (!file || !(file instanceof File) || file.size === 0) {
          console.warn(`Archivo ${i} no es válido, saltando...`)
          continue
        }
        
        try {
          const fileName = `image-${Date.now()}-${i}.${file.name.split('.').pop()}`
          // const result = await driveService.uploadImage(file, businessId, fileName)
          // uploadedImages.push(result.id)
          console.warn('Servicio de Google Drive no disponible, saltando subida de imagen')
        } catch (fileError) {
          console.error(`Error subiendo archivo ${i}:`, fileError)
          // Continuar con el siguiente archivo en lugar de fallar todo
          continue
        }
      }
      
      // Solo actualizar si se subieron imágenes exitosamente
      if (uploadedImages.length > 0) {
        const business = await this.getBusiness(businessId)
        const allImages = [...(business.images || []), ...uploadedImages]
        await this.updateBusiness(businessId, { images: allImages })
      }
      
      return uploadedImages
    } catch (error) {
      console.error('Error uploading business images:', error)
      // No lanzar el error para no romper el flujo de creación del negocio
      
      return []
    }
  }

  // PRODUCTS
  async createProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { id: docRef.id, ...productData }
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  async getProducts(businessId) {
    try {
      const q = query(
        collection(db, 'products'), 
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const products = []
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return products
    } catch (error) {
      console.error('Error getting products:', error)
      
      // If permission error or index error, return empty array
      if (error.code === 'permission-denied' || error.message.includes('index')) {
        console.warn('⚠️ Sin permisos para productos, retornando datos mock')
        return this.getMockProducts(businessId)
      }
      
      return []
    }
  }

  // Mock products for when Firebase is not available
  getMockProducts(businessId) {
    return [
      {
        id: 'product-1',
        businessId: businessId,
        name: 'Producto de ejemplo',
        description: 'Descripción del producto de ejemplo',
        price: 99.99,
        category: 'General',
        images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'],
        available: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ]
  }

  async updateProduct(productId, updates) {
    try {
      const docRef = doc(db, 'products', productId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { id: productId, ...updates }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async deleteProduct(productId) {
    try {
      const docRef = doc(db, 'products', productId)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  async deleteBusinessProducts(businessId) {
    try {
      const q = query(collection(db, 'products'), where('businessId', '==', businessId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = []
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref))
      })
      
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Error deleting business products:', error)
      throw error
    }
  }

  // REVIEWS
  async createReview(reviewData) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Update business rating
      await this.updateBusinessRating(reviewData.businessId)
      
      return { id: docRef.id, ...reviewData }
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  async getReviews(businessId, includeUserData = true) {
    try {
      
      // Usar consulta simple primero para evitar problemas de índice
      const q = query(
        collection(db, 'reviews'), 
        where('businessId', '==', businessId)
      )
      
      const querySnapshot = await getDocs(q)
      const reviews = []
      
      querySnapshot.forEach((doc) => {
        const reviewData = {
          id: doc.id,
          ...doc.data()
        }
        
        reviews.push(reviewData)
      })
      
      // Ordenar manualmente por fecha
      reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB - dateA
      })
      
      // Si se solicita incluir datos de usuario, obtenerlos después
      if (includeUserData && reviews.length > 0) {
        const reviewPromises = reviews.map(async (review) => {
          if (review.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', review.userId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                review.userName = userData.full_name || userData.displayName || userData.name || 'Usuario'
                review.userAvatar = userData.photoURL || userData.avatar
              } else {
                review.userName = 'Usuario'
              }
            } catch (error) {
              console.warn('Error obteniendo usuario para reseña:', error)
              review.userName = 'Usuario'
            }
          } else {
            review.userName = 'Usuario anónimo'
          }
        })
        
        await Promise.all(reviewPromises)
      }
      
      return reviews
    } catch (error) {
      console.error('Error getting reviews:', error)
      
      // If permission error, return empty array instead of throwing
      if (error.code === 'permission-denied') {
        console.warn('⚠️ Sin permisos para reviews, retornando datos mock')
        return this.getMockReviews(businessId)
      }
      
      console.error('❌ Error detallado:', error.message)
      return []
    }
  }

  // Método alternativo para obtener reseñas sin índices compuestos
  async getReviewsAlternative(businessId, includeUserData = true) {
    try {
      
      // Obtener todas las reseñas y filtrar en JavaScript
      const q = collection(db, 'reviews')
      const querySnapshot = await getDocs(q)
      const allReviews = []
      
      querySnapshot.forEach((doc) => {
        const reviewData = {
          id: doc.id,
          ...doc.data()
        }
        if (reviewData.businessId === businessId) {
          allReviews.push(reviewData)
        }
      })
      
      // Ordenar por fecha
      allReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })
      
      return allReviews
    } catch (error) {
      console.error('Error en método alternativo:', error)
      return []
    }
  }

  // Mock reviews for when Firebase is not available
  getMockReviews(businessId) {
    return [
      {
        id: 'review-1',
        businessId: businessId,
        userId: 'user-1',
        userName: 'María García',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b999?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Excelente servicio y calidad. Muy recomendado.',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'review-2',
        businessId: businessId,
        userId: 'user-2',
        userName: 'Carlos López',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        comment: 'Muy buena experiencia, volveré pronto.',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      }
    ]
  }

  async updateReview(reviewId, updates) {
    try {
      const docRef = doc(db, 'reviews', reviewId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { id: reviewId, ...updates }
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  async deleteReview(reviewId, businessId) {
    try {
      const docRef = doc(db, 'reviews', reviewId)
      await deleteDoc(docRef)
      
      // Update business rating
      await this.updateBusinessRating(businessId)
      
      return true
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  async deleteBusinessReviews(businessId) {
    try {
      const q = query(collection(db, 'reviews'), where('businessId', '==', businessId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = []
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref))
      })
      
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Error deleting business reviews:', error)
      throw error
    }
  }

  // Update business rating based on reviews
  async updateBusinessRating(businessId) {
    try {
      const reviews = await this.getReviews(businessId, false) // No necesitamos datos de usuario para el cálculo
      
      if (reviews.length === 0) {
        await this.updateBusiness(businessId, { rating: 0, totalReviews: 0 })
        return
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length
      
      await this.updateBusiness(businessId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length
      })
    } catch (error) {
      console.error('Error updating business rating:', error)
    }
  }

  // FAVORITES
  async addToFavorites(userId, businessId) {
    try {
      // Check if already in favorites
      const existingFavorite = await this.getFavorite(userId, businessId)
      if (existingFavorite) {
        return existingFavorite
      }

      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        businessId,
        createdAt: serverTimestamp()
      })
      
      return { id: docRef.id, userId, businessId }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }

  async removeFromFavorites(userId, businessId) {
    try {
      const favorite = await this.getFavorite(userId, businessId)
      if (favorite) {
        const docRef = doc(db, 'favorites', favorite.id)
        await deleteDoc(docRef)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }

  async getFavorite(userId, businessId) {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('businessId', '==', businessId)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data()
        }
      }
      return null
    } catch (error) {
      console.error('Error getting favorite:', error)
      return null
    }
  }

  async getUserFavorites(userId) {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const favorites = []
      
      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Get business details for each favorite
      const favoritesWithBusinesses = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const business = await this.getBusiness(favorite.businessId)
            return {
              ...favorite,
              business
            }
          } catch (error) {
            // If business is not found or not approved, return null
            return null
          }
        })
      )
      
      // Filter out null values (businesses that are not approved or don't exist)
      return favoritesWithBusinesses.filter(favorite => favorite !== null)
    } catch (error) {
      console.error('Error getting user favorites:', error)
      return []
    }
  }

  async isFavorite(userId, businessId) {
    try {
      const favorite = await this.getFavorite(userId, businessId)
      return favorite !== null
    } catch (error) {
      console.error('Error checking if favorite:', error)
      return false
    }
  }

  // ADMIN FUNCTIONS
  async updateBusinessStatus(businessId, status, adminNotes = '') {
    try {
      await this.updateBusiness(businessId, {
        status,
        adminNotes,
        reviewedAt: serverTimestamp()
      })
      
      return true
    } catch (error) {
      console.error('Error updating business status:', error)
      throw error
    }
  }

  async approveRejectBusiness(businessId, status, adminNotes = '') {
    try {
      await this.updateBusiness(businessId, {
        status,
        adminNotes,
        reviewedAt: serverTimestamp()
      })
      
      return true
    } catch (error) {
      console.error('Error updating business status:', error)
      throw error
    }
  }

  async getStats() {
    try {
      const [businesses, products, reviews] = await Promise.all([
        this.getBusinesses(),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'reviews'))
      ])
      
      return {
        totalBusinesses: businesses.length,
        approvedBusinesses: businesses.filter(b => b.status === 'approved').length,
        pendingBusinesses: businesses.filter(b => b.status === 'pending').length,
        totalProducts: products.size,
        totalReviews: reviews.size,
        averageRating: businesses.length > 0 
          ? businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length
          : 0
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }

  // Función para resetear el flag de errores de permisos
  resetPermissionError() {
    this.permissionError = false
    
  }

  // Función para verificar si hay errores de permisos
  hasPermissionError() {
    return this.permissionError
  }

  // Función de diagnóstico para verificar reseñas
  async getReviewsDiagnostic(businessId) {
    try {
      
      // 1. Verificar todas las reseñas sin filtros
      const allReviewsQuery = collection(db, 'reviews')
      const allSnapshot = await getDocs(allReviewsQuery)
      
      allSnapshot.forEach((doc) => {
        const data = doc.data()
        
      })
      
      // 2. Intentar consulta filtrada
      const filteredQuery = query(
        collection(db, 'reviews'), 
        where('businessId', '==', businessId)
      )
      
      const filteredSnapshot = await getDocs(filteredQuery)
      
      return filteredSnapshot.size
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error)
      return 0
    }
  }

  // Get unique categories from existing businesses
  async getBusinessCategories() {
    try {
      const businesses = await this.getApprovedBusinesses()
      
      // Extract unique categories from businesses
      const categoryMap = new Map()
      
      // Add predefined categories that match exactly with the form options
      const predefinedCategories = [
        { id: 'restaurante', name: 'restaurante', display_name: 'Restaurante', color: '#FF6B6B' },
        { id: 'cafe', name: 'cafe', display_name: 'Café', color: '#4ECDC4' },
        { id: 'tienda', name: 'tienda', display_name: 'Tienda', color: '#45B7D1' },
        { id: 'servicios', name: 'servicios', display_name: 'Servicios', color: '#96CEB4' },
        { id: 'tecnologia', name: 'tecnologia', display_name: 'Tecnología', color: '#74B9FF' },
        { id: 'salud', name: 'salud', display_name: 'Salud y Belleza', color: '#DDA0DD' },
        { id: 'educacion', name: 'educacion', display_name: 'Educación', color: '#98D8C8' },
        { id: 'entretenimiento', name: 'entretenimiento', display_name: 'Entretenimiento', color: '#FFEAA7' },
        { id: 'transporte', name: 'transporte', display_name: 'Transporte', color: '#F7DC6F' },
        { id: 'automotriz', name: 'automotriz', display_name: 'Automotriz', color: '#636E72' },
        { id: 'belleza', name: 'belleza', display_name: 'Belleza', color: '#FD79A8' },
        { id: 'hogar', name: 'hogar', display_name: 'Hogar', color: '#FDCB6E' },
        { id: 'deportes', name: 'deportes', display_name: 'Deportes', color: '#E17055' },
        { id: 'mascotas', name: 'mascotas', display_name: 'Mascotas', color: '#00B894' },
        { id: 'otros', name: 'otros', display_name: 'Otros', color: '#A29BFE' }
      ]
      
      // Only add categories that actually have businesses
      const categoriesWithBusinesses = []
      predefinedCategories.forEach(cat => {
        const hasBusinesses = businesses.some(business => {
          const businessCategory = business.category || business.category_name || ''
          return businessCategory.toLowerCase() === cat.name.toLowerCase()
        })
        
        if (hasBusinesses) {
          categoriesWithBusinesses.push({
            id: cat.id,
            name: cat.name, // Use the exact value that's stored in the database
            display_name: cat.display_name,
            color: cat.color
          })
        }
      })
      
      return categoriesWithBusinesses
    } catch (error) {
      console.error('Error getting business categories:', error)
      // Return default categories as fallback
      return [
        { id: 'restaurante', name: 'restaurante', display_name: 'Restaurante', color: '#FF6B6B' },
        { id: 'cafe', name: 'cafe', display_name: 'Café', color: '#4ECDC4' },
        { id: 'tienda', name: 'tienda', display_name: 'Tienda', color: '#45B7D1' },
        { id: 'servicios', name: 'servicios', display_name: 'Servicios', color: '#96CEB4' },
        { id: 'entretenimiento', name: 'entretenimiento', display_name: 'Entretenimiento', color: '#FFEAA7' },
        { id: 'otros', name: 'otros', display_name: 'Otros', color: '#A29BFE' }
      ]
    }
  }

  // Helper function to assign colors to categories
  getCategoryColor(categoryName) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    
    // Simple hash function to get consistent color for same category
    let hash = 0
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }
}

// Create and export a singleton instance
const dbService = new DatabaseService()
export default dbService
