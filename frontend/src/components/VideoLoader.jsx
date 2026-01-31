import { useState, useRef } from 'react'
import { videoAPI } from '../services/api'

const ACCEPTED_VIDEO = '.mp4,.mov,.webm,.avi,.mkv'
const ACCEPTED_EXT = ['.mp4', '.mov', '.webm', '.avi', '.mkv']

const VideoLoader = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeTab, setActiveTab] = useState('youtube') // 'youtube' | 'upload'
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const isValidVideo = (file) => ACCEPTED_EXT.some(ext => file.name.toLowerCase().endsWith(ext))

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

  const processClips = async () => {
    if (!selectedFiles.length) {
      alert('⚠️ Please select one or more video files')
      return
    }

    setLoading(true)
    setStatus({ state: 'processing', message: 'Uploading clips...' })

    try {
      const result = await videoAPI.processClips(selectedFiles)
      if (result.error) {
        setStatus({ state: 'error', message: result.error })
        setLoading(false)
        return
      }
      pollStatus()
    } catch (error) {
      setStatus({ state: 'error', message: 'Error uploading: ' + (error.message || 'Unknown error') })
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
            setSelectedFiles([])
          }
        }
      } catch (error) {
        console.error('Status polling error:', error)
        clearInterval(interval)
        setLoading(false)
      }
    }, 2000)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).filter(isValidVideo)
    setSelectedFiles(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || []).filter(isValidVideo)
    setSelectedFiles(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <section id="load-video" className="section">
      <h2>🔄 Add video content</h2>
      <p className="text-muted" style={{ marginBottom: '16px' }}>
        Add a YouTube video or upload multiple video clips. We extract frames and make them searchable.
      </p>

      {/* Tabs */}
      <div className="upload-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
          onClick={() => setActiveTab('youtube')}
          style={{
            padding: '10px 20px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            background: activeTab === 'youtube' ? 'var(--primary)' : 'var(--surface)',
            color: activeTab === 'youtube' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          YouTube URL
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 20px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            background: activeTab === 'upload' ? 'var(--primary)' : 'var(--surface)',
            color: activeTab === 'upload' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Upload clips
        </button>
      </div>

      {/* YouTube tab */}
      {activeTab === 'youtube' && (
        <div className="input-group">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && processVideo()}
            placeholder="Paste YouTube link here"
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
                <span>Add video</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload clips tab */}
      {activeTab === 'upload' && (
        <div>
          <div
            className="file-drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '12px',
              background: isDragging ? 'var(--primary-light)' : 'var(--surface-alt)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO}
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p className="text-muted" style={{ marginBottom: '8px' }}>
              {isDragging ? 'Drop files here...' : 'Click to select or drag video files (mp4, mov, webm, avi, mkv)'}
            </p>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : 'Multiple files supported'}
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
              {selectedFiles.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="text-muted">{f.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            className="btn btn-primary"
            onClick={processClips}
            disabled={loading || selectedFiles.length === 0}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Upload & process</span>
              </>
            )}
          </button>
        </div>
      )}

      {status.message && (
        <div className={`status ${status.state}`} style={{ marginTop: '16px' }}>
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

