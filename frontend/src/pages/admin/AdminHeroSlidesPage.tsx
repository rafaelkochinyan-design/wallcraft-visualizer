import { useEffect, useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../../lib/api'
import {
  PageShell, Modal, ModalActions, Toast, TableActions, StatusBadge,
  Field, FileUpload, inputClass, useToast, uploadImage, apiErr,
  LocaleTabs, useLocaleLang, emptyLocale,
} from './adminUtils'

interface LocaleStr { ru: string; en: string; am: string }

interface HeroSlide {
  id: string; image_url: string; video_url: string | null
  headline: LocaleStr; subheadline: LocaleStr | null
  cta_label: LocaleStr | null; cta_url: string | null
  sort_order: number; active: boolean
}

// ── Sortable row ───────────────────────────────────────────────
function SortableRow({
  item, onEdit, onDelete,
}: {
  item: HeroSlide
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f9fafb' : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-50">
      <td className="px-3 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none"
          title="Перетащить"
        >
          ⠿
        </button>
      </td>
      <td className="px-4 py-3">
        <img src={item.image_url} alt="" className="w-16 h-10 object-cover rounded-lg bg-gray-100" />
      </td>
      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{item.headline.ru}</td>
      <td className="px-4 py-3 text-gray-500 text-xs">{item.cta_label?.ru || '—'}</td>
      <td className="px-4 py-3"><StatusBadge active={item.active} /></td>
      <td className="px-4 py-3">
        <TableActions onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function AdminHeroSlidesPage() {
  const [items, setItems] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HeroSlide | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_toast, showToast] = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function load() {
    try { setItems((await api.get('/admin/hero-slides')).data.data) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить слайд?')) return
    try { await api.delete(`/admin/hero-slides/${id}`); showToast('Удалено'); load() }
    catch { showToast('Ошибка', 'err') }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = items.findIndex(i => i.id === active.id)
    const newIdx = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx)
    setItems(reordered)

    const body = reordered.map((s, i) => ({ id: s.id, sort_order: i }))
    try { await api.patch('/admin/hero-slides/reorder', body) }
    catch { showToast('Ошибка сохранения порядка', 'err'); load() }
  }

  return (
    <PageShell title="Hero-слайды" addLabel="+ Добавить слайд" onAdd={() => { setEditing(null); setModalOpen(true) }} loading={loading}>
      <p className="text-xs text-gray-400 mb-3">Перетащите строки для изменения порядка слайдов.</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-3 py-3 w-8" />
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Слайд</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Заголовок (RU)</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CTA</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    onEdit={() => { setEditing(item); setModalOpen(true) }}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">Нет слайдов.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={null} />
      {modalOpen && (
        <SlideModal
          item={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }}
          onError={m => showToast(m, 'err')}
        />
      )}
    </PageShell>
  )
}

// ── Modal ──────────────────────────────────────────────────────
function SlideModal({ item, onClose, onSaved, onError }: {
  item: HeroSlide | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void
}) {
  const [lang, setLang] = useLocaleLang()
  const [form, setForm] = useState({
    image_url: item?.image_url ?? '',
    headline: item?.headline ?? emptyLocale(),
    subheadline: item?.subheadline ?? emptyLocale(),
    cta_label: item?.cta_label ?? emptyLocale(),
    cta_url: item?.cta_url ?? '',
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleImg(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/hero-slides/upload-image', onError)
    if (url) setForm(f => ({ ...f, image_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url || !form.headline.ru) { onError('Изображение и заголовок (RU) обязательны'); return }
    setSaving(true)
    try {
      item ? await api.put(`/admin/hero-slides/${item.id}`, form) : await api.post('/admin/hero-slides', form)
      onSaved()
    } catch (err) { onError(apiErr(err)) } finally { setSaving(false) }
  }

  const setLocale = (field: 'headline' | 'subheadline' | 'cta_label', val: string) =>
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val } }))

  return (
    <Modal title={item ? 'Редактировать слайд' : 'Новый слайд'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Изображение *">
          <FileUpload url={form.image_url} uploading={uploading} onFile={handleImg} />
        </Field>

        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Локализованный контент</p>
          <LocaleTabs lang={lang} onChange={setLang} />
          <div className="flex flex-col gap-3">
            <Field label={`Заголовок (${lang.toUpperCase()}) *`}>
              <input className={inputClass} value={form.headline[lang]} onChange={e => setLocale('headline', e.target.value)} />
            </Field>
            <Field label={`Подзаголовок (${lang.toUpperCase()})`}>
              <input className={inputClass} value={form.subheadline[lang]} onChange={e => setLocale('subheadline', e.target.value)} />
            </Field>
            <Field label={`Текст кнопки (${lang.toUpperCase()})`}>
              <input className={inputClass} value={form.cta_label[lang]} onChange={e => setLocale('cta_label', e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Ссылка кнопки (URL)">
          <input className={inputClass} value={form.cta_url || ''} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="/products" />
        </Field>
        <div className="flex gap-4">
          <Field label="Порядок">
            <input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
          Активен
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
