import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadManyReceipts, processPages, saveReceipt } from '../api/receipts.js'

const CATEGORIES = ['Groceries', 'Restaurant', 'Utilities', 'Transport', 'Others']
const MAX_FILES = 10

export default function ScanPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState('idle') // 'idle' | 'uploading' | 'processing' | 'review' | 'saving' | 'done'
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrls, setPreviewUrls] = useState([])   // one per selected file
  const [uploadIds, setUploadIds] = useState([])        // ordered upload_ids from backend
  const [error, setError] = useState(null)

  // Review form state
  const [vendorName, setVendorName] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [category, setCategory] = useState('Groceries')
  const [items, setItems] = useState([])
  const [rawOcrText, setRawOcrText] = useState('')

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (files.length > MAX_FILES) {
      setError(`You can upload at most ${MAX_FILES} pages at once.`)
      return
    }

    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
    startUploadAndOcr(files)
  }

  const startUploadAndOcr = async (files) => {
    setError(null)
    setStep('uploading')
    setUploadProgress(0)

    try {
      // Step 1: Upload all pages in one request
      const uploadRes = await uploadManyReceipts(files, (pct) => setUploadProgress(pct))
      const ids = uploadRes.uploads.map((u) => u.upload_id)
      setUploadIds(ids)

      // Warn if any page is a duplicate of an already-saved receipt
      const duplicates = uploadRes.uploads.filter((u) => u.already_saved_receipt_id)
      if (duplicates.length) {
        const names = duplicates.map((u) => u.filename).join(', ')
        setError(`Warning: ${names} appear identical to a previously saved receipt.`)
      }

      // Step 2: OCR — single page fast path, multi-page merged path
      setStep('processing')
      const ocrRes = await processPages(ids)

      if (ocrRes.is_receipt === false) {
        setError(ocrRes.rejection_reason || 'The image does not appear to be a receipt.')
        setStep('idle')
        return
      }

      setVendorName(ocrRes.vendor_name || 'Super Mart')
      // receipt_date is the backend-parsed ISO "YYYY-MM-DD" string — correct format for <input type="date">
      // ocrRes.date is raw OCR text (e.g. "12 Nov 2026") which the date input cannot parse
      setReceiptDate(ocrRes.receipt_date || new Date().toISOString().split('T')[0])
      setTotalAmount(ocrRes.total != null ? String(ocrRes.total) : '0')
      setCategory(ocrRes.category || 'Groceries')
      setItems(ocrRes.items || [])
      setRawOcrText(ocrRes.raw_ocr_text || '')

      setStep('review')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.detail || 'Failed to process receipt image. Please try another photo.')
      setStep('idle')
    }
  }

  const handleSave = async () => {
    setStep('saving')
    setError(null)

    try {
      await saveReceipt({
        upload_ids: uploadIds,
        vendor_name: vendorName.trim() || 'Unknown Vendor',
        date: receiptDate || null,
        total: parseFloat(totalAmount) || 0.0,
        category: category,
        confidence: 'high',
        total_auto_corrected: false,
        items: items.map((it) => ({
          name: it.name || 'Item',
          quantity: parseFloat(it.quantity) || 1.0,
          unit_price: parseFloat(it.unit_price) || 0.0,
          total_price: parseFloat(it.total_price) || 0.0,
        })),
        raw_ocr_text: rawOcrText,
      })

      setStep('done')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.detail || 'Failed to save receipt. Please try again.')
      setStep('review')
    }
  }

  if (step === 'done') {
    return (
      <div className="page-inner" style={{ ...styles.container, textAlign: 'center', paddingTop: '40px' }}>
        <div style={styles.successIconCircle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B8754" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#172B4D', marginBottom: '6px' }}>
          Receipt Digitized &amp; Saved
        </h2>
        <p style={{ color: '#8792A2', fontSize: '13.5px', marginBottom: '28px', maxWidth: '280px', margin: '0 auto 28px' }}>
          Your transaction and item breakdown have been added to your expense records.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setStep('idle')
              setPreviewUrls([])
            }}
          >
            Scan Another Receipt
          </button>
        </div>
      </div>
    )
  }

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
        <h2 style={styles.headerTitle}>Scan Receipt</h2>
        <div style={{ width: '48px' }} />
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={{ fontSize: '13px', color: '#D32F2F', fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {/* Step 1: Upload Prompt */}
      {step === 'idle' && (
        <div>
          <div style={styles.dropZone} onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <div style={styles.uploadIconCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3978B8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <h3 style={styles.dropTitle}>Take Photo or Upload Receipt</h3>
            <p style={styles.dropSub}>Select one or multiple pages (up to {MAX_FILES})</p>
            <div style={styles.formatBadge}>
              JPG, PNG, HEIC &bull; Max 10 MB each
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Uploading Progress */}
      {step === 'uploading' && (
        <div style={styles.loadingCard}>
          {previewUrls.length > 0 && (
            <div style={styles.previewStrip}>
              {previewUrls.map((url, i) => (
                <img key={i} src={url} alt={`Page ${i + 1}`} style={styles.previewImage} />
              ))}
            </div>
          )}
          <h3 style={styles.loadingTitle}>
            Uploading {previewUrls.length > 1 ? `${previewUrls.length} pages` : 'Receipt'}
          </h3>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${uploadProgress}%` }} />
          </div>
          <span style={styles.progressPct} className="tabular-nums">{uploadProgress}% complete</span>
        </div>
      )}

      {/* Step 3: OCR Processing */}
      {step === 'processing' && (
        <div style={styles.loadingCard}>
          {previewUrls.length > 0 && (
            <div style={styles.previewStrip}>
              {previewUrls.map((url, i) => (
                <img key={i} src={url} alt={`Page ${i + 1}`} style={styles.previewImage} />
              ))}
            </div>
          )}
          <div className="spinner" style={{ margin: '14px 0 10px' }} />
          <h3 style={styles.loadingTitle}>Digitizing Receipt Data</h3>
          <p style={styles.loadingSub}>
            {previewUrls.length > 1
              ? `Analyzing ${previewUrls.length} pages — merging items, totals and dates...`
              : 'Analyzing merchant, transaction date, line items, and tax totals...'}
          </p>
        </div>
      )}

      {/* Step 4: Review and Confirm */}
      {(step === 'review' || step === 'saving') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {previewUrls.length > 0 && (
            <div style={styles.previewCard}>
              {previewUrls.length === 1 ? (
                <img src={previewUrls[0]} alt="Receipt" style={styles.reviewImage} />
              ) : (
                <div style={styles.previewStrip}>
                  {previewUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', flex: '0 0 auto' }}>
                      <img src={url} alt={`Page ${i + 1}`} style={styles.reviewImage} />
                      <span style={styles.pageBadge}>p{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>Review Extracted Details</h3>
              <p style={styles.formSubtitle}>Verify and correct details before saving</p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Merchant Name</label>
              <input
                type="text"
                className="form-input"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Super Mart"
              />
            </div>

            <div style={styles.fieldRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input tabular-nums"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Extracted Line Items */}
            {items.length > 0 && (
              <div style={styles.itemsBlock}>
                <div style={styles.itemsBlockHeader}>
                  <label style={{ ...styles.fieldLabel, marginBottom: 0 }}>
                    Extracted Line Items ({items.length})
                  </label>
                </div>
                <div style={styles.itemsList}>
                  {items.map((it, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <span style={styles.itemTitle}>{it.name}</span>
                      <span style={styles.itemPrice} className="tabular-nums">
                        ₹{Number(it.total_price || it.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px', padding: '12px' }}
              onClick={handleSave}
              disabled={step === 'saving'}
            >
              {step === 'saving' ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#FFFFFF' }} />
                  <span>Saving Record...</span>
                </>
              ) : (
                'Confirm & Save Receipt'
              )}
            </button>
          </div>
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
  errorBox: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '14px',
  },
  dropZone: {
    backgroundColor: '#FFFFFF',
    border: '1.5px dashed #3978B8',
    borderRadius: '16px',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(23, 43, 77, 0.04)',
    transition: 'border-color 0.15s ease',
  },
  uploadIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#EBF2F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  dropTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#202938',
    marginBottom: '4px',
  },
  dropSub: {
    fontSize: '13px',
    color: '#8792A2',
    marginBottom: '14px',
  },
  formatBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#3978B8',
    backgroundColor: '#EBF2F9',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #E5E9F0',
  },
  previewImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '12px',
    marginBottom: '14px',
    backgroundColor: '#F7F8FA',
    border: '1px solid #E5E9F0',
  },
  loadingTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#202938',
    marginBottom: '4px',
  },
  loadingSub: {
    fontSize: '12.5px',
    color: '#8792A2',
    maxWidth: '260px',
    lineHeight: '1.4',
  },
  progressBar: {
    width: '100%',
    maxWidth: '280px',
    height: '6px',
    backgroundColor: '#E5E9F0',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '14px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3978B8',
    borderRadius: '9999px',
    transition: 'width 0.2s ease',
  },
  progressPct: {
    fontSize: '12px',
    color: '#8792A2',
    marginTop: '6px',
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '12px',
    border: '1px solid #E5E9F0',
    display: 'flex',
    justifyContent: 'center',
    overflowX: 'auto',
  },
  previewStrip: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    width: '100%',
  },
  pageBadge: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    backgroundColor: 'rgba(57, 120, 184, 0.85)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '4px',
    padding: '1px 5px',
  },
  reviewImage: {
    width: '100%',
    maxHeight: '180px',
    objectFit: 'contain',
    borderRadius: '10px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 18px',
    border: '1px solid #E5E9F0',
    boxShadow: '0 1px 3px rgba(23, 43, 77, 0.04)',
  },
  formHeader: {
    marginBottom: '16px',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#202938',
  },
  formSubtitle: {
    fontSize: '12px',
    color: '#8792A2',
    marginTop: '2px',
  },
  fieldGroup: {
    marginBottom: '12px',
  },
  fieldRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#8792A2',
    marginBottom: '5px',
  },
  itemsBlock: {
    marginTop: '14px',
    marginBottom: '8px',
  },
  itemsBlockHeader: {
    marginBottom: '6px',
  },
  itemsList: {
    backgroundColor: '#F7F8FA',
    borderRadius: '10px',
    padding: '6px 12px',
    border: '1px solid #E5E9F0',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 0',
    borderBottom: '1px solid #EEF2F6',
    fontSize: '12.5px',
  },
  itemTitle: {
    color: '#202938',
    fontWeight: '500',
  },
  itemPrice: {
    color: '#172B4D',
    fontWeight: '600',
  },
  successIconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#E8F5E9',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
}
