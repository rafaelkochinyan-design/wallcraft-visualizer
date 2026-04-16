import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
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
  useToast,
  uploadImage,
  apiErr,
} from './adminUtils'

import type { GalleryItem } from '../../types'

const SPACE_TYPES = ['living_room', 'bedroom', 'office', 'hotel', 'restaurant', 'bathroom']
const SPACE_LABELS: Record<string, string> = {
  living_room: 'Living room',
  bedroom: 'Bedroom',
  office: 'Office',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  bathroom: 'Bathroom',
}
const empty = () => ({
  image_url: '',
  thumb_url: '',
  caption: '',
  space_type: '',
  tags: [] as string[],
  sort_order: 0,
  active: true,
})

// ── Bulk drop zone ─────────────────────────────────────────────
function BulkDropzone({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const [toast, showToast] = useToast()

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      setProgress(0)
      let done = 0
      for (const file of files) {
        try {
          const fd = new FormData()
          fd.append('file', file)
          const res = await api.post('/admin/gallery/upload-image', fd)
          const url = res.data.data.url as string
          await api.post('/admin/gallery', {
            image_url: url,
            thumb_url: url,
            active: true,
            sort_order: 0,
            tags: [],
          })
        } catch {
          showToast(`Failed to upload ${file.name}`, 'err')
        }
        done++
        setProgress(Math.round((done / files.length) * 100))
      }
      setUploading(false)
      showToast(`Uploaded ${done} photo(s)`)
      onUploaded()
    },
    [onUploaded, showToast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: uploading,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`mb-4 rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}
        ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div>
          <div className="text-sm text-gray-600 mb-2">Uploading... {progress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : isDragActive ? (
        <p className="text-sm text-gray-600">Drop files to upload</p>
      ) : (
        <p className="text-sm text-gray-400">
          Drag photos here or{' '}
          <span className="text-gray-600 underline">choose files</span>
        </p>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)

  const [toast, showToast] = useToast()

  async function load() {
    setLoading(true)
    try {
      setItems((await api.get('/admin/gallery')).data.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete photo?')) return
    try {
      await api.delete(`/admin/gallery/${id}`)
      showToast('Deleted')
      load()
    } catch {
      showToast('Error', 'err')
    }
  }

  return (
    <PageShell
      title="Gallery"
      addLabel="+ Add photo"
      onAdd={() => {
        setEditing(null)
        setModalOpen(true)
      }}
      loading={loading}
    >
      <BulkDropzone onUploaded={load} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Photo
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Caption
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
                  <img
                    src={item.thumb_url || item.image_url}
                    alt=""
                    className="w-14 h-10 object-cover rounded-lg bg-gray-100"
                  />
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.caption || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {SPACE_LABELS[item.space_type || ''] || item.space_type || '—'}
                </td>
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
                  Gallery is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && (
        <GalleryModal
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

// ── Edit modal ─────────────────────────────────────────────────
function GalleryModal({
  item,
  onClose,
  onSaved,
  onError,
}: {
  item: GalleryItem | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const [form, setForm] = useState(item ?? empty())
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagsStr, setTagsStr] = useState((item?.tags || []).join(', '))

  async function handleImg(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/gallery/upload-image', onError)
    if (url) setForm((f) => ({ ...f, image_url: url, thumb_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url) {
      onError('Please upload an image')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      tags: tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    try {
      await (item
        ? api.put(`/admin/gallery/${item.id}`, payload)
        : api.post('/admin/gallery', payload))
      onSaved()
    } catch (err) {
      onError(apiErr(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={item ? 'Edit photo' : 'Add photo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Image *">
          <FileUpload url={form.image_url} uploading={uploading} onFile={handleImg} />
        </Field>
        <Field label="Caption">
          <input
            className={inputClass}
            value={form.caption || ''}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
          />
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
                {SPACE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tags (comma separated)">
          <input
            className={inputClass}
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="interior, living room, 3D"
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            className={inputClass}
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: +e.target.value }))}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="rounded"
          />
          Active
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
