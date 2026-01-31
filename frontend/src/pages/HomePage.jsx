import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Video, Search, Sparkles, ArrowRight, Zap, Shield, Brain, TrendingUp, Play, Upload as UploadIcon } from 'lucide-react'
import LottieAnimation from '../components/LottieAnimation'

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Search through hours of video in seconds with AI-powered semantic search"
  },
  {
    icon: Brain,
    title: "AI-Powered",
    description: "Understand context, emotions, and temporal relationships in your queries"
  },
  {
    icon: Shield,
    title: "Accurate Results",
    description: "Get precise video moments with relevance scoring and smart clustering"
  },
  {
    icon: TrendingUp,
    title: "Natural Language",
    description: "Search with your own words - no need to remember exact keywords"
  }
]

export default function HomePage() {
  return (
    <div className="home-page-enhanced">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            <Sparkles size={16} />
            <span>AI-Powered Video Search</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
          >
            Find Moments in Videos with
            <span className="gradient-text"> Natural Language</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-description"
          >
            Upload videos or paste YouTube links. Our AI extracts frames, generates captions,
            and makes every moment searchable. Find exactly what you're looking for with simple queries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-actions"
          >
            <Button size="lg" className="hero-btn-primary" asChild>
              <Link to="/upload">
                <Video size={20} />
                Upload Video
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="hero-btn-secondary" asChild>
              <Link to="/search">
                <Search size={20} />
                Start Searching
                <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Animation Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-animation"
        >
          <div className="animation-container">
            <LottieAnimation
              type="video"
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
                    <Video size={120} />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      x: [0, 20, 0],
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="animated-search-icon"
                  >
                    <Search size={60} />
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
                      delay: 1
                    }}
                    className="animated-pulse-ring"
                  />
                </div>
              }
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="stats-section"
      >
        <div className="stats-container">
          {[
            { value: "1000+", label: "Videos Processed", icon: Video },
            { value: "99%", label: "Accuracy Rate", icon: Shield },
            { value: "< 2s", label: "Search Speed", icon: Zap },
            { value: "24/7", label: "Available", icon: Brain }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="stat-card"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Icon size={32} className="stat-icon" />
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="features-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="features-header"
        >
          <h2 className="features-title">Why Choose Our Platform?</h2>
          <p className="features-subtitle">
            Powerful features that make video search effortless and intelligent
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="feature-card"
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div className="feature-icon-wrapper">
                  <Icon size={32} className="feature-icon" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="how-it-works-header"
        >
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to find any moment in your videos</p>
        </motion.div>

        <div className="steps-container">
          {[
            { step: 1, title: "Upload Video", description: "Paste a YouTube URL or upload video files", icon: Video },
            { step: 2, title: "AI Processing", description: "We extract frames and generate AI captions", icon: Brain },
            { step: 3, title: "Search & Find", description: "Search with natural language and get precise results", icon: Search }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="step-card"
              >
                <div className="step-number">{item.step}</div>
                <div className="step-icon-wrapper">
                  <Icon size={40} className="step-icon" />
                </div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="cta-section"
      >
        <div className="cta-content">
          <h2 className="cta-title">Ready to Search Your Videos?</h2>
          <p className="cta-description">
            Start uploading videos and experience the power of AI-powered semantic search
          </p>
          <div className="cta-buttons">
            <Button size="lg" className="cta-btn-primary" asChild>
              <Link to="/upload">
                <Video size={20} />
                Get Started
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
