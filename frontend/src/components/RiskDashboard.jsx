import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const RiskDashboard = ({ data }) => {
  // Count risks by level
  const riskCounts = { Low: 0, Medium: 0, High: 0 }
  
  data.scenes.forEach(scene => {
    scene.risks.forEach(risk => {
      riskCounts[risk.risk_level] = (riskCounts[risk.risk_level] || 0) + 1
    })
  })

  const riskData = [
    { level: 'Low', count: riskCounts.Low, color: '#10b981' },
    { level: 'Medium', count: riskCounts.Medium, color: '#f59e0b' },
    { level: 'High', count: riskCounts.High, color: '#ef4444' }
  ]

  // Get all risks with scene info
  const allRisks = []
  data.scenes.forEach(scene => {
    scene.risks.forEach(risk => {
      allRisks.push({
        ...risk,
        scene_number: scene.scene_number,
        scene_title: scene.scene_title
      })
    })
  })

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allRisks.map((risk, idx) => (
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
              <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RiskDashboard

