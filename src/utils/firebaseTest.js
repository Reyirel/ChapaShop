import { auth, db } from './services/firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

// Función para verificar permisos de Firebase
export const checkFirebasePermissions = async () => {

  try {
    // Verificar autenticación
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('⚠️ Usuario no autenticado')
      return false
    }

    // Intentar crear una review de prueba
    const testReview = {
      businessId: 'test-business-id',
      userId: currentUser.uid,
      rating: 5,
      comment: 'Review de prueba para verificar permisos',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'reviews'), testReview)

    // Intentar leer reviews
    const q = query(collection(db, 'reviews'), where('businessId', '==', 'test-business-id'))
    const querySnapshot = await getDocs(q)

    return true

  } catch (error) {
    console.error('❌ Error de permisos:', error)

    if (error.code === 'permission-denied') {
      console.error('🚫 Error de permisos de Firestore')

    }

    return false
  }
}

// Función para probar la conexión a Firebase
export const testFirebaseConnection = async () => {
  try {

    // Verificar que Firebase esté inicializado
    if (!db) {
      throw new Error('Firebase Firestore no está inicializado')
    }

    // Intentar una operación simple
    const testCollection = collection(db, 'test-connection')

    return true
  } catch (error) {
    console.error('❌ Error de conexión a Firebase:', error)
    return false
  }
}
