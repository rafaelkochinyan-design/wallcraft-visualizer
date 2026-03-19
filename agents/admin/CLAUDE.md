# Agent: Admin
# Scope: frontend/src/pages/admin/

## Моя зона
Только `frontend/src/pages/admin/`.
Я НЕ трогаю визуализатор, backend, scene компоненты.

---

## Страницы

```
AdminLoginPage.tsx    ← /admin/login (без auth)
AdminLayout.tsx       ← sidebar nav + auth guard
PanelsPage.tsx        ← CRUD панелей + upload текстур
AccessoriesPage.tsx   ← CRUD аксессуаров + upload .glb
StoreSettingsPage.tsx ← logo, primary_color, name
```

---

## Auth pattern

```typescript
// Токен в ПАМЯТИ (не localStorage):
import { tokenStore } from '../../lib/api'
tokenStore.set(accessToken)   // после login
tokenStore.get()              // при запросах (автоматически через api.ts)
tokenStore.clear()            // при logout

// AdminLayout: проверяет auth на mount
useEffect(() => {
  api.get('/admin/auth/me')
    .then(() => setChecking(false))
    .catch(() => navigate('/admin/login'))
}, [])
```

---

## API calls

```typescript
import api from '../../lib/api'
// api.ts автоматически добавляет:
// - Authorization: Bearer <token>
// - ?store=<tenantSlug> (в dev)

// Все запросы к admin:
api.get('/admin/panels')
api.post('/admin/panels', payload)
api.put('/admin/panels/:id', payload)
api.delete('/admin/panels/:id')

// Upload файлов:
const fd = new FormData()
fd.append('file', file)
const res = await api.post('/admin/panels/upload-texture', fd)
const url = res.data.data.url
```

---

## Upload правила

```typescript
// Перед upload валидировать на клиенте:

// Текстуры (jpg/png/webp):
const allowed = ['image/jpeg', 'image/png', 'image/webp']
if (!allowed.includes(file.type)) { toast.error('Только JPG, PNG, WebP'); return }
if (file.size > 5 * 1024 * 1024) { toast.error('Максимум 5MB'); return }

// 3D модели (.glb):
const ext = file.name.split('.').pop()?.toLowerCase()
if (ext !== 'glb') { toast.error('Только .glb файлы'); return }
if (file.size > 20 * 1024 * 1024) { toast.error('Максимум 20MB'); return }

// Логотип:
if (file.size > 2 * 1024 * 1024) { toast.error('Максимум 2MB'); return }
```

---

## Toast в admin

```typescript
import { toast } from 'sonner'

// После успешных операций:
toast.success('Панель сохранена')
toast.success('Аксессуар добавлен')
toast.success('Настройки обновлены')

// При ошибках:
toast.error(err?.response?.data?.error?.message || 'Ошибка сохранения')

// Confirmation перед удалением:
if (!confirm('Удалить панель?')) return
// потом delete request
```

---

## Стили для admin

Admin pages используют Tailwind (legacy) — это нормально.
Не нужно мигрировать на CSS tokens, если работает.

Если добавляешь новые компоненты — можно использовать как Tailwind так и tokens.css.

---

## Паттерн CRUD страницы

```
1. useEffect → load() → setState(data)
2. Таблица с данными
3. "+ Добавить" button → открывает Modal
4. Modal: form + file upload + save/cancel
5. После save: закрыть modal + load() снова
6. Удаление: confirm() → api.delete → load()
7. Toast на каждое действие
```

---

## Чего НЕ делать
- НЕ хранить токен в localStorage
- НЕ делать прямые запросы минуя api.ts (axios instance с interceptors)
- НЕ показывать пустой экран при загрузке — всегда spinner
- НЕ использовать useThree/THREE в admin компонентах
