import { motion } from 'framer-motion'
import ProductionPlanner from '../components/ProductionPlanner'
import { ClipboardList, Film, TrendingUp, Shield } from 'lucide-react'
import LottieAnimation from '../components/LottieAnimation'
import planAchievedAnimation from '../../lottiefiles/Plan achieved.json'

export default function ProductionPlannerPage() {
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
          <div className="page-hero-text">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="page-hero-badge"
            >
              <ClipboardList size={16} />
              <span>AI Production Planning</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="page-hero-title"
            >
              Production
              <span className="gradient-text"> Planner</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="page-hero-description"
            >
              Enter your script and budget to get a complete production breakdown with 
              scene analysis, budget allocation, safety requirements, and risk assessment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="page-hero-features"
            >
              <div className="hero-feature-item">
                <Film size={20} />
                <span>Scene Breakdown</span>
              </div>
              <div className="hero-feature-item">
                <TrendingUp size={20} />
                <span>Budget Analysis</span>
              </div>
              <div className="hero-feature-item">
                <Shield size={20} />
                <span>Risk Assessment</span>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="page-hero-animation"
          >
            <LottieAnimation
              animationData={planAchievedAnimation}
              fallback={
                <div className="hero-animation-fallback">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="animated-video-icon"
                  >
                    <ClipboardList size={100} />
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
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="page-main-content"
      >
        <ProductionPlanner />
      </motion.div>
    </div>
  )
}
