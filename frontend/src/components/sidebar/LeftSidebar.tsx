/**
 * LeftSidebar.tsx — Homestyler-style left catalog
 *
 * Tabs: Панели | Аксессуары | Свет
 *
 * Panels tab:
 * - 2 slot selector (слот A / слот B)
 * - Grid of panel cards with hover preview
 * - Click → applies panel to active slot instantly
 *
 * Accessories tab:
 * - Filter by type
 * - Grid → click adds to wall
 *
 * Settings tab (light + wall color):
 * - Sliders for angle/elevation
 * - Color presets + picker
 */

import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'
import { toast } from 'sonner'
import type { Panel } from '../../types'

const W = 256

const WALL_PRESETS = ['#f8f8f6', '#f0ede4', '#e0ddd6', '#c0bdb4', '#3a3836', '#141412']

export default function LeftSidebar() {
  const { sidebarOpen, sidebarTab, setSidebarTab } = useVisualizerStore()

  if (!sidebarOpen) return null

  return (
    <div
      style={{
        width: W,
        flexShrink: 0,
        height: '100%',
        background: 'var(--ui-bg)',
        borderRight: '1px solid var(--ui-surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--ui-surface)',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'panels' as const, label: 'Панели', emoji: '🪟' },
          { id: 'accessories' as const, label: 'Акс.', emoji: '🔌' },
          { id: 'settings' as const, label: 'Свет', emoji: '☀️' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSidebarTab(t.id)}
            style={{
              padding: '11px 4px 9px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              borderBottom:
                sidebarTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: sidebarTab === t.id ? 'var(--text-primary)' : '#8a8480',
                transition: 'color 0.12s',
              }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {sidebarTab === 'panels' && <PanelsTab />}
        {sidebarTab === 'accessories' && <AccessoriesTab />}
        {sidebarTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

/* ── Panels Tab ──────────────────────────────────────────── */
function PanelsTab() {
  const { availablePanels, selectedPanels, setPanelInSlot, setHoverPanelId } = useVisualizerStore()

  const selected = selectedPanels[0]

  return (
    <div style={{ padding: '12px 10px' }}>
      {/* Current selection */}
      <p style={sectionLabelStyle}>Выбранная панель</p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: 'var(--ui-surface)',
          borderRadius: 12,
          marginBottom: 14,
          position: 'relative',
          minHeight: 56,
        }}
      >
        {selected ? (
          <>
            <img
              src={selected.thumb_url}
              alt={selected.name}
              style={{ width: 40, height: 40, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
              {selected.name}
            </span>
            <button
              onClick={() => setPanelInSlot(null, 0)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(255,69,58,0.85)',
                border: 'none',
                color: '#fff',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Не выбрана — нажмите на панель ниже
          </span>
        )}
      </div>

      {/* Panel grid */}
      <p style={sectionLabelStyle}>Доступные панели ({availablePanels.length})</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {availablePanels.map((p) => (
          <PanelCard
            key={p.id}
            panel={p}
            selected={selected?.id === p.id}
            onSelect={() => {
              setPanelInSlot(p, 0)
              toast(p.name)
            }}
            onHoverEnter={() => setHoverPanelId(p.id)}
            onHoverLeave={() => setHoverPanelId(null)}
          />
        ))}
        {availablePanels.length === 0 && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              gridColumn: '1/-1',
              padding: '12px 0',
              textAlign: 'center',
            }}
          >
            Нет панелей
          </p>
        )}
      </div>
    </div>
  )
}

function PanelCard({
  panel,
  selected,
  onSelect,
  onHoverEnter,
  onHoverLeave,
}: {
  panel: Panel
  selected: boolean
  onSelect: () => void
  onHoverEnter: () => void
  onHoverLeave: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => {
        setHov(true)
        onHoverEnter()
      }}
      onMouseLeave={() => {
        setHov(false)
        onHoverLeave()
      }}
      style={{
        padding: 6,
        border: 'none',
        borderRadius: 12,
        cursor: 'pointer',
        background: hov ? 'var(--ui-surface)' : 'transparent',
        outline: selected ? '2px solid var(--accent)' : 'none',
        outlineOffset: selected ? 1 : 0,
        transition: 'all 0.12s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font)',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 9,
          overflow: 'hidden',
          background: 'var(--ui-surface)',
        }}
      >
        <img
          src={panel.thumb_url}
          alt={panel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {panel.name}
      </span>
    </button>
  )
}

/* ── Accessories Tab ─────────────────────────────────────── */
function AccessoriesTab() {
  const {
    availableAccessoryTypes,
    availableAccessories,
    placedAccessories,
    placeAccessory,
    removeAccessory,
  } = useVisualizerStore()

  const [selType, setSelType] = useState<string | null>(null)
  const filtered = selType
    ? availableAccessories.filter((a) => a.type_id === selType)
    : availableAccessories

  return (
    <div style={{ padding: '12px 10px' }}>
      {/* Type filter */}
      <p style={sectionLabelStyle}>Тип</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        <Chip label="Все" active={!selType} onClick={() => setSelType(null)} />
        {availableAccessoryTypes.map((t) => (
          <Chip
            key={t.id}
            label={t.label_ru}
            active={selType === t.id}
            onClick={() => setSelType(t.id)}
          />
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {filtered.map((acc) => (
          <button
            key={acc.id}
            onClick={() => {
              placeAccessory(acc)
              toast(`Добавлен: ${acc.name}`)
            }}
            style={{
              padding: 6,
              border: '1px solid var(--ui-border)',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'var(--ui-surface)',
              transition: 'background 0.12s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ui-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ui-surface)')}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--ui-elevated)',
              }}
            >
              <img
                src={acc.thumb_url}
                alt={acc.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              {acc.name}
            </span>
          </button>
        ))}
      </div>

      {/* Placed list */}
      {placedAccessories.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={sectionLabelStyle}>На стене ({placedAccessories.length})</p>
          {placedAccessories.map((p) => (
            <div
              key={p.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'var(--ui-surface)',
                borderRadius: 9,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {p.accessory.name}
              </span>
              <button
                onClick={() => removeAccessory(p.uid)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  padding: '2px 4px',
                  borderRadius: 5,
                  transition: 'color 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Settings Tab ────────────────────────────────────────── */
function SettingsTab() {
  const { lightAngle, setLightAngle, lightElevation, setLightElevation, wallColor, setWallColor } =
    useVisualizerStore()

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Slider
        label="Угол света"
        value={lightAngle}
        min={0}
        max={360}
        unit="°"
        onChange={setLightAngle}
      />
      <Slider
        label="Высота"
        value={lightElevation}
        min={5}
        max={85}
        unit="°"
        onChange={setLightElevation}
      />

      <div>
        <p style={sectionLabelStyle}>Цвет стены</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6,1fr)',
            gap: 7,
            marginBottom: 10,
          }}
        >
          {WALL_PRESETS.map((hex) => (
            <button
              key={hex}
              onClick={() => setWallColor(hex)}
              style={{
                aspectRatio: '1',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                background: hex,
                boxShadow:
                  wallColor === hex
                    ? `0 0 0 2px var(--ui-bg), 0 0 0 4px var(--text-primary)`
                    : `0 0 0 1px rgba(255,255,255,0.1)`,
                transform: wallColor === hex ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.12s',
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            background: 'var(--ui-surface)',
            borderRadius: 10,
            border: '1px solid var(--ui-border)',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: wallColor,
              border: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>Свой цвет</span>
          <input
            type="color"
            value={wallColor}
            onChange={(e) => setWallColor(e.target.value)}
            style={{
              width: 34,
              height: 34,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              background: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Shared ──────────────────────────────────────────────── */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        border: 'none',
        borderRadius: 20,
        cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--ui-surface)',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font)',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
            background: 'var(--ui-border)',
            padding: '1px 7px',
            borderRadius: 7,
          }}
        >
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 8,
}
