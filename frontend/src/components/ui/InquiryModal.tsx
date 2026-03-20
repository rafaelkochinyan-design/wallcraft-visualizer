import { useState } from 'react'
import api from '../../lib/api'
import { useVisualizerStore } from '../../store/visualizer'

interface Props {
  onClose: () => void
}

export default function InquiryModal({ onClose }: Props) {
  const { wallWidth, wallHeight, selectedPanels } = useVisualizerStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const panelNames = selectedPanels.filter((p): p is NonNullable<typeof p> => p !== null).map((p) => p.name).join(', ')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/inquiry', {
        name,
        phone,
        email: email || undefined,
        message: message || undefined,
        wall_width: wallWidth,
        wall_height: wallHeight,
        panel_names: panelNames || undefined,
      })
      setSent(true)
    } catch {
      setError('Ошибка при отправке. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(18,18,18,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
          <h2 className="text-white text-sm font-semibold tracking-wide">
            Запрос консультации
          </h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-2xl mb-3">✓</div>
              <p className="text-white/80 text-sm font-medium mb-1">Заявка отправлена!</p>
              <p className="text-white/40 text-xs">Мы свяжемся с вами в ближайшее время.</p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/15 transition-colors"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Context info */}
              {(panelNames || wallWidth) && (
                <div
                  className="rounded-lg px-3 py-2 text-xs text-white/40"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {panelNames && <div>Панели: <span className="text-white/60">{panelNames}</span></div>}
                  {wallWidth && wallHeight && (
                    <div>Стена: <span className="text-white/60">{wallWidth}×{wallHeight} м</span></div>
                  )}
                </div>
              )}

              <input
                type="text"
                placeholder="Ваше имя *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
              />
              <input
                type="tel"
                placeholder="Телефон *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
              />
              <input
                type="email"
                placeholder="Email (необязательно)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
              />
              <textarea
                placeholder="Комментарий (необязательно)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors resize-none"
              />

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#111', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
