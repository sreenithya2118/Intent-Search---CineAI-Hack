import { FlickeringGrid } from '@/components/ui/flickering-grid'
import Sidebar from './Header'
import Footer from './Footer'
import { Outlet, useLocation } from 'react-router-dom'
import { Film, Sparkles, ClipboardList } from 'lucide-react'

const pageInfo = {
  '/upload': { label: 'Upload Video', icon: Film },
  '/search': { label: 'Multimodal Search', icon: Sparkles },
  '/production-planner': { label: 'Production Planner', icon: ClipboardList },
}

export default function Layout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const currentPage = pageInfo[location.pathname]
  const PageIcon = currentPage?.icon

  return (
    <div className="app-layout">
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
        }}
      >
        <FlickeringGrid
          squareSize={4}
          gridGap={6}
          color="#60A5FA"
          maxOpacity={0.5}
          flickerChance={0.1}
          className="absolute inset-0 size-full"
        />
      </div>
      <div className="layout-container">
        <Sidebar />
        <main className="main-content">
          {!isHomePage && currentPage && (
            <div className="page-header">
              <div className="page-title-container">
                {PageIcon && <PageIcon className="page-title-icon" size={24} />}
                <h1 className="page-title">{currentPage.label}</h1>
              </div>
            </div>
          )}
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  )
}

