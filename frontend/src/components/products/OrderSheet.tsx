import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../../lib/api'
import { Panel } from '../../types'

interface OrderSheetProps {
  panel: Panel
  priceFormatted: string | null
  onClose: () => void
}

export default function OrderSheet({ panel, priceFormatted, onClose }: OrderSheetProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  const disabled = sending || !form.name || !form.phone

  async function handleSubmit() {
    setSending(true)
    try {
      await api.post('/api/leads', {
        name:    form.name,
        phone:   form.phone,
        comment: form.message || undefined,
        wall_config: {
          type:       'product_order',
          panel_name:  panel.name,
          panel_id:    panel.id,
          price:       priceFormatted ?? undefined,
          width_mm:    panel.width_mm,
          height_mm:   panel.height_mm,
          depth_mm:    panel.depth_mm,
          // LeadCard uses these fields for display
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

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('contact.form_phone')} *
            </label>
            <input
              className="pub-form__input"
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+374 XX XXX XXX"
            />
          </div>

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

          <button
            disabled={disabled}
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {sending ? '...' : t('products.send_order')}
          </button>
        </div>
      </div>
    </div>
  )
}
