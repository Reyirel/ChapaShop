// Google Drive service for image storage
class GoogleDriveService {
  constructor() {
    // En desarrollo, Google Drive es opcional
    this.isDevelopment = import.meta.env.DEV
    this.isConfigured = false
    
    // Solo intentar configurar Google Drive si tenemos las variables necesarias
    if (import.meta.env.VITE_GOOGLE_DRIVE_API_KEY && import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID) {
      this.apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY
      this.folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID
      this.isConfigured = true
    } else {
      console.warn('🔧 Google Drive no configurado - usando modo demo')
    }
  }

  // Check if Google Drive is properly configured
  isGoogleDriveEnabled() {
    return this.isConfigured && !this.isDevelopment
  }

  // Get access token (for client-side operations)
  async getAccessToken() {
    // This would typically be handled by Google Auth
    // For now, we'll use a service account approach
    return this.apiKey
  }

  // Upload image to Google Drive
  async uploadImage(file, businessId, fileName) {
    // Si no está configurado o estamos en desarrollo, usar mock directamente
    if (!this.isConfigured || this.isDevelopment) {
      console.log('📦 Usando modo demo para imágenes')
      return this.mockUpload(file, fileName)
    }
    
    try {
      const accessToken = await this.getAccessToken()
      
      // Create a folder for the business if it doesn't exist
      const businessFolderId = await this.createBusinessFolder(businessId, accessToken)
      
      // Prepare form data
      const formData = new FormData()
      const metadata = {
        name: fileName,
        parents: [businessFolderId]
      }
      
      formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}))
      formData.append('file', file)
      
      const response = await fetch(`${this.uploadUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Make the file public for viewing
      await this.makeFilePublic(result.id, accessToken)
      
      return {
        id: result.id,
        name: result.name,
        viewUrl: `https://drive.google.com/file/d/${result.id}/view`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${result.id}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${result.id}&sz=w400-h300`
      }
    } catch (error) {
      console.error('Error uploading to Google Drive:', error)
      console.log('🔄 Fallback: usando modo demo')
      return this.mockUpload(file, fileName)
    }
  }

  // Mock upload for demo mode
  mockUpload(file, fileName) {
    const fakeId = Math.random().toString(36).substr(2, 9)
    
    // Verificar si file es realmente un objeto File o Blob válido
    let objectUrl
    try {
      if (file && (file instanceof File || file instanceof Blob) && file.size > 0) {
        objectUrl = URL.createObjectURL(file)
      } else {
        console.warn('File no válido para createObjectURL, usando placeholder')
        // Si no es un File válido, crear una URL de placeholder
        objectUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBkZSBkZW1vPC90ZXh0Pjwvc3ZnPg==`
      }
    } catch (error) {
      console.error('Error creating object URL:', error)
      objectUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBkZSBkZW1vPC90ZXh0Pjwvc3ZnPg==`
    }
    
    return {
      id: fakeId,
      name: fileName,
      viewUrl: objectUrl,
      downloadUrl: objectUrl,
      thumbnailUrl: objectUrl
    }
  }

  // Create a folder for business images
  async createBusinessFolder(businessId, accessToken) {
    try {
      // Check if folder already exists
      const searchResponse = await fetch(
        `${this.baseUrl}/files?q=name='business-${businessId}' and parents in '${this.folderId}' and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      const searchResult = await searchResponse.json()
      
      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id
      }
      
      // Create new folder
      const folderMetadata = {
        name: `business-${businessId}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      }
      
      const createResponse = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(folderMetadata)
      })
      
      const createResult = await createResponse.json()
      return createResult.id
    } catch (error) {
      console.error('Error creating business folder:', error)
      // Fallback to main folder
      return this.folderId
    }
  }

  // Make file publicly accessible
  async makeFilePublic(fileId, accessToken) {
    try {
      const permission = {
        role: 'reader',
        type: 'anyone'
      }
      
      await fetch(`${this.baseUrl}/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permission)
      })
    } catch (error) {
      console.error('Error making file public:', error)
    }
  }

  // Get image URL for rendering
  getImageUrl(fileId, size = 'w400-h300') {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`
  }

  // Delete image from Drive
  async deleteImage(fileId) {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  // List images for a business
  async getBusinessImages(businessId) {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(
        `${this.baseUrl}/files?q=parents in '${this.folderId}' and name contains 'business-${businessId}'&fields=files(id,name,thumbnailLink)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      const result = await response.json()
      return result.files || []
    } catch (error) {
      console.error('Error getting business images:', error)
      return []
    }
  }
}

// Fallback service for when Google Drive is not configured
class MockDriveService {
  async uploadImage(file, businessId, fileName) {
    // Create a fake URL for demo purposes
    const fakeId = Math.random().toString(36).substr(2, 9)
    return {
      id: fakeId,
      name: fileName,
      viewUrl: URL.createObjectURL(file),
      downloadUrl: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file)
    }
  }

  async deleteImage() {
    return true
  }

  getImageUrl(fileId) {
    return `https://via.placeholder.com/400x300?text=Demo+Image+${fileId}`
  }

  async getBusinessImages() {
    return []
  }
}

// Export the appropriate service based on configuration
const driveService = import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID
  ? new GoogleDriveService()
  : new MockDriveService()

export default driveService
