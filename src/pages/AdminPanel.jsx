import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import dbService from '../services/database'
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
  Globe,
  Trash2,
  AlertTriangle
} from 'lucide-react'

const AdminPanel = () => {
  const [user, setUser] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [pendingBusinesses, setPendingBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    checkAdmin()
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdmin = async () => {
    if (!auth.currentUser) {
      navigate('/login')
      return
    }

    const profile = await dbService.getUserProfile(auth.currentUser.uid)

    if (profile?.role !== 'admin') {
      navigate('/negocios')
      return
    }

    setUser(profile)
  }

  const fetchData = async () => {
    try {
      // Fetch all businesses
      const businessesData = await dbService.getAllBusinesses()

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
      await dbService.updateBusinessStatus(businessId, action, notes)

      // Refresh data
      fetchData()
      setShowModal(false)
      setSelectedBusiness(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error updating business:', error)
    }
  }

  const handleDeleteBusiness = async (businessId) => {
    setDeleteLoading(true)
    try {
      // Eliminar negocio y sus relaciones usando el servicio de base de datos
      await dbService.deleteBusiness(businessId)
        .eq('business_id', businessId)

      if (reviewsError) {
        console.error('Error eliminando reseñas:', reviewsError)
      }

      // Actualizar datos
      fetchData()
      setShowDeleteModal(false)
      setBusinessToDelete(null)
      setShowModal(false)
      setSelectedBusiness(null)
    } catch (error) {
      console.error('Error eliminando negocio:', error)
      alert('Error al eliminar el negocio. Por favor, inténtalo de nuevo.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openDeleteModal = (business) => {
    setBusinessToDelete(business)
    setShowDeleteModal(true)
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ecf8e] mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Shield size={32} className="text-[#3ecf8e]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-gray-400 text-lg">Gestión de negocios y usuarios</p>
              </div>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
              <span className="text-sm text-gray-400">Admin:</span>
              <span className="text-[#3ecf8e] font-medium ml-2">{user?.full_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                <Store className="text-blue-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Negocios</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20">
                <Clock className="text-yellow-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aprobados</p>
                <p className="text-3xl font-bold text-white">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
                <XCircle className="text-red-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rechazados</p>
                <p className="text-3xl font-bold text-white">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Star className="text-[#3ecf8e]" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Reseñas</p>
                <p className="text-3xl font-bold text-white">{stats.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Businesses Section */}
        {pendingBusinesses.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl mb-8">
            <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20">
                  <Clock className="text-yellow-400" size={20} />
                </div>
                Negocios Pendientes de Aprobación 
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingBusinesses.length}
                </span>
              </h2>
            </div>
            
            <div className="divide-y divide-gray-700/50">
              {pendingBusinesses.map((business) => (
                <div key={business.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{business.name}</h3>
                        {business.business_categories && (
                          <span 
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: business.business_categories.color || '#3ecf8e' }}
                          >
                            {business.business_categories.name}
                          </span>
                        )}
                        {getStatusBadge(business.status)}
                      </div>
                      
                      <p className="text-gray-300 mb-4 leading-relaxed">{business.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-[#3ecf8e]" />
                          <span>Propietario: {business.profiles?.full_name}</span>
                        </div>
                        {business.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[#3ecf8e]" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-[#3ecf8e]" />
                            <span>{business.email}</span>
                          </div>
                        )}
                        {business.address && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#3ecf8e]" />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-[#3ecf8e]" />
                            <span>{business.website}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Creado: {new Date(business.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => openBusinessModal(business)}
                        className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleBusinessAction(business.id, 'approved')}
                        className="p-3 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-green-500/30"
                        title="Aprobar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => openBusinessModal(business)}
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                        title="Rechazar"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(business)}
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Store className="text-[#3ecf8e]" size={20} />
              </div>
              Todos los Negocios
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {businesses.map((business) => (
              <div key={business.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">{business.name}</h3>
                      {business.business_categories && (
                        <span 
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: business.business_categories.color || '#3ecf8e' }}
                        >
                          {business.business_categories.name}
                        </span>
                      )}
                      {getStatusBadge(business.status)}
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">{business.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#3ecf8e]" />
                        <span>{business.profiles?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-[#3ecf8e]" />
                        <span>{calculateAverageRating(business.reviews)} ({business.reviews?.length || 0})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-[#3ecf8e]" />
                        <span>{business.products?.length || 0} productos</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(business.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 ml-6">
                    <button
                      onClick={() => openBusinessModal(business)}
                      className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(business)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                      title="Eliminar negocio"
                    >
                      <Trash2 size={18} />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedBusiness.name}</h2>
                  <p className="text-gray-400">Propietario: {selectedBusiness.profiles?.full_name}</p>
                </div>
                {getStatusBadge(selectedBusiness.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-white mb-4 text-xl">Información del Negocio</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Descripción:</span>
                      <span className="text-gray-300">{selectedBusiness.description || 'No especificada'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Dirección:</span>
                      <span className="text-gray-300">{selectedBusiness.address || 'No especificada'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Teléfono:</span>
                      <span className="text-gray-300">{selectedBusiness.phone || 'No especificado'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Email:</span>
                      <span className="text-gray-300">{selectedBusiness.email || 'No especificado'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Sitio Web:</span>
                      <span className="text-gray-300">{selectedBusiness.website || 'No especificado'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-4 text-xl">Estadísticas</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Productos:</span>
                      <span className="text-[#3ecf8e] font-bold">{selectedBusiness.products?.length || 0}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Reseñas:</span>
                      <span className="text-[#3ecf8e] font-bold">{selectedBusiness.reviews?.length || 0}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Rating:</span>
                      <span className="text-[#3ecf8e] font-bold">{calculateAverageRating(selectedBusiness.reviews)}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20 font-medium">Registro:</span>
                      <span className="text-gray-300">{new Date(selectedBusiness.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-white mb-4 text-xl">Reseñas Recientes</h3>
                  <div className="space-y-4 max-h-40 overflow-y-auto">
                    {selectedBusiness.reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={14} fill="currentColor" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">{review.rating}/5</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-300">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-lg font-bold text-white mb-3">
                  Notas del Administrador
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  rows={3}
                  placeholder="Agregar notas sobre la revisión del negocio..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => {
                    setShowModal(false)
                    openDeleteModal(selectedBusiness)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                
                {selectedBusiness.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'approved', adminNotes)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'rejected', adminNotes)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {selectedBusiness.status !== 'pending' && (
                  <button
                    onClick={() => handleBusinessAction(selectedBusiness.id, 'pending', adminNotes)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-600 transition-all"
                  >
                    Marcar como Pendiente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && businessToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-700/50 rounded-2xl max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
                  <AlertTriangle className="text-red-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirmar Eliminación</h2>
                  <p className="text-gray-400">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-white mb-2">¿Estás seguro que deseas eliminar este negocio?</h3>
                <p className="text-red-300 font-medium text-lg">{businessToDelete.name}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Propietario: {businessToDelete.profiles?.full_name}
                </p>
                
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <p className="font-medium text-red-300">Se eliminará permanentemente:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>El negocio y toda su información</li>
                    <li>Todas las imágenes asociadas</li>
                    <li>Todos los productos del negocio</li>
                    <li>Todas las reseñas y calificaciones</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setBusinessToDelete(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteBusiness(businessToDelete.id)}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar Permanentemente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
