import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Accessory, AccessoryType } from '../../types'

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [types, setTypes] = useState<AccessoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Accessory | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  async function load() {
    try {
      const [accRes, typesRes] = await Promise.all([
        api.get('/admin/accessories'),
        api.get('/api/accessory-types'),
      ])
      setAccessories(accRes.data.data)
      setTypes(typesRes.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete accessory?')) return
    try {
      await api.delete(`/admin/accessories/${id}`)
      showToast('Accessory deleted')
      load()
    } catch {
      showToast('Delete failed', 'err')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Accessories</h2>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add accessory
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Accessory
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Scale
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {accessories.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.thumb_url}
                        alt={acc.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <span className="font-medium text-gray-900">{acc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{acc.type?.label_ru}</td>
                  <td className="px-4 py-3 text-gray-500">{acc.scale}×</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${acc.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {acc.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditing(acc)
                          setModalOpen(true)
                        }}
                        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accessories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No accessories. Add the first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white
          ${toast.type === 'ok' ? 'bg-gray-900' : 'bg-red-600'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AccessoryModal
          accessory={editing}
          types={types}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            load()
            showToast('Saved')
          }}
          onError={(msg) => showToast(msg, 'err')}
        />
      )}
    </div>
  )
}

// ── Accessory Modal ────────────────────────────────────────────
interface AccessoryModalProps {
  accessory: Accessory | null
  types: AccessoryType[]
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

function AccessoryModal({ accessory, types, onClose, onSaved, onError }: AccessoryModalProps) {
  const [form, setForm] = useState({
    name: accessory?.name ?? '',
    type_id: accessory?.type_id ?? types[0]?.id ?? '',
    scale: accessory?.scale?.toString() ?? '1.0',
    model_url: accessory?.model_url ?? '',
    thumb_url: accessory?.thumb_url ?? '',
    active: accessory?.active ?? true,
  })
  const [uploading, setUploading] = useState<'model' | 'thumb' | null>(null)
  const [saving, setSaving] = useState(false)

  async function uploadModel(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'glb') {
      onError('Only .glb files are allowed')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      onError('File is too large. Max 20 MB.')
      return
    }
    setUploading('model')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/admin/accessories/upload-model', formData)
      setForm((f) => ({ ...f, model_url: res.data.data.url }))
    } catch {
      onError('Failed to upload model')
    } finally {
      setUploading(null)
    }
  }

  async function uploadThumb(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      onError('Only JPG, PNG or WebP are allowed')
      return
    }
    setUploading('thumb')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/admin/accessories/upload-thumb', formData)
      setForm((f) => ({ ...f, thumb_url: res.data.data.url }))
    } catch {
      onError('Failed to upload thumbnail')
    } finally {
      setUploading(null)
    }
  }

  async function handleSave() {
    if (!form.name || !form.type_id || !form.model_url || !form.thumb_url) {
      onError('Please fill in all required fields')
      return
    }
    const scaleVal = parseFloat(form.scale)
    if (isNaN(scaleVal) || scaleVal < 0.1 || scaleVal > 10) {
      onError('Scale must be between 0.1 and 10')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, scale: scaleVal }
      if (accessory) {
        await api.put(`/admin/accessories/${accessory.id}`, payload)
      } else {
        await api.post('/admin/accessories', payload)
      }
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
        ?.data?.error?.message
      onError(msg || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-medium text-gray-900 mb-5">
          {accessory ? 'Edit accessory' : 'New accessory'}
        </h3>

        <div className="flex flex-col gap-4">
          <Field label="Name *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Schneider socket"
            />
          </Field>

          <Field label="Type *">
            <select
              value={form.type_id}
              onChange={(e) => setForm({ ...form, type_id: e.target.value })}
              className={inputClass}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label_ru}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Scale (0.1 – 10)">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={form.scale}
              onChange={(e) => setForm({ ...form, scale: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="3D model (.glb) *">
            <div className="flex items-center gap-3">
              {form.model_url && (
                <span className="text-xs text-green-600 font-medium flex-shrink-0">
                  ✓ Uploaded
                </span>
              )}
              <label
                className={`flex-1 flex items-center justify-center h-10 rounded-lg border-2 border-dashed
                border-gray-200 text-xs text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600
                transition-colors ${uploading === 'model' ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading === 'model'
                  ? 'Uploading...'
                  : form.model_url
                    ? 'Replace .glb'
                    : 'Choose .glb'}
                <input
                  type="file"
                  accept=".glb"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadModel(e.target.files[0])
                  }}
                />
              </label>
            </div>
          </Field>

          <Field label="Thumbnail (JPG/PNG) *">
            <div className="flex items-center gap-3">
              {form.thumb_url && (
                <img
                  src={form.thumb_url}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                />
              )}
              <label
                className={`flex-1 flex items-center justify-center h-10 rounded-lg border-2 border-dashed
                border-gray-200 text-xs text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600
                transition-colors ${uploading === 'thumb' ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading === 'thumb'
                  ? 'Uploading...'
                  : form.thumb_url
                    ? 'Replace file'
                    : 'Choose file'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadThumb(e.target.files[0])
                  }}
                />
              </label>
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
            />
            Active (show in visualizer)
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading !== null}
            className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900
  focus:outline-none focus:ring-2 focus:ring-gray-200`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
