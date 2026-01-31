import { useState } from 'react'
import { videoAPI } from '../services/api'
import ResultCard from './ResultCard'
import { Search, Headphones } from 'lucide-react'

const RAGSearch = () => {
  const [query, setQuery] = useState('')
  const [preSuggestions, setPreSuggestions] = useState(null)
  const [ragData, setRagData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [searchMode, setSearchMode] = useState('multimodal') // 'multimodal' or 'audio'

  // Step 1: Get better-sentence suggestions (before searching)
  const handleGetSuggestions = async () => {
    const q = query.trim()
    if (!q) {
      alert('⚠️ Please enter a search query')
      return
    }
    setLoadingSuggestions(true)
    setPreSuggestions(null)
    setRagData(null)
    try {
      const data = await videoAPI.getRAGSuggestions(q)
      setPreSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('RAG suggestions error:', error)
      setPreSuggestions(null)
      alert('❌ Error: ' + (error.message || 'Unknown error'))
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Step 2: Run RAG search (after user picks a suggestion)
  const handleRAGSearch = async (chosenPrompt) => {
    const searchQuery = (chosenPrompt != null ? chosenPrompt : query).trim()
    if (!searchQuery) {
      alert('⚠️ Please enter or choose a search query')
      return
    }
    if (chosenPrompt != null) setQuery(chosenPrompt)
    setPreSuggestions(null)
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
            setPreSuggestions(null)
          }}
          disabled={loading || loadingSuggestions}
        >
          <Search size={18} />
          <span>Multimodal Search</span>
        </button>
        <button
          className={`mode-toggle-btn ${searchMode === 'audio' ? 'active' : ''}`}
          onClick={() => {
            setSearchMode('audio')
            setRagData(null)
            setPreSuggestions(null)
          }}
          disabled={loading || loadingSuggestions}
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
          onKeyPress={(e) => e.key === 'Enter' && !loadingSuggestions && !loading && handleGetSuggestions()}
          placeholder={searchMode === 'audio' ? "e.g. when they say hello, dialogue about the mission" : "e.g. crowd celebrating after goal"}
          disabled={loadingSuggestions || loading}
        />
        <button className="btn btn-secondary" onClick={handleGetSuggestions} disabled={loadingSuggestions || loading}>
          {loadingSuggestions ? (
            <>
              <span className="loading"></span>
              <span>Finding better search phrases...</span>
            </>
          ) : loading ? (
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
        {loadingSuggestions && (
          <div className="loading-block">
            <div className="loading"></div>
            <p>Finding better ways to search...</p>
          </div>
        )}
        {preSuggestions && preSuggestions.length > 0 && !loading && (
          <div className="ai-explanation" style={{ marginBottom: '20px' }}>
            <h4>💡 Try one of these</h4>
            <p className="text-muted">
              Click a phrase to search with it.
            </p>
            <div className="suggestions">
              {preSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleRAGSearch(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
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
              {ragData.suggestions && ragData.suggestions.length > 0 && (
                <>
                  <h4>💡 Try searching for</h4>
                  <p className="text-muted">
                    Click to search with that phrase.
                  </p>
                  <div className="suggestions">
                    {ragData.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="suggestion-chip"
                        onClick={() => handleRAGSearch(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                    : 'No clips found. Try another phrase or use the suggestions above.'}
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

