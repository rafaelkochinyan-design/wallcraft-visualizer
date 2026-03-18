import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Panel } from '../../types'

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
    if (!confirm('Удалить панель?')) return
    try {
      await api.delete(`/admin/panels/${id}`)
      showToast('Панель удалена')
      load()
    } catch {
      showToast('Ошибка при удалении', 'err')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Панели</h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Добавить панель
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Панель</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Размер (мм)</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Цена</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {panels.map((panel) => (
                <tr key={panel.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={panel.thumb_url}
                        alt={panel.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <span className="font-medium text-gray-900">{panel.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{panel.sku || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{panel.width_mm}×{panel.height_mm}×{panel.depth_mm}</td>
                  <td className="px-4 py-3 text-gray-500">{panel.price ? `${panel.price} ₽` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${panel.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {panel.active ? 'Активна' : 'Скрыта'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(panel); setModalOpen(true) }}
                        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(panel.id)}
                        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {panels.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Нет панелей. Добавьте первую.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white
          ${toast.type === 'ok' ? 'bg-gray-900' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PanelModal
          panel={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); showToast('Сохранено') }}
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
  const [form, setForm] = useState({
    name: panel?.name ?? '',
    sku: panel?.sku ?? '',
    texture_url: panel?.texture_url ?? '',
    thumb_url: panel?.thumb_url ?? '',
    price: panel?.price?.toString() ?? '',
    active: panel?.active ?? true,
  })
  const [uploading, setUploading] = useState<'texture' | 'thumb' | null>(null)
  const [saving, setSaving] = useState(false)

  async function uploadFile(file: File, type: 'texture' | 'thumb') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      onError('Только JPG, PNG или WebP')
      return
    }

    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const endpoint = type === 'texture' ? '/admin/panels/upload-texture' : '/admin/accessories/upload-thumb'
      const res = await api.post(endpoint, formData)
      const url = res.data.data.url
      setForm((f) => ({ ...f, [type === 'texture' ? 'texture_url' : 'thumb_url']: url }))
    } catch {
      onError('Ошибка загрузки файла')
    } finally {
      setUploading(null)
    }
  }

  async function handleSave() {
    if (!form.name || !form.texture_url || !form.thumb_url) {
      onError('Заполните название и загрузите текстуры')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : undefined,
      }
      if (panel) {
        await api.put(`/admin/panels/${panel.id}`, payload)
      } else {
        await api.post('/admin/panels', payload)
      }
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      onError(msg || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-medium text-gray-900 mb-5">
          {panel ? 'Редактировать панель' : 'Новая панель'}
        </h3>

        <div className="flex flex-col gap-4">
          <Field label="Название *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Консул А"
            />
          </Field>

          <Field label="SKU">
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className={inputClass}
              placeholder="CONSUL-A"
            />
          </Field>

          <Field label="Цена (₽)">
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
              placeholder="1500"
            />
          </Field>

          <Field label="Текстура (JPG/PNG) *">
            <FileUpload
              url={form.texture_url}
              uploading={uploading === 'texture'}
              accept="image/jpeg,image/png,image/webp"
              onFile={(f) => uploadFile(f, 'texture')}
            />
          </Field>

          <Field label="Миниатюра (JPG/PNG) *">
            <FileUpload
              url={form.thumb_url}
              uploading={uploading === 'thumb'}
              accept="image/jpeg,image/png,image/webp"
              onFile={(f) => uploadFile(f, 'thumb')}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
            />
            Активна (показывать в визуализаторе)
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
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

function FileUpload({
  url, uploading, accept, onFile,
}: {
  url: string
  uploading: boolean
  accept: string
  onFile: (f: File) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {url && (
        <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
      )}
      <label className={`flex-1 flex items-center justify-center h-10 rounded-lg border-2 border-dashed
        border-gray-200 text-xs text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600
        transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? 'Загрузка...' : url ? 'Заменить файл' : 'Выбрать файл'}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]) }}
        />
      </label>
    </div>
  )
}
