import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Panel, PanelCategory } from '../../types'
import { apiErr } from './adminUtils'

export default function PanelsPage() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Panel | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  async function load() {
    try {
      const res = await api.get('/admin/panels')
      setPanels(res.data.data)
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
    if (!confirm('Delete panel?')) return
    try {
      await api.delete(`/admin/panels/${id}`)
      showToast('Panel deleted')
      load()
    } catch {
      showToast('Error deleting panel', 'err')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Panels</h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Panel
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Panel</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Size (mm)</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {panels.map((panel) => (
                <tr key={panel.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={panel.thumb_url} alt={panel.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <div>
                        <span className="font-medium text-gray-900">{panel.name}</span>
                        {panel.category && (
                          <div className="text-xs text-gray-400">{panel.category.name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{panel.sku || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{panel.width_mm}×{panel.height_mm}×{panel.depth_mm}</td>
                  <td className="px-4 py-3 text-gray-500">{panel.price ? `${panel.price} AMD` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${panel.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {panel.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(panel); setModalOpen(true) }}
                        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(panel.id)}
                        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {panels.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No panels yet. Add your first panel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white
          ${toast.type === 'ok' ? 'bg-gray-900' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PanelModal
          panel={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Saved') }}
          onError={(msg) => showToast(msg, 'err')}
        />
      )}
    </div>
  )
}

// ── Panel Modal ────────────────────────────────────────────────
interface PanelModalProps {
  panel: Panel | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

function PanelModal({ panel, onClose, onSaved, onError }: PanelModalProps) {
  const [categories, setCategories] = useState<PanelCategory[]>([])
  const [form, setForm] = useState({
    name: panel?.name ?? '',
    sku: panel?.sku ?? '',
    texture_url: panel?.texture_url ?? '',
    thumb_url: panel?.thumb_url ?? '',
    price: panel?.price?.toString() ?? '',
    width_mm: panel?.width_mm?.toString() ?? '500',
    height_mm: panel?.height_mm?.toString() ?? '500',
    depth_mm: panel?.depth_mm?.toString() ?? '19',
    depth_relief_mm: panel?.depth_relief_mm?.toString() ?? '',
    weight_kg: panel?.weight_kg?.toString() ?? '',
    material: panel?.material ?? '',
    description: panel?.description ?? '',
    catalog_url: panel?.catalog_url ?? '',
    model_url: panel?.model_url ?? '',
    category_id: panel?.category?.id ?? '',
    active: panel?.active ?? true,
  })
  const [images, setImages] = useState<{ url: string }[]>(panel?.images || [])
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/panel-categories').then((r) => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  async function uploadFile(file: File, type: 'texture' | 'thumb' | 'image' | 'catalog') {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (type !== 'catalog' && !imageTypes.includes(file.type)) {
      onError('Only JPG, PNG or WebP')
      return
    }
    if (type === 'catalog' && file.type !== 'application/pdf') {
      onError('Only PDF files for catalog')
      return
    }
    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const endpoints: Record<string, string> = {
        texture: '/admin/panels/upload-texture',
        thumb: '/admin/panels/upload-texture',
        image: '/admin/panels/upload-image',
        catalog: '/admin/panels/upload-catalog',
      }
      const res = await api.post(endpoints[type], formData)
      const url = res.data.data.url
      if (type === 'texture') setForm((f) => ({ ...f, texture_url: url }))
      else if (type === 'thumb') setForm((f) => ({ ...f, thumb_url: url }))
      else if (type === 'catalog') setForm((f) => ({ ...f, catalog_url: url }))
      else if (type === 'image') setImages((imgs) => [...imgs, { url }])
    } catch {
      onError('Upload error')
    } finally {
      setUploading(null)
    }
  }

  async function handleSave() {
    if (!form.name || !form.thumb_url) {
      onError('Fill in the name and upload at least a thumbnail')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : undefined,
        width_mm: form.width_mm ? parseInt(form.width_mm) : undefined,
        height_mm: form.height_mm ? parseInt(form.height_mm) : undefined,
        depth_mm: form.depth_mm ? parseInt(form.depth_mm) : undefined,
        depth_relief_mm: form.depth_relief_mm ? parseInt(form.depth_relief_mm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        category_id: form.category_id || undefined,
        images,
      }
      if (panel) {
        await api.put(`/admin/panels/${panel.id}`, payload)
      } else {
        await api.post('/admin/panels', payload)
      }
      onSaved()
    } catch (err: unknown) {
      onError(apiErr(err) || 'Save error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
        <h3 className="text-base font-medium text-gray-900 mb-5">
          {panel ? 'Edit Panel' : 'New Panel'}
        </h3>

        <div className="flex flex-col gap-4">
          {/* Basic info row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} placeholder="Consul A" />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={inputClass} placeholder="CONSUL-A" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (AMD)">
              <input type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass} placeholder="31500" />
            </Field>
            <Field label="Category">
              <select value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className={inputClass}>
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="Width mm">
              <input type="number" value={form.width_mm}
                onChange={(e) => setForm({ ...form, width_mm: e.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Height mm">
              <input type="number" value={form.height_mm}
                onChange={(e) => setForm({ ...form, height_mm: e.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Depth mm">
              <input type="number" value={form.depth_mm}
                onChange={(e) => setForm({ ...form, depth_mm: e.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Relief depth mm">
              <input type="number" value={form.depth_relief_mm}
                onChange={(e) => setForm({ ...form, depth_relief_mm: e.target.value })}
                className={inputClass} placeholder="20" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Weight kg">
              <input type="number" step="0.1" value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                className={inputClass} placeholder="1.5" />
            </Field>
            <Field label="Material">
              <input value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className={inputClass} placeholder="gypsum mixture" />
            </Field>
          </div>

          {/* Images */}
          <Field label="Thumbnail (JPG/PNG) *">
            <FileUpload url={form.thumb_url} uploading={uploading === 'thumb'}
              accept="image/jpeg,image/png,image/webp" onFile={(f) => uploadFile(f, 'thumb')} />
          </Field>

          <Field label="Texture for 3D (JPG/PNG)">
            <FileUpload url={form.texture_url} uploading={uploading === 'texture'}
              accept="image/jpeg,image/png,image/webp" onFile={(f) => uploadFile(f, 'texture')} />
          </Field>

          {/* Gallery images */}
          <Field label="Gallery Images">
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                  <button
                    onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#ef4444', border: 'none', color: '#fff',
                      fontSize: 12, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              ))}
              <label className={`flex items-center justify-center w-16 h-16 rounded-lg border-2 border-dashed
                border-gray-200 text-gray-400 cursor-pointer hover:border-gray-400 text-xl
                ${uploading === 'image' ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading === 'image' ? '…' : '+'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'image') }} />
              </label>
            </div>
          </Field>

          {/* 3D Model URL */}
          <Field label="3D Model URL (GLB)">
            <input value={form.model_url}
              onChange={(e) => setForm({ ...form, model_url: e.target.value })}
              className={inputClass} placeholder="https://... or /uploads/models/panel.glb" />
          </Field>

          {/* Catalog PDF */}
          <Field label="Catalog PDF">
            <div className="flex items-center gap-3">
              {form.catalog_url && (
                <a href={form.catalog_url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate max-w-[160px]">
                  📄 View PDF
                </a>
              )}
              <label className={`flex-1 flex items-center justify-center h-10 rounded-lg border-2 border-dashed
                border-gray-200 text-xs text-gray-400 cursor-pointer hover:border-gray-400
                ${uploading === 'catalog' ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading === 'catalog' ? 'Uploading...' : form.catalog_url ? 'Replace PDF' : 'Upload PDF'}
                <input type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'catalog') }} />
              </label>
            </div>
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass} rows={3}
              placeholder="Describe the panel design, finish, ideal use cases..." />
          </Field>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded" />
            Active (visible on website and in 3D visualizer)
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50">
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

function FileUpload({ url, uploading, accept, onFile }: {
  url: string; uploading: boolean; accept: string; onFile: (f: File) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {url && (
        <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
      )}
      <label className={`flex-1 flex items-center justify-center h-10 rounded-lg border-2 border-dashed
        border-gray-200 text-xs text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600
        transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? 'Uploading...' : url ? 'Replace file' : 'Choose file'}
        <input type="file" accept={accept} className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]) }} />
      </label>
    </div>
  )
}
