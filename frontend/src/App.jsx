import { Hero } from '@/components/ui/animated-hero'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import Header from './components/Header'
import Footer from './components/Footer'
import VideoLoader from './components/VideoLoader'
import RAGSearch from './components/RAGSearch'
import ProductionPlanner from './components/ProductionPlanner'
import './App.css'

function App() {
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
      <Hero />
      <Header />
      <div className="container">
        <main className="content">
          <VideoLoader />
          {/* <BasicSearch /> */}
          <RAGSearch />
          <ProductionPlanner />
        </main>
      </div>
      <Footer />
      </div>
    </div>
  )
}

export default App
