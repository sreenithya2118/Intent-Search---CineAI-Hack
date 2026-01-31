import { useState } from 'react'
import { videoAPI } from '../services/api'
import ResultCard from './ResultCard'

const BasicSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('⚠️ Please enter a search query')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const data = await videoAPI.basicSearch(query)
      setResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      alert('❌ Error connecting to backend: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="basic-search" className="section">
      <h2>🔍 Intent-based retrieval</h2>
      <p className="text-muted" style={{ marginBottom: '16px' }}>
        Dense retrieval over frame captions in embedding space (cosine similarity). Temporal intent (before / after / during) segments the timeline and adjusts clip boundaries; results return trimmed MP4 clips and optional YouTube deep links.
      </p>
      <div className="input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
          placeholder="e.g. before goal, crowd celebrating, after whistle"
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <>
              <span className="loading"></span>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>🔎</span>
              <span>Retrieve</span>
            </>
          )}
        </button>
      </div>
      <div className="results">
        {loading && (
          <div className="loading-block">
            <div className="loading"></div>
            <p>Searching...</p>
          </div>
        )}
        {!loading && results.length === 0 && query && (
          <div className="empty-state">
            <p>No hits above threshold. Try rephrasing or lowering similarity threshold.</p>
          </div>
        )}
        {!loading && results.map((item, index) => (
          <ResultCard key={index} item={item} index={index + 1} />
        ))}
      </div>
    </section>
  )
}

export default BasicSearch

