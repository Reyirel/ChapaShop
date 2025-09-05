import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
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
        // Datos de ejemplo para inicializar inmediatamente
        const negociosEjemplo = [
          {
            id: '1',
            name: 'Restaurante El Sabor',
            description: 'El mejor restaurante de comida tradicional en la ciudad. Especialidades caseras con ingredientes frescos.',
            category_id: '1',
            image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop',
            address: 'Calle Principal 123',
            phone: '+1234567890',
            website: 'https://restauranteelsabor.com',
            email: 'info@restauranteelsabor.com',
            avgRating: 4.8,
            reviewCount: 127,
            productCount: 25,
            created_at: new Date().toISOString(),
            business_categories: { name: 'Restaurantes', color: '#f59e0b' },
            business_hours: [
              { day_of_week: 1, open_time: '08:00', close_time: '22:00', is_closed: false },
              { day_of_week: 2, open_time: '08:00', close_time: '22:00', is_closed: false },
              { day_of_week: 3, open_time: '08:00', close_time: '22:00', is_closed: false },
              { day_of_week: 4, open_time: '08:00', close_time: '22:00', is_closed: false },
              { day_of_week: 5, open_time: '08:00', close_time: '23:00', is_closed: false },
              { day_of_week: 6, open_time: '09:00', close_time: '23:00', is_closed: false },
              { day_of_week: 0, open_time: '09:00', close_time: '21:00', is_closed: false }
            ]
          },
          {
            id: '2',
            name: 'Tienda de Ropa Fashion',
            description: 'Las últimas tendencias en moda para toda la familia. Ropa moderna y elegante.',
            category_id: '2',
            image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop',
            address: 'Avenida Central 456',
            phone: '+1234567891',
            website: 'https://fashionstore.com',
            email: 'contacto@fashionstore.com',
            avgRating: 4.5,
            reviewCount: 89,
            productCount: 150,
            created_at: new Date().toISOString(),
            business_categories: { name: 'Retail', color: '#3b82f6' },
            business_hours: [
              { day_of_week: 1, open_time: '09:00', close_time: '20:00', is_closed: false },
              { day_of_week: 2, open_time: '09:00', close_time: '20:00', is_closed: false },
              { day_of_week: 3, open_time: '09:00', close_time: '20:00', is_closed: false },
              { day_of_week: 4, open_time: '09:00', close_time: '20:00', is_closed: false },
              { day_of_week: 5, open_time: '09:00', close_time: '21:00', is_closed: false },
              { day_of_week: 6, open_time: '10:00', close_time: '21:00', is_closed: false },
              { day_of_week: 0, open_time: '00:00', close_time: '00:00', is_closed: true }
            ]
          },
          {
            id: '3',
            name: 'Cafetería Central',
            description: 'El mejor café de la ciudad con pasteles artesanales y ambiente acogedor.',
            category_id: '3',
            image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=300&fit=crop',
            address: 'Plaza Mayor 789',
            phone: '+1234567892',
            website: 'https://cafeteriacentral.com',
            email: 'hola@cafeteriacentral.com',
            avgRating: 4.9,
            reviewCount: 203,
            productCount: 45,
            created_at: new Date().toISOString(),
            business_categories: { name: 'Restaurantes', color: '#f59e0b' },
            business_hours: [
              { day_of_week: 1, open_time: '06:00', close_time: '18:00', is_closed: false },
              { day_of_week: 2, open_time: '06:00', close_time: '18:00', is_closed: false },
              { day_of_week: 3, open_time: '06:00', close_time: '18:00', is_closed: false },
              { day_of_week: 4, open_time: '06:00', close_time: '18:00', is_closed: false },
              { day_of_week: 5, open_time: '06:00', close_time: '19:00', is_closed: false },
              { day_of_week: 6, open_time: '07:00', close_time: '19:00', is_closed: false },
              { day_of_week: 0, open_time: '08:00', close_time: '17:00', is_closed: false }
            ]
          },
          {
            id: '4',
            name: 'Gimnasio PowerFit',
            description: 'Centro de entrenamiento completo con equipos modernos y entrenadores certificados.',
            category_id: '4',
            image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
            address: 'Avenida Deportiva 321',
            phone: '+1234567893',
            website: 'https://powerfit.com',
            email: 'info@powerfit.com',
            avgRating: 4.7,
            reviewCount: 156,
            productCount: 12,
            created_at: new Date().toISOString(),
            business_categories: { name: 'Deportes', color: '#06b6d4' },
            business_hours: [
              { day_of_week: 1, open_time: '05:00', close_time: '23:00', is_closed: false },
              { day_of_week: 2, open_time: '05:00', close_time: '23:00', is_closed: false },
              { day_of_week: 3, open_time: '05:00', close_time: '23:00', is_closed: false },
              { day_of_week: 4, open_time: '05:00', close_time: '23:00', is_closed: false },
              { day_of_week: 5, open_time: '05:00', close_time: '22:00', is_closed: false },
              { day_of_week: 6, open_time: '06:00', close_time: '22:00', is_closed: false },
              { day_of_week: 0, open_time: '07:00', close_time: '21:00', is_closed: false }
            ]
          },
          {
            id: '5',
            name: 'Salón de Belleza Elegante',
            description: 'Servicios de belleza profesionales con productos de primera calidad.',
            category_id: '5',
            image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=300&fit=crop',
            address: 'Calle Belleza 654',
            phone: '+1234567894',
            website: 'https://salonelegante.com',
            email: 'citas@salonelegante.com',
            avgRating: 4.6,
            reviewCount: 98,
            productCount: 30,
            created_at: new Date().toISOString(),
            business_categories: { name: 'Belleza', color: '#ec4899' },
            business_hours: [
              { day_of_week: 1, open_time: '09:00', close_time: '19:00', is_closed: false },
              { day_of_week: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
              { day_of_week: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
              { day_of_week: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
              { day_of_week: 5, open_time: '09:00', close_time: '20:00', is_closed: false },
              { day_of_week: 6, open_time: '09:00', close_time: '18:00', is_closed: false },
              { day_of_week: 0, open_time: '00:00', close_time: '00:00', is_closed: true }
            ]
          }
        ]

        // Buscar negocio en datos de ejemplo
        const negocioEjemplo = negociosEjemplo.find(n => n.id === id)
        
        if (negocioEjemplo) {
          setNegocio(negocioEjemplo)
          
          // Reseñas de ejemplo
          const reviewsEjemplo = [
            {
              id: '1',
              rating: 5,
              comment: 'Excelente servicio y calidad. Muy recomendado!',
              created_at: new Date().toISOString(),
              profiles: { full_name: 'María García', avatar_url: null }
            },
            {
              id: '2',
              rating: 4,
              comment: 'Muy buena experiencia, volveré pronto.',
              created_at: new Date().toISOString(),
              profiles: { full_name: 'Carlos López', avatar_url: null }
            }
          ]
          
          // Productos de ejemplo
          const productosEjemplo = [
            {
              id: '1',
              name: 'Producto 1',
              description: 'Descripción del producto 1',
              price: 25.99,
              image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'
            },
            {
              id: '2',
              name: 'Producto 2',
              description: 'Descripción del producto 2',
              price: 35.50,
              image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'
            }
          ]
          
          setReviews(reviewsEjemplo)
          setProducts(productosEjemplo)
          setLoading(false)
        }

        // Intentar obtener datos reales de Supabase en segundo plano
        try {
          // Obtener datos del negocio
          const { data: negocioData, error: negocioError } = await supabase
            .from('businesses')
            .select(`
              *,
              business_categories (name, icon, color),
              business_hours (*),
              profiles (full_name, avatar_url)
            `)
            .eq('id', id)
            .eq('status', 'approved')
            .single()

          if (negocioError) {
            console.warn('Warning fetching business:', negocioError.message)
          }

          // Obtener reseñas
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
              *,
              profiles (full_name, avatar_url)
            `)
            .eq('business_id', id)
            .order('created_at', { ascending: false })

          if (reviewsError) {
            console.warn('Warning fetching reviews:', reviewsError.message)
          }

          // Obtener productos/servicios
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', id)
            .eq('is_available', true)
            .order('created_at', { ascending: false })

          if (productsError) {
            console.warn('Warning fetching products:', productsError.message)
          }

          // Si se obtuvieron datos reales, reemplazar los de ejemplo
          if (negocioData) {
            const avgRating = reviewsData?.length > 0 
              ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
              : 0

            setNegocio({
              ...negocioData,
              avgRating: parseFloat(avgRating.toFixed(1)),
              reviewCount: reviewsData?.length || 0
            })
          }

          if (reviewsData) {
            setReviews(reviewsData)
          }

          if (productsData) {
            setProducts(productsData)
          }

        } catch (supabaseError) {
          console.warn('Supabase connection error:', supabaseError.message)
          // Mantener los datos de ejemplo que ya están cargados
        }

        if (!negocioEjemplo) {
          setLoading(false)
        }
        
      } catch (error) {
        console.error('Error general fetching negocio:', error)
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
