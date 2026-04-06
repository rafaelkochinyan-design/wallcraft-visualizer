/**
 * ShareButton — copies current URL to clipboard.
 * URL already has params set by useUrlState.
 */
import { useState } from 'react'
import { toast } from 'sonner'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Мой дизайн стены — Wallcraft',
          text: 'Посмотри какие панели я выбрал!',
          url,
        })
        return
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Ссылка скопирована!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      toast.success('Ссылка скопирована!')
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        padding: '0 12px',
        background: copied ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 8,
        color: copied ? 'var(--accent-green)' : 'rgba(255,255,255,0.65)',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <LinkIcon />
          <span>Поделиться</span>
        </>
      )}
    </button>
  )
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M5.5 7.5a3 3 0 004.243 0l1.5-1.5a3 3 0 00-4.243-4.243L6 2.757"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 5.5a3 3 0 00-4.243 0L1.757 7A3 3 0 006 11.243L7 10.243"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
