import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

// Popular free LottieFiles animations for video/search themes
// These are example URLs - you can replace with your preferred animations from https://lottiefiles.com
// To use: Search for animations on LottieFiles, copy the JSON URL, and paste it here
const ANIMATION_URLS = {
  video: null, // Add your LottieFiles URL here, e.g., 'https://lottie.host/embed/...'
  search: null,
  upload: null
}

export default function LottieAnimation({ type = 'video', fallback = null, className = '', url = null, animationData: externalAnimationData = null }) {
  const [animationData, setAnimationData] = useState(externalAnimationData)
  const [loading, setLoading] = useState(!externalAnimationData)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If animation data is passed directly, use it
    if (externalAnimationData) {
      setAnimationData(externalAnimationData)
      setLoading(false)
      setError(false)
      return
    }

    const fetchAnimation = async () => {
      const animationUrl = url || ANIMATION_URLS[type]
      
      if (!animationUrl) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(animationUrl)
        if (!response.ok) throw new Error('Failed to fetch animation')
        const data = await response.json()
        setAnimationData(data)
        setError(false)
      } catch (err) {
        console.warn('Failed to load Lottie animation, using fallback:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimation()
  }, [type, url, externalAnimationData])

  if (loading) {
    return (
      <div className={`lottie-loading ${className}`}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error || !animationData) {
    return fallback || (
      <div className={`lottie-fallback ${className}`}>
        <div className="fallback-animation">
          <div className="animated-circle"></div>
          <div className="animated-circle delay-1"></div>
          <div className="animated-circle delay-2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`lottie-container ${className}`}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

