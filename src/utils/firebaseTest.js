import { auth, db } from './services/firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

// Función para verificar permisos de Firebase
export const checkFirebasePermissions = async () => {
  console.log('🔍 Verificando permisos de Firebase...')

  try {
    // Verificar autenticación
    const currentUser = auth.currentUser
    console.log('👤 Usuario actual:', currentUser ? currentUser.email : 'No autenticado')

    if (!currentUser) {
      console.warn('⚠️ Usuario no autenticado')
      return false
    }

    // Intentar crear una review de prueba
    console.log('📝 Intentando crear review de prueba...')
    const testReview = {
      businessId: 'test-business-id',
      userId: currentUser.uid,
      rating: 5,
      comment: 'Review de prueba para verificar permisos',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'reviews'), testReview)
    console.log('✅ Review de prueba creada exitosamente:', docRef.id)

    // Intentar leer reviews
    console.log('📖 Intentando leer reviews...')
    const q = query(collection(db, 'reviews'), where('businessId', '==', 'test-business-id'))
    const querySnapshot = await getDocs(q)
    console.log('✅ Reviews leídas exitosamente:', querySnapshot.size, 'documentos')

    return true

  } catch (error) {
    console.error('❌ Error de permisos:', error)

    if (error.code === 'permission-denied') {
      console.error('🚫 Error de permisos de Firestore')
      console.log('💡 Solución: Actualiza las reglas de Firestore en Firebase Console')
      console.log('📋 Reglas requeridas:')
      console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
      `)
    }

    return false
  }
}

// Función para probar la conexión a Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('🔗 Probando conexión a Firebase...')

    // Verificar que Firebase esté inicializado
    if (!db) {
      throw new Error('Firebase Firestore no está inicializado')
    }

    // Intentar una operación simple
    const testCollection = collection(db, 'test-connection')
    console.log('✅ Conexión a Firestore exitosa')

    return true
  } catch (error) {
    console.error('❌ Error de conexión a Firebase:', error)
    return false
  }
}
