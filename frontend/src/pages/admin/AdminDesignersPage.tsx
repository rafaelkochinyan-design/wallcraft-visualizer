import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  PageShell, Modal, ModalActions, Toast, TableActions, StatusBadge,
  Field, FileUpload, inputClass, textareaClass, useToast, uploadImage, apiErr,
  LocaleTabs, useLocaleLang, emptyLocale,
} from './adminUtils'

interface LocaleStr { ru: string; en: string; am: string }

interface Designer {
  id: string; name: string; slug: string; photo_url: string | null
  bio: LocaleStr | null; specialty: string | null
  portfolio: string[]; instagram: string | null; website: string | null
  active: boolean; sort_order: number
}

function genSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 60)
}

export default function AdminDesignersPage() {
  const [items, setItems] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Designer | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try { setItems((await api.get('/admin/designers')).data.data) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить дизайнера?')) return
    try { await api.delete(`/admin/designers/${id}`); showToast('Удалено'); load() }
    catch { showToast('Ошибка', 'err') }
  }

  return (
    <PageShell title="Дизайнеры" addLabel="+ Добавить" onAdd={() => { setEditing(null); setModalOpen(true) }} loading={loading}>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Дизайнер</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Специализация</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Instagram</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.photo_url
                      ? <img src={item.photo_url} alt={item.name} className="w-9 h-9 rounded-full object-cover bg-gray-100" />
                      : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">{item.name[0]}</div>
                    }
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.specialty || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.instagram || '—'}</td>
                <td className="px-4 py-3"><StatusBadge active={item.active} /></td>
                <td className="px-4 py-3">
                  <TableActions onEdit={() => { setEditing(item); setModalOpen(true) }} onDelete={() => handleDelete(item.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Нет дизайнеров.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && (
        <DesignerModal
          item={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }}
          onError={m => showToast(m, 'err')}
        />
      )}
    </PageShell>
  )
}

function DesignerModal({ item, onClose, onSaved, onError }: {
  item: Designer | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void
}) {
  const [lang, setLang] = useLocaleLang()
  const [form, setForm] = useState({
    name: item?.name ?? '',
    slug: item?.slug ?? '',
    photo_url: item?.photo_url ?? '',
    bio: item?.bio ?? emptyLocale(),
    specialty: item?.specialty ?? '',
    instagram: item?.instagram ?? '',
    website: item?.website ?? '',
    active: item?.active ?? true,
    sort_order: item?.sort_order ?? 0,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, ...(!item ? { slug: genSlug(name) } : {}) }))
  }

  async function handlePhoto(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/designers/upload-photo', onError)
    if (url) setForm(f => ({ ...f, photo_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.slug) { onError('Имя и slug обязательны'); return }
    setSaving(true)
    try {
      item ? await api.put(`/admin/designers/${item.id}`, form) : await api.post('/admin/designers', form)
      onSaved()
    } catch (err) { onError(apiErr(err)) } finally { setSaving(false) }
  }

  return (
    <Modal title={item ? 'Редактировать дизайнера' : 'Новый дизайнер'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Имя *">
            <input className={inputClass} value={form.name} onChange={e => handleNameChange(e.target.value)} />
          </Field>
          <Field label="Slug *">
            <input className={`${inputClass} font-mono`} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </Field>
        </div>

        <Field label="Фото"><FileUpload url={form.photo_url || ''} uploading={uploading} onFile={handlePhoto} /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Специализация">
            <input className={inputClass} value={form.specialty || ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Interior Design" />
          </Field>
          <Field label="Instagram">
            <input className={inputClass} value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@handle" />
          </Field>
          <Field label="Сайт">
            <input className={inputClass} value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
          </Field>
          <Field label="Порядок">
            <input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
          </Field>
        </div>

        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Биография</p>
          <LocaleTabs lang={lang} onChange={setLang} />
          <textarea
            className={`${textareaClass} h-28`}
            value={form.bio[lang]}
            onChange={e => setForm(f => ({ ...f, bio: { ...f.bio, [lang]: e.target.value } }))}
            placeholder={`Биография на ${lang.toUpperCase()}...`}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
          Активен (показывать на сайте)
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
