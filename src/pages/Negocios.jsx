import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users,
  Heart,
  Share2,
  Store,
  ShoppingBag,
  Award,
  Sparkles
} from 'lucide-react'

const Negocios = () => {
  const [negocios, setNegocios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [topNegocios, setTopNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('Fetching data...')
      
      // Inicializar con datos de ejemplo para evitar pantallas vacías
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

      const categoriasEjemplo = [
        { id: '1', name: 'Restaurantes', color: '#f59e0b', is_active: true },
        { id: '2', name: 'Retail', color: '#3b82f6', is_active: true },
        { id: '3', name: 'Servicios', color: '#10b981', is_active: true },
        { id: '4', name: 'Belleza', color: '#ec4899', is_active: true },
        { id: '5', name: 'Deportes', color: '#06b6d4', is_active: true },
        { id: '6', name: 'Tecnología', color: '#6366f1', is_active: true }
      ]

      // Establecer datos de ejemplo primero para evitar pantallas vacías
      setNegocios(negociosEjemplo)
      setCategorias(categoriasEjemplo)

      // Top 10 negocios con mejor rating
      const topRated = [...negociosEjemplo]
        .filter(n => n.reviewCount > 0)
        .sort((a, b) => {
          if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating
          return b.reviewCount - a.reviewCount
        })
        .slice(0, 10)

      setTopNegocios(topRated)
      setLoading(false)

      // Intentar obtener datos reales de Supabase en segundo plano
      try {
        // Obtener categorías
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('business_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (categoriasError) {
          console.warn('Warning fetching categories:', categoriasError.message)
        }

        // Obtener negocios aprobados
        const { data: negociosData, error: negociosError } = await supabase
          .from('businesses')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (negociosError) {
          console.warn('Warning fetching businesses:', negociosError.message)
        }

        console.log('Supabase data loaded - Negocios:', negociosData?.length || 0, 'Categories:', categoriasData?.length || 0)

        // Si se obtuvieron datos reales, reemplazar los de ejemplo
        if (negociosData && negociosData.length > 0) {
          setNegocios(negociosData)
          
          const topRatedReal = [...negociosData]
            .filter(n => n.reviewCount > 0)
            .sort((a, b) => {
              if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating
              return b.reviewCount - a.reviewCount
            })
            .slice(0, 10)
          
          setTopNegocios(topRatedReal)
        }

        if (categoriasData && categoriasData.length > 0) {
          setCategorias(categoriasData)
        }
      } catch (supabaseError) {
        console.warn('Supabase connection error:', supabaseError.message)
        // Mantener los datos de ejemplo que ya están cargados
      }

    } catch (error) {
      console.error('Error general en fetchData:', error)
      setLoading(false)
    }
  }

  const filteredNegocios = negocios.filter(negocio => {
    const matchesSearch = negocio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         negocio.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || negocio.category_id === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.avgRating - a.avgRating
      case 'reviews':
        return b.reviewCount - a.reviewCount
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3ecf8e] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Cargando negocios increíbles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-[#3ecf8e] bg-clip-text text-transparent">
              Descubre Negocios
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora una selección curada de los mejores negocios verificados por nuestra comunidad
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="¿Qué tipo de negocio buscas?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none min-w-[180px]"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="reviews">Más reseñas</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {negocios.length}+
              </div>
              <div className="text-gray-500 text-sm">Negocios</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {topNegocios.reduce((acc, neg) => acc + neg.reviewCount, 0)}+
              </div>
              <div className="text-gray-500 text-sm">Reseñas</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {categorias.length}+
              </div>
              <div className="text-gray-500 text-sm">Categorías</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {topNegocios.length > 0 ? Math.round(topNegocios.reduce((acc, neg) => acc + neg.avgRating, 0) / topNegocios.length * 10) / 10 : 0}★
              </div>
              <div className="text-gray-500 text-sm">Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar izquierdo - Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Filter className="h-6 w-6 text-[#3ecf8e]" />
                Categorías
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    !selectedCategory 
                      ? 'bg-[#3ecf8e] text-white font-semibold shadow-md' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4" />
                    Todas las categorías
                  </div>
                </button>
                
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setSelectedCategory(categoria.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === categoria.id
                        ? 'bg-[#3ecf8e] text-white font-semibold shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      ></div>
                      {categoria.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal - Negocios */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredNegocios.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <div className="text-6xl mb-6">🏪</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    No se encontraron negocios
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Intenta cambiar tus filtros de búsqueda
                  </p>
                </div>
              ) : (
                filteredNegocios.map((negocio) => (
                  <BusinessCard key={negocio.id} negocio={negocio} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar derecho - Top negocios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-500" />
                Top Calificados
              </h2>
              
              <div className="space-y-3">
                {topNegocios.slice(0, 10).map((negocio, index) => (
                  <Link
                    key={negocio.id}
                    to={`/negocio/${negocio.id}`}
                    className="block p-3 rounded-xl hover:bg-gray-50 transition-all group border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#3ecf8e] transition-colors">
                          {negocio.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {negocio.avgRating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({negocio.reviewCount} reseñas)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para cada tarjeta de negocio
const BusinessCard = ({ negocio }) => {
  const [liked, setLiked] = useState(false)

  const handleCardClick = (e) => {
    // Evitar navegación si se hace clic en botones de acción
    if (e.target.closest('.action-button')) {
      e.preventDefault()
      return
    }
  }

  return (
    <Link 
      to={`/negocio/${negocio.id}`}
      className="block group"
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-lg group-hover:border-[#3ecf8e] transition-all duration-300">
        {/* Imagen del negocio */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={negocio.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop'} 
            alt={negocio.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setLiked(!liked)
              }}
              className={`action-button p-2 rounded-full backdrop-blur-sm transition-all ${
                liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Funcionalidad de compartir
              }}
              className="action-button p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#3ecf8e] hover:text-white transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Badge de categoría */}
          {negocio.business_categories && (
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                style={{ backgroundColor: negocio.business_categories.color }}
              >
                {negocio.business_categories.name}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {negocio.reviewCount > 0 && (
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-800">
                  {negocio.avgRating}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#3ecf8e] transition-colors mb-2">
              {negocio.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {negocio.description || 'Descripción no disponible'}
            </p>
          </div>

          {/* Estadísticas del negocio */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[#3ecf8e]" />
              <span className="text-gray-600">{negocio.reviewCount} reseñas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-[#3ecf8e]" />
              <span className="text-gray-600">{negocio.productCount} productos</span>
            </div>
          </div>

          {/* Dirección si está disponible */}
          {negocio.address && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <MapPin className="h-4 w-4 text-[#3ecf8e]" />
              <span className="truncate">{negocio.address}</span>
            </div>
          )}

          {/* Botón de acción */}
          <div className="bg-gradient-to-r from-[#3ecf8e] to-[#2dd4bf] text-white text-center py-3 rounded-xl font-semibold group-hover:from-[#2dd4bf] group-hover:to-[#3ecf8e] transition-all duration-200 shadow-md">
            Ver Detalles
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Negocios
