import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import dbService from '../services/database'
import { 
  ArrowLeft,
  MapPin, 
  Phone, 
  Globe,
  Star, 
  Clock, 
  Heart,
  Share2,
  MessageCircle,
  Facebook,
  Instagram,
  ExternalLink,
  Calendar,
  Camera,
  Users,
  Award,
  CheckCircle,
  Send
} from 'lucide-react'

// Function to get appropriate image for each category
const getCategoryImage = (categoryName) => {
  const categoryImages = {
    'Restaurante': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Imagen personalizada de comida
    'Café': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Imagen personalizada de comida
    'Tienda': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Imagen personalizada de tienda
    'Servicio': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Imagen personalizada de servicio
    'Entretenimiento': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Imagen personalizada de entretenimiento
    'Salud y Belleza': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Imagen personalizada de salud y belleza
    'Educación': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Imagen personalizada de educación
    'Transporte': 'https://i.pinimg.com/736x/c3/c4/03/c3c403673f9e4ab5ec3c5b5d6e0a1279.jpg', // Imagen personalizada de transporte
    'Librería': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Usar imagen de educación
    'Peluquería': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Bar': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Usar imagen de comida
    'Hotel': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Gimnasio': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Consultoría': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Tecnología': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Arte': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Usar imagen de entretenimiento
    'Deporte': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Viajes': 'https://i.pinimg.com/736x/c3/c4/03/c3c403673f9e4ab5ec3c5b5d6e0a1279.jpg', // Usar imagen de transporte
    'Música': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Usar imagen de entretenimiento
    'Fotografía': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Farmacia': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Automotriz': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Construcción': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Inmobiliaria': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Financiero': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Legal': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Veterinaria': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Florería': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Joyería': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Panadería': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Usar imagen de comida
    'Supermercado': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Ropa': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Electrónicos': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Muebles': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Jardín': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Mascotas': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Libros': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Usar imagen de educación
    'Zapatos': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Juguetes': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Deportes': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Cocina': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Limpieza': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg' // Usar imagen de tienda
  }
  
  return categoryImages[categoryName] || 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg' // Imagen por defecto de servicio
}

const NegocioDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [negocio, setNegocio] = useState(null)
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  
  // Estados para nueva reseña
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener datos del negocio con relaciones
        const negocioData = await dbService.getBusinessById(id)

        if (!negocioData) {
          throw new Error('Negocio no encontrado')
        }

        // Obtener reseñas (manejar errores silenciosamente)
        let reviewsData = []
        try {
          
          reviewsData = await dbService.getBusinessReviews(id)
          
        } catch (error) {
          console.error('❌ Error al cargar reseñas:', error)
          console.error('Detalles del error:', error.message)
          reviewsData = []
        }

        // Los productos ahora están almacenados como cadena en el negocio
        const productsData = negocioData.products ? negocioData.products.split(', ').filter(p => p.trim()) : []

        // Calcular rating promedio
        const avgRating = reviewsData?.length > 0 
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
          : 0

        // Establecer datos
        setNegocio({
          ...negocioData,
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: reviewsData?.length || 0
        })
        setReviews(reviewsData || [])
        setProducts(productsData || [])
        setLoading(false)

        // Verificar si el negocio está en favoritos
        if (user) {
          try {
            const favoriteStatus = await dbService.isFavorite(user.uid, id)
            setIsFavorite(favoriteStatus)
          } catch (error) {
            console.error('Error checking favorite status:', error)
          }
        }

      } catch (error) {
        console.error('Error fetching negocio:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const formatBusinessHours = (hours) => {
    if (!hours || typeof hours !== 'object') return []
    
    const dayNames = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }

    return Object.entries(hours).map(([day, data]) => ({
      day: dayNames[day] || day,
      ...data
    }))
  }

  const shareNegocio = () => {
    if (navigator.share) {
      navigator.share({
        title: negocio.name,
        text: negocio.description,
        url: window.location.href,
      })
    }
  }

  const handleRatingClick = (rating) => {
    setNewReview(prev => ({ ...prev, rating }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Debes iniciar sesión para escribir una reseña')
      return
    }

    if (newReview.rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    if (!newReview.comment.trim()) {
      alert('Por favor escribe un comentario')
      return
    }

    setSubmittingReview(true)

    try {
      
      
      await dbService.createReview({
        businessId: id,
        userId: user.uid,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      })

      // Recargar reseñas
      const updatedReviews = await dbService.getBusinessReviews(id)
      setReviews(updatedReviews || [])
      
      // Actualizar rating promedio
      const avgRating = updatedReviews?.length > 0 
        ? updatedReviews.reduce((sum, review) => sum + review.rating, 0) / updatedReviews.length 
        : 0

      setNegocio(prev => ({
        ...prev,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: updatedReviews?.length || 0
      }))

      // Limpiar formulario
      setNewReview({ rating: 0, comment: '' })
      
      alert('¡Reseña enviada exitosamente!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar la reseña. Por favor intenta de nuevo.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar favoritos')
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        await dbService.removeFromFavorites(user.uid, id)
        setIsFavorite(false)
      } else {
        await dbService.addToFavorites(user.uid, id)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error al actualizar favoritos. Inténtalo de nuevo.')
    } finally {
      setLoadingFavorite(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ecf8e] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    )
  }

  if (!negocio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Negocio no encontrado</h2>
          <p className="text-gray-600 mb-6">El negocio que buscas no existe o no está disponible</p>
          <Link 
            to="/negocios" 
            className="inline-flex items-center gap-2 bg-[#3ecf8e] text-white px-6 py-3 rounded-lg hover:bg-[#2dd4bf] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Negocios
          </Link>
        </div>
      </div>
    )
  }

  const businessHours = formatBusinessHours(negocio.businessHours || negocio.business_hours)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative h-96 bg-white shadow-sm">
        <img 
          src={
            negocio.image_url || 
            negocio.images?.[0] || 
            negocio.imageUrl || 
            getCategoryImage(negocio.business_categories?.name || negocio.category || 'Servicio')
          } 
          alt={negocio.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Navigation */}
        <div className="absolute top-4 left-4">
          <Link 
            to="/negocios"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavoriteToggle}
            disabled={loadingFavorite}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            } ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={shareNegocio}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              {negocio.business_categories && (
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: negocio.business_categories.color }}
                >
                  {negocio.business_categories.name}
                </span>
              )}
              {negocio.reviewCount > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {negocio.avgRating} ({negocio.reviewCount} reseñas)
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{negocio.name}</h1>
            <p className="text-xl opacity-90">{negocio.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'info', label: 'Información', icon: MapPin },
              { id: 'reviews', label: 'Reseñas', icon: Star },
              { id: 'products', label: 'Productos', icon: Camera }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Información Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contacto */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-indigo-600" />
                      Contacto
                    </h3>
                    
                    <div className="space-y-3">
                      {negocio.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${negocio.phone}`} className="text-indigo-600 hover:underline">
                            {negocio.phone}
                          </a>
                        </div>
                      )}
                      
                      {negocio.email && (
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${negocio.email}`} className="text-indigo-600 hover:underline">
                            {negocio.email}
                          </a>
                        </div>
                      )}

                      {negocio.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a 
                            href={negocio.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            Sitio web
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {negocio.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {negocio.address}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Redes Sociales */}
                    <div className="flex gap-3 pt-3">
                      {negocio.facebook && (
                        <a 
                          href={negocio.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {negocio.instagram && (
                        <a 
                          href={negocio.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      Horarios de Atención
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      {businessHours.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4">Horarios no disponibles</p>
                      ) : (
                        <div className="grid gap-3">
                          {businessHours.map((hour, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                              <span className="text-gray-700 font-medium">{hour.day}</span>
                              <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                                hour.time === 'Cerrado' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {hour.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reseñas Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Formulario para nueva reseña */}
                {user && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Escribir una reseña</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Calificación
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingClick(star)}
                              className={`h-8 w-8 ${
                                star <= newReview.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            >
                              <Star className="h-full w-full" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comentario
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Comparte tu experiencia con este negocio..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                          maxLength={500}
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          {newReview.comment.length}/500 caracteres
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submittingReview || newReview.rating === 0 || !newReview.comment.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar reseña
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {!user && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-3">Inicia sesión para escribir una reseña</p>
                    <Link 
                      to="/login" 
                      className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}

                {/* Lista de reseñas existentes */}
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay reseñas disponibles</p>
                    <p className="text-gray-400 text-sm mt-2">¡Sé el primero en escribir una reseña!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Reseñas ({reviews.length})
                    </h3>
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {review.userName || 'Usuario anónimo'}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Productos Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay productos disponibles</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-indigo-600" />
                      Productos y Servicios
                    </h3>
                    <div className="grid gap-3">
                      {products.map((product, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                          </div>
                          <span className="text-gray-800 font-medium">{product}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {negocio.phone && (
            <a
              href={`tel:${negocio.phone}`}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Llamar
            </a>
          )}
          
          {negocio.whatsapp && (
            <a
              href={`https://wa.me/${negocio.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <img src="/whatsapp-icon.svg" alt="WhatsApp" className="h-5 w-5" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default NegocioDetail
