# /new-page — Add a New Public Page

## Usage
`/new-page "page name" "description"`

## Steps

1. **Plan** — use `/plan` to design the page layout and data requirements
2. **API** — check if backend route exists. If not, add to `content.ts`
3. **Types** — check `types/index.ts` for needed interfaces
4. **Build page** — use `/frontend-design` with these constraints:
   - Wrap in PublicLayout (already done via App.tsx routing)
   - Use CSS variables ONLY — no Tailwind, no hardcoded colors
   - Mobile-first responsive design
   - Use `usePublicData` hook for data fetching
   - Use `useLocalized` hook for LocalizedString fields
   - Support dark mode via `[data-theme="dark"]` in `public.css`
5. **Add route** — add to `App.tsx` (lazy import + route)
6. **Add nav link** — add to `PublicNavbar.tsx` links array if needed
7. **Review** — run `/review`
8. **Build check** — `npx vite build`

## Template

```tsx
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { YourType } from '../types'

export default function YourPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data, loading } = usePublicData<YourType[]>('/api/your-endpoint')

  return (
    <div className="pub-section">
      <h1 className="pub-section-title">{t('your.title')}</h1>
      <p className="pub-section-subtitle">{t('your.subtitle')}</p>
      {/* content */}
    </div>
  )
}
```
