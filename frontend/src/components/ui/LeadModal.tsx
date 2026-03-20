/**
 * LeadModal — "Заказать панели" form.
 * Submits lead to backend with wall config.
 */

import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'
import { toast } from 'sonner'
import api from '../../lib/api'

interface Props { onClose: () => void }

export function LeadModal({ onClose }: Props) {
  const { wallWidth, wallHeight, wallColor, selectedPanels, placedAccessories } = useVisualizerStore()

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const cols  = Math.ceil(wallWidth  / 0.5)
  const rows  = Math.ceil(wallHeight / 0.5)
  const total = cols * rows
  const nonNull = selectedPanels.filter(Boolean)
  const avgPrice = nonNull.reduce((s, p) => s + (p?.price ?? 0), 0) / Math.max(nonNull.length, 1)
  const totalCost = avgPrice > 0 ? Math.round(total * avgPrice) : 0

  async function handleSubmit() {
    if (!name.trim())  { toast.error('Введите имя');     return }
    if (!phone.trim()) { toast.error('Введите телефон'); return }

    setLoading(true)
    try {
      await api.post('/api/leads', {
        name:    name.trim(),
        phone:   phone.trim(),
        comment: comment.trim() || undefined,
        wall_config: {
          width:       wallWidth,
          height:      wallHeight,
          color:       wallColor,
          panels:      nonNull.map(p => ({ id: p!.id, name: p!.name, sku: p!.sku })),
          accessories: placedAccessories.map(a => ({ name: a.accessory.name })),
          total_panels: total,
          total_cost:   totalCost,
          share_url:   window.location.href,
        },
      })
      toast.success('Заявка отправлена! Мы свяжемся с вами.')
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Ошибка отправки. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--ui-bg)', border: '1px solid var(--ui-border)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Заказать панели</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Мы свяжемся с вами в течение часа</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22 }}>×</button>
        </div>

        {/* Config summary */}
        <div style={{ background: 'var(--ui-surface)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, border: '1px solid var(--ui-border)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            Ваш дизайн
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 0' }}>
            <SRow label="Стена"   value={`${wallWidth}×${wallHeight} м`} />
            <SRow label="Панелей" value={`${total} шт`} />
            {nonNull.map((p, i) => p && <SRow key={i} label="Панель" value={p.name} />)}
            {totalCost > 0 && <SRow label="~Стоимость" value={`${totalCost.toLocaleString('ru-RU')} ₽`} accent />}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <Field label="Ваше имя"  value={name}    onChange={setName}    placeholder="Как к вам обращаться?" autoFocus />
          <Field label="Телефон"   value={phone}   onChange={setPhone}   placeholder="+7 (___) ___-__-__" type="tel" />
          <Field label="Комментарий (необязательно)" value={comment} onChange={setComment} placeholder="Уточнения по заказу..." />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 46, border: '1px solid var(--ui-border)', borderRadius: 12,
            background: 'transparent', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font)', cursor: 'pointer',
          }}>Отмена</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 2, height: 46, border: 'none', borderRadius: 12,
            background: loading ? 'var(--ui-surface)' : 'var(--accent)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Отправляем...' : 'Отправить заявку →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: accent ? 'var(--accent-green)' : 'var(--text-secondary)', textAlign: 'right' }}>{value}</span>
    </>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', autoFocus }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; autoFocus?: boolean
}) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input type={type} value={value} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', height: 44, padding: '0 14px',
          background: 'var(--ui-surface)', border: '1px solid var(--ui-border)',
          borderRadius: 10, color: 'var(--text-primary)',
          fontFamily: 'var(--font)', fontSize: 15, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.12s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--ui-border)')}
      />
    </div>
  )
}
