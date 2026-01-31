import { motion } from 'framer-motion'
import VideoLoader from '../components/VideoLoader'
import { Video, Upload, Youtube, Zap } from 'lucide-react'
import LottieAnimation from '../components/LottieAnimation'
import uploadingAnimation from '../../lottiefiles/uploading.json'

export default function UploadVideoPage() {
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
              <Video size={16} />
              <span>Video Processing</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="page-hero-title"
            >
              Upload
              <span className="gradient-text"> Videos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="page-hero-description"
            >
              Upload video files or paste YouTube URLs. Our AI will extract frames, 
              generate captions, and make your videos searchable in seconds.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="page-hero-features"
            >
              <div className="hero-feature-item">
                <Youtube size={20} />
                <span>YouTube Support</span>
              </div>
              <div className="hero-feature-item">
                <Upload size={20} />
                <span>File Upload</span>
              </div>
              <div className="hero-feature-item">
                <Zap size={20} />
                <span>Fast Processing</span>
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
              animationData={uploadingAnimation}
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
                    <Video size={100} />
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
        <VideoLoader />
      </motion.div>
    </div>
  )
}
