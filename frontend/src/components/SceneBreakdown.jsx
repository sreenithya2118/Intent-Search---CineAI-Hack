const SceneBreakdown = ({ data }) => {
  const formatCurrency = (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '1.2rem' }}>
        🎬 Scene Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.scenes.map((scene, idx) => (
          <div
            key={idx}
            style={{
              background: '#171717',
              padding: '24px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-strong)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '8px' }}>
                  Scene {scene.scene_number}: {scene.scene_title}
                </h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span className="badge badge-intent">{scene.location}</span>
                  <span className="badge badge-time">{scene.time_of_day}</span>
                  <span className="badge badge-score">
                    {formatCurrency(scene.budget.total_scene_budget)}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              {scene.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                Budget Breakdown:
              </strong>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Cast & Crew: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.cast_and_crew)}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Location & Set: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.location_and_set)}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Props & Costumes: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.props_and_costumes)}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Equipment & Technical: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.equipment_and_technical)}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Special Effects & Stunts: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.special_effects_and_stunts)}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Miscellaneous: <strong style={{ color: 'var(--text)' }}>{formatCurrency(scene.budget.breakdown.miscellaneous)}</strong>
                </div>
              </div>
            </div>

            {scene.safety_measures && scene.safety_measures.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                  Safety Measures:
                </strong>
                <ul style={{ color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.8' }}>
                  {scene.safety_measures.map((measure, mIdx) => (
                    <li key={mIdx}>{measure}</li>
                  ))}
                </ul>
              </div>
            )}

            {scene.risks && scene.risks.length > 0 && (
              <div>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                  Risks:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scene.risks.map((risk, rIdx) => (
                    <div 
                      key={rIdx}
                      style={{
                        padding: '12px',
                        background: '#0a0a0a',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${
                          risk.risk_level === 'High' ? '#ef4444' :
                          risk.risk_level === 'Medium' ? '#f59e0b' : '#10b981'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          {risk.risk_description}
                        </span>
                        <span 
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: risk.risk_level === 'High' ? 'rgba(239, 68, 68, 0.15)' :
                                         risk.risk_level === 'Medium' ? 'rgba(245, 158, 11, 0.15)' :
                                         'rgba(16, 185, 129, 0.15)',
                            color: risk.risk_level === 'High' ? '#ef4444' :
                                   risk.risk_level === 'Medium' ? '#f59e0b' : '#10b981',
                            marginLeft: '12px'
                          }}
                        >
                          {risk.risk_level}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text)', fontSize: '13px' }}>
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SceneBreakdown

