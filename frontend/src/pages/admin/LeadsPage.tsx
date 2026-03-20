/**
 * LeadsPage — Admin page showing all leads with status management.
 */

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../lib/api'

interface Lead {
  id: string
  name: string
  phone: string
  comment?: string
  status: 'new' | 'contacted' | 'sold' | 'cancelled'
  created_at: string
  wall_config: {
    width: number
    height: number
    color: string
    panels: { sku?: string; name: string }[]
    total_panels?: number
    total_cost?: number
    share_url?: string
  }
}

const STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',     color: 'var(--accent-blue)' },
  contacted: { label: 'Связались', color: 'var(--accent-yellow)' },
  sold:      { label: 'Продано ✓', color: 'var(--accent-green)' },
  cancelled: { label: 'Отменена',  color: 'var(--light-text-sec)' },
}

export default function LeadsPage() {
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  async function load() {
    try {
      const res = await api.get('/admin/leads')
      setLeads(res.data.data)
    } catch { toast.error('Ошибка загрузки заявок') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/leads/${id}`, { status })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l))
      toast.success('Статус обновлён')
    } catch { toast.error('Ошибка обновления') }
  }

  const filtered = leads.filter(l => filter === 'all' || l.status === filter)
  const stats = {
    total:     leads.length,
    new:       leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    sold:      leads.filter(l => l.status === 'sold').length,
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--light-text-sec)' }}>Загрузка...</div>

  return (
    <div style={{ padding: '24px 32px', maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--light-text)', marginBottom: 6 }}>Заявки</h1>
      <p style={{ fontSize: 14, color: 'var(--light-text-sec)', marginBottom: 24 }}>
        {stats.total} всего · {stats.new} новых · {stats.sold} продано
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Всего',    value: stats.total,     color: 'var(--light-text)' },
          { label: 'Новых',    value: stats.new,       color: 'var(--accent-blue)' },
          { label: 'В работе', value: stats.contacted, color: 'var(--accent-yellow)' },
          { label: 'Продано',  value: stats.sold,      color: 'var(--accent-green)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--light-surface)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#9a9890', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['all', 'new', 'contacted', 'sold', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filter === f ? 'var(--light-text)' : 'var(--light-surface)',
            color:      filter === f ? '#fff'    : '#4a4946',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.12s',
          }}>
            {f === 'all' ? 'Все' : STATUS[f]?.label ?? f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9a9890' }}>Нет заявок</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(lead => <LeadCard key={lead.id} lead={lead} onStatusChange={updateStatus} />)}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, onStatusChange }: { lead: Lead; onStatusChange: (id: string, status: string) => void }) {
  const { label: statusLabel, color: statusColor } = STATUS[lead.status] ?? STATUS.new
  const wc = lead.wall_config

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '16px 20px',
      border: lead.status === 'new' ? '1px solid rgba(10,132,255,0.3)' : '1px solid var(--light-surface)',
      boxShadow: lead.status === 'new' ? '0 2px 12px rgba(10,132,255,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Wall color preview */}
        <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: wc.color, border: '1px solid rgba(0,0,0,0.1)', position: 'relative' }}>
          <span style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 9, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 4, padding: '1px 3px' }}>
            {wc.width}×{wc.height}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--light-text)' }}>{lead.name}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, background: `${statusColor}18`, padding: '2px 8px', borderRadius: 20 }}>
              {statusLabel}
            </span>
            <span style={{ fontSize: 10, color: '#9a9890' }}>
              {new Date(lead.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={`tel:${lead.phone}`} style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
              📞 {lead.phone}
            </a>
            {wc.panels.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--light-text-sec)' }}>Панели: {wc.panels.map(p => p.name).join(' + ')}</span>
            )}
            {wc.total_panels && (
              <span style={{ fontSize: 12, color: 'var(--light-text-sec)' }}>
                {wc.total_panels} шт{wc.total_cost ? ` · ${wc.total_cost.toLocaleString('ru-RU')} ₽` : ''}
              </span>
            )}
          </div>

          {lead.comment && (
            <p style={{ fontSize: 12, color: '#9a9890', marginTop: 4, marginBottom: 0 }}>💬 {lead.comment}</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {wc.share_url && (
            <a href={wc.share_url} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--light-surface)', color: '#4a4946', textDecoration: 'none' }}>
              🔗 Дизайн
            </a>
          )}
          {lead.status === 'new' && (
            <button onClick={() => onStatusChange(lead.id, 'contacted')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent-blue)', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
              Позвонил
            </button>
          )}
          {lead.status === 'contacted' && (
            <button onClick={() => onStatusChange(lead.id, 'sold')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent-green)', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
              Продано ✓
            </button>
          )}
          {lead.status !== 'cancelled' && lead.status !== 'sold' && (
            <button onClick={() => onStatusChange(lead.id, 'cancelled')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--light-surface)', cursor: 'pointer', background: 'transparent', color: '#9a9890', fontSize: 11, fontFamily: 'inherit' }}>
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
