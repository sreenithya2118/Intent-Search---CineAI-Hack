import { useState, useRef, useEffect } from 'react'
import { videoAPI } from '../services/api'
import { Upload, Youtube, FileVideo, X } from 'lucide-react'

// In dev, use relative paths so Vite proxy forwards to backend
const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:8000'

const ACCEPTED_VIDEO = '.mp4,.mov,.webm,.avi,.mkv'
const ACCEPTED_EXT = ['.mp4', '.mov', '.webm', '.avi', '.mkv']

const VideoLoader = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeTab, setActiveTab] = useState('youtube') // 'youtube' | 'upload'
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const [uploadedClips, setUploadedClips] = useState([])
  const fileInputRef = useRef(null)

  const fetchUploadedClips = async () => {
    try {
      const { clips } = await videoAPI.getSourceClips()
      setUploadedClips(clips || [])
    } catch (e) {
      console.error('Failed to fetch clips:', e)
    }
  }

  useEffect(() => {
    fetchUploadedClips()
  }, [])

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
            fetchUploadedClips()
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
    <div className="upload-video-container enhanced-upload-section">
      {/* Upload Options */}
      <div className="upload-options">
        {/* YouTube URL Option */}
        <div className="upload-option-card">
          <div className="upload-option-header">
            <Youtube className="upload-option-icon" size={24} />
            <h3 className="upload-option-title">YouTube URL</h3>
          </div>
          <div className="upload-option-content">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && processVideo()}
              placeholder="Paste YouTube link here"
              disabled={loading}
              className="youtube-input"
            />
            <button
              className="upload-action-btn"
              onClick={processVideo}
              disabled={loading || !videoUrl.trim()}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Process Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Upload Option */}
        <div className="upload-option-card">
          <div className="upload-option-header">
            <FileVideo className="upload-option-icon" size={24} />
            <h3 className="upload-option-title">Upload Video Files</h3>
          </div>
          <div
            className={`file-drop-zone-large ${isDragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO}
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="upload-icon-large">
              <Upload size={48} />
            </div>
            <p className="upload-main-text">
              {isDragging ? 'Drop files here...' : 'Drag & drop your video files here'}
            </p>
            <p className="upload-sub-text">
              or click to browse • MP4, MOV, WEBM, AVI, MKV (max 100MB per file)
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="selected-files-list">
              {selectedFiles.map((f, i) => (
                <div key={i} className="selected-file-item">
                  <FileVideo size={18} className="file-icon" />
                  <span className="file-name">{f.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    className="remove-file-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="upload-action-btn-large"
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
                <Upload size={20} />
                <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}Video{selectedFiles.length !== 1 ? 's' : ''} to Continue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status.message && (
        <div className={`upload-status ${status.state}`}>
          <span>
            {status.state === 'processing' && '⏳'}
            {status.state === 'completed' && '✅'}
            {status.state === 'error' && '❌'}
            {status.state === 'idle' && 'ℹ️'}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      {/* Uploaded Videos Section */}
      {uploadedClips.length > 0 && (
        <div className="uploaded-videos-section">
          <div className="section-header">
            <h2 className="section-title">
              <FileVideo size={20} />
              Your Uploaded Videos
            </h2>
            <span className="section-count">{uploadedClips.length} video{uploadedClips.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="videos-grid">
            {uploadedClips.map((clip) => (
              <div key={clip.name} className="video-card">
                <video
                  controls
                  preload="metadata"
                  className="video-preview"
                  src={`${API_BASE}${clip.url}`}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="video-card-info">
                  <span className="video-name">{clip.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoLoader

