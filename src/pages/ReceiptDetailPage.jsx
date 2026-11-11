import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReceipt } from '../api/receipts.js'
import { apiBase } from '../api/client.js'

const CATEGORY_THEMES = {
  Groceries: { bg: '#EBF2F9', color: '#3978B8' },
  Restaurant: { bg: '#FEF3C7', color: '#B45309' },
  Utilities: { bg: '#E8F5E9', color: '#1B8754' },
  Transport: { bg: '#F3E8FF', color: '#7E22CE' },
  Others: { bg: '#F1F4F8', color: '#8792A2' },
}

function formatINR(val) {
  if (val === undefined || val === null) return '₹ 0.00'
  return (
    '₹ ' +
    Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function ReceiptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRawOcr, setShowRawOcr] = useState(false)

  useEffect(() => {
    getReceipt(id)
      .then(setReceipt)
      .catch((err) => {
        console.error(err)
        setError('Unable to load receipt details.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const categoryKey = receipt?.category || 'Others'
  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.Others

  return (
    <div className="page-inner" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={styles.backText}>Back</span>
        </button>
        <h2 style={styles.headerTitle}>Receipt Details</h2>
        <div style={{ width: '48px' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <p style={{ color: '#D32F2F', fontSize: '14px', marginBottom: '14px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      ) : receipt ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main Transaction Overview Card */}
          <div style={styles.card}>
            <div style={styles.topRow}>
              <div>
                <span style={styles.metaLabel}>MERCHANT</span>
                <h3 style={styles.merchantName}>{receipt.vendor_name || 'Unknown Vendor'}</h3>
              </div>
              <span style={{ ...styles.categoryBadge, backgroundColor: theme.bg, color: theme.color }}>
                {categoryKey}
              </span>
            </div>

            <div style={styles.amountBlock}>
              <span style={styles.amountLabel}>Total Amount</span>
              <div style={styles.totalAmount} className="tabular-nums">
                {formatINR(receipt.total)}
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.detailRow}>
              <span style={styles.rowLabel}>Transaction Date</span>
              <span style={styles.rowValue}>{formatDate(receipt.date || receipt.created_at)}</span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.rowLabel}>Receipt ID</span>
              <span style={{ ...styles.rowValue, fontFamily: 'monospace', fontSize: '12px', color: '#8792A2' }}>
                {receipt.id}
              </span>
            </div>
          </div>

          {/* Receipt Image (if present) */}
          {receipt.image_url && (
            <div style={styles.card}>
              <h4 style={styles.sectionHeading}>Receipt Photo</h4>
              <div style={styles.imageWrapper}>
                <img
                  src={`${apiBase}${receipt.image_url}`}
                  alt="Receipt"
                  style={styles.fullImage}
                />
              </div>
            </div>
          )}

          {/* Line Items Breakdown Table */}
          {receipt.items && receipt.items.length > 0 && (
            <div style={styles.card}>
              <div style={styles.sectionHeaderRow}>
                <h4 style={styles.sectionHeading}>Itemized Breakdown</h4>
                <span style={styles.itemCountBadge}>{receipt.items.length} items</span>
              </div>

              <div style={styles.tableHeader}>
                <span style={{ flex: 1 }}>Item</span>
                <span style={{ width: '50px', textAlign: 'center' }}>Qty</span>
                <span style={{ width: '80px', textAlign: 'right' }}>Price</span>
              </div>

              <div style={styles.itemsList}>
                {receipt.items.map((item, idx) => (
                  <div key={item.id || idx} style={styles.itemRow}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <span style={styles.itemName}>{item.name}</span>
                    </div>
                    <span style={{ width: '50px', textAlign: 'center', fontSize: '13px', color: '#8792A2' }} className="tabular-nums">
                      {item.quantity || 1}
                    </span>
                    <span style={{ width: '80px', textAlign: 'right', fontSize: '13.5px', fontWeight: '600', color: '#172B4D' }} className="tabular-nums">
                      {formatINR(item.total_price || item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw OCR Text Section */}
          {receipt.raw_ocr_text && (
            <div style={styles.card}>
              <div
                style={styles.collapsibleHeader}
                onClick={() => setShowRawOcr(!showRawOcr)}
                role="button"
                tabIndex={0}
              >
                <h4 style={{ ...styles.sectionHeading, marginBottom: 0 }}>Raw OCR Extraction</h4>
                <span style={styles.toggleLink}>
                  {showRawOcr ? 'Hide' : 'View Text'}
                </span>
              </div>
              {showRawOcr && (
                <pre style={styles.rawText}>{receipt.raw_ocr_text}</pre>
              )}
            </div>
          )}
        </div>
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingTop: '2px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0',
  },
  backText: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#172B4D',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#172B4D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 18px',
    border: '1px solid #E5E9F0',
    boxShadow: '0 1px 3px rgba(23, 43, 77, 0.04)',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  metaLabel: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#8792A2',
    letterSpacing: '0.06em',
  },
  merchantName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#172B4D',
    marginTop: '2px',
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  amountBlock: {
    margin: '12px 0 16px',
  },
  amountLabel: {
    fontSize: '11.5px',
    color: '#8792A2',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#172B4D',
    marginTop: '2px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#EEF2F6',
    margin: '14px 0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  rowLabel: {
    fontSize: '13px',
    color: '#8792A2',
  },
  rowValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#202938',
  },
  sectionHeading: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#202938',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  itemCountBadge: {
    fontSize: '11.5px',
    color: '#8792A2',
    backgroundColor: '#F7F8FA',
    border: '1px solid #E5E9F0',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  tableHeader: {
    display: 'flex',
    paddingBottom: '8px',
    borderBottom: '1px solid #EEF2F6',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#8792A2',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #EEF2F6',
  },
  itemName: {
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#202938',
  },
  imageWrapper: {
    marginTop: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#F7F8FA',
    border: '1px solid #E5E9F0',
    maxHeight: '300px',
    display: 'flex',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
  },
  collapsibleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  toggleLink: {
    fontSize: '12.5px',
    color: '#3978B8',
    fontWeight: '600',
  },
  rawText: {
    marginTop: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '11.5px',
    color: '#202938',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    maxHeight: '180px',
    overflowY: 'auto',
    border: '1px solid #E5E9F0',
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 20px',
    textAlign: 'center',
    border: '1px solid #E5E9F0',
  },
}
