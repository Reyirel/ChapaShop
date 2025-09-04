import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Negocios from './pages/Negocios'
import NegocioDetail from './pages/NegocioDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/negocios" element={<Negocios />} />
            <Route path="/negocio/:id" element={<NegocioDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
