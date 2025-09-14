import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/firebase'
import dbService from '../services/database'
import '../styles/AdminPanel.css'
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
  AlertTriangle,
  Edit,
  X,
  Heart,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  RefreshCw,
  ChevronDown,
  Activity,
  DollarSign,
  Zap,
  Award,
  Target,
  PieChart,
  ArrowUp,
  ArrowDown,
  Plus,
  UserCheck,
  UserX,
  Building2,
  Package
} from 'lucide-react'

const AdminPanel = () => {
  const [user, setUser] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [pendingBusinesses, setPendingBusinesses] = useState([])
  const [users, setUsers] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [businessToEdit, setBusinessToEdit] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
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

      // Calculate advanced stats
      const totalBusinesses = businessesData.length
      const approvedBusinesses = businessesData.filter(b => b.status === 'approved').length
      const rejectedBusinesses = businessesData.filter(b => b.status === 'rejected').length
      const totalReviews = businessesData.reduce((acc, b) => acc + (b.reviews?.length || 0), 0)
      const totalProducts = businessesData.reduce((acc, b) => acc + (b.products?.length || 0), 0)
      
      // Calculate average rating
      const allReviews = businessesData.flatMap(b => b.reviews || [])
      const avgRating = allReviews.length > 0 
        ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
        : 0

      // Calculate recent activity (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentBusinesses = businessesData.filter(b => 
        new Date(b.created_at) > weekAgo
      ).length

      // Calculate growth percentage
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const businessesLastMonth = businessesData.filter(b => 
        new Date(b.created_at) <= monthAgo
      ).length
      const growth = businessesLastMonth > 0 
        ? (((totalBusinesses - businessesLastMonth) / businessesLastMonth) * 100).toFixed(1)
        : 0

      setStats({
        total: totalBusinesses,
        pending: pendingData.length,
        approved: approvedBusinesses,
        rejected: rejectedBusinesses,
        reviews: totalReviews,
        products: totalProducts,
        avgRating: avgRating,
        recentActivity: recentBusinesses,
        growth: growth
      })

      // Generate notifications
      const newNotifications = []
      if (pendingData.length > 0) {
        newNotifications.push({
          id: 'pending',
          type: 'warning',
          title: 'Negocios Pendientes',
          message: `Tienes ${pendingData.length} negocio${pendingData.length > 1 ? 's' : ''} esperando aprobación`,
          time: new Date()
        })
      }
      
      if (recentBusinesses > 0) {
        newNotifications.push({
          id: 'recent',
          type: 'info',
          title: 'Nueva Actividad',
          message: `${recentBusinesses} nuevo${recentBusinesses > 1 ? 's' : ''} negocio${recentBusinesses > 1 ? 's' : ''} esta semana`,
          time: new Date()
        })
      }

      setNotifications(newNotifications)
      setLastRefresh(new Date())

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
      // Eliminar negocio usando el servicio de base de datos Firebase
      await dbService.deleteBusiness(businessId)

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

  const openEditModal = (business) => {
    setBusinessToEdit(business)
    setEditFormData({
      name: business.name || '',
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || ''
    })
    setShowEditModal(true)
  }

  const handleEditBusiness = async (e) => {
    e.preventDefault()
    if (!businessToEdit) return

    setEditLoading(true)
    try {
      await dbService.updateBusiness(businessToEdit.id, editFormData)
      
      // Refresh data
      fetchData()
      setShowEditModal(false)
      setBusinessToEdit(null)
      alert('Negocio actualizado exitosamente')
    } catch (error) {
      console.error('Error updating business:', error)
      alert('Error al actualizar el negocio. Por favor, inténtalo de nuevo.')
    } finally {
      setEditLoading(false)
    }
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

  // Filter businesses based on search and filters
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || business.status === filterStatus
    
    const matchesCategory = filterCategory === 'all' || 
                           business.business_categories?.name === filterCategory

    const matchesDate = (() => {
      if (dateRange === 'all') return true
      const businessDate = new Date(business.created_at)
      const now = new Date()
      
      switch (dateRange) {
        case 'today':
          return businessDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return businessDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return businessDate >= monthAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesStatus && matchesCategory && matchesDate
  })

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = filteredBusinesses.map(business => ({
      'Nombre': business.name,
      'Estado': business.status,
      'Categoría': business.business_categories?.name || 'N/A',
      'Propietario': business.profiles?.full_name || 'N/A',
      'Teléfono': business.phone || 'N/A',
      'Email': business.email || 'N/A',
      'Dirección': business.address || 'N/A',
      'Rating': calculateAverageRating(business.reviews),
      'Reseñas': business.reviews?.length || 0,
      'Productos': business.products?.length || 0,
      'Fecha Creación': new Date(business.created_at).toLocaleDateString()
    }))
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chapaShop_businesses_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const categories = new Set()
    businesses.forEach(business => {
      if (business.business_categories?.name) {
        categories.add(business.business_categories.name)
      }
    })
    return Array.from(categories)
  }

  // Refresh data manually
  const handleRefresh = () => {
    setLoading(true)
    fetchData()
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
      {/* Enhanced Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Shield size={28} className="text-[#3ecf8e]" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ChapaShop Admin
                </h1>
                <p className="text-gray-400 text-sm">Panel de Control Avanzado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-700/50">
                      <h3 className="font-bold text-white">Notificaciones</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div key={notification.id} className="p-4 border-b border-gray-700/50 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.type === 'warning' ? 'bg-yellow-400' : 
                                notification.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                              }`} />
                              <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {notification.time.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          <Bell size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No hay notificaciones</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* User Info */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
                <span className="text-gray-400 text-sm">Admin:</span>
                <span className="text-[#3ecf8e] font-medium ml-2 text-sm">{user?.full_name}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pb-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'businesses', label: 'Negocios', icon: Store },
              { id: 'pending', label: 'Pendientes', icon: Clock, badge: stats.pending },
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'analytics', label: 'Analíticas', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 rounded-2xl stats-card business-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Total Negocios</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUp size={12} className="text-green-400" />
                      <span className="text-green-400 text-xs">+{stats.growth}% este mes</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Building2 size={24} className="text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 p-6 rounded-2xl stats-card business-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Pendientes</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
                    <p className="text-gray-400 text-xs mt-2">Requieren atención</p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Clock size={24} className="text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 rounded-2xl stats-card business-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Rating Promedio</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.avgRating}</p>
                    <p className="text-gray-400 text-xs mt-2">De {stats.reviews} reseñas</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Star size={24} className="text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6 rounded-2xl stats-card business-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Productos Total</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.products}</p>
                    <p className="text-gray-400 text-xs mt-2">En toda la plataforma</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Package size={24} className="text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-[#3ecf8e]" />
                  Actividad Reciente
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Nuevos negocios esta semana</span>
                    </div>
                    <span className="text-white font-bold">{stats.recentActivity}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Negocios aprobados</span>
                    </div>
                    <span className="text-white font-bold">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Esperando revisión</span>
                    </div>
                    <span className="text-white font-bold">{stats.pending}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[#3ecf8e]" />
                  Métricas Clave
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tasa de Aprobación</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stats.approved / stats.total * 100) || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium text-sm">
                        {((stats.approved / stats.total * 100) || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Satisfacción Cliente</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-[#3ecf8e] h-2 rounded-full" 
                          style={{ width: `${(stats.avgRating / 5 * 100) || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium text-sm">
                        {stats.avgRating}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Crecimiento</span>
                    <div className="flex items-center gap-1">
                      <ArrowUp size={14} className="text-green-400" />
                      <span className="text-green-400 font-medium text-sm">+{stats.growth}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Businesses Tab */}
        {(activeTab === 'businesses' || activeTab === 'pending') && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-4 rounded-2xl">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar negocios, propietarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="approved">Aprobados</option>
                    <option value="rejected">Rechazados</option>
                  </select>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                  >
                    <option value="all">Todas las categorías</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                  </select>
                  
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-3 bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30 rounded-xl hover:bg-[#3ecf8e]/30 transition-colors flex items-center gap-2 btn-primary"
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Mostrando {filteredBusinesses.length} de {businesses.length} negocios
                {searchTerm && ` para "${searchTerm}"`}
              </p>
              <p className="text-xs text-gray-500">
                Última actualización: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>

            {/* Business List */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
              {activeTab === 'pending' && pendingBusinesses.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 px-6 py-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <Clock className="text-yellow-400" size={20} />
                    Negocios Pendientes de Aprobación
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {pendingBusinesses.length}
                    </span>
                  </h3>
                </div>
              )}
              
              <div className="divide-y divide-gray-700/50">
                {(activeTab === 'pending' ? pendingBusinesses : filteredBusinesses).map((business) => (
                  <div key={business.id} className="p-6 hover:bg-gray-700/20 transition-colors business-card">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white line-clamp-1">{business.name}</h3>
                          <div className="flex flex-wrap items-center gap-2">
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
                        </div>
                        
                        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-2">{business.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span className="truncate">{business.profiles?.full_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span>{calculateAverageRating(business.reviews)} ({business.reviews?.length || 0})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span>{business.products?.length || 0} productos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span>{new Date(business.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-500">
                          {business.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-[#3ecf8e] flex-shrink-0" />
                              <span>{business.phone}</span>
                            </div>
                          )}
                          {business.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-[#3ecf8e] flex-shrink-0" />
                              <span className="truncate">{business.email}</span>
                            </div>
                          )}
                          {business.address && (
                            <div className="flex items-start gap-2">
                              <MapPin size={12} className="text-[#3ecf8e] flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{business.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                        <button
                          onClick={() => openBusinessModal(business)}
                          className="flex items-center justify-center gap-2 lg:gap-0 p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30 flex-1 lg:flex-initial"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                          <span className="lg:hidden text-sm">Ver</span>
                        </button>
                        
                        {business.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBusinessAction(business.id, 'approved')}
                              className="flex items-center justify-center gap-2 lg:gap-0 p-3 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-green-500/30 flex-1 lg:flex-initial"
                              title="Aprobar"
                            >
                              <CheckCircle size={16} />
                              <span className="lg:hidden text-sm">Aprobar</span>
                            </button>
                            <button
                              onClick={() => openBusinessModal(business)}
                              className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                              title="Rechazar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => openEditModal(business)}
                          className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30"
                          title="Editar negocio"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => openDeleteModal(business)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                          title="Eliminar negocio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredBusinesses.length === 0 && (
                  <div className="p-12 text-center">
                    <Store size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron negocios</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay negocios registrados aún'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#3ecf8e]" />
                Gestión de Usuarios
              </h3>
              <p className="text-gray-400">
                Próximamente: Panel de gestión de usuarios, roles y permisos.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#3ecf8e]" />
                Análisis Avanzado
              </h3>
              <p className="text-gray-400">
                Próximamente: Gráficos detallados, reportes avanzados y métricas de rendimiento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Business Detail Modal */}
      {showModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                      <Store size={24} className="text-[#3ecf8e]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedBusiness.name}</h2>
                      <p className="text-gray-400">Propietario: {selectedBusiness.profiles?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedBusiness.business_categories && (
                      <span 
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: selectedBusiness.business_categories.color || '#3ecf8e' }}
                      >
                        {selectedBusiness.business_categories.name}
                      </span>
                    )}
                    {getStatusBadge(selectedBusiness.status)}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Package size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedBusiness.products?.length || 0}</p>
                      <p className="text-xs text-gray-400">Productos</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Star size={16} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{calculateAverageRating(selectedBusiness.reviews)}</p>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <MessageSquare size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedBusiness.reviews?.length || 0}</p>
                      <p className="text-xs text-gray-400">Reseñas</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Calendar size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{new Date(selectedBusiness.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">Registrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Building2 size={20} className="text-[#3ecf8e]" />
                      Información del Negocio
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <MessageSquare size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Descripción:</span>
                            <span className="text-gray-300">{selectedBusiness.description || 'No especificada'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Dirección:</span>
                            <span className="text-gray-300">{selectedBusiness.address || 'No especificada'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Phone size={20} className="text-[#3ecf8e]" />
                      Contacto
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Phone size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.phone || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Mail size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.email || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Globe size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.website || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Activity size={20} className="text-[#3ecf8e]" />
                      Estadísticas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Total Productos:</span>
                        <span className="text-[#3ecf8e] font-bold">{selectedBusiness.products?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Total Reseñas:</span>
                        <span className="text-[#3ecf8e] font-bold">{selectedBusiness.reviews?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Rating Promedio:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#3ecf8e] font-bold">{calculateAverageRating(selectedBusiness.reviews)}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < Math.round(calculateAverageRating(selectedBusiness.reviews)) ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Fecha Registro:</span>
                        <span className="text-gray-300">{new Date(selectedBusiness.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedBusiness.admin_notes && (
                    <div>
                      <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                        <AlertTriangle size={20} className="text-yellow-400" />
                        Notas Anteriores
                      </h3>
                      <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl">
                        <p className="text-yellow-200 text-sm">{selectedBusiness.admin_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                    <Star size={20} className="text-[#3ecf8e]" />
                    Reseñas Recientes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {selectedBusiness.reviews.slice(0, 6).map((review, index) => (
                      <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="currentColor" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">{review.rating}/5</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-300 line-clamp-3">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Edit size={20} className="text-[#3ecf8e]" />
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

              <div className="flex flex-wrap gap-3">
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
                
                {selectedBusiness.status === 'approved' && (
                  <>
                    <button
                      onClick={() => {
                        setShowModal(false)
                        openEditModal(selectedBusiness)
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'rejected', adminNotes)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'pending', adminNotes)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-600 transition-all"
                    >
                      Marcar como Pendiente
                    </button>
                  </>
                )}
                {selectedBusiness.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'approved', adminNotes)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleBusinessAction(selectedBusiness.id, 'rejected', adminNotes)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Rechazar
                    </button>
                  </>
                )}
                {selectedBusiness.status === 'rejected' && (
                  <button
                    onClick={() => handleBusinessAction(selectedBusiness.id, 'pending', adminNotes)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-600 transition-all"
                  >
                    Marcar como Pendiente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && businessToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-700/50 rounded-2xl max-w-lg w-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
                  <AlertTriangle className="text-red-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirmar Eliminación</h2>
                  <p className="text-gray-400">Esta acción es irreversible</p>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Building2 size={20} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">¿Estás seguro que deseas eliminar este negocio?</h3>
                    <p className="text-red-300 font-medium text-lg mb-2">{businessToDelete.name}</p>
                    <p className="text-gray-400 text-sm">
                      Propietario: {businessToDelete.profiles?.full_name}
                    </p>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="font-medium text-red-300">Se eliminará permanentemente:</p>
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>Información del negocio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>Imágenes asociadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>{businessToDelete.products?.length || 0} productos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>{businessToDelete.reviews?.length || 0} reseñas</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      Eliminar Definitivamente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Business Modal */}
      {showEditModal && businessToEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                    <Edit size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Editar Negocio</h2>
                    <p className="text-gray-400">Modificar la información de {businessToEdit.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditBusiness} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Building2 size={16} className="text-[#3ecf8e]" />
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        placeholder="Ej: Mi Tienda de Abarrotes"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Phone size={16} className="text-[#3ecf8e]" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        placeholder="Ej: +52 55 1234 5678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-[#3ecf8e]" />
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        placeholder="Ej: contacto@mitienda.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Globe size={16} className="text-[#3ecf8e]" />
                        Sitio Web
                      </label>
                      <input
                        type="url"
                        value={editFormData.website}
                        onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        placeholder="Ej: https://www.mitienda.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#3ecf8e]" />
                        Descripción *
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        rows={6}
                        placeholder="Describe tu negocio, productos o servicios..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-[#3ecf8e]" />
                        Dirección
                      </label>
                      <textarea
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                        rows={3}
                        placeholder="Dirección completa del negocio..."
                      />
                    </div>
                  </div>
                </div>

                {/* Current Stats Display */}
                <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-[#3ecf8e]" />
                    Estadísticas Actuales
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#3ecf8e]">{businessToEdit.products?.length || 0}</p>
                      <p className="text-sm text-gray-400">Productos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#3ecf8e]">{businessToEdit.reviews?.length || 0}</p>
                      <p className="text-sm text-gray-400">Reseñas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#3ecf8e]">{calculateAverageRating(businessToEdit.reviews)}</p>
                      <p className="text-sm text-gray-400">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#3ecf8e]">{new Date(businessToEdit.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-400">Registrado</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                    disabled={editLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Edit size={16} />
                        Actualizar Negocio
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
