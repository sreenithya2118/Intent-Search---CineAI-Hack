import { useState } from 'react'
import { videoAPI } from '../services/api'

const VideoLoader = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [loading, setLoading] = useState(false)

  const processVideo = async () => {
    if (!videoUrl.trim()) {
      alert('⚠️ Please enter a YouTube URL')
      return
    }

    setLoading(true)
    setStatus({ state: 'processing', message: 'Starting...' })

    try {
      await videoAPI.processVideo(videoUrl)
      pollStatus()
    } catch (error) {
      setStatus({ state: 'error', message: 'Error starting job: ' + (error.message || 'Unknown error') })
      setLoading(false)
    }
  }

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const data = await videoAPI.getStatus()
        setStatus(data)

        if (data.state === 'completed' || data.state === 'error') {
          clearInterval(interval)
          setLoading(false)
          if (data.state === 'completed') {
            alert('✅ Video processed! You can now search.')
          }
        }
      } catch (error) {
        console.error('Status polling error:', error)
        clearInterval(interval)
        setLoading(false)
      }
    }, 2000)
  }

  return (
    <section id="load-video" className="section">
      <h2>🔄 Ingest pipeline</h2>
      <p className="text-muted" style={{ marginBottom: '16px' }}>
        YouTube URL → yt-dlp download → ffmpeg frame extraction (5 FPS) → Vit-GPT2 image captioning (encoder–decoder) → SBERT sentence embeddings → ChromaDB persistence (cosine similarity). Index is built per video; run once before retrieval.
      </p>
      <div className="input-group">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && processVideo()}
          placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={processVideo}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>📥</span>
              <span>Ingest video</span>
            </>
          )}
        </button>
      </div>
      {status.message && (
        <div className={`status ${status.state}`}>
          <span>
            {status.state === 'processing' && '⏳'}
            {status.state === 'completed' && '✅'}
            {status.state === 'error' && '❌'}
            {status.state === 'idle' && 'ℹ️'}
          </span>
          <span>Status: {status.message}</span>
        </div>
      )}
    </section>
  )
}

export default VideoLoader

