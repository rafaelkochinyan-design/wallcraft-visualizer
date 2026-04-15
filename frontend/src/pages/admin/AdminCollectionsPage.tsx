import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Collection, Panel } from '../../types'
import { apiErr, useToast, Toast } from './adminUtils'

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try {
      const res = await api.get('/admin/collections')
      setCollections(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete collection?')) return
    try {
      await api.delete(`/admin/collections/${id}`)
      showToast('Collection deleted')
      load()
    } catch {
      showToast('Error deleting collection', 'err')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Collections</h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Collection
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Panels</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {col.cover_url && (
                        <img src={col.cover_url} alt={col.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{col.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{col.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{(col.panel_ids ?? []).length} panels</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${col.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {col.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(col); setModalOpen(true) }}
                        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No collections yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Toast toast={toast} />

      {modalOpen && (
        <CollectionModal
          collection={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Saved') }}
          onError={(msg) => showToast(msg, 'err')}
        />
      )}
    </div>
  )
}

// ── Collection Modal ───────────────────────────────────────────
interface CollectionModalProps {
  collection: Collection | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

function CollectionModal({ collection, onClose, onSaved, onError }: CollectionModalProps) {
  const [panels, setPanels] = useState<Panel[]>([])
  const [form, setForm] = useState({
    name: collection?.name ?? '',
    slug: collection?.slug ?? '',
    description: collection?.description ?? '',
    cover_url: collection?.cover_url ?? '',
    active: collection?.active ?? true,
    sort_order: collection?.sort_order?.toString() ?? '0',
  })
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>(collection?.panel_ids ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/panels').then((r) => setPanels(r.data.data || [])).catch(() => {})
  }, [])

  function togglePanel(id: string) {
    setSelectedPanelIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSave() {
    if (!form.name || !form.slug) {
      onError('Name and slug are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
        cover_url: form.cover_url || null,
        panel_ids: selectedPanelIds,
      }
      if (collection) {
        await api.put(`/admin/collections/${collection.id}`, payload)
      } else {
        await api.post('/admin/collections', payload)
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
          {collection ? 'Edit Collection' : 'New Collection'}
        </h3>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({ ...f, name, slug: collection ? f.slug : autoSlug(name) }))
                }}
                className={inputClass} placeholder="Summer Collection" />
            </Field>
            <Field label="Slug *">
              <input value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={inputClass} placeholder="summer-collection" />
            </Field>
          </div>

          <Field label="Cover Image URL">
            <input value={form.cover_url}
              onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
              className={inputClass} placeholder="https://..." />
          </Field>

          <Field label="Description">
            <textarea value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass} rows={2} placeholder="Short description..." />
          </Field>

          <Field label="Sort Order">
            <input type="number" value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className={inputClass} />
          </Field>

          {/* Panel picker */}
          <Field label={`Panels (${selectedPanelIds.length} selected)`}>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
              {panels.map((p) => (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedPanelIds.includes(p.id)}
                    onChange={() => togglePanel(p.id)}
                    className="rounded flex-shrink-0"
                  />
                  {p.panelImages?.[0]?.url ? (
                    <img src={p.panelImages[0].url} alt={p.name} className="w-8 h-8 rounded object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">🏛</div>
                  )}
                  <span className="text-sm text-gray-800">{p.name}</span>
                </label>
              ))}
              {panels.length === 0 && (
                <div className="px-3 py-4 text-xs text-gray-400 text-center">No panels found</div>
              )}
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
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
