import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Settings {
  id: string
  slug: string
  name: string
  logo_url: string | null
  primary_color: string
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState({ name: '', primary_color: '#1a1a1a', logo_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/settings').then((res) => {
      const data = res.data.data as Settings
      setSettings(data)
      setForm({ name: data.name, primary_color: data.primary_color, logo_url: data.logo_url ?? '' })
      setLoading(false)
    })
  }, [])

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/admin/settings/upload-logo', fd)
      setForm((f) => ({ ...f, logo_url: res.data.data.url }))
    } catch {
      setToast('Ошибка загрузки логотипа')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.put('/admin/settings', {
        name: form.name,
        primary_color: form.primary_color,
        logo_url: form.logo_url || null,
      })
      setToast('Настройки сохранены')
      setTimeout(() => setToast(null), 3000)
    } catch {
      setToast('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Настройки магазина</h2>

      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
        {/* Store name */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Название магазина</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Primary color */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Основной цвет</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
            />
            <input
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none"
              placeholder="#1a1a1a"
            />
            <div
              className="w-10 h-10 rounded-lg border border-gray-200"
              style={{ backgroundColor: form.primary_color }}
            />
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Логотип</label>
          <div className="flex items-center gap-4">
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="Logo"
                className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg p-1 border border-gray-100"
              />
            ) : (
              <div className="w-20 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 text-xs">
                Нет лого
              </div>
            )}
            <label className={`px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
              cursor-pointer hover:bg-gray-50 transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingLogo ? 'Загрузка...' : 'Выбрать файл'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }}
              />
            </label>
            {form.logo_url && (
              <button
                onClick={() => setForm({ ...form, logo_url: '' })}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                Удалить
              </button>
            )}
          </div>
        </div>

        {/* Slug info */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500">
          Slug магазина: <span className="font-mono text-gray-700">{settings?.slug}</span>
          <br />
          Визуализатор: <span className="font-mono text-gray-700">{settings?.slug}.yourdomain.com</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium
            hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg bg-gray-900 text-white text-sm">
          {toast}
        </div>
      )}
    </div>
  )
}
