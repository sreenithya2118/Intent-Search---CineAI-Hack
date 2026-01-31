import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { videoAPI } from '../services/api'

const RiskDashboard = ({ data }) => {
  const [riskLevelFilter, setRiskLevelFilter] = useState('All')
  const [sceneSearch, setSceneSearch] = useState('')
  const [footageModal, setFootageModal] = useState(null) // { risk, query, results, loading, error }

  // Count risks by level
  const riskCounts = { Low: 0, Medium: 0, High: 0 }
  const scenes = data?.scenes || []
  
  scenes.forEach(scene => {
    (scene.risks || []).forEach(risk => {
      riskCounts[risk.risk_level] = (riskCounts[risk.risk_level] || 0) + 1
    })
  })

  const riskData = [
    { level: 'Low', count: riskCounts.Low, color: '#10b981' },
    { level: 'Medium', count: riskCounts.Medium, color: '#f59e0b' },
    { level: 'High', count: riskCounts.High, color: '#ef4444' }
  ]

  // Get all risks with scene info
  const allRisks = useMemo(() => {
    const list = []
    scenes.forEach(scene => {
      (scene.risks || []).forEach(risk => {
        list.push({
          ...risk,
          scene_number: scene.scene_number,
          scene_title: scene.scene_title
        })
      })
    })
    return list
  }, [scenes])

  // Filter risks by level and scene search
  const filteredRisks = useMemo(() => {
    return allRisks.filter(risk => {
      const matchesLevel = riskLevelFilter === 'All' || risk.risk_level === riskLevelFilter
      const searchLower = sceneSearch.trim().toLowerCase()
      const matchesSearch = !searchLower ||
        (risk.scene_title && risk.scene_title.toLowerCase().includes(searchLower)) ||
        (risk.risk_description && risk.risk_description.toLowerCase().includes(searchLower)) ||
        (risk.mitigation && risk.mitigation.toLowerCase().includes(searchLower))
      return matchesLevel && matchesSearch
    })
  }, [allRisks, riskLevelFilter, sceneSearch])

  const handleMultimodalSearch = async (risk) => {
    const query = [risk.scene_title, risk.risk_description, risk.mitigation]
      .filter(Boolean)
      .join('. ')
    setFootageModal({ risk, query, results: null, loading: true, error: null })
    try {
      const results = await videoAPI.basicSearch(query)
      setFootageModal(prev => ({ ...prev, results: Array.isArray(results) ? results : [], loading: false, error: null }))
    } catch (err) {
      setFootageModal(prev => ({ ...prev, results: [], loading: false, error: err.message || 'Search failed' }))
    }
  }

  const closeFootageModal = () => setFootageModal(null)

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '1.2rem' }}>
        ⚠️ Risk Dashboard
      </h3>

      <div style={{ 
        background: '#171717', 
        padding: '24px', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border-strong)',
        marginBottom: '24px'
      }}>
        <h4 style={{ color: 'var(--text)', marginBottom: '16px' }}>Risk Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="level" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip 
              contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        background: '#171717', 
        padding: '24px', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border-strong)'
      }}>
        <h4 style={{ color: 'var(--text)', marginBottom: '16px' }}>All Risks by Scene</h4>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          marginBottom: '20px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Risk level:</span>
            {['All', 'Low', 'Medium', 'High'].map(level => (
              <button
                key={level}
                onClick={() => setRiskLevelFilter(level)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: riskLevelFilter === level ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: riskLevelFilter === level 
                    ? (level === 'High' ? 'rgba(239, 68, 68, 0.2)' : 
                       level === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 
                       level === 'Low' ? 'rgba(16, 185, 129, 0.2)' : 'var(--primary-dim)')
                    : 'transparent',
                  color: level === 'High' ? '#ef4444' : level === 'Medium' ? '#f59e0b' : level === 'Low' ? '#10b981' : 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search scene, risk, or mitigation..."
            value={sceneSearch}
            onChange={e => setSceneSearch(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              maxWidth: '320px',
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: '#0a0a0a',
              color: 'var(--text)',
              fontSize: '14px'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {filteredRisks.length} of {allRisks.length} risk{allRisks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRisks.map((risk, idx) => (
            <div 
              key={idx}
              style={{
                padding: '16px',
                background: '#0a0a0a',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${
                  risk.risk_level === 'High' ? '#ef4444' :
                  risk.risk_level === 'Medium' ? '#f59e0b' : '#10b981'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>
                    Scene {risk.scene_number}: {risk.scene_title}
                  </strong>
                  <span 
                    style={{
                      marginLeft: '12px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: risk.risk_level === 'High' ? 'rgba(239, 68, 68, 0.15)' :
                                   risk.risk_level === 'Medium' ? 'rgba(245, 158, 11, 0.15)' :
                                   'rgba(16, 185, 129, 0.15)',
                      color: risk.risk_level === 'High' ? '#ef4444' :
                             risk.risk_level === 'Medium' ? '#f59e0b' : '#10b981'
                    }}
                  >
                    {risk.risk_level}
                  </span>
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                {risk.risk_description}
              </div>
              <div style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '12px' }}>
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
              <button
                type="button"
                onClick={() => handleMultimodalSearch(risk)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--primary)',
                  background: 'var(--primary-dim)',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>🔍</span>
                <span>Multimodal search</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footage modal: search results from script */}
      {footageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}
          onClick={closeFootageModal}
        >
          <div
            style={{
              background: '#171717',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-strong)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <button
                type="button"
                onClick={closeFootageModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
              <h4 style={{ color: 'var(--text)', marginBottom: '8px' }}>
                Scene {footageModal.risk.scene_number}: {footageModal.risk.scene_title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '0' }}>
                Query: &quot;{footageModal.query}&quot;
              </p>
            </div>
            <div style={{ padding: '20px' }}>
              {footageModal.loading && (
                <p style={{ color: 'var(--text-muted)' }}>Searching your footage...</p>
              )}
              {footageModal.error && (
                <p style={{ color: '#ef4444' }}>{footageModal.error}</p>
              )}
              {!footageModal.loading && !footageModal.error && footageModal.results && (
                <>
                  {footageModal.results.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No matching footage found. Add or process more videos to search.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {footageModal.results.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#0a0a0a',
                            padding: '12px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
                            {r.caption}
                          </p>
                          {r.video_url && (
                            <video
                              src={r.video_url}
                              controls
                              style={{ width: '100%', borderRadius: 'var(--radius)' }}
                            />
                          )}
                          {r.score != null && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              Score: {(r.score * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskDashboard

