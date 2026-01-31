import { Film, Sparkles, ClipboardList, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/upload', label: 'Upload Video', icon: Film },
  { path: '/search', label: 'Multimodal Search', icon: Sparkles },
  { path: '/production-planner', label: 'Production Planner', icon: ClipboardList },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="app-header navbar-top">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-icon">🎬</span>
          <div className="header-logo-text-block">
            <span className="header-logo-text">Semantic Video Search</span>
            <span className="header-tagline">Add a video, then search with your words</span>
          </div>
        </Link>
        <nav className="header-nav">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link 
                key={path} 
                to={path} 
                className={`header-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="header-nav-icon" size={22} />
                <span className="header-nav-label">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
