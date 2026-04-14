import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalized } from '../../hooks/useLocalized'
import { HeroSlide } from '../../types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .hero-carousel {
    --hc-bg: #0a0a0f;
    --hc-accent: #c9a96e;
    --hc-text: #ffffff;
    --hc-muted: rgba(255,255,255,0.45);
    --hc-overlay: rgba(10,10,15,0.55);
    --hc-transition: 0.72s cubic-bezier(0.77, 0, 0.175, 1);
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 560px;
    overflow: hidden;
    background: var(--hc-bg);
    font-family: 'DM Sans', sans-serif;
    user-select: none;
  }

  .hc-slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(1.06);
    transition: opacity var(--hc-transition), transform var(--hc-transition);
    pointer-events: none;
  }
  .hc-slide.active { opacity: 1; transform: scale(1); pointer-events: auto; }
  .hc-slide.prev   { opacity: 0; transform: scale(0.96); }

  .hc-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
  }

  .hc-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(120deg, rgba(10,10,15,0.82) 0%, rgba(10,10,15,0.38) 55%, rgba(10,10,15,0.15) 100%);
  }

  .hc-content {
    position: absolute;
    bottom: 10%; left: 6%;
    max-width: 600px; z-index: 2;
  }

  .hc-tag {
    display: inline-block;
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--hc-accent);
    border: 1px solid var(--hc-accent);
    padding: 4px 12px; border-radius: 2px; margin-bottom: 20px;
    opacity: 0; transform: translateY(18px);
    transition: opacity 0.5s 0.1s ease, transform 0.5s 0.1s ease;
  }
  .hc-slide.active .hc-tag { opacity: 1; transform: translateY(0); }

  .hc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    font-weight: 800; line-height: 1.05;
    color: var(--hc-text); margin: 0 0 16px;
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.55s 0.22s ease, transform 0.55s 0.22s ease;
  }
  .hc-slide.active .hc-title { opacity: 1; transform: translateY(0); }

  .hc-desc {
    font-size: 1rem; font-weight: 300;
    color: var(--hc-muted); line-height: 1.7; margin: 0 0 32px;
    opacity: 0; transform: translateY(22px);
    transition: opacity 0.5s 0.34s ease, transform 0.5s 0.34s ease;
  }
  .hc-slide.active .hc-desc { opacity: 1; transform: translateY(0); }

  .hc-ctas {
    display: flex; gap: 14px; flex-wrap: wrap;
    opacity: 0; transform: translateY(18px);
    transition: opacity 0.5s 0.44s ease, transform 0.5s 0.44s ease;
  }
  .hc-slide.active .hc-ctas { opacity: 1; transform: translateY(0); }

  .hc-cta {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--hc-accent); color: #0a0a0f;
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 0.85rem; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 14px 28px; border: none; cursor: pointer;
    text-decoration: none; border-radius: 2px;
    transition: background 0.2s, transform 0.18s;
  }
  .hc-cta:hover { background: #fff; transform: translateY(-2px); }

  .hc-cta-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    background: transparent; color: rgba(255,255,255,0.75);
    font-family: 'Syne', sans-serif; font-weight: 600;
    font-size: 0.85rem; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 13px 24px; border: 1px solid rgba(255,255,255,0.25);
    cursor: pointer; text-decoration: none; border-radius: 2px;
    transition: border-color 0.2s, color 0.2s;
  }
  .hc-cta-ghost:hover { border-color: rgba(255,255,255,0.7); color: #fff; }

  .hc-cta--gold {
    background: var(--accent-gold);
    color: #1a1025;
    font-weight: 700;
  }
  .hc-cta--gold:hover { background: var(--accent-gold-dark); color: #fff; }

  .hc-progress {
    position: absolute; bottom: 0; left: 0;
    height: 3px; background: var(--hc-accent);
    transform-origin: left; z-index: 10; transition: none;
  }
  .hc-progress.animating { transition: width linear; }

  .hc-controls {
    position: absolute; right: 5%; top: 50%;
    transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 12px; z-index: 10;
  }
  .hc-btn {
    width: 48px; height: 48px;
    border: 1px solid rgba(255,255,255,0.22);
    background: rgba(10,10,15,0.45); color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
    transition: border-color 0.2s, background 0.2s, color 0.2s;
  }
  .hc-btn:hover { border-color: var(--hc-accent); background: rgba(201,169,110,0.12); color: var(--hc-accent); }

  .hc-dots {
    position: absolute; bottom: 32px; right: 5%;
    display: flex; gap: 8px; z-index: 10;
  }
  .hc-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.3); border: none; cursor: pointer;
    transition: background 0.25s, transform 0.25s;
  }
  .hc-dot.active { background: var(--hc-accent); transform: scale(1.4); }

  .hc-counter {
    position: absolute; top: 32px; right: 5%;
    font-family: 'Syne', sans-serif; font-size: 0.78rem;
    color: var(--hc-muted); letter-spacing: 0.12em; z-index: 10;
  }
  .hc-counter span { color: var(--hc-text); font-weight: 700; }
`

interface Slide {
  image_url: string
  tag?: string
  title: string
  desc?: string
  ctaLabel?: string
  ctaUrl?: string
}

interface Props {
  slides: HeroSlide[]
  fallback?: { title: string; subtitle?: string; eyebrow?: string }
}

export default function HeroCarousel({ slides, fallback }: Props) {
  const { t } = useTranslation()
  const localized = useLocalized()

  const [current, setCurrent] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [progressWidth, setProgressWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Normalize HeroSlide → internal Slide shape
  const normalized: Slide[] =
    slides.length > 0
      ? slides.map((s) => ({
          image_url: s.image_url,
          title: localized(s.headline),
          desc: s.subheadline ? localized(s.subheadline) : undefined,
          ctaLabel: s.cta_label ? localized(s.cta_label) : undefined,
          ctaUrl: s.cta_url || '/products',
        }))
      : fallback
        ? [
            {
              image_url: '',
              title: fallback.title,
              desc: fallback.subtitle,
              tag: fallback.eyebrow,
              ctaLabel: t('home.hero_cta'),
              ctaUrl: '/products',
            },
          ]
        : []

  const goTo = useCallback(
    (idx: number) => {
      setPrevIdx(current)
      setCurrent(idx)
      setProgressWidth(0)
      setTimeout(() => setProgressWidth(100), 30)
    },
    [current]
  )

  const next = useCallback(
    () => goTo((current + 1) % normalized.length),
    [current, goTo, normalized.length]
  )
  const prev = useCallback(
    () => goTo((current - 1 + normalized.length) % normalized.length),
    [current, goTo, normalized.length]
  )

  useEffect(() => {
    if (normalized.length < 2) return
    setProgressWidth(0)
    setTimeout(() => setProgressWidth(100), 30)
    timerRef.current = setTimeout(next, 5500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, next, normalized.length])

  if (normalized.length === 0) return null

  return (
    <>
      <style>{styles}</style>
      <div className="hero-carousel">
        {normalized.map((slide, i) => (
          <div
            key={i}
            className={`hc-slide${i === current ? ' active' : ''}${i === prevIdx ? ' prev' : ''}`}
          >
            {slide.image_url && <img className="hc-img" src={slide.image_url} alt={slide.title} />}
            <div className="hc-overlay" />
            <div className="hc-content">
              {slide.tag && <div className="hc-tag">{slide.tag}</div>}
              <h1 className="hc-title" style={{ whiteSpace: 'pre-line' }}>
                {slide.title}
              </h1>
              {slide.desc && <p className="hc-desc">{slide.desc}</p>}
              <div className="hc-ctas">
                <Link className="hc-cta hc-cta--gold" to={slide.ctaUrl || '/products'}>
                  {slide.ctaLabel || t('home.hero_cta')} <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {normalized.length > 1 && (
          <>
            <div
              className={`hc-progress${progressWidth > 0 ? ' animating' : ''}`}
              style={{
                width: `${progressWidth}%`,
                transitionDuration: progressWidth === 100 ? '5500ms' : '0ms',
              }}
            />
            <div className="hc-controls">
              <button className="hc-btn" onClick={prev} aria-label="Previous slide">
                ↑
              </button>
              <button className="hc-btn" onClick={next} aria-label="Next slide">
                ↓
              </button>
            </div>
            <div className="hc-dots">
              {normalized.map((_, i) => (
                <button
                  key={i}
                  className={`hc-dot${i === current ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <div className="hc-counter">
              <span>{String(current + 1).padStart(2, '0')}</span> /{' '}
              {String(normalized.length).padStart(2, '0')}
            </div>
          </>
        )}
      </div>
    </>
  )
}
