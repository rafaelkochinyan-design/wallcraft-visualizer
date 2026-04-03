const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;1,400&display=swap');

  .st-root {
    --st-text: #0f0f12;
    --st-muted: #6b6b78;
    --st-accent: #c9a96e;
    --st-line: #e0e0dc;
    font-family: 'DM Sans', sans-serif;
  }
  .st-root.dark {
    --st-text: #ffffff;
    --st-muted: rgba(255,255,255,0.45);
    --st-accent: #c9a96e;
    --st-line: rgba(255,255,255,0.12);
  }

  .st-center { text-align: center; }
  .st-left   { text-align: left; }
  .st-right  { text-align: right; }

  .st-overline {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 0.24em; text-transform: uppercase;
    color: var(--st-accent); margin-bottom: 14px;
  }
  .st-overline::before, .st-overline::after {
    content: ''; display: block; height: 1px; width: 28px;
    background: currentColor; opacity: 0.5;
  }
  .st-left .st-overline::before  { display: none; }
  .st-right .st-overline::after  { display: none; }

  .st-heading {
    font-family: 'Syne', sans-serif; font-weight: 800;
    line-height: 1.08; letter-spacing: -0.02em;
    color: var(--st-text); margin: 0;
  }
  .st-heading em { font-style: italic; font-weight: 700; opacity: 0.55; }

  .st-xs .st-heading { font-size: clamp(1.1rem, 2vw, 1.35rem); }
  .st-sm .st-heading { font-size: clamp(1.4rem, 2.5vw, 1.75rem); }
  .st-md .st-heading { font-size: clamp(1.8rem, 3.5vw, 2.5rem); }
  .st-lg .st-heading { font-size: clamp(2.2rem, 4.5vw, 3.4rem); }
  .st-xl .st-heading { font-size: clamp(2.8rem, 6vw, 4.5rem); }

  .st-body {
    font-size: 1rem; font-weight: 300; color: var(--st-muted);
    line-height: 1.75; margin: 14px 0 0; max-width: 520px;
  }
  .st-center .st-body { margin-left: auto; margin-right: auto; }

  .st-rule-none   .st-hr { display: none; }
  .st-rule-accent .st-hr {
    border: none; height: 3px; width: 48px;
    background: var(--st-accent); border-radius: 2px; margin: 14px 0 0;
  }
  .st-rule-full   .st-hr {
    border: none; height: 1px; background: var(--st-line); margin: 18px 0 0;
  }
  .st-center.st-rule-accent .st-hr { margin: 14px auto 0; }

  .st-action-wrap {
    margin-top: 22px; display: flex; align-items: center; gap: 8px;
  }
  .st-center .st-action-wrap { justify-content: center; }
  .st-right  .st-action-wrap { justify-content: flex-end; }
  .st-action-link {
    font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--st-accent); text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: gap 0.18s;
  }
  .st-action-link:hover { gap: 10px; }
  .st-action-rule { flex: 1; height: 1px; background: var(--st-line); min-width: 32px; max-width: 120px; }
  .st-center .st-action-rule { display: none; }
`

interface Props {
  overline?: string
  title?: string
  titleHtml?: string
  subtitle?: string
  action?: { label: string; href: string }
  align?: 'left' | 'center' | 'right'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rule?: 'none' | 'accent' | 'full'
  dark?: boolean
  className?: string
}

export default function SectionTitle({
  overline,
  title,
  titleHtml,
  subtitle,
  action,
  align = 'left',
  size = 'md',
  rule = 'accent',
  dark = false,
  className = '',
}: Props) {
  return (
    <>
      <style>{styles}</style>
      <div className={['st-root', `st-${align}`, `st-${size}`, `st-rule-${rule}`, dark ? 'dark' : '', className].filter(Boolean).join(' ')}>
        {overline && <div className="st-overline">{overline}</div>}

        {titleHtml
          ? <h2 className="st-heading" dangerouslySetInnerHTML={{ __html: titleHtml }} />
          : <h2 className="st-heading">{title}</h2>
        }

        <hr className="st-hr" />

        {subtitle && <p className="st-body">{subtitle}</p>}

        {action && (
          <div className="st-action-wrap">
            <span className="st-action-rule" />
            <a className="st-action-link" href={action.href}>{action.label} <span>→</span></a>
          </div>
        )}
      </div>
    </>
  )
}
