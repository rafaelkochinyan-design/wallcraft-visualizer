import { useState } from 'react'
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

// +374 followed by 8 digits, with optional spaces/dashes
function validateArmenianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-()]/g, '')
  return /^(\+374|374|0)\d{8}$/.test(clean)
}

export default function OrderSheet({ panel, priceFormatted, activePrice, onClose }: OrderSheetProps) {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState({ name: '', phone: '', message: '', square_meters: '' })
  const [phoneError, setPhoneError] = useState('')
  const [sending, setSending] = useState(false)

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

  const disabled = sending || !form.name || !form.phone || !!phoneError

  async function handleSubmit() {
    // Re-validate phone on submit in case user skipped blur
    if (!validateArmenianPhone(form.phone)) {
      setPhoneError(t('products.phone_invalid'))
      return
    }
    setSending(true)
    try {
      await api.post('/api/leads', {
        name:    form.name,
        phone:   form.phone,
        comment: form.message || undefined,
        wall_config: {
          type:         'product_order',
          panel_name:   panel.name,
          panel_id:     panel.id,
          price:        priceFormatted ?? undefined,
          width_mm:     panel.width_mm,
          height_mm:    panel.height_mm,
          depth_mm:     panel.depth_mm,
          square_meters: squareMetersNum > 0 ? squareMetersNum : undefined,
          panels_total:  panelsTotal ?? undefined,
          total_cost:    totalPrice ?? undefined,
          // Fields used by LeadCard display
          width:   0,
          height:  0,
          color:   'var(--accent)',
          panels:  [{ name: panel.name }],
        },
      })
      toast.success(t('contact.success'))
      onClose()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
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
            onClick={onClose}
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

          {/* Phone */}
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
                setForm(f => ({ ...f, phone: e.target.value }))
                if (phoneError) setPhoneError('')
              }}
              onBlur={e => {
                const val = e.target.value.trim()
                if (val && !validateArmenianPhone(val)) {
                  setPhoneError(t('products.phone_invalid'))
                }
              }}
              placeholder="+374 XX XXX XXX"
            />
            {phoneError && (
              <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, margin: '6px 0 0' }}>
                ⚠ {phoneError}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {t('products.phone_hint')}
            </p>
          </div>

          {/* Wall area + calculator */}
          {panelAreaM2 && (
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {t('products.wall_area')} (m²)
              </label>
              <input
                className="pub-form__input"
                type="number"
                min="0"
                step="0.1"
                value={form.square_meters}
                onChange={e => setForm(f => ({ ...f, square_meters: e.target.value }))}
                placeholder="e.g. 12.5"
              />

              {/* Calculator result */}
              {panelsTotal !== null && (
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
                  {panelAreaM2 && (
                    <div style={{ marginTop: 2 }}>
                      {t('products.panel_area')}: {panelAreaM2.toFixed(4)} m²
                    </div>
                  )}
                  {totalPrice !== null && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid rgba(167,139,250,0.25)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--accent)',
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
      </div>
    </div>
  )
}
