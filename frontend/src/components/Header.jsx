import { Film, Sparkles, ClipboardList, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/upload', label: 'Upload Video', icon: Film },
  { path: '/search', label: 'Multimodal Search', icon: Sparkles },
  { path: '/production-planner', label: 'Production Planner', icon: ClipboardList },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link">
          <div className="sidebar-logo-icon">🎬</div>
          <span className="sidebar-logo-text">Semantic Video Search</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navLinks.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link 
              key={path} 
              to={path} 
              className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-nav-icon" size={20} />
              <span className="sidebar-nav-label">{label}</span>
            </Link>
          )
        })}
        </nav>

      {/* User Profile Section (Optional - can be removed or made functional later) */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">👤</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">User</div>
            <div className="sidebar-user-email">user@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
