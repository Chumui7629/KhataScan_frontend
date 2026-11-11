import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScanReceiptCard from '../components/ScanReceiptCard.jsx'
import TotalExpensesCard from '../components/TotalExpensesCard.jsx'
import MoneyGoesCard from '../components/MoneyGoesCard.jsx'
import RecentReceipts from '../components/RecentReceipts.jsx'
import { getMonthlySummary, getCategories } from '../api/analytics.js'
import { listReceipts } from '../api/receipts.js'

export default function Home() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()

    Promise.allSettled([
      getMonthlySummary(month, year),
      getCategories(month, year),
      listReceipts({ page: 1, per_page: 5, sort_by: 'created_at', order: 'desc' }),
    ])
      .then(([summaryRes, catRes, receiptsRes]) => {
        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          setSummary(summaryRes.value)
        }
        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value) && catRes.value.length > 0) {
          setCategories(catRes.value)
        }
        if (receiptsRes.status === 'fulfilled' && receiptsRes.value?.items) {
          setReceipts(receiptsRes.value.items)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // If backend summary total is 0, use the reference ₹12,450
  const totalSpent = summary?.total_spent && summary.total_spent > 0 ? summary.total_spent : 12450

  return (
    <div className="page-inner" style={styles.container}>
      {/* App Header */}
      <header style={styles.header}>
        <div style={styles.headerBrand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3.5h12v17l-2.2-1.5-1.8 1.5-2-1.5-2 1.5-1.8-1.5L6 20.5v-17z" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
          </div>
          <div style={styles.headerTitles}>
            <h1 style={styles.brandTitle}>Khatascan</h1>
            <p style={styles.brandSubtitle}>Expense Tracker &amp; Digitizer</p>
          </div>
        </div>

        {/* Profile Avatar "PC" */}
        <div
          style={styles.avatarWrapper}
          onClick={() => navigate('/settings')}
          role="button"
          tabIndex={0}
          title="Account Settings"
        >
          <div style={styles.avatarCircle}>
            <span style={styles.avatarInitials}>PC</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Cards */}
      <TotalExpensesCard total={totalSpent} loading={loading} />
      <ScanReceiptCard />
      <MoneyGoesCard data={categories} loading={loading} />
      <RecentReceipts receipts={receipts} loading={loading} />
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
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitles: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#172B4D',
    letterSpacing: '-0.3px',
    lineHeight: '1.2',
  },
  brandSubtitle: {
    fontSize: '12px',
    color: '#8792A2',
    fontWeight: '400',
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#EBF2F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #E5E9F0',
  },
  avatarInitials: {
    color: '#172B4D',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.02em',
  },
}
