import { useMemo } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  .pag-root {
    --pag-bg: #ffffff;
    --pag-bg-hover: #f4f4f1;
    --pag-bg-active: #7c3aed;
    --pag-text: #0f0f12;
    --pag-text-muted: #9999a6;
    --pag-text-active: #ffffff;
    --pag-border: #e0e0dc;
    --pag-border-active: #7c3aed;
    --pag-radius: 6px;
    font-family: 'DM Sans', sans-serif;
  }

  .pag-wrap {
    display: flex; align-items: center; gap: 6px;
    flex-wrap: wrap; justify-content: center;
    margin-top: 40px;
  }

  .pag-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 40px; height: 40px; padding: 0 6px;
    border-radius: var(--pag-radius);
    border: 1.5px solid var(--pag-border);
    background: var(--pag-bg); color: var(--pag-text);
    font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 600;
    cursor: pointer;
    transition: background 0.16s, border-color 0.16s, color 0.16s, transform 0.14s, box-shadow 0.16s;
    user-select: none; outline: none; text-decoration: none;
  }
  .pag-btn:hover:not(:disabled):not(.pag-active) {
    background: var(--pag-bg-hover); transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  }
  .pag-btn:disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
  .pag-active {
    background: var(--pag-bg-active) !important;
    border-color: var(--pag-border-active) !important;
    color: var(--pag-text-active) !important;
    box-shadow: 0 3px 12px rgba(26,26,46,0.18);
  }

  .pag-ellipsis {
    display: inline-flex; align-items: flex-end; justify-content: center;
    width: 32px; height: 40px; color: var(--pag-text-muted);
    font-size: 1.1rem; letter-spacing: 0.05em;
    user-select: none; cursor: default;
  }
`

function buildPages(current: number, total: number, siblings = 1): (number | '...')[] {
  const totalShown = siblings * 2 + 5
  if (total <= totalShown) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(current - siblings, 1)
  const right = Math.min(current + siblings, total)
  const showLeft = left > 2
  const showRight = right < total - 1
  if (!showLeft && showRight)
    return [...Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1), '...', total]
  if (showLeft && !showRight)
    return [
      1,
      '...',
      ...Array.from({ length: 3 + siblings * 2 }, (_, i) => total - 2 - siblings * 2 + i),
    ]
  return [1, '...', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), '...', total]
}

interface Props {
  page: number
  pages: number
  onChange: (page: number) => void
  siblings?: number
}

export default function Pagination({ page, pages, onChange, siblings = 1 }: Props) {
  const pageList = useMemo(() => buildPages(page, pages, siblings), [page, pages, siblings])

  if (pages <= 1) return null

  return (
    <>
      <style>{styles}</style>
      <div className="pag-root">
        <div className="pag-wrap">
          <button className="pag-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>
            ←
          </button>
          {pageList.map((p, i) =>
            p === '...' ? (
              <span key={`ell-${i}`} className="pag-ellipsis">
                ···
              </span>
            ) : (
              <button
                key={p}
                className={`pag-btn${page === p ? ' pag-active' : ''}`}
                onClick={() => onChange(p as number)}
                aria-current={page === p ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
          <button className="pag-btn" disabled={page === pages} onClick={() => onChange(page + 1)}>
            →
          </button>
        </div>
      </div>
    </>
  )
}
