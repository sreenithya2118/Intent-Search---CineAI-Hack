// In dev, use relative paths so Vite proxy forwards to backend (avoids CORS)
const toLocalUrl = (url) => (import.meta.env.DEV && url ? url.replace('http://localhost:8000', '') : url)

const ResultCard = ({ item, index }) => {
  const frameSrc = item.best_frame ? (import.meta.env.DEV ? `/frames/${item.best_frame}` : `http://localhost:8000/frames/${item.best_frame}`) : null
  const videoSrc = toLocalUrl(item.video_url)
  const fullVideoHref = toLocalUrl(item.full_video_url) || item.full_video_url
  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-info">
          <h3>Match {index}</h3>
          <p className="text-muted" style={{ marginBottom: '10px' }}>{item.caption}</p>
          <div>
            {item.source === 'audio' && (
              <span className="badge badge-intent" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                🎤 Dialog
              </span>
            )}
            <span className="badge badge-score">
              Match: {item.score.toFixed(2)}
            </span>
            <span className="badge badge-intent">
              When: {item.intent}
            </span>
            <span className="badge badge-time">
              {item.start.toFixed(1)}s - {item.end.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
      <div className="media-container">
        <div className="frame-preview">
          {frameSrc && (
            <img
              src={frameSrc}
              alt="Frame preview"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
        </div>
        <div>
          <video controls preload="metadata">
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <a
        href={fullVideoHref}
        target="_blank"
        rel="noopener noreferrer"
        className="link-btn"
      >
        {item.is_youtube === false ? '🔗 View full clip' : '🔗 Open in YouTube'}
      </a>
    </div>
  )
}

export default ResultCard

