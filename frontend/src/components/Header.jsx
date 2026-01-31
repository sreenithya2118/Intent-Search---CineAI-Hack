import { Film, Search, Sparkles } from 'lucide-react'

const navLinks = [
  { href: '#load-video', label: 'Ingest pipeline', icon: Film },
  { href: '#basic-search', label: 'Dense retrieval', icon: Search },
  { href: '#rag-search', label: 'RAG + LLM', icon: Sparkles },
]

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a href="#" className="header-logo">
          <span className="header-logo-icon">🎬</span>
          <span className="header-logo-text">Semantic Video Search</span>
          <span className="header-tagline">Frame-level captioning · ChromaDB · temporal intent</span>
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
