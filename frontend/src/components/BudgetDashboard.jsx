import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

const BudgetDashboard = ({ data }) => {
  // Prepare scene budget data (ensure numeric for chart and axis)
  const sceneData = data.scenes.map(scene => ({
    name: `Scene ${scene.scene_number}`,
    budget: Number(scene.budget.total_scene_budget) || 0
  }))

  // Prepare category breakdown (aggregate across all scenes)
  const categoryTotals = {
    cast_and_crew: 0,
    location_and_set: 0,
    props_and_costumes: 0,
    equipment_and_technical: 0,
    special_effects_and_stunts: 0,
    miscellaneous: 0
  }

  data.scenes.forEach(scene => {
    Object.keys(categoryTotals).forEach(key => {
      categoryTotals[key] += scene.budget.breakdown[key] || 0
    })
  })

  const categoryData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value: value
  }))

  const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Compact form for Y-axis ticks so budget values show fully (no truncation)
  const formatAxisCurrency = (value) => {
    const n = Number(value)
    if (Number.isNaN(n)) return '₹0'
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
    return `₹${n.toFixed(0)}`
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '1.2rem' }}>
        💰 Budget Dashboard
      </h3>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: '#171717',
          padding: '20px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-strong)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
            Total Budget
          </div>
          <div style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 600 }}>
            {formatCurrency(data.total_budget)}
          </div>
        </div>
        <div style={{
          background: '#171717',
          padding: '20px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-strong)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
            Total Allocated
          </div>
          <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 600 }}>
            {formatCurrency(data.budget_summary.total_allocated)}
          </div>
        </div>
        <div style={{
          background: '#171717',
          padding: '20px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-strong)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
            Remaining Budget
          </div>
          <div style={{ 
            color: data.budget_summary.remaining_budget >= 0 ? '#10b981' : '#ef4444', 
            fontSize: '24px', 
            fontWeight: 600 
          }}>
            {formatCurrency(data.budget_summary.remaining_budget)}
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#171717', 
        padding: '24px', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border-strong)',
        marginBottom: '24px'
      }}>
        <h4 style={{ color: 'var(--text)', marginBottom: '16px' }}>Budget by Scene</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sceneData} margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis 
              stroke="var(--text-muted)" 
              tickFormatter={formatAxisCurrency}
              width={70}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <Bar dataKey="budget" fill="#6366f1" name="Budget" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        background: '#171717', 
        padding: '24px', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border-strong)'
      }}>
        <h4 style={{ color: 'var(--text)', marginBottom: '16px' }}>Budget by Category</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BudgetDashboard

