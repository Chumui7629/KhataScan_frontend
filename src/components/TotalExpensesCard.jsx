import React from 'react'

function formatINR(val) {
  if (val === null || val === undefined) return '₹ 0.00'
  return (
    '₹ ' +
    Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export default function TotalExpensesCard({ total = 12450, loading = false }) {
  const effectiveTotal = total || 0

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.topRow}>
          <div className="skeleton" style={{ width: '100px', height: '14px' }} />
          <div className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '12px' }} />
        </div>
        <div className="skeleton" style={{ width: '180px', height: '36px', marginTop: '12px' }} />
        <div className="skeleton" style={{ width: '120px', height: '14px', marginTop: '8px' }} />
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <span style={styles.label}>TOTAL MONTHLY EXPENSES</span>
        <span style={styles.periodBadge}>{currentMonthName}</span>
      </div>

      <div style={styles.amount} className="tabular-nums">
        {formatINR(effectiveTotal)}
      </div>

      <div style={styles.metaRow}>
        <span style={styles.metaDot} />
        <span style={styles.metaText}>All active receipts calculated</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 18px',
    marginBottom: '14px',
    border: '1px solid #E5E9F0',
    boxShadow: '0 1px 3px rgba(23, 43, 77, 0.04)',
    boxSizing: 'border-box',
    width: '100%',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#8792A2',
    letterSpacing: '0.06em',
  },
  periodBadge: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#3978B8',
    backgroundColor: '#EBF2F9',
    padding: '3px 9px',
    borderRadius: '6px',
  },
  amount: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#172B4D',
    letterSpacing: '-0.8px',
    lineHeight: '1.15',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
  },
  metaDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1B8754',
  },
  metaText: {
    fontSize: '12px',
    color: '#8792A2',
    fontWeight: '500',
  },
}
