import { useState } from 'react'
import { productionAPI } from '../services/api'
import BudgetDashboard from './BudgetDashboard'
import RiskDashboard from './RiskDashboard'
import SceneBreakdown from './SceneBreakdown'

const ProductionPlanner = () => {
  const [script, setScript] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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
      }
    } catch (err) {
      setError(err.message || 'Failed to generate production plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="production-planner" className="section">
      <h2>📋 Production Planner</h2>
      <p className="text-muted" style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
        Enter your script and budget to get a complete production breakdown with scene analysis, budget allocation, safety requirements, and risk assessment.
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
            Total Budget ($)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter total production budget"
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

      {result && (
        <div style={{ marginTop: '32px' }}>
          <BudgetDashboard data={result} />
          <RiskDashboard data={result} />
          <SceneBreakdown data={result} />
        </div>
      )}
    </section>
  )
}

export default ProductionPlanner

