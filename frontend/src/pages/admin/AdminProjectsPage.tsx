import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  PageShell,
  Modal,
  ModalActions,
  Toast,
  TableActions,
  StatusBadge,
  Field,
  FileUpload,
  inputClass,
  textareaClass,
  useToast,
  uploadImage,
  apiErr,
} from './adminUtils'
import { genSlug } from '../../utils/slug'

import type { Project } from '../../types'

const SPACE_TYPES = [
  'living_room',
  'bedroom',
  'office',
  'hotel',
  'restaurant',
  'bathroom',
  'corridor',
]
const SPACE_LABELS: Record<string, string> = {
  living_room: 'Living room',
  bedroom: 'Bedroom',
  office: 'Office',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  bathroom: 'Bathroom',
  corridor: 'Corridor',
}

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try {
      setItems((await api.get('/admin/projects')).data.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete project?')) return
    try {
      await api.delete(`/admin/projects/${id}`)
      showToast('Deleted')
      load()
    } catch {
      showToast('Error', 'err')
    }
  }

  return (
    <PageShell
      title="Projects"
      addLabel="+ New project"
      onAdd={() => {
        setEditing(null)
        setModalOpen(true)
      }}
      loading={loading}
    >
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Project
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Slug
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Space type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.cover_url && (
                      <img
                        src={item.cover_url}
                        alt=""
                        className="w-12 h-9 object-cover rounded-lg bg-gray-100"
                      />
                    )}
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{item.slug}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{SPACE_LABELS[item.space_type || ''] || item.space_type || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge active={item.active} />
                </td>
                <td className="px-4 py-3">
                  <TableActions
                    onEdit={() => {
                      setEditing(item)
                      setModalOpen(true)
                    }}
                    onDelete={() => handleDelete(item.id)}
                  />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No projects.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && (
        <ProjectModal
          item={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            load()
            showToast('Saved')
          }}
          onError={(m) => showToast(m, 'err')}
        />
      )}
    </PageShell>
  )
}

function ProjectModal({
  item,
  onClose,
  onSaved,
  onError,
}: {
  item: Project | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const [form, setForm] = useState({
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    description: item?.description ?? '',
    cover_url: item?.cover_url ?? '',
    space_type: item?.space_type ?? '',
    active: item?.active ?? true,
    sort_order: item?.sort_order ?? 0,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, ...(!item ? { slug: genSlug(title) } : {}) }))
  }

  async function handleCover(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/projects/upload-image', onError)
    if (url) setForm((f) => ({ ...f, cover_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.slug) {
      onError('Title and slug are required')
      return
    }
    setSaving(true)
    try {
      await (item ? api.put(`/admin/projects/${item.id}`, form) : api.post('/admin/projects', form))
      onSaved()
    } catch (err) {
      onError(apiErr(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={item ? 'Edit project' : 'New project'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title *">
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </Field>
        <Field label="Slug *">
          <input
            className={`${inputClass} font-mono`}
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="my-project"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${textareaClass} h-24`}
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <Field label="Cover image">
          <FileUpload url={form.cover_url || ''} uploading={uploading} onFile={handleCover} />
        </Field>
        <Field label="Space type">
          <select
            className={inputClass}
            value={form.space_type || ''}
            onChange={(e) => setForm((f) => ({ ...f, space_type: e.target.value }))}
          >
            <option value="">— Not specified —</option>
            {SPACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SPACE_LABELS[t] || t}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-4">
          <Field label="Order">
            <input
              type="number"
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: +e.target.value }))}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="rounded"
          />
          Active (show on site)
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
