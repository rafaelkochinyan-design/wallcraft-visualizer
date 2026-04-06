const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .ph-root {
    --ph-bg: #0a0a0f;
    --ph-text: #ffffff;
    --ph-muted: rgba(255,255,255,0.5);
    --ph-accent: #c9a96e;
    font-family: 'DM Sans', sans-serif;
  }

  .ph-default {
    position: relative;
    background: var(--ph-bg);
    min-height: 380px;
    display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px; overflow: hidden;
  }
  .ph-default::after {
    content: ''; position: absolute;
    width: 680px; height: 680px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .ph-image {
    position: relative; min-height: 460px;
    display: flex; align-items: flex-end;
    padding: 64px 7%; overflow: hidden;
  }
  .ph-image-bg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
  }
  .ph-image-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.3) 60%, rgba(10,10,15,0.08) 100%);
  }

  .ph-split {
    display: grid; grid-template-columns: 1fr 1fr;
    min-height: 460px; background: var(--ph-bg); overflow: hidden;
  }
  .ph-split-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ph-split-body { display: flex; flex-direction: column; justify-content: center; padding: 64px 8%; }

  .ph-minimal {
    background: #f8f8f5; padding: 72px 7%; border-bottom: 1px solid #e0e0dc;
  }
  .ph-minimal .ph-label { color: #6b6b78; }
  .ph-minimal .ph-title { color: #0f0f12; }
  .ph-minimal .ph-subtitle { color: #6b6b78; }

  .ph-inner {
    position: relative; z-index: 2; max-width: 780px;
    animation: phAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .ph-inner.centered { margin: 0 auto; }

  @keyframes phAppear {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ph-label {
    display: inline-block;
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--ph-accent); margin-bottom: 18px;
  }
  .ph-label::before { content: '—'; margin-right: 8px; opacity: 0.6; }

  .ph-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 800; line-height: 1.06;
    color: var(--ph-text); margin: 0 0 18px; letter-spacing: -0.02em;
  }
  .ph-title em { font-style: italic; color: var(--ph-accent); font-weight: 700; }

  .ph-subtitle {
    font-size: clamp(0.95rem, 2vw, 1.1rem); font-weight: 300;
    color: var(--ph-muted); line-height: 1.75; margin: 0 0 32px; max-width: 540px;
  }

  .ph-ctas { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .ph-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ph-accent); color: #0a0a0f;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.82rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 14px 28px; border: none; cursor: pointer;
    text-decoration: none; border-radius: 2px;
    transition: background 0.2s, transform 0.18s;
  }
  .ph-btn-primary:hover { background: #fff; transform: translateY(-2px); }

  .ph-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.7);
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.82rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 13px 24px; border: 1px solid rgba(255,255,255,0.2);
    cursor: pointer; text-decoration: none; border-radius: 2px;
    transition: border-color 0.2s, color 0.2s;
  }
  .ph-btn-ghost:hover { border-color: rgba(255,255,255,0.6); color: #fff; }

  .ph-stats {
    display: flex; gap: 40px; margin-top: 32px;
    padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap;
  }
  .ph-stat-value {
    font-family: 'Syne', sans-serif; font-size: 1.9rem; font-weight: 800;
    color: var(--ph-text); line-height: 1;
  }
  .ph-stat-label { font-size: 0.78rem; color: var(--ph-muted); margin-top: 4px; letter-spacing: 0.06em; }

  @media (max-width: 768px) {
    .ph-split { grid-template-columns: 1fr; }
    .ph-split-img { height: 260px; }
  }
`

interface Cta {
  label: string
  href: string
}
interface Stat {
  value: string
  label: string
}

interface Props {
  variant?: 'default' | 'image' | 'split' | 'minimal'
  label?: string
  title: string
  titleHtml?: string
  subtitle?: string
  primaryCta?: Cta
  ghostCta?: Cta
  image?: string
  stats?: Stat[]
  centered?: boolean
  className?: string
}

export default function PageHero({
  variant = 'default',
  label,
  title,
  titleHtml,
  subtitle,
  primaryCta,
  ghostCta,
  image,
  stats,
  centered = false,
  className = '',
}: Props) {
  const inner = (
    <div className={`ph-inner${centered || variant === 'default' ? ' centered' : ''}`}>
      {label && <div className="ph-label">{label}</div>}

      {titleHtml ? (
        <h1 className="ph-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />
      ) : (
        <h1 className="ph-title">{title}</h1>
      )}

      {subtitle && <p className="ph-subtitle">{subtitle}</p>}

      {(primaryCta || ghostCta) && (
        <div className="ph-ctas">
          {primaryCta && (
            <a className="ph-btn-primary" href={primaryCta.href}>
              {primaryCta.label} <span>→</span>
            </a>
          )}
          {ghostCta && (
            <a className="ph-btn-ghost" href={ghostCta.href}>
              {ghostCta.label}
            </a>
          )}
        </div>
      )}

      {stats && (
        <div className="ph-stats">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="ph-stat-value">{s.value}</div>
              <div className="ph-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <style>{styles}</style>
      {variant === 'image' && (
        <section className={`ph-root ph-image ${className}`}>
          {image && <img className="ph-image-bg" src={image} alt="" />}
          <div className="ph-image-overlay" />
          {inner}
        </section>
      )}
      {variant === 'split' && (
        <section className={`ph-root ph-split ${className}`}>
          {image && <img className="ph-split-img" src={image} alt="" />}
          <div className="ph-split-body">{inner}</div>
        </section>
      )}
      {variant === 'minimal' && (
        <section className={`ph-root ph-minimal ${className}`}>{inner}</section>
      )}
      {variant === 'default' && (
        <section className={`ph-root ph-default ${className}`}>{inner}</section>
      )}
    </>
  )
}
