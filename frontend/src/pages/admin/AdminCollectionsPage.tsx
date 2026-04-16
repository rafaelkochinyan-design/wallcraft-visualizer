import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Collection, Panel } from '../../types'
import {
  apiErr,
  useToast,
  Toast,
  Field,
  inputClass,
  Modal,
  ModalActions,
  PageShell,
  StatusBadge,
  TableActions,
} from './adminUtils'
import { genSlug } from '../../utils/slug'

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
    <PageShell
      title="Collections"
      addLabel="+ Add Collection"
      onAdd={() => { setEditing(null); setModalOpen(true) }}
      loading={loading}
    >
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Panels</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {collections.map((col) => (
              <tr key={col.id} className="border-b border-gray-50 hover:bg-gray-50">
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
                  <StatusBadge active={col.active} />
                </td>
                <td className="px-4 py-3">
                  <TableActions
                    onEdit={() => { setEditing(col); setModalOpen(true) }}
                    onDelete={() => handleDelete(col.id)}
                  />
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
      <Toast toast={toast} />

      {modalOpen && (
        <CollectionModal
          collection={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Saved') }}
          onError={(msg) => showToast(msg, 'err')}
        />
      )}
    </PageShell>
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
    <Modal title={collection ? 'Edit Collection' : 'New Collection'} onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({ ...f, name, slug: collection ? f.slug : genSlug(name) }))
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

        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}

