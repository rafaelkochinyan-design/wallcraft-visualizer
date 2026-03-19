# Agent: UI
# Scope: frontend/src/components/ui/, steps/, pages/VisualizerPage.tsx

## Моя зона ответственности
- `frontend/src/components/ui/`
- `frontend/src/components/steps/`
- `frontend/src/pages/VisualizerPage.tsx`
- `frontend/src/styles/` (tokens.css, components.css)

Я НЕ трогаю `components/scene/`, `backend/`, admin pages.

---

## Design System — ОБЯЗАН следовать

### Единственные CSS файлы
```
frontend/src/styles/tokens.css     ← переменные
frontend/src/styles/components.css ← классы
```

### Правила использования
```tsx
// ✅ Правильно
<button className="btn btn-primary btn-lg btn-full">
<div className="card">
<div className="card-dark">
<input className="input">

// ❌ Неправильно
<button style={{ backgroundColor: '#0a0a0a', height: '52px' }}>
<div style={{ backdropFilter: 'blur(20px)', background: 'rgba(...)' }}>
```

### CSS переменные для inline styles
```tsx
// Когда нужен inline style — только через переменные:
style={{ color: 'var(--c-gray-400)' }}
style={{ borderRadius: 'var(--r-full)' }}
style={{ transition: 'all var(--dur-fast) var(--ease)' }}

// НЕ хардкодить:
style={{ color: '#9a9890' }}  // ❌
style={{ borderRadius: '9999px' }}  // ❌
```

---

## Компоненты (готовые, использовать не переизобретать)

### Button
```tsx
import { Button } from '../ui/Button'
<Button variant="primary|secondary|ghost|danger" size="sm|md|lg" full onClick={...}>
  Текст
</Button>
```

### InputField
```tsx
import { InputField } from '../ui/InputField'
<InputField
  label="Ширина" suffix="м" error={errs.w}
  value={w} type="number" min={0.5} max={10}
  onChange={v => setW(v)}
/>
```

### TooltipWrapper (draggable + collapsible)
```tsx
import { TooltipWrapper } from '../ui/TooltipWrapper'
// Оборачивает любой тултип
<TooltipWrapper>
  <TooltipMain />
</TooltipWrapper>
```

### PanelCounter, LoadingScreen, SaveSceneWirer
```tsx
import { PanelCounter, LoadingScreen, SaveSceneWirer } from '../ui/Utils'

// LoadingScreen: fullscreen лоадер с лого Wallcraft
// PanelCounter: правый нижний угол, показывает кол-во/цену
// SaveSceneWirer: монтируется ВНУТРИ <Canvas>, слушает store.pendingSave
```

---

## Граница Canvas — я работаю СНАРУЖИ

```tsx
// ✅ Мои компоненты — обычный React DOM
function TooltipMain() {
  const { resetAll, setTooltipMode } = useVisualizerStore()
  return <div className="card-dark">...</div>
}

// ❌ НЕ использовать в моих компонентах:
import { useThree } from '@react-three/fiber'  // только внутри Canvas!
import * as THREE from 'three'                  // не нужен в DOM
```

**Общение с Canvas — только через Zustand:**
```tsx
// Тригер скриншота:
const { setPendingSave } = useVisualizerStore()
<button onClick={() => setPendingSave(true)}>Сохранить</button>
// SaveSceneWirer внутри Canvas подхватывает и делает screenshot
```

---

## Sonner Toast

```tsx
import { toast } from 'sonner'

// Когда использовать:
toast('Панель выбрана')           // нейтральное действие
toast.success('Сохранено!')       // успех
toast.error('Ошибка загрузки')   // ошибка (из useTenant при fail)
toast('Добавлен: ' + name)       // аксессуар добавлен на стену
```

**Когда НЕ использовать:**
- Деструктивные действия без последствий (удаление аксессуара с возможностью отмены)
- Слишком частые действия (перемещение аксессуара)

---

## VisualizerPage.tsx структура

```tsx
<div style={{ width:'100vw', height:'100vh', position:'relative' }}>
  <Scene />                    // 3D fullscreen
  <div class="progress-bar">  // прогресс 3px сверху
  {/* Logo top-center */}
  {step === 'size'         && <WallSizeStep />}
  {step === 'panel_select' && <PanelSelectStep />}
  {step === 'interactive'  && (
    <TooltipWrapper>
      {tooltipMode === null      && <TooltipMain />}
      {tooltipMode === 'settings' && <TooltipSettings />}
    </TooltipWrapper>
  )}
  <PanelCounter />             // правый нижний
</div>
```

---

## Анимации UI (motion/react)

```tsx
// Для переходов между шагами (если установлено motion):
import { motion, AnimatePresence } from 'motion/react'

<AnimatePresence mode="wait">
  {step === 'size' && (
    <motion.div key="size"
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-12 }}
      transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
    >
      <WallSizeStep />
    </motion.div>
  )}
</AnimatePresence>

// Если motion не установлен — использовать CSS класс:
className="anim-fadeup"  // определён в components.css
```

---

## Чего НЕ делать
- Хардкодить цвета в компонентах
- Создавать новые CSS файлы
- Использовать `useThree`, `useFrame`, THREE.* в этих компонентах
- Дублировать логику кнопок — только `<Button>` компонент
- Добавлять бизнес-логику в UI — только вызовы store actions
