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
  LocaleTabs,
  useLocaleLang,
  emptyLocale,
} from './adminUtils'
import type { TeamMember } from '../../types'

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [toast, showToast] = useToast()

  async function load() {
    try {
      setItems((await api.get('/admin/team')).data.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete member?')) return
    try {
      await api.delete(`/admin/team/${id}`)
      showToast('Deleted')
      load()
    } catch {
      showToast('Error', 'err')
    }
  }

  return (
    <PageShell
      title="Team"
      addLabel="+ Add"
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
                Member
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Role (RU)
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Order
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
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="w-9 h-9 rounded-full object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                        {item.name[0]}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{item.role?.ru || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.sort_order}</td>
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
                  No team members.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast toast={toast} />
      {modalOpen && (
        <TeamModal
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

function TeamModal({
  item,
  onClose,
  onSaved,
  onError,
}: {
  item: TeamMember | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const [lang, setLang] = useLocaleLang()
  const [form, setForm] = useState({
    name: item?.name ?? '',
    role: item?.role ?? emptyLocale(),
    photo_url: item?.photo_url ?? '',
    bio: item?.bio ?? emptyLocale(),
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePhoto(file: File) {
    setUploading(true)
    const url = await uploadImage(file, '/admin/team/upload-photo', onError)
    if (url) setForm((f) => ({ ...f, photo_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.role.ru) {
      onError('Name and role (RU) are required')
      return
    }
    setSaving(true)
    try {
      await (item ? api.put(`/admin/team/${item.id}`, form) : api.post('/admin/team', form))
      onSaved()
    } catch (err) {
      onError(apiErr(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={item ? 'Edit member' : 'New member'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
        </div>

        <Field label="Photo">
          <FileUpload url={form.photo_url || ''} uploading={uploading} onFile={handlePhoto} />
        </Field>

        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Role and biography</p>
          <LocaleTabs lang={lang} onChange={setLang} />
          <div className="flex flex-col gap-3">
            <Field label={`Role (${lang.toUpperCase()}) *`}>
              <input
                className={inputClass}
                value={form.role[lang]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: { ...f.role, [lang]: e.target.value } }))
                }
                placeholder="Head Designer"
              />
            </Field>
            <Field label={`Bio (${lang.toUpperCase()})`}>
              <textarea
                className={`${textareaClass} h-24`}
                value={form.bio[lang]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: { ...f.bio, [lang]: e.target.value } }))
                }
              />
            </Field>
          </div>
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
