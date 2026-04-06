import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Toast, useToast, textareaClass } from './adminUtils'

// Known page keys with labels
const PAGE_KEYS = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
  { key: 'installation', label: 'Installation' },
  { key: 'partners', label: 'Partners' },
]

type Lang = 'ru' | 'en' | 'am'
type ContentRecord = Record<string, { ru: string; en: string; am: string } | string>

export default function AdminPagesPage() {
  const [pageKey, setPageKey] = useState(PAGE_KEYS[0].key)
  const [content, setContent] = useState<ContentRecord>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lang, setLang] = useState<Lang>('ru')
  const [toast, showToast] = useToast()

  async function loadPage(key: string) {
    setLoading(true)
    try {
      const res = await api.get(`/admin/pages/${key}`)
      setContent((res.data.data?.content as ContentRecord) || {})
    } catch {
      setContent({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage(pageKey)
  }, [pageKey])

  async function handleSave() {
    setSaving(true)
    try {
      await api.put(`/admin/pages/${pageKey}`, { content })
      showToast('Saved')
    } catch {
      showToast('Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  function setField(field: string, val: string) {
    setContent((c) => ({
      ...c,
      [field]:
        typeof c[field] === 'object'
          ? { ...(c[field] as { ru: string; en: string; am: string }), [lang]: val }
          : val,
    }))
  }

  function addField() {
    const name = prompt('Field name (e.g. hero_title, mission_text):')
    if (!name) return
    const isLocale = confirm('Is this a multilingual field (RU/EN/AM)?')
    setContent((c) => ({
      ...c,
      [name]: isLocale ? { ru: '', en: '', am: '' } : '',
    }))
  }

  function removeField(field: string) {
    if (!confirm(`Delete field "${field}"?`)) return
    setContent((c) => {
      const copy = { ...c }
      delete copy[field]
      return copy
    })
  }

  const fields = Object.keys(content)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Pages (CMS)</h2>
        <div className="flex gap-3">
          <button
            onClick={addField}
            className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
          >
            + Field
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — page keys */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {PAGE_KEYS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPageKey(p.key)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors
                  ${pageKey === p.key ? 'bg-gray-900 text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content editor */}
        <div className="flex-1">
          {/* Lang tabs */}
          <div className="flex gap-1 mb-4">
            {(['ru', 'en', 'am'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  lang === l
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 self-center">
              Page: <code className="bg-gray-100 px-1 rounded">{pageKey}</code>
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {fields.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400 text-sm">
                  No fields for this page.
                  <br />
                  <button onClick={addField} className="mt-3 text-gray-600 underline text-xs">
                    Add the first field
                  </button>
                </div>
              )}

              {fields.map((field) => {
                const val = content[field]
                const isLocale = typeof val === 'object' && val !== null && 'ru' in val

                return (
                  <div key={field} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {field}
                        </code>
                        {isLocale && (
                          <span className="text-xs text-gray-400 bg-blue-50 text-blue-500 px-2 py-0.5 rounded">
                            multilang
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeField(field)}
                        className="text-gray-300 hover:text-red-500 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>

                    {isLocale ? (
                      <textarea
                        className={`${textareaClass} h-24`}
                        value={(val as { ru: string; en: string; am: string })[lang] || ''}
                        onChange={(e) => setField(field, e.target.value)}
                        placeholder={`Value in ${lang.toUpperCase()}...`}
                      />
                    ) : (
                      <textarea
                        className={`${textareaClass} h-16`}
                        value={typeof val === 'string' ? val : ''}
                        onChange={(e) => setContent((c) => ({ ...c, [field]: e.target.value }))}
                        placeholder="Value..."
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
