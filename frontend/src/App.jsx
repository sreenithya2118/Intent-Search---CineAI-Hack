import { Hero } from '@/components/ui/animated-hero'
import Header from './components/Header'
import Footer from './components/Footer'
import VideoLoader from './components/VideoLoader'
import BasicSearch from './components/BasicSearch'
import RAGSearch from './components/RAGSearch'
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <div className="container">
        <main className="content">
          <VideoLoader />
          <BasicSearch />
          <RAGSearch />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
