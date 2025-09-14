import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Building, Calendar, ArrowLeft, Save, Edit3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'

const Profile = () => {
  const { user, userProfile: profile, updateProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    business_description: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        business_name: profile.business_name || '',
        business_description: profile.business_description || ''
      })
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setSaveLoading(true)
    setError('')
    setMessage('')

    try {
      if (!user?.uid) {
        throw new Error('Usuario no autenticado')
      }

      // Llamar updateProfile con userId y updates
      await updateProfile(user.uid, formData)
      
      setMessage('Perfil actualizado exitosamente')
      setIsEditing(false)
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(`Error al actualizar perfil: ${error.message}`)
    } finally {
      setSaveLoading(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'business': return 'Negocio'
      case 'person': return 'Usuario'
      case 'client': return 'Cliente'
      default: return 'Usuario'
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'business': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'person': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'client': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const HeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <GridPattern />
      <GlowOrbs />
      <FloatingParticles />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <HeroBackground />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#3ecf8e]/20 border-t-[#3ecf8e] rounded-full animate-spin"></div>
          <span>Cargando perfil...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <HeroBackground />
      
      <div className="relative z-10 min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#3ecf8e] hover:text-white transition-colors mb-4 sm:mb-6 lg:mb-8 group text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al inicio</span>
          </Link>

          {/* Profile Card */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3ecf8e]/10 to-transparent p-4 sm:p-6 lg:p-8 border-b border-gray-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-full flex items-center justify-center text-black text-lg sm:text-xl lg:text-2xl font-bold flex-shrink-0">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{profile?.full_name || 'Usuario'}</h1>
                    <p className="text-gray-400 text-sm sm:text-base truncate">{user?.email}</p>
                    <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm mt-1 sm:mt-2 ${getRoleBadgeClass(profile?.role)}`}>
                      <User size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="truncate">{getRoleDisplayName(profile?.role)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#3ecf8e] text-black rounded-lg sm:rounded-xl font-semibold hover:bg-[#2ebd7e] transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Edit3 size={14} className="sm:w-4 sm:h-4" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="mx-3 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 bg-green-900/30 border border-green-500/50 text-green-400 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
                {message}
              </div>
            )}

            {error && (
              <div className="mx-3 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 bg-red-900/30 border border-red-500/50 text-red-400 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Profile Form */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <User size={18} className="sm:w-5 sm:h-5 text-[#3ecf8e]" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="lg:col-span-1">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Nombre Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all text-sm sm:text-base"
                        placeholder="Tu nombre completo"
                      />
                    ) : (
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 text-sm sm:text-base">
                        {profile?.full_name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-white text-sm font-semibold mb-2">
                      <Mail size={14} className="sm:w-4 sm:h-4 inline mr-1" />
                      Email
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 text-sm sm:text-base">
                      {user?.email}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-white text-sm font-semibold mb-2">
                      <Phone size={14} className="sm:w-4 sm:h-4 inline mr-1" />
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all text-sm sm:text-base"
                        placeholder="+52 123 456 7890"
                      />
                    ) : (
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 text-sm sm:text-base">
                        {profile?.phone || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Tipo de Usuario
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getRoleBadgeClass(profile?.role || 'person')}`}>
                        {getRoleDisplayName(profile?.role || 'person')}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-white text-sm font-semibold mb-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4 inline mr-1" />
                      Miembro desde
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 text-sm sm:text-base">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information (only for business users) */}
              {profile?.role === 'business' && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Building size={18} className="sm:w-5 sm:h-5 text-[#3ecf8e]" />
                    Información del Negocio
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Nombre del Negocio
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all text-sm sm:text-base"
                          placeholder="Nombre de tu negocio"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 text-sm sm:text-base">
                          {profile?.business_name || 'No especificado'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Descripción del Negocio
                      </label>
                      {isEditing ? (
                        <textarea
                          name="business_description"
                          value={formData.business_description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all resize-none text-sm sm:text-base"
                          placeholder="Describe tu negocio..."
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-700 rounded-lg sm:rounded-xl text-gray-300 min-h-[80px] text-sm sm:text-base">
                          {profile?.business_description || 'No especificado'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-6 border-t border-gray-700/50 gap-3 sm:gap-0">
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#3ecf8e] text-black rounded-lg sm:rounded-xl font-semibold hover:bg-[#2ebd7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                  >
                    {saveLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={14} className="sm:w-4 sm:h-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
