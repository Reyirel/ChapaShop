# 🔥 Configuración de Firebase para ChapaShop

## 📋 Pasos para Solucionar los Errores de Permisos

### 1. 🌐 Ir a la Consola de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **chapashop-80392**

### 2. 🔒 Configurar Reglas de Firestore (Temporalmente para Desarrollo)

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en la pestaña **Reglas**
3. Reemplaza las reglas actuales con estas reglas de desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas temporales para desarrollo - CAMBIAR EN PRODUCCIÓN
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
