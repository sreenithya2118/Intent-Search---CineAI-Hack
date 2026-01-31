import { Hero } from '@/components/ui/animated-hero'
import VideoLoader from './components/VideoLoader'
import BasicSearch from './components/BasicSearch'
import RAGSearch from './components/RAGSearch'
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="container">
        <main className="content">
          <VideoLoader />
          <BasicSearch />
          <RAGSearch />
        </main>
      </div>
    </div>
  )
}

export default App
