import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import dbService from '../services/database'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Users,
  TrendingUp,
  Heart,
  Share2,
  Eye
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
      // Obtener categorías
      const categoriasData = await dbService.getBusinessCategories()

      // Obtener negocios aprobados con sus reseñas
      const negociosData = await dbService.getApprovedBusinesses()

      // Calcular estadísticas para cada negocio
      const negociosConStats = negociosData?.map(negocio => {
        const reviews = negocio.reviews || []
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0
        const reviewCount = reviews.length
        
        return {
          ...negocio,
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount,
          productCount: negocio.products?.length || 0
        }
      }) || []

      // Top 10 negocios con mejor rating
      const topRated = [...negociosConStats]
        .filter(n => n.reviewCount > 0)
        .sort((a, b) => {
          if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating
          return b.reviewCount - a.reviewCount
        })
        .slice(0, 10)

      setNegocios(negociosConStats)
      setCategorias(categoriasData || [])
      setTopNegocios(topRated)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando negocios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con búsqueda */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Descubre Negocios
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Barra de búsqueda */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar negocios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Filtro de ordenamiento */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="reviews">Más reseñas</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar izquierdo - Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-600" />
                Categorías
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  Todas las categorías
                </button>
                
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setSelectedCategory(categoria.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory === categoria.id
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoria.color }}
                    ></div>
                    {categoria.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal - Negocios */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredNegocios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No se encontraron negocios
                  </h3>
                  <p className="text-gray-500">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Calificados
              </h2>
              
              <div className="space-y-3">
                {topNegocios.slice(0, 10).map((negocio, index) => (
                  <Link
                    key={negocio.id}
                    to={`/negocio/${negocio.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {negocio.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {negocio.avgRating} ({negocio.reviewCount})
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

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2">
      {/* Imagen del negocio */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={negocio.image_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen'} 
          alt={negocio.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              setLiked(!liked)
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              liked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white backdrop-blur-sm transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        
        {/* Badge de categoría */}
        {negocio.business_categories && (
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
              style={{ backgroundColor: negocio.business_categories.color }}
            >
              {negocio.business_categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
            {negocio.name}
          </h3>
          {negocio.reviewCount > 0 && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-yellow-700">
                {negocio.avgRating}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {negocio.description || 'Descripción no disponible'}
        </p>

        {/* Estadísticas del negocio */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{negocio.reviewCount} reseñas</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{negocio.productCount} productos</span>
          </div>
        </div>

        {/* Dirección si está disponible */}
        {negocio.address && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{negocio.address}</span>
          </div>
        )}

        {/* Botón de acción */}
        <Link
          to={`/negocio/${negocio.id}`}
          className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  )
}

export default Negocios
