import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReceipts } from '../api/receipts.js'
import ReceiptRow from '../components/ReceiptRow.jsx'

const CATEGORIES = ['All', 'Groceries', 'Restaurant', 'Utilities', 'Transport', 'Others']

export default function ReceiptsPage() {
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const fetchReceipts = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listReceipts({ page: p, per_page: 10, sort_by: 'created_at', order: 'desc' })
      setReceipts(data.items || [])
      setTotalPages(data.pages || 1)
    } catch (err) {
      console.error(err)
      setError('Could not load receipts. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReceipts(page)
  }, [page, fetchReceipts])

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchCategory = selectedCategory === 'All' || r.category === selectedCategory
      const matchSearch =
        !searchQuery ||
        (r.vendor_name && r.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.total && String(r.total).includes(searchQuery))
      return matchCategory && matchSearch
    })
  }, [receipts, selectedCategory, searchQuery])

  return (
    <div className="page-inner" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>All Receipts</h2>
          <p style={styles.subtitle}>View and manage all scanned expenses</p>
        </div>
        <button style={styles.scanBtn} onClick={() => navigate('/scan')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Scan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8792A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by merchant, category, or amount..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button style={styles.clearBtn} onClick={() => setSearchQuery('')}>
            ×
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={styles.filterRow}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              style={{
                ...styles.filterPill,
                backgroundColor: isActive ? '#172B4D' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#8792A2',
                borderColor: isActive ? '#172B4D' : '#E5E9F0',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      {error ? (
        <div style={styles.errorBox}>
          <p style={{ color: '#D32F2F', fontSize: '14px', marginBottom: '14px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchReceipts(page)}>
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div style={styles.listCard}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={styles.skeletonRow}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div className="skeleton" style={{ width: '55%', height: '14px' }} />
                <div className="skeleton" style={{ width: '35%', height: '11px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div className="skeleton" style={{ width: '60px', height: '14px' }} />
                <div className="skeleton" style={{ width: '50px', height: '16px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : receipts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIconCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3978B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3.5h12v17l-2.2-1.5-1.8 1.5-2-1.5-2 1.5-1.8-1.5L6 20.5v-17z" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No Receipts Yet</h3>
          <p style={styles.emptySub}>
            Scan a paper or digital receipt to automatically digitize items, totals, and categories.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/scan')} style={{ marginTop: '16px' }}>
            Scan Your First Receipt
          </button>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div style={styles.emptyFilterState}>
          <p style={{ color: '#8792A2', fontSize: '13.5px' }}>
            No receipts matching "{searchQuery}" in {selectedCategory}.
          </p>
          <button
            style={styles.resetFilterBtn}
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={styles.listCard}>
          {filteredReceipts.map((r) => (
            <ReceiptRow
              key={r.id}
              receipt={r}
              onClick={() => navigate(`/receipts/${r.id}`)}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: page <= 1 ? 0.4 : 1,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: page >= totalPages ? 0.4 : 1,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingTop: '2px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#172B4D',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#8792A2',
    marginTop: '2px',
  },
  scanBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 15px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 36px 9px 34px',
    borderRadius: '10px',
    border: '1px solid #E5E9F0',
    backgroundColor: '#FFFFFF',
    fontSize: '13.5px',
    color: '#202938',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#8792A2',
    cursor: 'pointer',
    padding: '0 4px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '12px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  filterPill: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '8px 16px',
    border: '1px solid #E5E9F0',
    boxShadow: '0 1px 3px rgba(23, 43, 77, 0.04)',
  },
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #EEF2F6',
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 20px',
    textAlign: 'center',
    border: '1px solid #E5E9F0',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '44px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #E5E9F0',
  },
  emptyIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#EBF2F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#202938',
    marginBottom: '6px',
  },
  emptySub: {
    fontSize: '13px',
    color: '#8792A2',
    maxWidth: '280px',
    lineHeight: '1.45',
  },
  emptyFilterState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '36px 20px',
    textAlign: 'center',
    border: '1px solid #E5E9F0',
  },
  resetFilterBtn: {
    marginTop: '10px',
    background: 'none',
    border: 'none',
    color: '#3978B8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 4px 6px',
  },
  pageBtn: {
    backgroundColor: '#F7F8FA',
    color: '#202938',
    border: '1px solid #E5E9F0',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  pageIndicator: {
    fontSize: '12px',
    color: '#8792A2',
    fontWeight: '500',
  },
}
