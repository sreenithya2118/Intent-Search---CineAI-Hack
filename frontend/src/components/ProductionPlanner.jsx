import { useState } from 'react'
import { productionAPI } from '../services/api'
import BudgetDashboard from './BudgetDashboard'
import SceneBreakdown from './SceneBreakdown'
import RiskDashboard from './RiskDashboard'

const TABS = [
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'scenes', label: 'Scene Breakdown', icon: '🎬' },
  { id: 'risk', label: 'Risk Analyzer', icon: '⚠️' }
]

const ProductionPlanner = () => {
  const [script, setScript] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('budget')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!script.trim()) {
      setError('Please enter a script')
      return
    }
    
    const budgetNum = parseFloat(budget)
    if (!budgetNum || budgetNum <= 0) {
      setError('Please enter a valid budget amount')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await productionAPI.generatePlan(script, budgetNum)
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        setActiveTab('budget')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate production plan')
    } finally {
      setLoading(false)
    }
  }

  const handleNewPlan = () => {
    setResult(null)
    setError('')
    setActiveTab('budget')
  }

  // After result: show only tabs + content, no form
  if (result) {
    return (
      <section id="production-planner" className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: 'var(--text)', margin: 0 }}>📋 Production Plan</h2>
          <button
            type="button"
            onClick={handleNewPlan}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← New plan
          </button>
        </div>

        <div style={{ 
          borderBottom: '1px solid var(--border-strong)', 
          marginBottom: '24px',
          display: 'flex',
          gap: '4px'
        }}>
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {activeTab === 'budget' && <BudgetDashboard data={result} />}
        {activeTab === 'scenes' && <SceneBreakdown data={result} />}
        {activeTab === 'risk' && <RiskDashboard data={result} />}
      </section>
    )
  }

  // No result: show form
  return (
    <section id="production-planner" className="section">
      <h2>📋 Production Planner</h2>
      <p className="text-muted" style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
        Enter your script and budget to get a complete production breakdown with scene analysis, budget allocation, and safety requirements.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 500 }}>
            Script Text
          </label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your movie script here..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              fontSize: '15px',
              color: 'var(--text)',
              background: '#171717',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 500 }}>
            Total Budget (₹)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter total budget in ₹"
            disabled={loading}
            min="0"
            step="1000"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              fontSize: '15px',
              color: 'var(--text)',
              background: '#171717'
            }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              <span>Generating Plan...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Generate Production Plan</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="status error" style={{ marginTop: '16px' }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}

export default ProductionPlanner

