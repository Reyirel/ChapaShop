import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  CheckCircle
} from 'lucide-react'

const NegocioDetail = () => {
  const { id } = useParams()
  const [negocio, setNegocio] = useState(null)
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener datos del negocio con relaciones
        const negocioData = await dbService.getBusinessById(id)

        if (!negocioData) {
          throw new Error('Negocio no encontrado')
        }

        // Obtener reseñas
        const reviewsData = await dbService.getBusinessReviews(id)

        // Obtener productos/servicios
        const productsData = await dbService.getBusinessProducts(id)

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

      } catch (error) {
        console.error('Error fetching negocio:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatBusinessHours = (hours) => {
    if (!hours || hours.length === 0) return []
    
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return hours.map(hour => ({
      day: days[hour.day_of_week],
      time: hour.is_closed ? 'Cerrado' : `${hour.open_time} - ${hour.close_time}`
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

  const businessHours = formatBusinessHours(negocio.business_hours)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative h-96 bg-white shadow-sm">
        <img 
          src={negocio.image_url || 'https://via.placeholder.com/1200x400?text=Sin+Imagen'} 
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
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
              liked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
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
                          <span className="text-gray-700">{negocio.address}</span>
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
                      Horarios
                    </h3>
                    
                    <div className="space-y-2">
                      {businessHours.length === 0 ? (
                        <p className="text-gray-500 italic">Horarios no disponibles</p>
                      ) : (
                        businessHours.map((hour, index) => (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-gray-600">{hour.day}</span>
                            <span className={`font-medium ${
                              hour.time === 'Cerrado' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {hour.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reseñas Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay reseñas disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {review.profiles?.full_name || 'Usuario anónimo'}
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
                            {new Date(review.created_at).toLocaleDateString()}
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <img 
                          src={product.image_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                          {product.price && (
                            <p className="text-lg font-bold text-indigo-600">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
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
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          )}
          
          <button
            onClick={shareNegocio}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}

export default NegocioDetail
