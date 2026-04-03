import { useRef } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  .fc-root {
    --fc-bg: #f6f6f4;
    --fc-bg-hover: #ededea;
    --fc-bg-active: #1a1a2e;
    --fc-text: #0f0f12;
    --fc-text-active: #c9a96e;
    --fc-border: #e0e0dc;
    --fc-border-active: #1a1a2e;
    font-family: 'DM Sans', sans-serif;
  }
  .fc-root.dark {
    --fc-bg: rgba(255,255,255,0.07);
    --fc-bg-hover: rgba(255,255,255,0.12);
    --fc-bg-active: #c9a96e;
    --fc-text: rgba(255,255,255,0.75);
    --fc-text-active: #0a0a0f;
    --fc-border: rgba(255,255,255,0.12);
    --fc-border-active: #c9a96e;
  }

  .fc-scroll-wrap { position: relative; overflow: hidden; }
  .fc-scroll-wrap::after {
    content: ''; position: absolute; right: 0; top: 0; bottom: 0;
    width: 48px;
    background: linear-gradient(to right, transparent, var(--fc-fade-end, #fff));
    pointer-events: none; z-index: 2;
  }

  .fc-list {
    display: flex; gap: 8px; flex-wrap: nowrap;
    overflow-x: auto; padding: 4px 2px 8px;
    scrollbar-width: none; scroll-behavior: smooth;
  }
  .fc-list::-webkit-scrollbar { display: none; }

  .fc-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 100px;
    border: 1.5px solid var(--fc-border);
    background: var(--fc-bg); color: var(--fc-text);
    font-size: 0.82rem; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s, box-shadow 0.18s;
    user-select: none; outline: none; flex-shrink: 0;
  }
  .fc-chip:hover:not(.fc-chip-active) {
    background: var(--fc-bg-hover); transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.06);
  }
  .fc-chip-active {
    background: var(--fc-bg-active) !important;
    border-color: var(--fc-border-active) !important;
    color: var(--fc-text-active) !important;
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(0,0,0,0.12);
  }
`

export interface FilterOption {
  key: string
  label: string
  count?: number
  icon?: string
}

interface Props {
  options: FilterOption[]
  value: string
  onChange: (key: string) => void
  dark?: boolean
  className?: string
}

export default function FilterChips({ options, value, onChange, dark = false, className = '' }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <style>{styles}</style>
      <div className={`fc-root${dark ? ' dark' : ''} ${className}`}>
        <div className="fc-scroll-wrap" style={{ '--fc-fade-end': dark ? '#0a0a0f' : '#fff' } as React.CSSProperties}>
          <div ref={listRef} className="fc-list">
            {options.map(opt => (
              <button
                key={opt.key}
                className={`fc-chip${value === opt.key ? ' fc-chip-active' : ''}`}
                onClick={() => onChange(opt.key)}
                aria-pressed={value === opt.key}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
                {opt.count != null && (
                  <span style={{ opacity: 0.55, fontSize: '0.72rem' }}>({opt.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
