# Agent: UI / Tooltip

## My scope
`/frontend/src/components/ui/` и `/frontend/src/components/steps/`

## State Machine

```
STEP: size
  └─ WallSizeStep (center overlay)
       Inputs: ширина (0.5-10m), высота (0.5-10m)
       Button "Далее" → setStep('panel_select')

STEP: panel_select
  └─ PanelSelectStep (bottom overlay)
       Panel cards: click to select (max 2, toggle)
       Selected panels highlighted with border
       Button "Применить" (active only if ≥1 panel) → setStep('interactive')
       Button "← Назад" → setStep('size')

STEP: interactive
  └─ TooltipMain (left side, absolute)
       "Убрать всё" → resetAll()  [goes back to step 'size']
       "Настроить" → setTooltipMode('settings')

  └─ TooltipSettings (left side, replaces Main when mode='settings')
       Tab "Свет":
         Слайдер Угол (0-360) → setLightAngle()
         Слайдер Высота (0-90) → setLightElevation()
         Color picker → setWallColor()
       Tab "Позиция":
         Текст-подсказка про orbit controls
       Tab "Аксессуары":
         Grid типов (розетка, выключатель, тв, лампа, картина)
         При выборе типа → список моделей
         Клик модели → placeAccessory()
         Список размещённых с кнопкой ×
       Button "← Назад" → setTooltipMode(null) [показывает TooltipMain]
```

## Tooltip Visual Style

```css
/* Glassmorphism tooltip */
background: rgba(15, 15, 15, 0.75);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 16px;
color: white;

/* Positioning */
position: absolute;
left: 24px;
top: 50%;
transform: translateY(-50%);
z-index: 10;
```

Tailwind классы:
```
TooltipMain: "absolute left-6 top-1/2 -translate-y-1/2 z-10 w-44 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 p-4 flex flex-col gap-3"

TooltipSettings: "absolute left-6 top-1/2 -translate-y-1/2 z-10 w-64 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 p-4"
```

## WallSizeStep

```tsx
// Centered overlay card
// Класс: "absolute inset-0 flex items-center justify-center z-20"
// Card: "bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-80"

// Два инпута: ширина + высота
// Валидация: число, 0.5 ≤ x ≤ 10
// Показывать в метрах с подписью "м"
// Кнопка "Далее" disabled если невалидно
```

## PanelSelectStep

```tsx
// Bottom sheet overlay
// Класс: "absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4"
// Card: "bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10"

// Горизонтальный скролл карточек панелей
// Каждая карточка: thumbnail 80×80px + название
// Выбранная: border-2 border-white или border тенантского primary_color
// Счётчик выбранных: "Выбрано: 2/2"
// Кнопка "Применить" — primary button с primary_color тенанта
```

## Color Picker для цвета стены

```tsx
// В tab "Свет" TooltipSettings
// Несколько preset свотчей: белый, светло-серый, бежевый, тёмно-серый, чёрный
// + input type="color" для произвольного
// При изменении → setWallColor(hex)

const WALL_COLOR_PRESETS = [
  { label: 'Белый', value: '#f8f8f6' },
  { label: 'Светло-серый', value: '#e0e0dc' },
  { label: 'Бежевый', value: '#e8e0d0' },
  { label: 'Серый', value: '#9a9a96' },
  { label: 'Тёмно-серый', value: '#3a3a38' },
  { label: 'Чёрный', value: '#1a1a1a' },
]
```

## CRITICAL RULES

1. Эти компоненты — HTML over canvas, НЕ внутри `<Canvas>`
2. НЕ импортировать THREE или @react-three/* здесь
3. НЕ читать напрямую из DOM — только Zustand store
4. Все анимации — CSS transitions, не JS
5. Кнопка "Убрать всё" должна быть визуально деструктивной (red-tinted или ghost)
6. Всегда показывать "← Назад" в TooltipSettings и в PanelSelectStep
