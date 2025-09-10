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
      const docRef = await addDoc(collection(db, 'businesses'), {
        ...businessData,
        status: 'pending',
        images: [],
        rating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { id: docRef.id, ...businessData }
    } catch (error) {
      console.error('Error creating business:', error)
      throw error
    }
  }

  async getBusinesses(filters = {}) {
    try {
      let q = collection(db, 'businesses')
      
      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.ownerId) {
        q = query(q, where('ownerId', '==', filters.ownerId))
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'))
      
      // Apply limit if specified
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }
      
      const querySnapshot = await getDocs(q)
      const businesses = []
      
      querySnapshot.forEach((doc) => {
        businesses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return businesses
    } catch (error) {
      console.error('Error getting businesses:', error)
      throw error
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
      const result = await this.getBusinesses()
      // Si llegamos aquí, los permisos están funcionando
      this.permissionError = false
      return result
    } catch (error) {
      // Si hay errores de permisos, marcar flag y usar datos mock
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('⚠️ Permisos insuficientes, usando datos mock')
        this.permissionError = true
        return this.getMockBusinesses()
      }
      throw error
    }
  }

  // Función para retornar datos mock cuando hay problemas de permisos
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
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Business not found')
      }
    } catch (error) {
      console.error('Error getting business:', error)
      throw error
    }
  }

  async updateBusiness(businessId, updates) {
    try {
      const docRef = doc(db, 'businesses', businessId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { id: businessId, ...updates }
    } catch (error) {
      console.error('Error updating business:', error)
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
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `image-${Date.now()}-${i}.${file.name.split('.').pop()}`
        
        const result = await driveService.uploadImage(file, businessId, fileName)
        uploadedImages.push(result.id)
      }
      
      // Update business with new image IDs
      const business = await this.getBusiness(businessId)
      const allImages = [...(business.images || []), ...uploadedImages]
      
      await this.updateBusiness(businessId, { images: allImages })
      
      return uploadedImages
    } catch (error) {
      console.error('Error uploading business images:', error)
      throw error
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
      throw error
    }
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
      throw error
    }
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

  // SEARCH AND FILTERS
  async searchBusinesses(searchTerm, filters = {}) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation. For production, consider using Algolia or similar
      let businesses = await this.getBusinesses({ status: 'approved', ...filters })
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        businesses = businesses.filter(business => 
          business.name.toLowerCase().includes(term) ||
          business.description?.toLowerCase().includes(term) ||
          business.category?.toLowerCase().includes(term) ||
          business.address?.toLowerCase().includes(term)
        )
      }
      
      return businesses
    } catch (error) {
      console.error('Error searching businesses:', error)
      throw error
    }
  }

  // ADMIN FUNCTIONS
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
