import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Negocios from './pages/Negocios'
import NegocioDetail from './pages/NegocioDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import './App.css'

// Componente interno que tiene acceso al contexto de auth
const AppContent = () => {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/negocios" element={<Negocios />} />
        <Route path="/negocio/:id" element={<NegocioDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/business-dashboard" element={<BusinessDashboard />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
