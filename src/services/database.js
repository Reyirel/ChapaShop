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
import driveService from './googleDrive'

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

  // BUSINESSES
  async createBusiness(businessData) {
    try {
      // Validate and format business hours if provided
      if (businessData.businessHours) {
        businessData.businessHours = this.validateBusinessHours(businessData.businessHours)
      }

      console.log('💾 Guardando negocio con datos:', businessData)
      
      const docRef = await addDoc(collection(db, 'businesses'), {
        ...businessData,
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Negocio guardado con ID:', docRef.id)
      return { id: docRef.id, ...businessData }
    } catch (error) {
      console.error('❌ Error creating business:', error)
      throw error
    }
  }

  // Validate and format business hours
  validateBusinessHours(hours) {
    if (!hours || typeof hours !== 'object') {
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
        // Default values for missing days
        validatedHours[day] = {
          open: '09:00',
          close: '18:00',
          closed: true
        }
      }
    })

    console.log('📅 Horarios validados:', validatedHours)
    return validatedHours
  }

  async getBusinesses(filters = {}) {
    try {
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
      
      return businesses
    } catch (error) {
      console.error('Error getting businesses:', error)
      
      // Si es un error de índice y tenemos filtros, intentar una consulta más simple
      if (error.message.includes('index') && filters.ownerId) {
        console.log('⚠️ Error de índice detectado, usando consulta simplificada')
        return this.getBusinessesSimple(filters)
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
      return await this.getBusinesses({ status: 'approved' })
    } catch (error) {
      console.error('Error getting approved businesses:', error)
      return []
    }
  }

  // Alias para obtener todos los negocios sin filtros
  async getAllBusinesses() {
    // Si ya sabemos que hay errores de permisos, usar datos mock directamente
    if (this.permissionError) {
      console.log('📦 Usando datos mock (permisos previamente denegados)')
      return this.getMockBusinesses()
    }

    try {
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
        
        this.permissionError = false
        return businesses
      } catch {
        // Si hay error con orderBy, hacer consulta simple
        console.log('⚠️ Error con orderBy, usando consulta simple')
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
        
        this.permissionError = false
        return businesses
      }
    } catch (error) {
      // Si hay errores de permisos, marcar flag y usar datos mock
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('⚠️ Permisos insuficientes, usando datos mock')
        this.permissionError = true
        return this.getMockBusinesses()
      }
      
      // Si hay errores de índice u otros, también usar mock como fallback
      if (error.message.includes('index') || error.message.includes('requires an index')) {
        console.warn('⚠️ Error de índice, usando datos mock como fallback')
        return this.getMockBusinesses()
      }
      
      throw error
    }
  }

  // Función especial para obtener negocios del usuario sin problemas de índice
  async getUserBusinesses(ownerId) {
    try {
      console.log('🔍 Obteniendo negocios para owner:', ownerId)
      
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
      
      console.log('✅ Negocios encontrados:', businesses.length)
      return businesses
    } catch (error) {
      console.error('Error getting user businesses:', error)
      
      // Si hay problemas, devolver array vacío en lugar de lanzar error
      if (error.message.includes('index') || error.code === 'permission-denied') {
        console.log('⚠️ Usando fallback debido a error de índice/permisos')
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
        console.log('📅 Actualizando horarios del negocio:', businessId, updates.businessHours)
      }

      const docRef = doc(db, 'businesses', businessId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Negocio actualizado:', businessId)
      return { id: businessId, ...updates }
    } catch (error) {
      console.error('❌ Error updating business:', error)
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

      console.log('📅 Actualizando horarios específicamente para negocio:', businessId)
      
      const result = await this.updateBusiness(businessId, { 
        businessHours: validatedHours 
      })
      
      console.log('✅ Horarios actualizados exitosamente')
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
      const business = await this.getBusiness(businessId)
      if (business.images && business.images.length > 0) {
        for (const imageId of business.images) {
          await driveService.deleteImage(imageId)
        }
      }
      
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
        console.log('No hay archivos válidos para subir')
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
          const result = await driveService.uploadImage(file, businessId, fileName)
          uploadedImages.push(result.id)
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
      console.log('⚠️ Continuando sin imágenes debido a errores en la subida')
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

  async getReviews(businessId) {
    try {
      const q = query(
        collection(db, 'reviews'), 
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const reviews = []
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return reviews
    } catch (error) {
      console.error('Error getting reviews:', error)
      
      // If permission error, return empty array instead of throwing
      if (error.code === 'permission-denied') {
        console.warn('⚠️ Sin permisos para reviews, retornando datos mock')
        return this.getMockReviews(businessId)
      }
      
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
      const reviews = await this.getReviews(businessId)
      
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
    console.log('🔄 Flag de permisos reseteado - se intentará usar Firebase nuevamente')
  }

  // Función para verificar si hay errores de permisos
  hasPermissionError() {
    return this.permissionError
  }
}

// Create and export a singleton instance
const dbService = new DatabaseService()
export default dbService
