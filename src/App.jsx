import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IPhoneStatusBar from './components/IPhoneStatusBar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import ReceiptsPage from './pages/ReceiptsPage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ReceiptDetailPage from './pages/ReceiptDetailPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Status bar preserved for compatibility */}
        <IPhoneStatusBar />

        {/* Scrollable Viewport */}
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

        {/* Modern Fintech Navigation Bar */}
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
