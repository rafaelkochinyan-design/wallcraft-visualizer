import { useState } from 'react'
import { toast } from 'sonner'
import { useVisualizerStore } from '../../store/visualizer'
import { Button } from '../ui/Button'
import type { Panel } from '../../types'

export default function PanelSelectStep() {
  const {
    availablePanels, selectedPanels,
    togglePanelSelect, setStep,
  } = useVisualizerStore()

  const [activeCat, setActiveCat] = useState<string | null>(null)

  // Unique categories from available panels
  const categories = Array.from(
    new Map(
      availablePanels
        .filter(p => p.category)
        .map(p => [p.category!.id, p.category!])
    ).values()
  )

  const filtered = activeCat
    ? availablePanels.filter(p => p.category?.id === activeCat)
    : availablePanels

  const canGo = selectedPanels.length >= 1
  const maxed = selectedPanels.length >= 2

  function handleApply() {
    setStep('interactive')
    toast.success('Панели применены')
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
      padding: '0 16px 20px',
      zIndex: 'var(--z-overlay)',
      pointerEvents: 'none',
    }}>
      <div className="card-dark anim-fadeup" style={{
        width: '100%', maxWidth: 880,
        padding: '20px 22px 20px',
        pointerEvents: 'auto',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>

          {/* Title */}
          <div>
            <p style={{
              fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)',
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.30)', marginBottom: 4,
            }}>
              Шаг 2 из 3
            </p>
            <h3 style={{
              fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: '#fff',
            }}>
              Выберите панели
            </h3>
          </div>

          {/* Slot preview — shows which panels are selected */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {[0, 1].map(i => {
              const panel = selectedPanels[i]
              return (
                <SlotPreview
                  key={i}
                  index={i}
                  panel={panel ?? null}
                  onRemove={panel ? () => togglePanelSelect(panel) : undefined}
                />
              )
            })}
          </div>
        </div>

        {/* ── Category tabs ───────────────────────────────────── */}
        {categories.length > 0 && (
          <div style={{
            display: 'flex', gap: 6,
            marginBottom: 14, overflowX: 'auto', paddingBottom: 2,
          }}>
            <CatTab label="Все" active={activeCat === null} onClick={() => setActiveCat(null)} />
            {categories.map(cat => (
              <CatTab
                key={cat.id}
                label={cat.name}
                active={activeCat === cat.id}
                onClick={() => setActiveCat(cat.id)}
              />
            ))}
          </div>
        )}

        {/* ── Panel grid ──────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: 10,
          maxHeight: 300,
          overflowY: 'auto',
          marginBottom: 18,
          paddingRight: 2,
        }}>
          {filtered.map(p => {
            const selected   = selectedPanels.some(s => s.id === p.id)
            const slotIndex  = selectedPanels.findIndex(s => s.id === p.id)
            const disabled   = maxed && !selected
            return (
              <PanelCard
                key={p.id}
                panel={p}
                selected={selected}
                slotIndex={slotIndex}
                disabled={disabled}
                onToggle={() => togglePanelSelect(p)}
              />
            )
          })}

          {filtered.length === 0 && (
            <p style={{
              gridColumn: '1 / -1', textAlign: 'center',
              padding: '32px 0',
              color: 'rgba(255,255,255,0.28)', fontSize: 'var(--text-sm)',
            }}>
              Нет доступных панелей
            </p>
          )}
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" size="md" style={{ flexShrink: 0 }}
            onClick={() => setStep('size')}>
            ← Назад
          </Button>
          <Button full size="lg" disabled={!canGo} onClick={handleApply}>
            {canGo
              ? `Применить ${selectedPanels.length === 2 ? '(2 панели — шахматный паттерн)' : '(1 панель)'}`
              : 'Выберите хотя бы одну панель'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ── Slot preview in header ─────────────────────────────── */
function SlotPreview({ index, panel, onRemove }: {
  index: number; panel: Panel | null; onRemove?: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 12px',
      background: panel ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
      border: panel
        ? '1px solid rgba(255,255,255,0.18)'
        : '1px dashed rgba(255,255,255,0.12)',
      borderRadius: 'var(--r-md)',
      minWidth: 110, maxWidth: 150,
      transition: 'all var(--dur-base) var(--ease)',
    }}>
      {panel ? (
        <>
          {/* Thumbnail */}
          <div style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            overflow: 'hidden', background: 'rgba(255,255,255,0.08)',
          }}>
            <img
              src={panel.thumb_url} alt={panel.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          {/* Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginBottom: 3,
            }}>
              {index + 1}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              {panel.name}
            </div>
          </div>
          {/* Remove */}
          <button
            onClick={onRemove}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 4px', flexShrink: 0,
              color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1,
              transition: 'color var(--dur-fast)',
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
          >✕</button>
        </>
      ) : (
        /* Empty slot */
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            border: '1.5px dashed rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'rgba(255,255,255,0.18)',
          }}>+</div>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.28)',
          }}>
            Панель {index + 1}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Category tab ────────────────────────────────────────── */
function CatTab({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        border: active
          ? '1.5px solid rgba(255,255,255,0.32)'
          : '1.5px solid rgba(255,255,255,0.09)',
        borderRadius: 'var(--r-full)',
        background: active ? 'rgba(255,255,255,0.11)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.44)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-semibold)',
        cursor: 'pointer',
        fontFamily: 'var(--font)',
        transition: 'all var(--dur-fast) var(--ease)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

/* ── Panel card ──────────────────────────────────────────── */
function PanelCard({ panel, selected, slotIndex, disabled, onToggle }: {
  panel: Panel; selected: boolean; slotIndex: number
  disabled: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        position: 'relative',
        background: selected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
        border: selected
          ? '2px solid rgba(255,255,255,0.78)'
          : '2px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--r-md)',
        padding: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.25 : 1,
        transition: 'all var(--dur-base) var(--ease)',
        display: 'flex', flexDirection: 'column', gap: 8,
        textAlign: 'left',
        fontFamily: 'var(--font)',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '1',
        borderRadius: 'var(--r-sm)', overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
      }}>
        <img
          src={panel.thumb_url} alt={panel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      {/* Name */}
      <span style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        color: selected ? '#fff' : 'rgba(255,255,255,0.58)',
        lineHeight: 1.3,
      }}>
        {panel.name}
      </span>

      {/* Price */}
      {panel.price != null && (
        <span style={{
          fontSize: 'var(--text-2xs)',
          color: 'rgba(255,255,255,0.30)',
          fontWeight: 'var(--weight-medium)',
        }}>
          {panel.price.toLocaleString('ru-RU')} ₽
        </span>
      )}

      {/* Slot number badge */}
      {selected && slotIndex >= 0 && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff', color: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, lineHeight: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.30)',
        }}>
          {slotIndex + 1}
        </div>
      )}

      {/* Category label */}
      {panel.category && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          padding: '2px 7px',
          background: 'rgba(0,0,0,0.52)',
          borderRadius: 'var(--r-full)',
          fontSize: 10, fontWeight: 600,
          color: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(4px)',
          display: selected ? 'none' : 'block',
        }}>
          {panel.category.name}
        </div>
      )}
    </button>
  )
}
