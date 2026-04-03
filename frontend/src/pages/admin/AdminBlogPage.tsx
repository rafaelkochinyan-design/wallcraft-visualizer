import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  PageShell, Modal, ModalActions, Toast, TableActions,
  Field, FileUpload, inputClass, textareaClass, useToast, uploadImage, apiErr,
  LocaleTabs, useLocaleLang, emptyLocale,
} from './adminUtils'

interface LocaleStr { ru: string; en: string; am: string }

interface BlogPost {
  id: string; slug: string; title: LocaleStr; excerpt: LocaleStr; body: LocaleStr
  cover_url: string | null; category: string | null; tags: string[]
  published: boolean; published_at: string | null; created_at: string
}

function genSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try { setItems((await api.get('/admin/blog')).data.data) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить статью?')) return
    try { await api.delete(`/admin/blog/${id}`); showToast('Удалено'); load() }
    catch { showToast('Ошибка', 'err') }
  }

  async function togglePublish(id: string) {
    try { await api.patch(`/admin/blog/${id}/publish`); load() }
    catch { showToast('Ошибка', 'err') }
  }

  return (
    <PageShell title="Блог" addLabel="+ Новая статья" onAdd={() => { setEditing(null); setModalOpen(true) }} loading={loading}>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статья</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Категория</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.cover_url && <img src={item.cover_url} alt="" className="w-12 h-9 object-cover rounded-lg bg-gray-100" />}
                    <div>
                      <div className="font-medium text-gray-900">{item.title.ru || item.title.en}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.category || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {item.published_at ? new Date(item.published_at).toLocaleDateString('ru') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublish(item.id)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors
                      ${item.published ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {item.published ? 'Опубликована' : 'Черновик'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <TableActions onEdit={() => { setEditing(item); setModalOpen(true) }} onDelete={() => handleDelete(item.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Нет статей.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && <BlogModal item={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }} onError={m => showToast(m, 'err')} />}
    </PageShell>
  )
}

function BlogModal({ item, onClose, onSaved, onError }: { item: BlogPost | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
  const [lang, setLang] = useLocaleLang()
  const [form, setForm] = useState({
    slug: item?.slug ?? '',
    title: item?.title ?? emptyLocale(),
    excerpt: item?.excerpt ?? emptyLocale(),
    body: item?.body ?? emptyLocale(),
    cover_url: item?.cover_url ?? '',
    category: item?.category ?? '',
    tags: item?.tags ?? [],
    published: item?.published ?? false,
  })
  const [tagsStr, setTagsStr] = useState((item?.tags || []).join(', '))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleTitleChange(val: string) {
    setForm(f => ({ ...f, title: { ...f.title, [lang]: val }, ...(!item && lang === 'ru' ? { slug: genSlug(val) } : {}) }))
  }

  async function handleCover(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/blog/upload-cover', onError)
    if (url) setForm(f => ({ ...f, cover_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slug || !form.title.ru) { onError('Slug и заголовок (RU) обязательны'); return }
    setSaving(true)
    const payload = { ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      item ? await api.put(`/admin/blog/${item.id}`, payload) : await api.post('/admin/blog', payload)
      onSaved()
    } catch (err) { onError(apiErr(err)) } finally { setSaving(false) }
  }

  const setLocale = (field: 'title' | 'excerpt' | 'body', val: string) =>
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val } }))

  return (
    <Modal title={item ? 'Редактировать статью' : 'Новая статья'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Обложка"><FileUpload url={form.cover_url || ''} uploading={uploading} onFile={handleCover} /></Field>

        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Контент</p>
          <LocaleTabs lang={lang} onChange={setLang} />
          <div className="flex flex-col gap-3">
            <Field label={`Заголовок (${lang.toUpperCase()}) *`}>
              <input className={inputClass} value={form.title[lang]} onChange={e => handleTitleChange(e.target.value)} />
            </Field>
            <Field label={`Краткое описание (${lang.toUpperCase()})`}>
              <textarea className={`${textareaClass} h-16`} value={form.excerpt[lang]} onChange={e => setLocale('excerpt', e.target.value)} />
            </Field>
            <Field label={`Текст статьи (${lang.toUpperCase()})`}>
              <textarea className={`${textareaClass} h-40`} value={form.body[lang]} onChange={e => setLocale('body', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug *">
            <input className={`${inputClass} font-mono`} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </Field>
          <Field label="Категория">
            <input className={inputClass} value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="news, tips..." />
          </Field>
        </div>
        <Field label="Теги (через запятую)">
          <input className={inputClass} value={tagsStr} onChange={e => setTagsStr(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded" />
          Опубликовать сразу
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
