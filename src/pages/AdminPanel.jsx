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
  Package,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Wrench,
  Laptop,
  GraduationCap,
  Gamepad2,
  Car,
  Home,
  Dumbbell,
  PawPrint,
  Stethoscope,
  Brush
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
  
  // User management states
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [showUserDeleteModal, setShowUserDeleteModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userEditFormData, setUserEditFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
    phone: '',
    address: ''
  })
  const [userEditLoading, setUserEditLoading] = useState(false)
  const [userDeleteLoading, setUserDeleteLoading] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userFilterRole, setUserFilterRole] = useState('all')
  
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
      
      // Fetch all users
      const usersData = await dbService.getAllUsers()
      
      setBusinesses(businessesData || [])
      setPendingBusinesses(pendingData || [])
      setUsers(usersData || [])

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
    console.log('🔍 AdminPanel - Abriendo modal para negocio:', business)
    console.log('🔍 AdminPanel - business.id:', business.id)
    console.log('🔍 AdminPanel - business.name:', business.name)
    console.log('🔍 AdminPanel - business.description:', business.description)
    console.log('🔍 AdminPanel - business.category:', business.category)
    console.log('🔍 AdminPanel - business.location:', business.location)
    console.log('🔍 AdminPanel - business.businessHours:', business.businessHours)
    console.log('🔍 AdminPanel - business.products:', business.products)
    console.log('🔍 AdminPanel - business.phone:', business.phone)
    console.log('🔍 AdminPanel - business.email:', business.email)
    console.log('🔍 AdminPanel - business.status:', business.status)
    console.log('🔍 AdminPanel - business.created_at:', business.created_at)
    console.log('🔍 AdminPanel - business.ownerId:', business.ownerId)
    
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

  // User Management Functions
  const openUserModal = (user) => {
    console.log('🔍 AdminPanel - Abriendo modal para usuario:', user)
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const openUserEditModal = (user) => {
    setUserToEdit(user)
    setUserEditFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'user',
      phone: user.phone || '',
      address: user.address || ''
    })
    setShowUserEditModal(true)
  }

  const openUserDeleteModal = (user) => {
    setUserToDelete(user)
    setShowUserDeleteModal(true)
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!userToEdit) return

    setUserEditLoading(true)
    try {
      await dbService.updateUserProfile(userToEdit.id, userEditFormData)
      
      // Refresh data
      fetchData()
      setShowUserEditModal(false)
      setUserToEdit(null)
      alert('Usuario actualizado exitosamente')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar el usuario. Por favor, inténtalo de nuevo.')
    } finally {
      setUserEditLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setUserDeleteLoading(true)
    try {
      await dbService.deleteUser(userId)
      
      // Refresh data
      fetchData()
      setShowUserDeleteModal(false)
      setUserToDelete(null)
      setShowUserModal(false)
      setSelectedUser(null)
      alert('Usuario eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.')
    } finally {
      setUserDeleteLoading(false)
    }
  }

  const getUserRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-500', text: 'Administrador' },
      business_owner: { color: 'bg-blue-500', text: 'Propietario' },
      user: { color: 'bg-gray-500', text: 'Usuario' }
    }
    
    const badge = badges[role] || badges.user
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    
    const matchesRole = userFilterRole === 'all' || user.role === userFilterRole
    
    return matchesSearch && matchesRole
  })

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
    
    // Improved category matching
    const matchesCategory = (() => {
      if (filterCategory === 'all') return true
      
      const businessCategory = (
        business.business_categories?.name || 
        business.category || 
        business.category_name || 
        ''
      ).toLowerCase()
      
      const filterCat = filterCategory.toLowerCase()
      
      // Direct match
      if (businessCategory === filterCat) return true
      
      // Check if business category contains filter category
      if (businessCategory.includes(filterCat)) return true
      
      // Check against all defined categories
      const allCategories = getAllCategories()
      const selectedCategory = allCategories.find(cat => 
        cat.name.toLowerCase() === filterCat || cat.id === filterCat
      )
      
      if (selectedCategory) {
        return businessCategory.includes(selectedCategory.id) || 
               businessCategory.includes(selectedCategory.name.toLowerCase())
      }
      
      return false
    })()

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

  // Get all available categories with icons
  const getAllCategories = () => {
    return [
      { id: 'restaurante', name: 'Restaurante', icon: UtensilsCrossed, color: '#FF6B6B' },
      { id: 'cafe', name: 'Café', icon: Coffee, color: '#4ECDC4' },
      { id: 'tienda', name: 'Tienda', icon: ShoppingBag, color: '#45B7D1' },
      { id: 'servicios', name: 'Servicios', icon: Wrench, color: '#96CEB4' },
      { id: 'servicio', name: 'Servicio', icon: Wrench, color: '#96CEB4' },
      { id: 'tecnologia', name: 'Tecnología', icon: Laptop, color: '#9B59B6' },
      { id: 'entretenimiento', name: 'Entretenimiento', icon: Gamepad2, color: '#FFEAA7' },
      { id: 'salud', name: 'Salud y Belleza', icon: Stethoscope, color: '#DDA0DD' },
      { id: 'educacion', name: 'Educación', icon: GraduationCap, color: '#98D8C8' },
      { id: 'transporte', name: 'Transporte', icon: Car, color: '#F7DC6F' },
      { id: 'automotriz', name: 'Automotriz', icon: Car, color: '#E74C3C' },
      { id: 'belleza', name: 'Belleza', icon: Brush, color: '#F39C12' },
      { id: 'hogar', name: 'Hogar', icon: Home, color: '#2ECC71' },
      { id: 'deportes', name: 'Deportes', icon: Dumbbell, color: '#3498DB' },
      { id: 'mascotas', name: 'Mascotas', icon: PawPrint, color: '#E67E22' },
      { id: 'otros', name: 'Otros', icon: Package, color: '#95A5A6' },
      { id: 'otro', name: 'Otro', icon: Package, color: '#95A5A6' }
    ]
  }

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const allCategories = getAllCategories()
    const categoriesInUse = new Set()
    
    businesses.forEach(business => {
      if (business.business_categories?.name) {
        categoriesInUse.add(business.business_categories.name.toLowerCase())
      }
      if (business.category) {
        categoriesInUse.add(business.category.toLowerCase())
      }
      if (business.category_name) {
        categoriesInUse.add(business.category_name.toLowerCase())
      }
    })
    
    // Filter categories that are actually in use or return all if user wants to see all
    return allCategories.filter(cat => 
      categoriesInUse.has(cat.id) || 
      categoriesInUse.has(cat.name.toLowerCase()) ||
      cat.id === 'otros' || cat.id === 'otro'
    )
  }

  // Get category icon and color
  const getCategoryInfo = (categoryName) => {
    const allCategories = getAllCategories()
    const normalizedName = categoryName?.toLowerCase() || 'otros'
    
    console.log('getCategoryInfo - Input:', categoryName, 'Normalized:', normalizedName)
    console.log('Available categories:', allCategories.map(cat => ({ id: cat.id, name: cat.name })))
    
    // Try to find exact match first
    let category = allCategories.find(cat => 
      cat.id === normalizedName || 
      cat.name.toLowerCase() === normalizedName
    )
    
    console.log('Exact match found:', category)
    
    // If not found, try partial match
    if (!category) {
      category = allCategories.find(cat => 
        normalizedName.includes(cat.id) || 
        cat.id.includes(normalizedName)
      )
      console.log('Partial match found:', category)
    }
    
    // Fallback to "otros"
    const result = category || allCategories.find(cat => cat.id === 'otros')
    console.log('Final result:', result)
    return result
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
                  
                  <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 appearance-none cursor-pointer min-w-[200px]"
                    >
                      <option value="all">🏪 Todas las categorías</option>
                      {getAllCategories().map(category => {
                        const IconComponent = category.icon
                        return (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        )
                      })}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  
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

            {/* Visual Category Filter */}
            <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 p-4 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter size={20} className="text-[#3ecf8e]" />
                Filtrar por Categoría
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {/* All Categories Option */}
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`group relative p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 category-filter-button ${
                    filterCategory === 'all'
                      ? 'border-[#3ecf8e] bg-[#3ecf8e]/10 shadow-lg shadow-[#3ecf8e]/20 category-filter-active'
                      : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`mx-auto mb-2 p-2 rounded-lg transition-colors ${
                      filterCategory === 'all' ? 'bg-[#3ecf8e]/20' : 'bg-gray-600/30'
                    }`}>
                      <Store size={20} className={`mx-auto category-icon ${
                        filterCategory === 'all' ? 'text-[#3ecf8e]' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className={`text-xs font-medium ${
                      filterCategory === 'all' ? 'text-[#3ecf8e]' : 'text-gray-300'
                    }`}>
                      Todas
                    </span>
                    {filterCategory === 'all' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3ecf8e] rounded-full animate-pulse"></div>
                    )}
                  </div>
                </button>

                {/* Individual Category Options */}
                {getAllCategories().map((category) => {
                  const IconComponent = category.icon
                  const isActive = filterCategory === category.name || filterCategory === category.id
                  const categoryBusinesses = businesses.filter(business => {
                    const businessCategory = business.business_categories?.name || business.category || business.category_name || ''
                    return businessCategory.toLowerCase().includes(category.id) || 
                           businessCategory.toLowerCase().includes(category.name.toLowerCase())
                  })
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.name)}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 category-filter-button ${
                        isActive
                          ? 'border-[#3ecf8e] bg-[#3ecf8e]/10 shadow-lg shadow-[#3ecf8e]/20 category-filter-active'
                          : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                      }`}
                      disabled={categoryBusinesses.length === 0}
                    >
                      <div className="text-center">
                        <div className={`mx-auto mb-2 p-2 rounded-lg transition-colors ${
                          isActive ? 'bg-[#3ecf8e]/20' : 'bg-gray-600/30'
                        }`}>
                          <IconComponent size={20} className={`mx-auto category-icon transition-colors ${
                            isActive ? 'text-[#3ecf8e]' : categoryBusinesses.length > 0 ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                        </div>
                        <span className={`text-xs font-medium block ${
                          isActive ? 'text-[#3ecf8e]' : categoryBusinesses.length > 0 ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {category.name}
                        </span>
                        {categoryBusinesses.length > 0 && (
                          <span className={`text-xs mt-1 block category-count ${
                            isActive ? 'text-[#3ecf8e]/80' : 'text-gray-400'
                          }`}>
                            ({categoryBusinesses.length})
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3ecf8e] rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  )
                })}
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
                            {/* Category Badge with Icon */}
                            {(() => {
                              const businessCategory = business.business_categories?.name || business.category || business.category_name
                              console.log('Debug - Business:', business.name, 'Category sources:', {
                                'business_categories_name': business.business_categories?.name,
                                'category': business.category,
                                'category_name': business.category_name,
                                'final': businessCategory
                              })
                              
                              if (!businessCategory) return null
                              
                              const categoryInfo = getCategoryInfo(businessCategory)
                              const IconComponent = categoryInfo?.icon || Package
                              
                              console.log('Debug - Category info for', businessCategory, ':', categoryInfo)
                              
                              return (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm business-category-badge"
                                  style={{ backgroundColor: categoryInfo?.color || '#3ecf8e' }}
                                >
                                  <IconComponent size={12} className="category-icon" />
                                  {businessCategory}
                                </span>
                              )
                            })()}
                            {getStatusBadge(business.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-2">{business.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span className="truncate">{business.profiles?.full_name || business.contactName || 'No especificado'}</span>
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
                            <span>{new Date(business.created_at || business.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-500">
                          {(business.phone || business.contactPhone) && (
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-[#3ecf8e] flex-shrink-0" />
                              <span>{business.phone || business.contactPhone}</span>
                            </div>
                          )}
                          {(business.email || business.contactEmail) && (
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-[#3ecf8e] flex-shrink-0" />
                              <span className="truncate">{business.email || business.contactEmail}</span>
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
            {/* Search and Filters */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-4 rounded-2xl">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <select
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value)}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administradores</option>
                    <option value="business_owner">Propietarios</option>
                    <option value="user">Usuarios</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      const csvData = filteredUsers.map(user => ({
                        'Nombre': user.full_name || 'N/A',
                        'Email': user.email || 'N/A',
                        'Rol': user.role || 'user',
                        'Teléfono': user.phone || 'N/A',
                        'Dirección': user.address || 'N/A',
                        'Fecha Registro': user.createdAt ? new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString() : 'N/A'
                      }))
                      
                      const csvString = [
                        Object.keys(csvData[0]).join(','),
                        ...csvData.map(row => Object.values(row).join(','))
                      ].join('\n')
                      
                      const blob = new Blob([csvString], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `chapaShop_usuarios_${new Date().toISOString().split('T')[0]}.csv`
                      link.click()
                    }}
                    className="px-4 py-3 bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30 rounded-xl hover:bg-[#3ecf8e]/30 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>
            </div>

            {/* Users Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Total Usuarios</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Users size={24} className="text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Administradores</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Shield size={24} className="text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Propietarios</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.filter(u => u.role === 'business_owner').length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Store size={24} className="text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Usuarios Regulares</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.filter(u => u.role === 'user' || !u.role).length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-500/20">
                    <UserCheck size={24} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Mostrando {filteredUsers.length} de {users.length} usuarios
                {userSearchTerm && ` para "${userSearchTerm}"`}
              </p>
            </div>

            {/* Users List */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-700/50">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white line-clamp-1">{user.full_name || 'Sin nombre'}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {getUserRoleBadge(user.role)}
                            {user.id === auth.currentUser?.uid && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-500/20">
                                Tú
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span className="truncate">{user.email || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span className="truncate">{user.phone || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span>
                              {user.createdAt ? 
                                new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString() :
                                'Fecha no disponible'
                              }
                            </span>
                          </div>
                        </div>

                        {user.address && (
                          <div className="flex items-start gap-2 text-xs text-gray-500">
                            <MapPin size={12} className="text-[#3ecf8e] flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{user.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                        <button
                          onClick={() => openUserModal(user)}
                          className="flex items-center justify-center gap-2 lg:gap-0 p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30 flex-1 lg:flex-initial"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                          <span className="lg:hidden text-sm">Ver</span>
                        </button>
                        
                        <button
                          onClick={() => openUserEditModal(user)}
                          className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30"
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                        
                        {user.id !== auth.currentUser?.uid && (
                          <button
                            onClick={() => openUserDeleteModal(user)}
                            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="p-12 text-center">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron usuarios</h3>
                    <p className="text-gray-500">
                      {userSearchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios registrados aún'}
                    </p>
                  </div>
                )}
              </div>
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
                      <p className="text-gray-400">Propietario: {selectedBusiness.profiles?.full_name || selectedBusiness.contactName || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {(() => {
                      const businessCategory = selectedBusiness.business_categories?.name || selectedBusiness.category || selectedBusiness.category_name
                      if (!businessCategory) return null
                      
                      const categoryInfo = getCategoryInfo(businessCategory)
                      const IconComponent = categoryInfo?.icon || Package
                      
                      return (
                        <span 
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg business-category-badge"
                          style={{ backgroundColor: categoryInfo?.color || '#3ecf8e' }}
                        >
                          <IconComponent size={16} className="category-icon" />
                          {businessCategory}
                        </span>
                      )
                    })()}
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
                      <p className="text-2xl font-bold text-white">
                        {Array.isArray(selectedBusiness.products) ? 
                          selectedBusiness.products.length : 
                          (selectedBusiness.products && typeof selectedBusiness.products === 'string' ? 
                            selectedBusiness.products.split(',').filter(p => p.trim()).length : 
                            0)
                        }
                      </p>
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
                      <p className="text-2xl font-bold text-white">
                        {selectedBusiness.rating || calculateAverageRating(selectedBusiness.reviews)}
                      </p>
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
                      <p className="text-2xl font-bold text-white">
                        {selectedBusiness.reviews?.length || selectedBusiness.totalReviews || 0}
                      </p>
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
                      <p className="text-lg font-bold text-white">
                        {selectedBusiness.created_at ? 
                          new Date(selectedBusiness.created_at.toDate ? selectedBusiness.created_at.toDate() : selectedBusiness.created_at).toLocaleDateString() :
                          selectedBusiness.createdAt ?
                          new Date(selectedBusiness.createdAt.toDate ? selectedBusiness.createdAt.toDate() : selectedBusiness.createdAt).toLocaleDateString() :
                          'N/A'
                        }
                      </p>
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
                          <Store size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Categoría:</span>
                            <span className="text-gray-300 capitalize">
                              {selectedBusiness.business_categories?.name || 
                               selectedBusiness.category || 
                               selectedBusiness.category_name || 
                               'No especificada'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Dirección:</span>
                            <span className="text-gray-300">{selectedBusiness.address || 'No especificada'}</span>
                            {selectedBusiness.location && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span>Coordenadas: {selectedBusiness.location.lat?.toFixed(6)}, {selectedBusiness.location.lng?.toFixed(6)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedBusiness.products && typeof selectedBusiness.products === 'string' && selectedBusiness.products.length > 0 && (
                        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                          <div className="flex items-start gap-3">
                            <Package size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-gray-400 font-medium block mb-1">Productos/Servicios:</span>
                              <div className="space-y-1">
                                {selectedBusiness.products.split(',').map((product, index) => (
                                  product.trim() && (
                                    <span key={index} className="inline-block bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-sm mr-2 mb-1">
                                      {product.trim()}
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {Array.isArray(selectedBusiness.products) && selectedBusiness.products.length > 0 && (
                        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                          <div className="flex items-start gap-3">
                            <Package size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-gray-400 font-medium block mb-1">Productos/Servicios:</span>
                              <div className="space-y-1">
                                {selectedBusiness.products.map((product, index) => (
                                  <span key={index} className="inline-block bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-sm mr-2 mb-1">
                                    {product.name || product}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alertas de datos faltantes */}
                    {(() => {
                      const missingData = []
                      if (!selectedBusiness.description || selectedBusiness.description.trim() === '') missingData.push('Descripción')
                      if (!selectedBusiness.category && !selectedBusiness.business_categories?.name) missingData.push('Categoría')
                      if (!selectedBusiness.phone && !selectedBusiness.contactPhone) missingData.push('Teléfono')
                      if (!selectedBusiness.email && !selectedBusiness.contactEmail) missingData.push('Email')
                      if (!selectedBusiness.address) missingData.push('Dirección')
                      if (!selectedBusiness.location) missingData.push('Ubicación en mapa')
                      if (!selectedBusiness.businessHours) missingData.push('Horarios de atención')
                      
                      if (missingData.length > 0) {
                        return (
                          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                            <div className="flex items-start gap-3">
                              <AlertTriangle size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-yellow-400 font-medium block mb-1">Datos Faltantes:</span>
                                <div className="space-y-1">
                                  {missingData.map((item, index) => (
                                    <span key={index} className="inline-block bg-yellow-700/30 text-yellow-200 px-2 py-1 rounded text-xs mr-2 mb-1">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-yellow-200 text-xs mt-2">
                                  Considera solicitar estos datos al propietario para mejorar la calidad del listado.
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Phone size={20} className="text-[#3ecf8e]" />
                      Contacto
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Phone size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.phone || selectedBusiness.contactPhone || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Mail size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.email || selectedBusiness.contactEmail || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Globe size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">{selectedBusiness.website || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Users size={14} className="text-[#3ecf8e]" />
                        <span className="text-gray-300">ID Propietario: {selectedBusiness.ownerId || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Activity size={20} className="text-[#3ecf8e]" />
                      Estadísticas y Estado
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Estado:</span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedBusiness.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Total Productos:</span>
                        <span className="text-[#3ecf8e] font-bold">
                          {Array.isArray(selectedBusiness.products) ? 
                            selectedBusiness.products.length : 
                            (selectedBusiness.products && typeof selectedBusiness.products === 'string' ? 
                              selectedBusiness.products.split(',').filter(p => p.trim()).length : 
                              0)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Total Reseñas:</span>
                        <span className="text-[#3ecf8e] font-bold">{selectedBusiness.reviews?.length || selectedBusiness.totalReviews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Rating Promedio:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#3ecf8e] font-bold">
                            {selectedBusiness.rating || calculateAverageRating(selectedBusiness.reviews)}
                          </span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < Math.round(selectedBusiness.rating || calculateAverageRating(selectedBusiness.reviews)) ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Fecha Registro:</span>
                        <span className="text-gray-300">
                          {selectedBusiness.created_at ? 
                            new Date(selectedBusiness.created_at.toDate ? selectedBusiness.created_at.toDate() : selectedBusiness.created_at).toLocaleDateString() :
                            selectedBusiness.createdAt ?
                            new Date(selectedBusiness.createdAt.toDate ? selectedBusiness.createdAt.toDate() : selectedBusiness.createdAt).toLocaleDateString() :
                            'No disponible'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Última Actualización:</span>
                        <span className="text-gray-300">
                          {selectedBusiness.updated_at ? 
                            new Date(selectedBusiness.updated_at.toDate ? selectedBusiness.updated_at.toDate() : selectedBusiness.updated_at).toLocaleDateString() :
                            selectedBusiness.updatedAt ?
                            new Date(selectedBusiness.updatedAt.toDate ? selectedBusiness.updatedAt.toDate() : selectedBusiness.updatedAt).toLocaleDateString() :
                            'No disponible'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horarios de atención */}
                  {selectedBusiness.businessHours && (
                    <div>
                      <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                        <Clock size={20} className="text-[#3ecf8e]" />
                        Horarios de Atención
                      </h3>
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="space-y-2">
                          {Object.entries(selectedBusiness.businessHours).map(([day, hours]) => {
                            const dayNames = {
                              monday: 'Lunes',
                              tuesday: 'Martes', 
                              wednesday: 'Miércoles',
                              thursday: 'Jueves',
                              friday: 'Viernes',
                              saturday: 'Sábado',
                              sunday: 'Domingo'
                            };
                            
                            return (
                              <div key={day} className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-medium">{dayNames[day]}:</span>
                                <span className="text-gray-300">
                                  {hours.closed ? 
                                    'Cerrado' : 
                                    `${hours.open || '09:00'} - ${hours.close || '18:00'}`
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

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

              {/* Información técnica adicional */}
              <div className="mb-8">
                <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                  <Settings size={20} className="text-[#3ecf8e]" />
                  Información Técnica
                </h3>
                <div className="bg-gray-800/20 p-6 rounded-xl border border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">ID del Negocio:</span>
                        <span className="text-gray-300 font-mono text-sm">{selectedBusiness.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">ID del Propietario:</span>
                        <span className="text-gray-300 font-mono text-sm">{selectedBusiness.ownerId || 'No disponible'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Tiene Ubicación:</span>
                        <span className={`text-sm font-medium ${selectedBusiness.location ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedBusiness.location ? 'Sí' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Tiene Horarios:</span>
                        <span className={`text-sm font-medium ${selectedBusiness.businessHours ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedBusiness.businessHours ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Rating Base:</span>
                        <span className="text-gray-300 text-sm">{selectedBusiness.rating || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Reviews Campo:</span>
                        <span className="text-gray-300 text-sm">{selectedBusiness.totalReviews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Imágenes:</span>
                        <span className="text-gray-300 text-sm">{selectedBusiness.images?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Datos Completos:</span>
                        <span className={`text-sm font-medium ${
                          selectedBusiness.name && selectedBusiness.description && selectedBusiness.category ? 
                          'text-green-400' : 'text-yellow-400'
                        }`}>
                          {selectedBusiness.name && selectedBusiness.description && selectedBusiness.category ? 
                           'Completos' : 'Incompletos'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Debug info para desarrollo */}
                  <details className="mt-4">
                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                      Ver datos raw (solo para debugging)
                    </summary>
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                      <pre className="text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify(selectedBusiness, null, 2)}
                      </pre>
                    </div>
                  </details>
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                      <Users size={24} className="text-[#3ecf8e]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedUser.full_name || 'Usuario sin nombre'}</h2>
                      <p className="text-gray-400">Información del usuario</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {getUserRoleBadge(selectedUser.role)}
                    {selectedUser.id === auth.currentUser?.uid && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-400 bg-green-500/20">
                        Tu cuenta
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Users size={20} className="text-[#3ecf8e]" />
                      Información Personal
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <Mail size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Email:</span>
                            <span className="text-gray-300">{selectedUser.email || 'No especificado'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <Phone size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Teléfono:</span>
                            <span className="text-gray-300">{selectedUser.phone || 'No especificado'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-[#3ecf8e] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-400 font-medium block mb-1">Dirección:</span>
                            <span className="text-gray-300">{selectedUser.address || 'No especificada'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                      <Activity size={20} className="text-[#3ecf8e]" />
                      Información del Sistema
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">ID de Usuario:</span>
                        <span className="text-[#3ecf8e] font-mono text-sm">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Rol:</span>
                        <span className="text-gray-300 capitalize">{selectedUser.role || 'user'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Fecha de Registro:</span>
                        <span className="text-gray-300">
                          {selectedUser.createdAt ? 
                            new Date(selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate() : selectedUser.createdAt).toLocaleDateString() :
                            'No disponible'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400 font-medium">Última Actualización:</span>
                        <span className="text-gray-300">
                          {selectedUser.updatedAt ? 
                            new Date(selectedUser.updatedAt.toDate ? selectedUser.updatedAt.toDate() : selectedUser.updatedAt).toLocaleDateString() :
                            'No disponible'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    openUserEditModal(selectedUser)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all flex items-center gap-2"
                >
                  <Edit size={16} />
                  Editar Usuario
                </button>
                
                {selectedUser.id !== auth.currentUser?.uid && (
                  <button
                    onClick={() => {
                      setShowUserModal(false)
                      openUserDeleteModal(selectedUser)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar Usuario
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                    <Edit size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Editar Usuario</h2>
                    <p className="text-gray-400">Modificar información de {userToEdit.full_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserEditModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Users size={16} className="text-[#3ecf8e]" />
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={userEditFormData.full_name}
                      onChange={(e) => setUserEditFormData({...userEditFormData, full_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-[#3ecf8e]" />
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={userEditFormData.email}
                      onChange={(e) => setUserEditFormData({...userEditFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                      placeholder="Ej: juan@ejemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Shield size={16} className="text-[#3ecf8e]" />
                      Rol *
                    </label>
                    <select
                      value={userEditFormData.role}
                      onChange={(e) => setUserEditFormData({...userEditFormData, role: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                      required
                    >
                      <option value="user">Usuario</option>
                      <option value="business_owner">Propietario de Negocio</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-[#3ecf8e]" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={userEditFormData.phone}
                      onChange={(e) => setUserEditFormData({...userEditFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                      placeholder="Ej: +52 55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-[#3ecf8e]" />
                    Dirección
                  </label>
                  <textarea
                    value={userEditFormData.address}
                    onChange={(e) => setUserEditFormData({...userEditFormData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                    rows={3}
                    placeholder="Dirección completa..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUserEditModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                    disabled={userEditLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={userEditLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {userEditLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Edit size={16} />
                        Actualizar Usuario
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Delete Modal */}
      {showUserDeleteModal && userToDelete && (
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
                    <Users size={20} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">¿Estás seguro que deseas eliminar este usuario?</h3>
                    <p className="text-red-300 font-medium text-lg mb-2">{userToDelete.full_name}</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Email: {userToDelete.email}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-red-300">Se eliminará permanentemente:</p>
                      <div className="grid grid-cols-1 gap-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>Perfil del usuario</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>Datos personales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          <span>Historial de actividad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowUserDeleteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                  disabled={userDeleteLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete.id)}
                  disabled={userDeleteLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {userDeleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar Usuario
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
