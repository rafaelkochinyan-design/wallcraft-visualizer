import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../../lib/api'
import {
  PageShell, Modal, ModalActions, Toast, TableActions, StatusBadge,
  Field, FileUpload, inputClass, useToast, uploadImage, apiErr,
} from './adminUtils'

interface GalleryItem {
  id: string; image_url: string; thumb_url: string | null
  caption: string | null; space_type: string | null
  tags: string[]; sort_order: number; active: boolean
}

const SPACE_TYPES = ['living_room', 'bedroom', 'office', 'hotel', 'restaurant', 'bathroom']
const SPACE_LABELS: Record<string, string> = {
  living_room: 'Гостиная', bedroom: 'Спальня', office: 'Офис',
  hotel: 'Отель', restaurant: 'Ресторан', bathroom: 'Ванная',
}
const empty = () => ({ image_url: '', thumb_url: '', caption: '', space_type: '', tags: [] as string[], sort_order: 0, active: true })

// ── Bulk drop zone ─────────────────────────────────────────────
function BulkDropzone({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_toast, showToast] = useToast()

  const onDrop = useCallback(async (files: File[]) => {
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
        await api.post('/admin/gallery', { image_url: url, thumb_url: url, active: true, sort_order: 0, tags: [] })
      } catch {
        showToast(`Ошибка при загрузке ${file.name}`, 'err')
      }
      done++
      setProgress(Math.round((done / files.length) * 100))
    }
    setUploading(false)
    showToast(`Загружено ${done} фото`)
    onUploaded()
  }, [onUploaded, showToast])

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
          <div className="text-sm text-gray-600 mb-2">Загрузка... {progress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : isDragActive ? (
        <p className="text-sm text-gray-600">Отпустите файлы для загрузки</p>
      ) : (
        <p className="text-sm text-gray-400">
          Перетащите несколько фото сюда или <span className="text-gray-600 underline">выберите файлы</span>
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_toast, showToast] = useToast()

  async function load() {
    try { setItems((await api.get('/admin/gallery')).data.data) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить фото?')) return
    try { await api.delete(`/admin/gallery/${id}`); showToast('Удалено'); load() }
    catch { showToast('Ошибка', 'err') }
  }

  return (
    <PageShell title="Галерея" addLabel="+ Добавить фото" onAdd={() => { setEditing(null); setModalOpen(true) }} loading={loading}>
      <BulkDropzone onUploaded={load} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Фото</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Подпись</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Тип пространства</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img src={item.thumb_url || item.image_url} alt="" className="w-14 h-10 object-cover rounded-lg bg-gray-100" />
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.caption || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{SPACE_LABELS[item.space_type || ''] || item.space_type || '—'}</td>
                <td className="px-4 py-3"><StatusBadge active={item.active} /></td>
                <td className="px-4 py-3">
                  <TableActions onEdit={() => { setEditing(item); setModalOpen(true) }} onDelete={() => handleDelete(item.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Галерея пуста.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={null} />
      {modalOpen && (
        <GalleryModal
          item={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }}
          onError={m => showToast(m, 'err')}
        />
      )}
    </PageShell>
  )
}

// ── Edit modal ─────────────────────────────────────────────────
function GalleryModal({ item, onClose, onSaved, onError }: {
  item: GalleryItem | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void
}) {
  const [form, setForm] = useState(item ?? empty())
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagsStr, setTagsStr] = useState((item?.tags || []).join(', '))

  async function handleImg(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/gallery/upload-image', onError)
    if (url) setForm(f => ({ ...f, image_url: url, thumb_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url) { onError('Загрузите изображение'); return }
    setSaving(true)
    const payload = { ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      item ? await api.put(`/admin/gallery/${item.id}`, payload) : await api.post('/admin/gallery', payload)
      onSaved()
    } catch (err) { onError(apiErr(err)) } finally { setSaving(false) }
  }

  return (
    <Modal title={item ? 'Редактировать фото' : 'Добавить фото'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Изображение *">
          <FileUpload url={form.image_url} uploading={uploading} onFile={handleImg} />
        </Field>
        <Field label="Подпись">
          <input className={inputClass} value={form.caption || ''} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
        </Field>
        <Field label="Тип пространства">
          <select className={inputClass} value={form.space_type || ''} onChange={e => setForm(f => ({ ...f, space_type: e.target.value }))}>
            <option value="">— Не указано —</option>
            {SPACE_TYPES.map(t => <option key={t} value={t}>{SPACE_LABELS[t]}</option>)}
          </select>
        </Field>
        <Field label="Теги (через запятую)">
          <input className={inputClass} value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="интерьер, гостиная, 3D" />
        </Field>
        <Field label="Порядок">
          <input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
          Активно
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
