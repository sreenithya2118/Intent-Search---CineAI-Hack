import { useState } from 'react'
import { videoAPI } from '../services/api'
import ResultCard from './ResultCard'
import { Search, Headphones } from 'lucide-react'

const RAGSearch = () => {
  const [query, setQuery] = useState('')
  const [ragData, setRagData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchMode, setSearchMode] = useState('multimodal') // 'multimodal' or 'audio'

  const handleSearch = async () => {
    const searchQuery = query.trim()
    if (!searchQuery) {
      alert('⚠️ Please enter a search query')
      return
    }
    setLoading(true)
    setRagData(null)
    try {
      let data
      if (searchMode === 'audio') {
        data = await videoAPI.audioSearch(searchQuery)
      } else {
        data = await videoAPI.ragSearch(searchQuery)
      }
      setRagData(data)
    } catch (error) {
      console.error('Search error:', error)
      setRagData(null)
      alert('❌ Error: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="rag-search" className="section enhanced-search-section">
      {/* Search Mode Toggle */}
      <div className="search-mode-toggle">
        <button
          className={`mode-toggle-btn ${searchMode === 'multimodal' ? 'active' : ''}`}
          onClick={() => {
            setSearchMode('multimodal')
            setRagData(null)
          }}
          disabled={loading}
        >
          <Search size={18} />
          <span>Multimodal Search</span>
        </button>
        <button
          className={`mode-toggle-btn ${searchMode === 'audio' ? 'active' : ''}`}
          onClick={() => {
            setSearchMode('audio')
            setRagData(null)
          }}
          disabled={loading}
        >
          <Headphones size={18} />
          <span>Audio Search</span>
        </button>
      </div>

      <div className="input-group enhanced-input-group">
        <input
          id="rag-query-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
          placeholder={searchMode === 'audio' ? "e.g. when they say hello, dialogue about the mission" : "e.g. crowd celebrating after goal"}
          disabled={loading}
        />
        <button className="btn btn-secondary" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <>
              <span className="loading"></span>
              <span>Searching...</span>
            </>
          ) : (
            <>
              {searchMode === 'audio' ? <Headphones size={18} /> : <span>✨</span>}
              <span>{searchMode === 'audio' ? 'Audio Search' : 'Multi modal search'}</span>
            </>
          )}
        </button>
      </div>
      <div className="results">
        {loading && (
          <div className="loading-block">
            <div className="loading"></div>
            <p>Searching with AI...</p>
          </div>
        )}
        {ragData && (
          <>
            <div className="ai-explanation">
              <h4>💡 Explanation</h4>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
                {ragData.explanation || 'No explanation available.'}
              </p>
              <h4>📊 Summary</h4>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
                {ragData.summary || 'No summary available.'}
              </p>
            </div>
            {ragData.results && ragData.results.length > 0 ? (
              <>
                <h3>
                  {searchMode === 'audio' ? '🎵' : '🎬'} Found {ragData.count} clip{ragData.count !== 1 ? 's' : ''} 
                  {searchMode === 'audio' && ' (from audio transcriptions)'}:
                </h3>
                {ragData.results.map((item, index) => (
                  <ResultCard key={index} item={item} index={index + 1} />
                ))}
              </>
            ) : (
              <div className="empty-state">
                <p>
                  {searchMode === 'audio' 
                    ? 'No audio transcriptions found. Make sure videos have been processed with audio transcription.'
                    : 'No clips found. Try another phrase.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default RAGSearch

