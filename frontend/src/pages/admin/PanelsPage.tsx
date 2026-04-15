import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Panel, PanelCategory, PanelImage, PanelSize } from '../../types'
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

  useEffect(() => { load() }, [])

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
                      {panel.panelImages?.[0]?.url ? (
                        <img src={panel.panelImages[0].url} alt={panel.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg">🏛</div>
                      )}
                      <div>
                        <span className="font-medium text-gray-900">{panel.name}</span>
                        {panel.category && (
                          <div className="text-xs text-gray-400">{panel.category.name}</div>
                        )}
                      </div>
                    </div>
                  </td>
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
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No panels yet. Add your first panel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white
          ${toast.type === 'ok' ? 'bg-gray-900' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

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
    zip_url: panel?.zip_url ?? '',
    price: panel?.price?.toString() ?? '',
    width_mm: panel?.width_mm?.toString() ?? '500',
    height_mm: panel?.height_mm?.toString() ?? '500',
    depth_mm: panel?.depth_mm?.toString() ?? '19',
    depth_relief_mm: panel?.depth_relief_mm?.toString() ?? '',
    weight_kg: panel?.weight_kg?.toString() ?? '',
    material: panel?.material ?? '',
    description: panel?.description ?? '',
    category_id: panel?.category?.id ?? '',
    active: panel?.active ?? true,
  })
  const [images, setImages] = useState<PanelImage[]>(panel?.panelImages ?? [])
  const [sizes, setSizes] = useState<Omit<PanelSize, 'panel_id'>[]>(
    panel?.sizes?.map(({ panel_id: _, ...s }) => s) ?? []
  )
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadingZip, setUploadingZip] = useState(false)
  const [saving, setSaving] = useState(false)

  function addSize() {
    setSizes((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, label: '', width_mm: 500, height_mm: 500, depth_mm: 19, price: null, sort_order: prev.length },
    ])
  }

  function updateSize(idx: number, field: string, value: string | number | null) {
    setSizes((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeSize(idx: number) {
    setSizes((prev) => prev.filter((_, i) => i !== idx))
  }

  useEffect(() => {
    api.get('/admin/panel-categories').then((r) => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  async function uploadImage(file: File, isMain: boolean) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!imageTypes.includes(file.type)) {
      onError('Only JPG, PNG or WebP')
      return
    }
    setUploading(isMain ? 'main' : 'image')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/admin/panels/upload-image', formData)
      const url = res.data.data.url
      if (isMain) {
        // Replace first image (sort_order 0) or prepend
        setImages((imgs) => {
          const rest = imgs.filter((_, i) => i !== 0)
          return [{ id: `new-${Date.now()}`, url, caption: null, sort_order: 0 }, ...rest]
        })
      } else {
        setImages((imgs) => [...imgs, { id: `new-${Date.now()}`, url, caption: null, sort_order: imgs.length }])
      }
    } catch {
      onError('Upload error')
    } finally {
      setUploading(null)
    }
  }

  async function uploadZip(file: File) {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      onError('Only ZIP files allowed')
      return
    }
    setUploadingZip(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/admin/panels/upload-zip', fd)
      setForm((f) => ({ ...f, zip_url: res.data.data.url }))
    } catch {
      onError('ZIP upload failed')
    } finally {
      setUploadingZip(false)
    }
  }

  async function handleSave() {
    if (!form.name || images.length === 0) {
      onError('Fill in the name and upload at least one photo')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        zip_url: form.zip_url || null,
        price: form.price ? parseFloat(form.price) : undefined,
        width_mm: form.width_mm ? parseInt(form.width_mm) : undefined,
        height_mm: form.height_mm ? parseInt(form.height_mm) : undefined,
        depth_mm: form.depth_mm ? parseInt(form.depth_mm) : undefined,
        depth_relief_mm: form.depth_relief_mm ? parseInt(form.depth_relief_mm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        category_id: form.category_id || undefined,
        sizes: sizes.map((s, i) => ({
          id: s.id.startsWith('new-') ? undefined : s.id,
          label: s.label,
          width_mm: s.width_mm,
          height_mm: s.height_mm,
          depth_mm: s.depth_mm,
          price: s.price ?? undefined,
          sort_order: i,
        })),
      }

      let savedPanelId: string
      if (panel) {
        await api.put(`/admin/panels/${panel.id}`, payload)
        savedPanelId = panel.id
      } else {
        const res = await api.post('/admin/panels', payload)
        savedPanelId = res.data.data.id
      }

      // Sync images: delete all existing, recreate from current state
      const existing = await api.get('/admin/panels').then((r) => {
        const found = (r.data.data as Panel[]).find((p) => p.id === savedPanelId)
        return found?.panelImages ?? []
      })
      for (const img of existing) {
        await api.delete(`/admin/panels/${savedPanelId}/images/${img.id}`)
      }
      for (let i = 0; i < images.length; i++) {
        await api.post(`/admin/panels/${savedPanelId}/images`, {
          url: images[i].url,
          caption: images[i].caption ?? null,
          sort_order: i,
        })
      }

      onSaved()
    } catch (err: unknown) {
      onError(apiErr(err) || 'Save error')
    } finally {
      setSaving(false)
    }
  }

  const mainPhoto = images[0]?.url ?? ''

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
            <div className="grid grid-cols-2 gap-3">
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

          {/* Main photo */}
          <Field label="Main Photo *">
            <FileUpload url={mainPhoto} uploading={uploading === 'main'}
              accept="image/jpeg,image/png,image/webp" onFile={(f) => uploadImage(f, true)} />
          </Field>

          {/* Gallery images */}
          <Field label="Gallery Images">
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <div key={img.id} style={{ position: 'relative' }}>
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
                  onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0], false) }} />
              </label>
            </div>
          </Field>

          {/* ZIP download */}
          <Field label="Download Files (ZIP) — optional">
            {form.zip_url && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#f0fdf4',
                border: '1px solid #86efac', borderRadius: 8,
                marginBottom: 8, fontSize: 13, color: '#166534',
              }}>
                📦 ZIP uploaded
                <a href={form.zip_url} target="_blank" rel="noreferrer"
                  style={{ marginLeft: 'auto', color: '#166534', fontSize: 12 }}>
                  Preview
                </a>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, zip_url: '' }))}
                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                  Remove
                </button>
              </div>
            )}
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 40, borderRadius: 8, border: '2px dashed #d1d5db',
              cursor: uploadingZip ? 'not-allowed' : 'pointer',
              opacity: uploadingZip ? 0.5 : 1,
              fontSize: 13, color: '#9ca3af',
            }}>
              {uploadingZip ? 'Uploading...' : form.zip_url ? 'Replace ZIP' : 'Upload ZIP file'}
              <input type="file" accept=".zip" style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) uploadZip(e.target.files[0]) }} />
            </label>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              Max 100MB · Include 3D models, catalogs, or any files for this panel.
            </p>
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass} rows={3}
              placeholder="Describe the panel design, finish, ideal use cases..." />
          </Field>

          {/* Size variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Size Variants (optional)</label>
              <button type="button" onClick={addSize}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
                + Add size
              </button>
            </div>
            {sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                {sizes.map((size, idx) => (
                  <div key={size.id} className="grid grid-cols-[1fr_80px_80px_80px_80px_32px] gap-2 items-end">
                    <div>
                      {idx === 0 && <div className="text-xs text-gray-400 mb-1">Label</div>}
                      <input value={size.label}
                        onChange={(e) => updateSize(idx, 'label', e.target.value)}
                        className={inputClass} placeholder="e.g. 500×500" />
                    </div>
                    <div>
                      {idx === 0 && <div className="text-xs text-gray-400 mb-1">W mm</div>}
                      <input type="number" value={size.width_mm}
                        onChange={(e) => updateSize(idx, 'width_mm', parseFloat(e.target.value))}
                        className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <div className="text-xs text-gray-400 mb-1">H mm</div>}
                      <input type="number" value={size.height_mm}
                        onChange={(e) => updateSize(idx, 'height_mm', parseFloat(e.target.value))}
                        className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <div className="text-xs text-gray-400 mb-1">D mm</div>}
                      <input type="number" value={size.depth_mm}
                        onChange={(e) => updateSize(idx, 'depth_mm', parseFloat(e.target.value))}
                        className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <div className="text-xs text-gray-400 mb-1">Price</div>}
                      <input type="number" value={size.price ?? ''}
                        onChange={(e) => updateSize(idx, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                        className={inputClass} placeholder="—" />
                    </div>
                    <div style={{ paddingTop: idx === 0 ? 20 : 0 }}>
                      <button type="button" onClick={() => removeSize(idx)}
                        className="w-8 h-9 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded" />
            Active (visible on website)
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
