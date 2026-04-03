import { useState } from 'react'
import { toast as sonnerToast } from 'sonner'
import api from '../../lib/api'

// ── Shared CSS ─────────────────────────────────────────────────
export const inputClass = `w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900
  focus:outline-none focus:ring-2 focus:ring-gray-200`

export const textareaClass = `w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900
  focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none`

// ── Field wrapper ──────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

// ── File upload ────────────────────────────────────────────────
export function FileUpload({
  url, uploading, accept, onFile,
}: {
  url: string
  uploading: boolean
  accept?: string
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
        {uploading ? 'Загрузка...' : url ? 'Заменить' : 'Выбрать файл'}
        <input
          type="file"
          accept={accept || 'image/jpeg,image/png,image/webp'}
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]) }}
        />
      </label>
    </div>
  )
}

// ── Upload helper ──────────────────────────────────────────────
export async function uploadImage(
  file: File,
  endpoint: string,
  onError: (msg: string) => void
): Promise<string | null> {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) { onError('Только JPG, PNG или WebP'); return null }
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.post(endpoint, fd)
    return res.data.data.url as string
  } catch {
    onError('Ошибка загрузки файла')
    return null
  }
}

// ── Locale tabs for LocalizedString fields ─────────────────────
type Lang = 'ru' | 'en' | 'am'

export function LocaleTabs({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex gap-1 mb-3">
      {(['ru', 'en', 'am'] as Lang[]).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            lang === l
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function useLocaleLang(): [Lang, (l: Lang) => void] {
  return useState<Lang>('ru')
}

// ── Modal wrapper ──────────────────────────────────────────────
export function Modal({ title, onClose, children, wide = false }: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} p-6 my-8`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Save / Cancel buttons ──────────────────────────────────────
export function ModalActions({ onClose, saving }: { onClose: () => void; saving: boolean }) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
      >
        Отмена
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  )
}

// ── Toast — powered by sonner (Toaster in App.tsx) ────────────
// Toast component is a no-op; sonner renders its own portal
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Toast(_props: { toast: unknown }) { return null }

export function useToast(): [null, (msg: string, type?: 'ok' | 'err') => void] {
  const show = (msg: string, type: 'ok' | 'err' = 'ok') => {
    if (type === 'err') sonnerToast.error(msg)
    else sonnerToast.success(msg)
  }
  return [null, show]
}

// ── Status badge ───────────────────────────────────────────────
export function StatusBadge({ active, labelOn = 'Активен', labelOff = 'Скрыт' }: {
  active: boolean
  labelOn?: string
  labelOff?: string
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      ${active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? labelOn : labelOff}
    </span>
  )
}

// ── Table action buttons ───────────────────────────────────────
export function TableActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={onEdit}
        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
      >
        Изменить
      </button>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
      >
        Удалить
      </button>
    </div>
  )
}

// ── Page shell ─────────────────────────────────────────────────
export function PageShell({
  title, addLabel, onAdd, loading, children,
}: {
  title: string
  addLabel: string
  onAdd: () => void
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          {addLabel}
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  )
}

// ── Localized string default ───────────────────────────────────
export const emptyLocale = () => ({ ru: '', en: '', am: '' })

// ── Extract API error message ──────────────────────────────────
export function apiErr(err: unknown): string {
  return (err as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message || 'Ошибка сохранения'
}
