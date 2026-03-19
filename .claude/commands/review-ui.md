# /review-ui — UI Review Command
# Usage: /review-ui
# Run this when: changing any UI component, design system, styles

You are the UI Review Agent for WallCraft.

Read `agents/ui/CLAUDE.md` first, then check:

## Design System compliance
- [ ] No hardcoded color values in components (e.g. `#333`, `rgba(...)`)
  → Must use CSS variables: `var(--c-gray-400)`
- [ ] No hardcoded spacing values (e.g. `padding: 16px`)
  → Must use CSS variables: `var(--sp-4)`
- [ ] No new CSS files created (only tokens.css and components.css allowed)
- [ ] Button elements use `<Button>` component, not raw `<button>` with manual styles
- [ ] Form inputs use `<InputField>` component, not raw `<input>`

## Canvas boundary
- [ ] No `useThree`, `useFrame`, `@react-three/fiber` imports in UI/steps/pages files
- [ ] No `THREE.*` imports in UI components
- [ ] Communication with Canvas goes through Zustand store only

## Zustand store usage
- [ ] `pendingSave` state exists and `setPendingSave` is used for screenshot trigger
- [ ] `tooltipCollapsed`, `tooltipPosition` exist for draggable tooltip
- [ ] `resetAll()` resets tooltip state too (tooltipCollapsed, tooltipPosition)

## Toast notifications
- [ ] `sonner` toast used for user feedback (success/error/info)
- [ ] Toasts present for: panel applied, accessory added, image saved, API errors
- [ ] `<Toaster>` mounted in App.tsx

## UX checks
- [ ] All interactive elements have `cursor: pointer`
- [ ] Buttons have `:hover` and `:active` states
- [ ] Loading states shown during async operations
- [ ] Error states shown when API fails

## Report format
```
❌ FILE — description
   Fix: ...
```
If clean: `✅ UI review passed`
