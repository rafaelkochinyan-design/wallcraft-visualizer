/**
 * LeadsPage — Admin page showing all orders with status management.
 */

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useOrderSocket, IncomingOrder } from '../../hooks/useOrderSocket'

interface Lead {
  id: string
  name: string
  phone: string
  comment?: string
  status: 'new' | 'contacted' | 'sold' | 'cancelled'
  created_at: string
  wall_config: {
    // visualizer order fields
    width: number
    height: number
    color: string
    panels: { sku?: string; name: string }[]
    total_panels?: number
    share_url?: string
    // product order fields
    type?: string
    panel_name?: string
    square_meters?: number
    panels_base?: number
    panels_extra?: number
    panels_total?: number
    panel_area_m2?: number
    price_per_m2?: number
    total_cost?: number
  }
}

const STATUS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'var(--accent-blue)' },
  contacted: { label: 'Contacted', color: 'var(--accent-yellow)' },
  sold: { label: 'Sold ✓', color: 'var(--accent-green)' },
  cancelled: { label: 'Cancelled', color: 'var(--light-text-sec)' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function load() {
    try {
      const res = await api.get('/admin/leads')
      setLeads(res.data.data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useOrderSocket((order: IncomingOrder) => {
    const newLead: Lead = {
      id:         order.id,
      name:       order.name,
      phone:      order.phone,
      comment:    order.comment ?? undefined,
      status:     (order.status as Lead['status']) ?? 'new',
      created_at: order.created_at,
      wall_config: (order.wall_config ?? {}) as Lead['wall_config'],
    }
    setLeads((prev) => [newLead, ...prev])
    toast.success(`New order from ${order.name}`, { duration: 5000 })
  })

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/leads/${id}`, { status })
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: status as Lead['status'] } : l)))
      toast.success('Status updated')
    } catch {
      toast.error('Update failed')
    }
  }

  const filtered = leads.filter((l) => filter === 'all' || l.status === filter)
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    sold: leads.filter((l) => l.status === 'sold').length,
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--light-text-sec)' }}>Loading...</div>

  return (
    <div style={{ padding: '24px 32px', maxWidth: 960 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--light-text)', marginBottom: 6 }}>
        Orders
      </h1>
      <p style={{ fontSize: 16, color: 'var(--light-text-sec)', marginBottom: 24 }}>
        {stats.total} total · {stats.new} new · {stats.sold} sold
      </p>

      {/* Stats */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}
      >
        {[
          { label: 'Total', value: stats.total, color: 'var(--light-text)' },
          { label: 'New', value: stats.new, color: 'var(--accent-blue)' },
          { label: 'In progress', value: stats.contacted, color: 'var(--accent-yellow)' },
          { label: 'Sold', value: stats.sold, color: 'var(--accent-green)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '20px',
              border: '1px solid var(--light-surface)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 14, color: '#9a9890', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'new', 'contacted', 'sold', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              background: filter === f ? 'var(--light-text)' : 'var(--light-surface)',
              color: filter === f ? '#fff' : '#4a4946',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              minHeight: 40,
              transition: 'all 0.12s',
            }}
          >
            {f === 'all' ? 'All' : (STATUS[f]?.label ?? f)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9a9890' }}>No orders</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onStatusChange={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: Lead
  onStatusChange: (id: string, status: string) => void
}) {
  const { label: statusLabel, color: statusColor } = STATUS[lead.status] ?? STATUS.new
  const wc = lead.wall_config
  const isProductOrder = wc.type === 'product_order'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        border: lead.status === 'new'
          ? '2px solid rgba(10,132,255,0.4)'
          : '1px solid #e5e7eb',
        boxShadow: lead.status === 'new'
          ? '0 4px 20px rgba(10,132,255,0.1)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        marginBottom: 4,
      }}
    >
      {/* Row 1: Color swatch + Name + Status + Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            flexShrink: 0,
            background: isProductOrder ? 'var(--accent)' : (wc.color || '#e5e7eb'),
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isProductOrder ? 24 : 11,
            color: '#fff',
            fontWeight: 700,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {isProductOrder ? '🪵' : `${wc.width}×${wc.height}`}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {lead.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: statusColor,
                background: `${statusColor}18`,
                padding: '4px 12px',
                borderRadius: 20,
              }}
            >
              {statusLabel}
            </span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              {new Date(lead.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Phone (prominent) */}
      <a
        href={`tel:${lead.phone}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 22,
          fontWeight: 700,
          color: '#1d4ed8',
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        📞 {lead.phone}
      </a>

      {/* Row 3: Order details */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isProductOrder ? (
          // ── Product page order ──────────────────────────────
          <>
            {wc.panel_name && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Panel:</span>
                <strong>{wc.panel_name}</strong>
              </div>
            )}
            {wc.square_meters && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Wall area:</span>
                <strong>{wc.square_meters} m²</strong>
              </div>
            )}
            {wc.panels_total && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Panels needed:</span>
                <strong>{wc.panels_total} pcs</strong>
                {wc.panels_base && wc.panels_extra && (
                  <span style={{ color: '#9ca3af', fontSize: 13, marginLeft: 8 }}>
                    ({wc.panels_base} + {wc.panels_extra} extra)
                  </span>
                )}
              </div>
            )}
            {wc.price_per_m2 && wc.price_per_m2 > 0 && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Price/m²:</span>
                <strong>{wc.price_per_m2.toLocaleString('ru-RU')} AMD</strong>
              </div>
            )}
            {wc.total_cost && wc.total_cost > 0 && (
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', paddingTop: 8, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
                Total: {wc.total_cost.toLocaleString('ru-RU')} AMD
              </div>
            )}
          </>
        ) : (
          // ── Visualizer order ────────────────────────────────
          <>
            {wc.panels && wc.panels.length > 0 && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Panels:</span>
                <strong>{wc.panels.map((p) => p.name).join(' + ')}</strong>
              </div>
            )}
            {wc.total_panels && (
              <div style={{ fontSize: 15, color: '#374151' }}>
                <span style={{ color: '#6b7280', marginRight: 8 }}>Quantity:</span>
                <strong>{wc.total_panels} pcs</strong>
                {wc.total_cost && (
                  <span style={{ marginLeft: 16, fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    {wc.total_cost.toLocaleString('ru-RU')} AMD
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Row 4: Comment */}
      {lead.comment && (
        <div
          style={{
            fontSize: 15,
            color: '#4b5563',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          💬 {lead.comment}
        </div>
      )}

      {/* Row 5: Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {wc.share_url && (
          <a
            href={wc.share_url}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              background: '#f3f4f6',
              color: '#374151',
              textDecoration: 'none',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🔗 View Design
          </a>
        )}
        {lead.status === 'new' && (
          <button
            onClick={() => onStatusChange(lead.id, 'contacted')}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: '#2563eb',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              minHeight: 44,
            }}
          >
            ✓ Called
          </button>
        )}
        {lead.status === 'contacted' && (
          <button
            onClick={() => onStatusChange(lead.id, 'sold')}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: '#16a34a',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              minHeight: 44,
            }}
          >
            ✓ Sold
          </button>
        )}
        {lead.status !== 'cancelled' && lead.status !== 'sold' && (
          <button
            onClick={() => onStatusChange(lead.id, 'cancelled')}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: 14,
              fontFamily: 'inherit',
              minHeight: 44,
            }}
          >
            ✕ Cancel
          </button>
        )}
      </div>
    </div>
  )
}
