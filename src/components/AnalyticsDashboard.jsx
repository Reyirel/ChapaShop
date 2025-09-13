import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Heart, MessageSquare, TrendingUp, Calendar } from 'lucide-react'

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUsers: 0,
    totalFavorites: 0,
    totalReviews: 0,
    topBusinesses: [],
    recentActivity: [],
    loading: true
  })

  useEffect(() => {
    // Aquí puedes conectar con tu backend para obtener estadísticas reales
    // Por ahora, datos de ejemplo
    const fetchAnalytics = async () => {
      try {
        // Simular carga de datos
        setTimeout(() => {
          setAnalytics({
            totalViews: 1250,
            totalUsers: 89,
            totalFavorites: 156,
            totalReviews: 73,
            topBusinesses: [
              { name: 'Café Central', views: 45, category: 'Café' },
              { name: 'Tienda Express', views: 38, category: 'Tienda' },
              { name: 'Restaurante Familiar', views: 32, category: 'Restaurante' },
              { name: 'Peluquería Bella', views: 28, category: 'Salud y Belleza' },
              { name: 'Librería Cultura', views: 25, category: 'Educación' }
            ],
            recentActivity: [
              { action: 'Nueva reseña', business: 'Café Central', time: '2 min ago' },
              { action: 'Nuevo negocio registrado', business: 'Tech Solutions', time: '15 min ago' },
              { action: 'Agregado a favoritos', business: 'Tienda Express', time: '1 hora ago' },
              { action: 'Contacto por WhatsApp', business: 'Restaurante Familiar', time: '2 horas ago' },
              { action: 'Visualización de negocio', business: 'Peluquería Bella', time: '3 horas ago' }
            ],
            loading: false
          })
        }, 1000)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setAnalytics(prev => ({ ...prev, loading: false }))
      }
    }

    fetchAnalytics()
  }, [])

  if (analytics.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          Analytics Dashboard
        </h2>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Vistas</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Usuarios Únicos</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Favoritos</p>
                <p className="text-2xl font-bold">{analytics.totalFavorites}</p>
              </div>
              <Heart className="h-8 w-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Reseñas</p>
                <p className="text-2xl font-bold">{analytics.totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Negocios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Negocios Más Visitados
          </h3>
          <div className="space-y-3">
            {analytics.topBusinesses.map((business, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{business.name}</p>
                    <p className="text-sm text-gray-500">{business.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{business.views}</p>
                  <p className="text-sm text-gray-500">vistas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.business}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">
          📊 Analytics Configurado
        </h3>
        <p className="text-indigo-700 mb-4">
          Tu aplicación ahora está recopilando datos de analytics automáticamente. 
          Puedes ver estadísticas detalladas en tu dashboard de Vercel.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">📈 Métricas que se rastrean:</h4>
            <ul className="text-indigo-700 space-y-1">
              <li>• Visualizaciones de negocios</li>
              <li>• Contactos (teléfono, WhatsApp)</li>
              <li>• Acciones de favoritos</li>
              <li>• Envío de reseñas</li>
              <li>• Navegación por páginas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">🔧 Herramientas instaladas:</h4>
            <ul className="text-indigo-700 space-y-1">
              <li>• Vercel Analytics</li>
              <li>• Speed Insights</li>
              <li>• Custom Event Tracking</li>
              <li>• Performance Monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
