import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import ReceiptsPage from './pages/ReceiptsPage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ReceiptDetailPage from './pages/ReceiptDetailPage.jsx'

function DynamicIsland() {
  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '126px',
      height: '37px',
      backgroundColor: '#000000',
      borderRadius: '20px',
      zIndex: 9999,
      pointerEvents: 'none',
    }} />
  )
}

function StatusBar() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const [time, setTime] = React.useState(timeStr)
  React.useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }, 10000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{
      height: '59px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '0 28px 8px',
      backgroundColor: '#F2F2F7',
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      <span style={{ fontSize: '15px', fontWeight: '600', color: '#000', letterSpacing: '-0.3px' }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="#000">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
          <rect x="9" y="3" width="3" height="9" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4.5C3.8 1.8 7 0.5 8 0.5s4.2 1.3 7 4" opacity="0.3"/>
          <path d="M3 7C4.8 5.2 6.4 4.5 8 4.5s3.2.7 5 2.5"/>
          <path d="M5.5 9.5C6.5 8.5 7.2 8 8 8s1.5.5 2.5 1.5"/>
          <circle cx="8" cy="11.5" r="0.8" fill="#000" stroke="none"/>
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <div style={{ width: '25px', height: '12px', border: '1.5px solid #000', borderRadius: '3px', padding: '1.5px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '75%', height: '100%', backgroundColor: '#000', borderRadius: '1px' }} />
          </div>
          <div style={{ width: '2px', height: '5px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '0 1px 1px 0' }} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <DynamicIsland />
        <StatusBar />
        <main className="page-scroll-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
