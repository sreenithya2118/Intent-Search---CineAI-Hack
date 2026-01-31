import { FlickeringGrid } from '@/components/ui/flickering-grid'
import Header from './Header'
import Footer from './Footer'
import { Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen relative">
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
      <div className="relative z-10">
        <Header />
        {!isHomePage && (
          <div className="hero-wrapper" style={{ padding: '60px 0 40px' }}>
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground">
                {location.pathname === '/upload' && '📥 Upload Video'}
                {location.pathname === '/search' && '🔍 Multimodal Search'}
                {location.pathname === '/production-planner' && '📋 Production Planner'}
              </h1>
            </div>
          </div>
        )}
        <Outlet />
        <Footer />
      </div>
    </div>
  )
}

