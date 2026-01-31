import { Film, Search, Sparkles, ClipboardList } from 'lucide-react'

const navLinks = [
  { href: '#load-video', label: 'Add video', icon: Film },
  { href: '#basic-search', label: 'Search', icon: Search },
<<<<<<< Updated upstream
  { href: '#rag-search', label: 'Multi modal search', icon: Sparkles },
=======
  { href: '#rag-search', label: 'Smart search', icon: Sparkles },
  { href: '#production-planner', label: 'Production Planner', icon: ClipboardList },
>>>>>>> Stashed changes
]

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a href="#" className="header-logo">
          <span className="header-logo-icon">🎬</span>
          <span className="header-logo-text">Semantic Video Search</span>
          <span className="header-tagline">Add a video, then search with your words</span>
        </a>
        <nav className="header-nav">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} className="header-nav-link">
              <Icon className="header-nav-icon" size={18} />
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
