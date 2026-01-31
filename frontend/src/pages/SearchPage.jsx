import { motion } from 'framer-motion'
import RAGSearch from '../components/RAGSearch'
import { Search, Sparkles, Brain, Zap } from 'lucide-react'
import LottieAnimation from '../components/LottieAnimation'
import multimodalAnimation from '../../lottiefiles/multimodal.json'

export default function SearchPage() {
  return (
    <div className="enhanced-page">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="page-hero-section"
      >
        <div className="page-hero-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="page-hero-animation"
          >
            <LottieAnimation
              animationData={multimodalAnimation}
              fallback={
                <div className="hero-animation-fallback">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="animated-search-icon-large"
                  >
                    <Search size={100} />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="animated-pulse-ring"
                  />
                </div>
              }
            />
          </motion.div>
          <div className="page-hero-text">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="page-hero-badge"
            >
              <Sparkles size={16} />
              <span>AI-Powered Search</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="page-hero-title"
            >
              Multimodal
              <span className="gradient-text"> Search</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="page-hero-description"
            >
              Type your idea. We suggest better ways to search, then you pick one. 
              You get short clips plus a simple explanation and summary.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="page-hero-features"
            >
              <div className="hero-feature-item">
                <Brain size={20} />
                <span>AI Suggestions</span>
              </div>
              <div className="hero-feature-item">
                <Zap size={20} />
                <span>Lightning Fast</span>
              </div>
              <div className="hero-feature-item">
                <Search size={20} />
                <span>Precise Results</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="page-main-content"
      >
        <RAGSearch />
      </motion.div>
    </div>
  )
}
