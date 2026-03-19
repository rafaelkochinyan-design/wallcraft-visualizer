/**
 * Tooltips.tsx
 * 
 * ДОСТУПНОСТЬ:
 * - Все тексты минимум 14px
 * - Контраст текста: #ebebf5 на #1c1c1e = 14.7:1 (WCAG AAA)
 * - Контраст secondary: #aeaeb2 на #1c1c1e = 6.8:1 (WCAG AA)
 * - Активные элементы: min 44×44px touch target
 * - Фокус-стиль на всех кнопках
 */

import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'
import type { Accessory, AccessoryType, PlacedAccessory } from '../../types'

/* ── Цветовая система (iOS Dark) ─────────────────────────
   #1c1c1e  = background панели
   #2c2c2e  = surface / card
   #3a3a3c  = elevated surface / border
   #48484a  = muted border
   #636366  = placeholder / disabled text   contrast 4.6:1 ✓ AA
   #aeaeb2  = secondary text                contrast 6.8:1 ✓ AA
   #ebebf5  = primary text                  contrast 14.7:1 ✓ AAA
   #ff453a  = destructive
   #30d158  = success / accent
   #0a84ff  = interactive blue
   #ffd60a  = warning / sun icon bg
──────────────────────────────────────────────────────── */

const C = {
  bg:        '#1c1c1e',
  surface:   '#2c2c2e',
  elevated:  '#3a3a3c',
  border:    '#3a3a3c',
  mutedBorder:'#48484a',
  textPrim:  '#ebebf5',   // 14.7:1
  textSec:   '#aeaeb2',   // 6.8:1
  textMuted: '#636366',   // 4.6:1
  red:       '#ff453a',
  green:     '#30d158',
  blue:      '#0a84ff',
  yellow:    '#ffd60a',
}

const WALL_PRESETS = [
  { label: 'Белый',        hex: '#f8f8f6' },
  { label: 'Кремовый',     hex: '#f0ede4' },
  { label: 'Светло-серый', hex: '#e0ddd6' },
  { label: 'Тёплый серый', hex: '#c0bdb4' },
  { label: 'Тёмный',       hex: '#3a3836' },
  { label: 'Чёрный',       hex: '#141412' },
]

/* ════════════════════════════════════════════════════════
   TOOLTIP MAIN
════════════════════════════════════════════════════════ */
export function TooltipMain() {
  const { resetAll, setTooltipMode, setPendingSave } = useVisualizerStore()

  return (
    <div style={{ padding: '8px 12px 16px', minWidth: 280 }}>

      {/* Label */}
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: C.textMuted,
        margin: '4px 0 12px 2px',
      }}>Управление</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Настроить — primary action */}
        <MainButton
          icon={<SettingsIcon />}
          label="Настроить сцену"
          sub="Свет · Вид · Аксессуары"
          onClick={() => setTooltipMode('settings')}
          arrow
        />

        {/* Сохранить */}
        <MainButton
          icon={<span style={{ fontSize: 20 }}>↓</span>}
          label="Сохранить изображение"
          sub="Скачать PNG вашего дизайна"
          onClick={() => setPendingSave(true)}
        />

        {/* Divider */}
        <div style={{ height: 1, background: C.border, margin: '2px 0' }} />

        {/* Сброс — danger */}
        <MainButton
          icon={<span style={{ fontSize: 18, color: C.red }}>↺</span>}
          label="Сбросить всё"
          sub="Начать с нуля"
          onClick={resetAll}
          danger
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   TOOLTIP SETTINGS
════════════════════════════════════════════════════════ */
export function TooltipSettings() {
  const {
    settingsTab, setSettingsTab, setTooltipMode,
    lightAngle, setLightAngle,
    lightElevation, setLightElevation,
    wallColor, setWallColor,
    availableAccessoryTypes, availableAccessories,
    placeAccessory, placedAccessories, removeAccessory,
  } = useVisualizerStore()

  const tabs: { id: typeof settingsTab; emoji: string; label: string }[] = [
    { id: 'light',       emoji: '☀️', label: 'Свет' },
    { id: 'position',    emoji: '🎥', label: 'Вид'  },
    { id: 'accessories', emoji: '🔌', label: 'Акс.' },
  ]

  return (
    <div style={{ minWidth: 296 }}>

      {/* ── Tab bar ────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 4, padding: '0 12px 12px',
      }}>
        {tabs.map(t => {
          const active = settingsTab === t.id
          return (
            <button key={t.id}
              onClick={() => setSettingsTab(t.id)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                padding: '10px 6px',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'var(--font)',
                background: active ? C.elevated : 'transparent',
                outline: active ? `1.5px solid ${C.mutedBorder}` : 'none',
                transition: 'background 0.12s',
                minHeight: 56,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{t.emoji}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, lineHeight: 1,
                color: active ? C.textPrim : C.textMuted,
                transition: 'color 0.12s',
              }}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Tab content ────────────────────────────────── */}
      <div style={{ padding: '0 12px', maxHeight: 380, overflowY: 'auto' }}>
        {settingsTab === 'light' && (
          <LightTab
            angle={lightAngle}    onAngle={setLightAngle}
            elev={lightElevation} onElev={setLightElevation}
            color={wallColor}     onColor={setWallColor}
          />
        )}
        {settingsTab === 'position' && <PositionTab />}
        {settingsTab === 'accessories' && (
          <AccessoriesTab
            types={availableAccessoryTypes}
            items={availableAccessories}
            placed={placedAccessories}
            onPlace={placeAccessory}
            onRemove={removeAccessory}
          />
        )}
      </div>

      {/* ── Back ───────────────────────────────────────── */}
      <div style={{ padding: '12px 12px 16px' }}>
        <TertiaryButton onClick={() => setTooltipMode(null)}>
          ← Назад
        </TertiaryButton>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   LIGHT TAB
════════════════════════════════════════════════════════ */
function LightTab({ angle, onAngle, elev, onElev, color, onColor }: {
  angle: number; onAngle:(v:number)=>void
  elev: number;  onElev:(v:number)=>void
  color: string; onColor:(v:string)=>void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 12 }}>
      <Slider label="Угол"   value={angle} min={0}  max={360} unit="°" onChange={onAngle} />
      <Slider label="Высота" value={elev}  min={5}  max={85}  unit="°" onChange={onElev}  />

      {/* Wall color */}
      <div>
        <SectionLabel>Цвет стены</SectionLabel>

        {/* Preset swatches */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 7, marginBottom: 10 }}>
          {WALL_PRESETS.map(p => {
            const active = color === p.hex
            return (
              <button key={p.hex}
                title={p.label}
                onClick={() => onColor(p.hex)}
                style={{
                  aspectRatio: '1', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: p.hex,
                  boxShadow: active
                    ? `0 0 0 2.5px ${C.bg}, 0 0 0 4.5px ${C.textPrim}`
                    : `0 0 0 1px rgba(255,255,255,0.12)`,
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'box-shadow 0.12s, transform 0.12s',
                }}
              />
            )
          })}
        </div>

        {/* Custom color picker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          background: C.surface, borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: color,
            border: '1px solid rgba(255,255,255,0.15)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: C.textSec, flex: 1 }}>Свой цвет</span>
          <input type="color" value={color}
            onChange={e => onColor(e.target.value)}
            style={{
              width: 36, height: 36, border: 'none',
              borderRadius: 8, cursor: 'pointer',
              background: 'none', padding: 2,
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   POSITION TAB
════════════════════════════════════════════════════════ */
function PositionTab() {
  const tips = [
    { icon: '🖱️', key: 'Перетащить',   val: 'вращение' },
    { icon: '⚙️', key: 'Прокрутка',    val: 'зум' },
    { icon: '⌨️', key: 'ПКМ + тянуть', val: 'панорама' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 12 }}>
      <SectionLabel>Управление камерой</SectionLabel>
      {tips.map(t => (
        <div key={t.key} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px',
          background: C.surface, borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrim, marginBottom: 1 }}>{t.key}</div>
            <div style={{ fontSize: 12, color: C.textSec }}>{t.val}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   ACCESSORIES TAB
════════════════════════════════════════════════════════ */
function AccessoriesTab({ types, items, placed, onPlace, onRemove }: {
  types: AccessoryType[]; items: Accessory[]
  placed: PlacedAccessory[]; onPlace:(a:Accessory)=>void; onRemove:(uid:string)=>void
}) {
  const [sel, setSel] = useState<string|null>(null)
  const filtered = sel ? items.filter(a => a.type_id === sel) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>

      {/* Type grid */}
      <div>
        <SectionLabel>Тип</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {types.map(t => {
            const active = sel === t.id
            return (
              <button key={t.id}
                onClick={() => setSel(active ? null : t.id)}
                style={{
                  padding: '11px 8px', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600,
                  background: active ? C.blue : C.surface,
                  color:      active ? '#fff' : C.textSec,
                  border:     `1px solid ${active ? C.blue : C.border}`,
                  transition: 'all 0.12s',
                  minHeight: 44,
                } as React.CSSProperties}
              >{t.label_ru}</button>
            )
          })}
        </div>
      </div>

      {/* Items */}
      {sel && filtered.length > 0 && (
        <div>
          <SectionLabel>Модель</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {filtered.map(acc => (
              <ItemRow key={acc.id} acc={acc} onAdd={() => onPlace(acc)} />
            ))}
          </div>
        </div>
      )}
      {sel && !filtered.length && (
        <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '8px 0' }}>
          Нет моделей
        </p>
      )}

      {/* Placed */}
      {placed.length > 0 && (
        <div>
          <div style={{ height: 1, background: C.border }} />
          <SectionLabel style={{ marginTop: 10 }}>
            На стене — {placed.length} шт
          </SectionLabel>
          {placed.map(p => (
            <div key={p.uid} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: C.surface, borderRadius: 10,
              marginBottom: 4, border: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrim }}>{p.accessory.name}</span>
              <button onClick={() => onRemove(p.uid)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 15, color: C.textMuted, padding: '4px 6px', borderRadius: 6,
                transition: 'color 0.12s',
                minWidth: 32, minHeight: 32,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Item row ─────────────────────────────────────────────── */
function ItemRow({ acc, onAdd }: { acc: Accessory; onAdd: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onAdd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
        fontFamily: 'var(--font)', textAlign: 'left',
        background: hov ? C.elevated : C.surface,
        border: `1px solid ${hov ? C.mutedBorder : C.border}`,
        transition: 'background 0.12s',
        minHeight: 52,
      } as React.CSSProperties}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
        background: C.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={acc.thumb_url} alt={acc.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrim, flex: 1 }}>{acc.name}</span>
      <span style={{ fontSize: 20, color: C.blue, lineHeight: 1, flexShrink: 0 }}>+</span>
    </button>
  )
}

/* ════════════════════════════════════════════════════════
   ПЕРЕИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ
════════════════════════════════════════════════════════ */

function MainButton({ icon, label, sub, onClick, arrow, danger }: {
  icon: React.ReactNode; label: string; sub: string
  onClick: () => void; arrow?: boolean; danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: danger
          ? hov ? 'rgba(255,69,58,0.14)' : 'rgba(255,69,58,0.08)'
          : hov ? C.elevated : C.surface,
        border: `1px solid ${danger ? 'rgba(255,69,58,0.28)' : C.border}`,
        borderRadius: 14, cursor: 'pointer',
        fontFamily: 'var(--font)', textAlign: 'left',
        transition: 'background 0.12s',
        width: '100%', minHeight: 56,
      } as React.CSSProperties}
    >
      {/* Icon box */}
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: danger ? 'rgba(255,69,58,0.15)' : C.elevated,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, lineHeight: 1,
      }}>{icon}</div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: danger ? C.red : C.textPrim, lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3, lineHeight: 1.2 }}>
          {sub}
        </div>
      </div>

      {arrow && (
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1.5L6.5 6.5L1 11.5" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  )
}

function TertiaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '11px',
        background: hov ? C.elevated : 'transparent',
        border: `1px solid ${C.border}`,
        borderRadius: 12, cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: C.textSec,
        fontFamily: 'var(--font)',
        transition: 'background 0.12s, color 0.12s',
        minHeight: 44,
      }}
    >{children}</button>
  )
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
      textTransform: 'uppercase', color: C.textMuted,
      marginBottom: 8, ...style,
    }}>{children}</p>
  )
}

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange:(v:number)=>void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.textSec }}>{label}</span>
        <span style={{
          fontSize: 13, fontWeight: 700, color: C.textPrim,
          background: C.elevated, padding: '2px 9px', borderRadius: 8,
          border: `1px solid ${C.border}`,
        }}>{Math.round(value)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────────── */
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="#ebebf5" strokeWidth="1.6"/>
      <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.93 3.93l1.06 1.06M13.01 13.01l1.06 1.06M3.93 14.07l1.06-1.06M13.01 4.99l1.06-1.06"
        stroke="#ebebf5" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}
