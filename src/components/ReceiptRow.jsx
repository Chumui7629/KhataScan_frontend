import React from 'react'
import { apiBase } from '../api/client.js'

const CATEGORY_THEMES = {
  Groceries: {
    bg: '#EBF2F9',
    color: '#3978B8',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3978B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  Restaurant: {
    bg: '#FEF3C7',
    color: '#B45309',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  Utilities: {
    bg: '#E8F5E9',
    color: '#1B8754',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B8754" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  Transport: {
    bg: '#F3E8FF',
    color: '#7E22CE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  Others: {
    bg: '#F1F4F8',
    color: '#8792A2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8792A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
}

function formatAmount(amount) {
  if (amount === undefined || amount === null) return '₹ 0.00'
  return (
    '₹ ' +
    Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function ReceiptRow({ receipt, onClick }) {
  const categoryKey = receipt.category || 'Others'
  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.Others

  const imgUrl = receipt.thumbnail_url || receipt.image_url

  return (
    <div style={styles.row} onClick={onClick} role="button" tabIndex={0}>
      {/* Left Icon / Thumbnail */}
      <div style={styles.iconContainer}>
        {imgUrl ? (
          <img
            src={`${apiBase}${imgUrl}`}
            alt={receipt.vendor_name || 'Receipt'}
            style={styles.thumbnailImg}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div style={{ ...styles.iconBox, backgroundColor: theme.bg }}>
            {theme.icon}
          </div>
        )}
      </div>

      {/* Middle: Vendor Name & Transaction Date */}
      <div style={styles.middleCol}>
        <span style={styles.vendorName}>{receipt.vendor_name || 'Receipt'}</span>
        <span style={styles.dateText}>{formatDate(receipt.date || receipt.created_at)}</span>
      </div>

      {/* Right: Amount & Category Badge */}
      <div style={styles.rightCol}>
        <span style={styles.amountText} className="tabular-nums">
          {formatAmount(receipt.total)}
        </span>
        <span style={{ ...styles.categoryPill, backgroundColor: theme.bg, color: theme.color }}>
          {categoryKey}
        </span>
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 4px',
    borderBottom: '1px solid #EEF2F6',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.15s ease',
  },
  iconContainer: {
    marginRight: '12px',
    flexShrink: 0,
  },
  thumbnailImg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E5E9F0',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  vendorName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202938',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.1px',
  },
  dateText: {
    fontSize: '12px',
    fontWeight: '400',
    color: '#8792A2',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '3px',
    flexShrink: 0,
    marginLeft: '10px',
  },
  amountText: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#172B4D',
    letterSpacing: '-0.2px',
  },
  categoryPill: {
    fontSize: '10.5px',
    fontWeight: '600',
    padding: '1.5px 7px',
    borderRadius: '4px',
    display: 'inline-block',
  },
}
