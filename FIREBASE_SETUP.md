# 🔥 Configuración de Firebase para ChapaShop

## 📋 Pasos para Solucionar los Errores de Permisos

### 1. 🌐 Ir a la Consola de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **chapashop-80392**

### 2. 🔒 Configurar Reglas de Firestore (SOLUCIÓN PARA REVIEWS)

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en la pestaña **Reglas**
3. **Copia y pega estas reglas exactas:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Negocios - lectura pública para todos, escritura solo para dueños/admin
    match /businesses/{businessId} {
      allow read: if true; // Lectura pública
      allow create: if request.auth != null; // Solo usuarios autenticados pueden crear
      allow update, delete: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Reviews - usuarios autenticados pueden crear, todos pueden leer
    match /reviews/{reviewId} {
      allow read: if true; // Lectura pública
      allow create: if request.auth != null; // Solo usuarios autenticados pueden crear
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Favorites - solo el dueño puede leer/escribir sus favoritos
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Products - lectura pública, escritura solo admin
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

4. Haz clic en **Publicar**

### 2.1. 🔒 Reglas Simplificadas (Si las anteriores no funcionan)

Si las reglas anteriores dan error, usa estas reglas más simples temporalmente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas temporales para desarrollo - PERMITEN ACCESO COMPLETO
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Haz clic en **Publicar**

⚠️ **IMPORTANTE**: Estas reglas permiten acceso completo y son SOLO para desarrollo. En producción debes usar reglas más restrictivas.

### 3. 🔒 Reglas de Producción Recomendadas (Para más tarde)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Negocios - lectura pública, escritura solo para dueños
    match /businesses/{businessId} {
      allow read: if true; // Lectura pública
      allow create: if request.auth != null; // Solo usuarios autenticados pueden crear
      allow update, delete: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 4. 🔑 Configurar Authentication (Si no está configurado)

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Comenzar**
3. En la pestaña **Método de acceso**, habilita:
   - ✅ **Correo electrónico/contraseña**
   - ✅ **Google** (opcional)

### 5. 🏗️ Crear Colecciones Iniciales

Después de configurar las reglas, puedes:

1. **Usar el botón "Crear Datos en Firebase"** en la página de login
2. **O crear manualmente** las colecciones en Firestore Console:
   - `users` (para perfiles de usuario)
   - `businesses` (para negocios)

### 6. 🧪 Modo de Prueba Actual

Mientras configuras Firebase, puedes usar el botón **"Usar Datos Mock"** en la página de login para probar la aplicación con datos locales.

## 🚀 Estado Actual de tu Configuración

✅ **Credenciales Firebase**: Configuradas correctamente
✅ **Variables de entorno**: Actualizadas
✅ **Servicios habilitados**: Auth, Firestore, Storage, Analytics
❌ **Reglas de Firestore**: Necesitan actualización (causa de los errores)

## 🚨 Solución de Errores Comunes

### Error: "onLocationChange is not a function"
✅ **Solucionado**: El `LocationPicker` ahora valida que la función esté definida correctamente.

### Error: Google Drive 401 Unauthorized
✅ **Solucionado**: Google Drive es opcional en desarrollo. La app usa imágenes de demo automáticamente.

### Error: createObjectURL failed
✅ **Solucionado**: Mejorado el manejo de archivos en modo demo.

### Error: Firestore Bad Request 400
⚠️ **Pendiente**: Necesitas publicar las reglas de Firestore (ver arriba).

## 🚨 SOLUCIÓN PARA ERRORES DE PERMISOS EN REVIEWS

### Problema Detectado
Los usuarios están obteniendo errores "Missing or insufficient permissions" al intentar:
- Crear comentarios/reviews
- Leer comentarios existentes

### ✅ Solución Rápida

1. **Ve a Firebase Console**: https://console.firebase.google.com/
2. **Selecciona tu proyecto**: chapashop-80392
3. **Ve a Firestore Database** → **Reglas**
4. **Reemplaza todo el contenido** con estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMITE ACCESO COMPLETO TEMPORALMENTE PARA DESARROLLO
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. **Haz clic en "Publicar"**
6. **Espera 30 segundos** para que las reglas se propaguen
7. **Recarga la página** de tu aplicación

### 🔧 Verificación

Después de aplicar las reglas, puedes verificar que funcionen:

1. Inicia sesión como usuario normal (no admin)
2. Ve a cualquier negocio
3. Intenta crear un comentario
4. Verifica que aparezca en la lista de comentarios

### ⚠️ Importante para Producción

**Estas reglas permiten acceso completo y son SOLO para desarrollo/testing.**

Para producción, usa reglas más restrictivas como las que están documentadas más arriba en este archivo.

### 🐛 Si el problema persiste

1. **Verifica que estés autenticado**: Asegúrate de haber iniciado sesión
2. **Revisa la consola del navegador**: Busca errores de red o autenticación
3. **Verifica las variables de entorno**: Asegúrate de que `.env` tenga las credenciales correctas de Firebase

## 🔧 Estado de los Servicios

| Servicio | Estado | Configuración Requerida |
|----------|--------|------------------------|
| 🔥 Firebase Auth | ✅ Configurado | Variables de entorno |
| 🗄️ Firestore | ⚠️ Reglas pendientes | Publicar reglas |
| 🌍 Google Drive | 📦 Modo demo | Opcional |
| 🗺️ LocationPicker | ✅ Funcional | Ninguna |

## 🔧 Comandos de Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Ver la aplicación
http://localhost:5173
```

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que las reglas se hayan publicado correctamente
2. Espera 1-2 minutos para que los cambios se propaguen
3. Recarga la página y prueba de nuevo
4. Usa los datos mock mientras configuras Firebase
