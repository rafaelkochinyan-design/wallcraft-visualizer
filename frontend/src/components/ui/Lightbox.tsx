import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400&display=swap');

  .lb-trigger { cursor: zoom-in; display: block; }

  .lb-backdrop {
    position: fixed; inset: 0;
    background: rgba(4, 4, 8, 0.96);
    z-index: 9998;
    display: flex; align-items: center; justify-content: center;
    animation: lbFadeIn 0.28s ease;
    backdrop-filter: blur(12px);
  }
  @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .lb-box {
    position: relative;
    max-width: min(90vw, 1100px); max-height: 90vh;
    display: flex; flex-direction: column; align-items: center;
    animation: lbSlideUp 0.32s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  @keyframes lbSlideUp {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .lb-img-wrap {
    position: relative;
    max-width: 100%; max-height: 80vh; overflow: hidden;
    border-radius: 3px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
  }
  .lb-img {
    display: block; max-width: 100%; max-height: 80vh;
    object-fit: contain;
    transition: opacity 0.22s ease;
  }
  .lb-img.loading { opacity: 0.3; }

  .lb-caption { margin-top: 16px; text-align: center; font-family: 'DM Sans', sans-serif; }
  .lb-caption-title {
    font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: #fff; margin: 0 0 4px;
  }
  .lb-caption-desc { font-size: 0.82rem; color: rgba(255,255,255,0.45); margin: 0; }

  .lb-nav {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 52px; height: 52px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06); color: #fff;
    font-size: 1.1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
    z-index: 9999; backdrop-filter: blur(4px);
  }
  .lb-nav:hover { border-color: #c9a96e; background: rgba(201,169,110,0.1); color: #c9a96e; }
  .lb-prev { left: 20px; }
  .lb-next { right: 20px; }

  .lb-close {
    position: fixed; top: 20px; right: 20px;
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7);
    font-size: 1.2rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; backdrop-filter: blur(4px);
    transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
  }
  .lb-close:hover { border-color: #c9a96e; color: #c9a96e; transform: rotate(90deg); }

  .lb-count {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    font-family: 'Syne', sans-serif; font-size: 0.75rem;
    letter-spacing: 0.14em; color: rgba(255,255,255,0.35); z-index: 9999;
  }

  .lb-thumbs {
    position: fixed; bottom: 48px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 8px; z-index: 9999;
    max-width: 80vw; overflow-x: auto;
    padding: 0 4px 4px; scrollbar-width: none;
  }
  .lb-thumbs::-webkit-scrollbar { display: none; }
  .lb-thumb {
    width: 48px; height: 36px; object-fit: cover; border-radius: 3px;
    border: 2px solid transparent; cursor: pointer;
    opacity: 0.45; transition: opacity 0.2s, border-color 0.2s; flex-shrink: 0;
  }
  .lb-thumb.active { opacity: 1; border-color: #c9a96e; }
`

export interface LightboxItem {
  src: string
  caption?: string
}

interface PortalProps {
  images: LightboxItem[]
  startIndex: number
  onClose: () => void
}

function LightboxPortal({ images, startIndex, onClose }: PortalProps) {
  const [idx, setIdx] = useState(startIndex)
  const [imgLoaded, setImgLoaded] = useState(false)

  const navigate = useCallback((dir: number) => {
    setImgLoaded(false)
    setIdx(prev => (prev + dir + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, onClose])

  const img = images[idx]

  return createPortal(
    <div className="lb-backdrop" onClick={onClose}>
      <style>{styles}</style>
      <div className="lb-box" onClick={e => e.stopPropagation()}>
        <div className="lb-img-wrap">
          <img
            src={img.src}
            alt={img.caption || ''}
            className={`lb-img${!imgLoaded ? ' loading' : ''}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
        {img.caption && (
          <div className="lb-caption">
            <p className="lb-caption-title">{img.caption}</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button className="lb-nav lb-prev" onClick={e => { e.stopPropagation(); navigate(-1) }}>←</button>
          <button className="lb-nav lb-next" onClick={e => { e.stopPropagation(); navigate(1) }}>→</button>
          <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
            {images.map((im, i) => (
              <img
                key={i} src={im.src} alt=""
                className={`lb-thumb${i === idx ? ' active' : ''}`}
                onClick={() => { setImgLoaded(false); setIdx(i) }}
              />
            ))}
          </div>
          <div className="lb-count">{idx + 1} / {images.length}</div>
        </>
      )}

      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>
    </div>,
    document.body
  )
}

interface Props {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onChange: (index: number) => void
}

export default function Lightbox({ items, index, onClose }: Props) {
  return <LightboxPortal images={items} startIndex={index} onClose={onClose} />
}
