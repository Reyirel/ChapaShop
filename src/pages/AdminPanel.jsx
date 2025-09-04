import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { 
  Shield, 
  Store, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageSquare,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'

const AdminPanel = () => {
  const [user, setUser] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [pendingBusinesses, setPendingBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    checkAdmin()
    fetchData()
  }, [])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      navigate('/negocios')
      return
    }

    setUser(profile)
  }

  const fetchData = async () => {
    try {
      // Fetch all businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, color, icon),
          profiles!businesses_owner_id_fkey(full_name, email),
          reviews(rating, comment),
          products(id, name)
        `)
        .order('created_at', { ascending: false })

      if (businessesError) throw businessesError

      // Fetch pending businesses
      const pendingData = businessesData.filter(b => b.status === 'pending')
      
      setBusinesses(businessesData || [])
      setPendingBusinesses(pendingData || [])

      // Calculate stats
      const totalBusinesses = businessesData.length
      const approvedBusinesses = businessesData.filter(b => b.status === 'approved').length
      const rejectedBusinesses = businessesData.filter(b => b.status === 'rejected').length
      const totalReviews = businessesData.reduce((acc, b) => acc + (b.reviews?.length || 0), 0)

      setStats({
        total: totalBusinesses,
        pending: pendingData.length,
        approved: approvedBusinesses,
        rejected: rejectedBusinesses,
        reviews: totalReviews
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessAction = async (businessId, action, notes = '') => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          status: action,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) throw error

      // Refresh data
      fetchData()
      setShowModal(false)
      setSelectedBusiness(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error updating business:', error)
    }
  }

  const openBusinessModal = (business) => {
    setSelectedBusiness(business)
    setAdminNotes(business.admin_notes || '')
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pendiente' },
      approved: { color: 'bg-green-500', icon: CheckCircle, text: 'Aprobado' },
      rejected: { color: 'bg-red-500', icon: XCircle, text: 'Rechazado' }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    )
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Shield size={32} className="text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Gestión de negocios y usuarios</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Admin: {user?.full_name}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Negocios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="text-yellow-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="text-red-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="text-yellow-500" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Businesses Section */}
        {pendingBusinesses.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="text-yellow-600" size={20} />
                Negocios Pendientes de Aprobación ({pendingBusinesses.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingBusinesses.map((business) => (
                <div key={business.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                        {business.business_categories && (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: business.business_categories.color || '#3ecf8e' }}
                          >
                            {business.business_categories.name}
                          </span>
                        )}
                        {getStatusBadge(business.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{business.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Propietario: {business.profiles?.full_name}</span>
                        </div>
                        {business.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{business.email}</span>
                          </div>
                        )}
                        {business.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center gap-1">
                            <Globe size={14} />
                            <span>{business.website}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Creado: {new Date(business.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openBusinessModal(business)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleBusinessAction(business.id, 'approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Aprobar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => openBusinessModal(business)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rechazar"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Todos los Negocios</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <div key={business.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                      {business.business_categories && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: business.business_categories.color || '#3ecf8e' }}
                        >
                          {business.business_categories.name}
                        </span>
                      )}
                      {getStatusBadge(business.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{business.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{business.profiles?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span>{calculateAverageRating(business.reviews)} ({business.reviews?.length || 0})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Store size={14} />
                        <span>{business.products?.length || 0} productos</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(business.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openBusinessModal(business)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Detail Modal */}
      {showModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBusiness.name}</h2>
                  <p className="text-gray-600">Propietario: {selectedBusiness.profiles?.full_name}</p>
                </div>
                {getStatusBadge(selectedBusiness.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Información del Negocio</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Descripción:</strong> {selectedBusiness.description || 'No especificada'}</p>
                    <p><strong>Dirección:</strong> {selectedBusiness.address || 'No especificada'}</p>
                    <p><strong>Teléfono:</strong> {selectedBusiness.phone || 'No especificado'}</p>
                    <p><strong>Email:</strong> {selectedBusiness.email || 'No especificado'}</p>
                    <p><strong>Sitio Web:</strong> {selectedBusiness.website || 'No especificado'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Productos:</strong> {selectedBusiness.products?.length || 0}</p>
                    <p><strong>Reseñas:</strong> {selectedBusiness.reviews?.length || 0}</p>
                    <p><strong>Rating promedio:</strong> {calculateAverageRating(selectedBusiness.reviews)}</p>
                    <p><strong>Fecha de registro:</strong> {new Date(selectedBusiness.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Reseñas Recientes</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedBusiness.reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={14} fill="currentColor" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Administrador
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Agregar notas sobre la revisión del negocio..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cerrar
                </button>
                {selectedBusiness.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'approved', adminNotes)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'rejected', adminNotes)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {selectedBusiness.status !== 'pending' && (
                  <button
                    onClick={() => handleBusinessAction(selectedBusiness.id, 'pending', adminNotes)}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Marcar como Pendiente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
