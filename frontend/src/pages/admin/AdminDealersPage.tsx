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
  inputClass,
  useToast,
  apiErr,
} from './adminUtils'

interface Dealer {
  id: string
  name: string
  country: string
  region: string | null
  city: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  map_url: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  active: boolean
  sort_order: number
}

const empty = (): Omit<Dealer, 'id'> => ({
  name: '',
  country: '',
  region: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  map_url: '',
  lat: null,
  lng: null,
  logo_url: '',
  active: true,
  sort_order: 0,
})

export default function AdminDealersPage() {
  const [items, setItems] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Dealer | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try {
      setItems((await api.get('/admin/dealers')).data.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Удалить дилера?')) return
    try {
      await api.delete(`/admin/dealers/${id}`)
      showToast('Удалено')
      load()
    } catch {
      showToast('Ошибка', 'err')
    }
  }

  return (
    <PageShell
      title="Дилеры"
      addLabel="+ Добавить"
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
                Компания
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Страна
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Город
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Телефон
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.country}</td>
                <td className="px-4 py-3 text-gray-500">{item.city}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.phone || '—'}</td>
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
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Нет дилеров.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && (
        <DealerModal
          item={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            load()
            showToast('Сохранено')
          }}
          onError={(m) => showToast(m, 'err')}
        />
      )}
    </PageShell>
  )
}

function DealerModal({
  item,
  onClose,
  onSaved,
  onError,
}: {
  item: Dealer | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const [form, setForm] = useState(item ?? empty())
  const [saving, setSaving] = useState(false)
  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.country || !form.city) {
      onError('Название, страна и город обязательны')
      return
    }
    setSaving(true)
    try {
      await (item ? api.put(`/admin/dealers/${item.id}`, form) : api.post('/admin/dealers', form))
      onSaved()
    } catch (err) {
      onError(apiErr(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={item ? 'Редактировать дилера' : 'Новый дилер'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название *">
            <input className={inputClass} value={form.name} onChange={f('name')} />
          </Field>
          <Field label="Страна *">
            <input className={inputClass} value={form.country} onChange={f('country')} />
          </Field>
          <Field label="Регион">
            <input className={inputClass} value={form.region || ''} onChange={f('region')} />
          </Field>
          <Field label="Город *">
            <input className={inputClass} value={form.city} onChange={f('city')} />
          </Field>
          <Field label="Телефон">
            <input className={inputClass} value={form.phone || ''} onChange={f('phone')} />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email || ''}
              onChange={f('email')}
            />
          </Field>
          <Field label="Сайт">
            <input
              className={inputClass}
              value={form.website || ''}
              onChange={f('website')}
              placeholder="https://..."
            />
          </Field>
          <Field label="Ссылка на карту">
            <input
              className={inputClass}
              value={form.map_url || ''}
              onChange={f('map_url')}
              placeholder="https://maps.google.com/..."
            />
          </Field>
        </div>
        <Field label="Адрес">
          <input className={inputClass} value={form.address || ''} onChange={f('address')} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            className="rounded"
          />
          Активен
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
