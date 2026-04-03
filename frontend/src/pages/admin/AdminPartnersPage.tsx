import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  PageShell, Modal, ModalActions, Toast, TableActions, StatusBadge,
  Field, FileUpload, inputClass, useToast, uploadImage, apiErr,
} from './adminUtils'

interface Partner { id: string; name: string; logo_url: string; website: string | null; sort_order: number; active: boolean }
const empty = () => ({ name: '', logo_url: '', website: '', sort_order: 0, active: true })

export default function AdminPartnersPage() {
  const [items, setItems] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try { setItems((await api.get('/admin/partners')).data.data) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить партнёра?')) return
    try { await api.delete(`/admin/partners/${id}`); showToast('Удалено'); load() }
    catch { showToast('Ошибка', 'err') }
  }

  return (
    <PageShell title="Партнёры" addLabel="+ Добавить" onAdd={() => { setEditing(null); setModalOpen(true) }} loading={loading}>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Партнёр</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Сайт</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Порядок</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={item.logo_url} alt={item.name} className="w-10 h-8 object-contain rounded bg-gray-50 border border-gray-100" />
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.website || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.sort_order}</td>
                <td className="px-4 py-3"><StatusBadge active={item.active} /></td>
                <td className="px-4 py-3">
                  <TableActions onEdit={() => { setEditing(item); setModalOpen(true) }} onDelete={() => handleDelete(item.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Нет партнёров.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && <PartnerModal item={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }} onError={m => showToast(m, 'err')} />}
    </PageShell>
  )
}

function PartnerModal({ item, onClose, onSaved, onError }: { item: Partner | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
  const [form, setForm] = useState(item ?? empty())
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleLogo(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/partners/upload-logo', onError)
    if (url) setForm(f => ({ ...f, logo_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.logo_url) { onError('Название и логотип обязательны'); return }
    setSaving(true)
    try {
      item ? await api.put(`/admin/partners/${item.id}`, form) : await api.post('/admin/partners', form)
      onSaved()
    } catch (err) { onError(apiErr(err)) } finally { setSaving(false) }
  }

  return (
    <Modal title={item ? 'Редактировать партнёра' : 'Новый партнёр'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Название *"><input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
        <Field label="Логотип *"><FileUpload url={form.logo_url} uploading={uploading} onFile={handleLogo} /></Field>
        <Field label="Сайт"><input className={inputClass} value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></Field>
        <Field label="Порядок сортировки"><input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} /></Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
          Активен
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
