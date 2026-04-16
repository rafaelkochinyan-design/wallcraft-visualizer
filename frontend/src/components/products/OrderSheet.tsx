import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../../lib/api'
import { Panel } from '../../types'

interface OrderSheetProps {
  panel: Panel
  priceFormatted: string | null
  activePrice: number | null
  onClose: () => void
}

const PHONE_PREFIX = '+374 '

function validateArmenianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-()]/g, '')
  return /^(\+374|374|0)\d{8}$/.test(clean)
}

function phoneIsEmpty(phone: string): boolean {
  return phone.replace(/^\+374\s?/, '').trim().length === 0
}

const INITIAL_FORM = { name: '', phone: PHONE_PREFIX, message: '', square_meters: '' }

export default function OrderSheet({ panel, priceFormatted, activePrice, onClose }: OrderSheetProps) {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState(INITIAL_FORM)
  const [phoneError, setPhoneError] = useState('')
  const [sqmError, setSqmError] = useState('')
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(true)

  function handleClose() {
    setMounted(false)
  }

  // ── Calculator derived values ─────────────────────────────
  const panelAreaM2 =
    panel.width_mm && panel.height_mm
      ? (panel.width_mm * panel.height_mm) / 1_000_000
      : null

  const squareMetersNum = parseFloat(form.square_meters) || 0

  const panelsBase =
    panelAreaM2 && squareMetersNum > 0
      ? Math.ceil(squareMetersNum / panelAreaM2)
      : null

  const panelsExtra = panelsBase !== null ? Math.ceil(panelsBase * 0.1) : null
  const panelsTotal = panelsBase !== null && panelsExtra !== null ? panelsBase + panelsExtra : null

  const totalPrice =
    panelsTotal !== null && panelAreaM2 !== null && activePrice
      ? Math.round(panelsTotal * panelAreaM2 * activePrice)
      : null

  // Disabled: name empty | phone empty | phone error | sqm required but empty/invalid
  const sqmRequired = panelAreaM2 !== null
  const disabled =
    sending ||
    !form.name.trim() ||
    phoneIsEmpty(form.phone) ||
    !!phoneError ||
    (sqmRequired ? (!form.square_meters || !!sqmError) : false)

  function validateSqm(val: string) {
    if (!val) { setSqmError(t('products.sqm_required')); return false }
    const n = parseFloat(val)
    if (isNaN(n) || n <= 0) { setSqmError(t('products.sqm_invalid')); return false }
    if (n > 10000) { setSqmError(t('products.sqm_too_large')); return false }
    setSqmError('')
    return true
  }

  async function handleSubmit() {
    // Guard: phone
    if (phoneIsEmpty(form.phone) || !validateArmenianPhone(form.phone)) {
      setPhoneError(t('products.phone_invalid'))
      return
    }
    // Guard: sqm (only when panel has dimensions)
    if (sqmRequired && !validateSqm(form.square_meters)) return

    setSending(true)
    try {
      await api.post('/api/leads', {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        comment: form.message || undefined,
        wall_config: {
          type:         'product_order',
          panel_name:   panel.name,
          panel_id:     panel.id,
          square_meters: squareMetersNum > 0 ? squareMetersNum : undefined,
          panels_base:   panelsBase   ?? undefined,
          panels_extra:  panelsExtra  ?? undefined,
          panels_total:  panelsTotal  ?? undefined,
          panel_area_m2: panelAreaM2  ?? undefined,
          price_per_m2:  activePrice  ?? undefined,
          total_cost:    totalPrice   ?? undefined,
          // LeadCard display fields (visualizer compat)
          width:  0, height: 0, color: '#D4601A',
          panels: [{ name: panel.name }],
        },
      })
      toast.success(t('contact.success'))
      handleClose()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence onExitComplete={onClose}>
      {mounted && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        style={{
          background: 'var(--ui-bg)', borderRadius: '20px 20px 0 0',
          padding: '28px 24px 40px', width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {t('products.order_now')}
          </h3>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Panel summary */}
        <div style={{ background: 'var(--ui-surface)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{panel.name}</strong>
          {panel.width_mm && (
            <span style={{ marginLeft: 8 }}>· {panel.width_mm}×{panel.height_mm}×{panel.depth_mm} mm</span>
          )}
          {priceFormatted && (
            <span style={{ marginLeft: 8, color: 'var(--accent)', fontWeight: 700 }}>· {priceFormatted} AMD/m²</span>
          )}
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('contact.form_name')} *
            </label>
            <input
              className="pub-form__input"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('contact.form_name')}
            />
          </div>

          {/* Phone — pre-filled +374, prefix protected */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('contact.form_phone')} *
            </label>
            <input
              className="pub-form__input"
              type="tel"
              required
              value={form.phone}
              onChange={e => {
                let val = e.target.value
                // Prevent user from deleting the +374 prefix
                if (!val.startsWith('+374')) {
                  val = PHONE_PREFIX + val.replace(/^\+374\s?/, '')
                }
                setForm(f => ({ ...f, phone: val }))
                if (phoneError) setPhoneError('')
              }}
              onBlur={e => {
                const val = e.target.value
                // Only validate if the user actually typed digits after the prefix
                if (!phoneIsEmpty(val) && !validateArmenianPhone(val)) {
                  setPhoneError(t('products.phone_invalid'))
                }
              }}
              placeholder="+374 XX XXX XXX"
            />
            {phoneError && (
              <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, margin: '6px 0 0' }}>
                ⚠ {phoneError}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {t('products.phone_hint')}
            </p>
          </div>

          {/* Wall area — required when panel has dimensions */}
          {panelAreaM2 && (
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {t('products.wall_area')} (m²) *
              </label>
              <input
                className="pub-form__input"
                type="number"
                min="0.1"
                step="0.1"
                value={form.square_meters}
                onChange={e => {
                  setForm(f => ({ ...f, square_meters: e.target.value }))
                  if (sqmError) setSqmError('')
                }}
                onBlur={e => validateSqm(e.target.value)}
                placeholder="e.g. 12.5"
              />
              {sqmError && (
                <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, margin: '6px 0 0' }}>
                  ⚠ {sqmError}
                </p>
              )}

              {/* Calculator result */}
              {panelsTotal !== null && !sqmError && (
                <div style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  background: 'rgba(167,139,250,0.08)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderRadius: 10,
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {panelsTotal} {t('products.panels_needed')}
                  </div>
                  <div>
                    {panelsBase} {t('products.panels_base')}
                    {' + '}
                    {panelsExtra} {t('products.panels_extra')}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    {t('products.panel_area')}: {panelAreaM2.toFixed(4)} m²
                  </div>
                  {totalPrice !== null && (
                    <div style={{
                      marginTop: 8, paddingTop: 8,
                      borderTop: '1px solid rgba(167,139,250,0.25)',
                      fontSize: 16, fontWeight: 700, color: 'var(--accent)',
                    }}>
                      {t('products.estimated_total')}: {totalPrice.toLocaleString(i18n.language)} AMD
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('contact.form_message')}
            </label>
            <textarea
              className="pub-form__textarea"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder={t('products.order_message_placeholder')}
              style={{ minHeight: 100 }}
            />
          </div>

          {/* Submit */}
          <button
            disabled={disabled}
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              transition: 'opacity 0.15s', opacity: disabled ? 0.5 : 1,
            }}
          >
            {sending ? '...' : t('products.send_order')}
          </button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
