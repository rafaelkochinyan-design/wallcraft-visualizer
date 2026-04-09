import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useVisualizerStore } from '../../store/visualizer'

interface Settings {
  id: string
  slug: string
  name: string
  logo_url: string | null
  primary_color: string
  phone: string | null
  email: string | null
  address: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  pinterest_url: string | null
  whatsapp: string | null
}

export default function StoreSettingsPage() {
  const { fetchTenant } = useVisualizerStore()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState({
    name: '',
    primary_color: '#1a1a1a',
    logo_url: '',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    pinterest_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then((res) => {
      const data = res.data.data as Settings
      setSettings(data)
      setForm({
        name: data.name,
        primary_color: data.primary_color,
        logo_url: data.logo_url ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        whatsapp: data.whatsapp ?? '',
        instagram_url: data.instagram_url ?? '',
        facebook_url: data.facebook_url ?? '',
        tiktok_url: data.tiktok_url ?? '',
        pinterest_url: data.pinterest_url ?? '',
      })
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
      toast.error('Logo upload failed')
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
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        whatsapp: form.whatsapp || null,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
        tiktok_url: form.tiktok_url || null,
        pinterest_url: form.pinterest_url || null,
      })
      toast.success('Settings saved')
      await fetchTenant()
    } catch {
      toast.error('Save failed')
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

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string; helper?: string }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={opts?.type ?? 'text'}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        placeholder={opts?.placeholder}
      />
      {opts?.helper && <p className="text-xs text-gray-400 mt-1">{opts.helper}</p>}
    </div>
  )

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Store Settings</h2>

      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
        {/* Store name */}
        {field('Store name', 'name')}

        {/* Primary color */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Primary color</label>
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
          <label className="block text-xs text-gray-500 mb-2">Logo</label>
          <div className="flex items-center gap-4">
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="Logo"
                className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg p-1 border border-gray-100"
              />
            ) : (
              <div className="w-20 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 text-xs">
                No logo
              </div>
            )}
            <label
              className={`px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
              cursor-pointer hover:bg-gray-50 transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploadingLogo ? 'Uploading...' : 'Choose file'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) uploadLogo(e.target.files[0])
                }}
              />
            </label>
            {form.logo_url && (
              <button
                onClick={() => setForm({ ...form, logo_url: '' })}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Contact information */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-3">Contact information</p>
          <div className="flex flex-col gap-4">
            {field('Phone', 'phone', { placeholder: '+374 93 97 97 70' })}
            {field('Email', 'email', { type: 'email', placeholder: 'info@wallcraft.am' })}
            {field('Address', 'address', { placeholder: 'Yerevan, Armenia' })}
            {field('WhatsApp number', 'whatsapp', {
              placeholder: '+374 93 97 97 70',
              helper: 'Used for WhatsApp button — numbers only',
            })}
          </div>
        </div>

        {/* Social media links */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-3">Social media links</p>
          <div className="flex flex-col gap-4">
            {field('Instagram URL', 'instagram_url', { placeholder: 'https://instagram.com/wallcraft.am' })}
            {field('Facebook URL', 'facebook_url', { placeholder: 'https://facebook.com/wallcraft.am' })}
            {field('TikTok URL', 'tiktok_url', { placeholder: 'https://tiktok.com/@wallcraft.am' })}
            {field('Pinterest URL', 'pinterest_url', { placeholder: 'https://pinterest.com/wallcraft' })}
          </div>
        </div>

        {/* Slug info */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500">
          Store slug: <span className="font-mono text-gray-700">{settings?.slug}</span>
          <br />
          Domain:{' '}
          <span className="font-mono text-gray-700">{settings?.slug}.yourdomain.com</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium
            hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
