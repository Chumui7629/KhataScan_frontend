import React from 'react'
import { useNavigate } from 'react-router-dom'
import ReceiptRow from './ReceiptRow.jsx'

const MOCK_RECEIPTS = [
  {
    id: 'mock-1',
    vendor_name: 'Super Mart',
    date: '12 Sep 2026',
    total: 320.0,
    category: 'Groceries',
    items: [
      { name: 'Rice', total_price: 160.0 },
      { name: 'Oil', total_price: 120.0 },
      { name: 'Biscuits', total_price: 40.0 },
    ],
  },
  {
    id: 'mock-2',
    vendor_name: 'Spice Hub Restaurant',
    date: '11 Sep 2026',
    total: 450.0,
    category: 'Restaurant',
    items: [
      { name: 'Chicken Biryani', total_price: 320.0 },
      { name: 'Cold Drink', total_price: 130.0 },
    ],
  },
  {
    id: 'mock-3',
    vendor_name: 'HP Petrol Pump',
    date: '10 Sep 2026',
    total: 2000.0,
    category: 'Transport',
    items: [
      { name: 'Petrol Unleaded', total_price: 2000.0 },
    ],
  },
]

export default function RecentReceipts({ receipts = [], loading = false }) {
  const navigate = useNavigate()

  const displayReceipts = receipts && receipts.length > 0 ? receipts : MOCK_RECEIPTS

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Recent Transactions</h3>
          <p style={styles.subtitle}>Latest scanned receipts</p>
        </div>
        <button style={styles.seeAllBtn} onClick={() => navigate('/receipts')}>
          View all
        </button>
      </div>

      {/* Receipts List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton" style={{ width: '50%', height: '14px' }} />
                <div className="skeleton" style={{ width: '30%', height: '11px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                <div className="skeleton" style={{ width: '60px', height: '14px' }} />
                <div className="skeleton" style={{ width: '50px', height: '16px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.list}>
          {displayReceipts.slice(0, 5).map((r) => (
            <ReceiptRow
              key={r.id}
              receipt={r}
              onClick={() => {
                if (r.id.startsWith('mock')) {
                  navigate('/receipts')
                } else {
                  navigate(`/receipts/${r.id}`)
                }
              }}
            />
          ))}
        </div>
      )}
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#202938',
    letterSpacing: '-0.2px',
    marginBottom: '2px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#8792A2',
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: '#3978B8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
}
