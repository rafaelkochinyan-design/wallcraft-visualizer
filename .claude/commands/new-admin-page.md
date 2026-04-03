# /new-admin-page — Build a Real Admin Page

## Usage
`/new-admin-page "entity name"`

## Steps

1. **Plan** — what fields does this entity have? Which are LocalizedString?
2. **Backend** — verify CRUD routes exist in `adminContent.ts`
3. **Build page** — use `/frontend-design` with these constraints:
   - Uses Tailwind (admin.css is already imported via AdminLayout)
   - Follows `PanelsPage.tsx` pattern exactly:
     * State: `items[]`, `modalOpen`, `editing` (item or null), `loading`
     * `useEffect` → `api.get('/admin/entity')` → setState
     * Table with columns: name, status, actions (edit/delete)
     * Modal with form → `api.post` or `api.put` → refetch
     * Delete → `api.delete` → filter from state
   - Reuse `Button.tsx` and `InputField.tsx` from `components/ui/`
   - For **LocalizedString fields**: render 3 tabs (RU / EN / AM) in the modal form
   - For **image uploads**: use same pattern as PanelsPage texture upload
   - For **sort_order**: show drag handle or up/down arrows

4. **Route** — route already exists in `App.tsx` (was added as stub)
5. **Review** — `/review`
6. **Build check** — `npx vite build`

## LocalizedString Tab Pattern

```tsx
const [lang, setLang] = useState<'ru'|'en'|'am'>('ru')

// In modal form:
<div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
  {(['ru','en','am'] as const).map(l => (
    <button key={l} className={lang === l ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
      onClick={() => setLang(l)}>{l.toUpperCase()}</button>
  ))}
</div>
<InputField
  label="Title"
  value={form.title[lang]}
  onChange={v => setForm(f => ({ ...f, title: { ...f.title, [lang]: v } }))}
/>
```

## Image Upload Pattern

```tsx
// Same as PanelsPage upload:
const handleUpload = async (file: File, field: string) => {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post(`/admin/entity/upload-${field}`, fd)
  setForm(f => ({ ...f, [`${field}_url`]: res.data.data.url }))
}
```
