/**
 * TopToolbar.tsx — Light theme version
 */

import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'
import { toast } from 'sonner'
import { ShareButton } from './ShareButton'
import { RoomPresets } from './RoomPresets'
import { LeadModal } from './LeadModal'

export default function TopToolbar() {
  const {
    tenant,
    wallWidth,
    wallHeight,
    setWallSize,
    setPendingSave,
    resetAll,
    sidebarOpen,
    setSidebarOpen,
  } = useVisualizerStore()

  const [w, setW] = useState(wallWidth.toString())
  const [h, setH] = useState(wallHeight.toString())
  const [dirty, setDirty] = useState(false)
  const [showLead, setShowLead] = useState(false)

  function applySize() {
    const wv = parseFloat(w)
    const hv = parseFloat(h)
    if (!wv || !hv || wv < 0.5 || wv > 10 || hv < 0.5 || hv > 10) {
      toast.error('Допустимый размер: 0.5 — 10 м')
      return
    }
    setWallSize(wv, hv)
    setDirty(false)
    toast.success('Размер обновлён')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') applySize()
  }

  return (
    <div
      style={{
        height: 52,
        background: 'var(--ui-bg)',
        borderBottom: '1px solid var(--ui-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        zIndex: 20,
        boxShadow: '0 1px 0 var(--ui-border)',
      }}
    >
      {/* Sidebar toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={iconBtnStyle} title="Каталог">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <rect y="0" width="18" height="2" rx="1" fill="var(--text-secondary)" />
          <rect y="6" width="18" height="2" rx="1" fill="var(--text-secondary)" />
          <rect y="12" width="18" height="2" rx="1" fill="var(--text-secondary)" />
        </svg>
      </button>

      <div style={dividerStyle} />

      {/* Logo */}
      {tenant?.logo_url ? (
        <img src={tenant.logo_url} alt={tenant.name} style={{ height: 26, width: 'auto' }} />
      ) : (
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          {tenant?.name ?? 'Wallcraft'}
        </span>
      )}

      <div style={dividerStyle} />

      {/* Room presets */}
      <RoomPresets
        onApply={(w, h) => {
          setW(w.toString())
          setH(h.toString())
          setDirty(false)
        }}
      />

      <div style={dividerStyle} />

      {/* Wall size inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={labelStyle}>Ш:</span>
        <SizeInput
          value={w}
          onChange={(v) => {
            setW(v)
            setDirty(true)
          }}
          onKeyDown={handleKey}
        />
        <span style={labelStyle}>×</span>
        <span style={labelStyle}>В:</span>
        <SizeInput
          value={h}
          onChange={(v) => {
            setH(v)
            setDirty(true)
          }}
          onKeyDown={handleKey}
        />
        <span style={labelStyle}>м</span>
      </div>

      {dirty && (
        <button onClick={applySize} style={applyBtnStyle}>
          Применить
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <button
        onClick={() => setShowLead(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 32,
          padding: '0 14px',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'var(--font)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Заказать →
      </button>

      <ShareButton />

      <button
        onClick={() => setPendingSave(true)}
        style={actionBtnStyle}
        title="Сохранить изображение"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1v8M4 6l3 4 3-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M1 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>Сохранить</span>
      </button>

      <button
        onClick={() => {
          resetAll()
          setW('3.0')
          setH('2.7')
        }}
        style={{
          ...actionBtnStyle,
          color: 'var(--accent-red)',
          borderColor: 'rgba(192,57,43,0.22)',
        }}
        title="Сбросить всё"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M11 2L2 11M2 2l9 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>Сброс</span>
      </button>

      {showLead && <LeadModal onClose={() => setShowLead(false)} />}
    </div>
  )
}

function SizeInput({
  value,
  onChange,
  onKeyDown,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}) {
  return (
    <input
      type="number"
      value={value}
      min={0.5}
      max={10}
      step={0.1}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{
        width: 52,
        height: 30,
        padding: '0 8px',
        background: '#fff',
        border: '1px solid var(--ui-border)',
        borderRadius: 8,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font)',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = '1px solid var(--accent)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = '1px solid var(--ui-border)'
      }}
    />
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  transition: 'background 0.12s',
}
const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 24,
  background: 'var(--ui-border)',
  flexShrink: 0,
}
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  fontWeight: 500,
  flexShrink: 0,
}
const applyBtnStyle: React.CSSProperties = {
  height: 30,
  padding: '0 12px',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'var(--font)',
  cursor: 'pointer',
  transition: 'opacity 0.12s',
  flexShrink: 0,
}
const actionBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  padding: '0 12px',
  background: 'var(--ui-surface)',
  border: '1px solid var(--ui-border)',
  borderRadius: 8,
  color: 'var(--text-secondary)',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'var(--font)',
  cursor: 'pointer',
  transition: 'all 0.12s',
  flexShrink: 0,
}
