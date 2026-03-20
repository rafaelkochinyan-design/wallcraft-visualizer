/**
 * useUrlState.ts
 * Syncs visualizer state with URL params.
 *
 * URL example: /?w=3.0&h=2.7&c=%23f0ede4&p0=KON-A
 *
 * Works without react-router — just window.history.replaceState
 */

import { useEffect, useRef } from 'react'
import { useVisualizerStore } from '../store/visualizer'

const DEBOUNCE_MS = 600

export function useUrlState() {
  const store = useVisualizerStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  // On mount: read URL → apply to store
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const params = new URLSearchParams(window.location.search)

    const w = parseFloat(params.get('w') ?? '')
    const h = parseFloat(params.get('h') ?? '')
    if (!isNaN(w) && !isNaN(h) && w >= 0.5 && w <= 10 && h >= 0.5 && h <= 10) {
      store.setWallSize(w, h)
    }

    const c = params.get('c')
    if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
      store.setWallColor(c)
    }

    const p0sku = params.get('p0')
    if (p0sku) {
      const tryApply = () => {
        const panels = useVisualizerStore.getState().availablePanels
        if (panels.length === 0) { setTimeout(tryApply, 300); return }
        const p = panels.find(x => x.sku === p0sku || x.id === p0sku)
        if (p) store.setPanelInSlot(p, 0)
      }
      setTimeout(tryApply, 200)
    }
  }, []) // eslint-disable-line

  // On store change: update URL (debounced)
  useEffect(() => {
    if (!initializedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const { wallWidth, wallHeight, wallColor, selectedPanels } = store

      const params = new URLSearchParams()
      params.set('w', wallWidth.toFixed(1))
      params.set('h', wallHeight.toFixed(1))
      params.set('c', wallColor)

      const p0 = selectedPanels[0]
      if (p0) params.set('p0', p0.sku ?? p0.id)

      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }, DEBOUNCE_MS)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [store.wallWidth, store.wallHeight, store.wallColor, store.selectedPanels])
}
