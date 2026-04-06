/**
 * PanelTiling.tsx — РЕАЛИСТИЧНЫЙ рендеринг гипсовых панелей
 *
 * ИЗМЕНЕНИЯ vs предыдущей версии:
 * 1. PBR материал: normalMap + aoMap + roughnessMap
 * 2. Правильные параметры для гипса: roughness=0.92, metalness=0
 * 3. PlaneGeometry вместо BoxGeometry для фронтальной грани
 * 4. normalScale управляется из props
 * 5. Fallback: если normal map не загрузился — работает без него
 * 6. useTexture с error handling
 *
 * ПОЧЕМУ НЕРЕАЛИСТИЧНО БЫЛО:
 * - BoxGeometry + только albedo = плоская картинка
 * - Без normal map свет не "видит" рельеф
 * - roughness=0.80 слишком глянцевый для гипса
 */

import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useVisualizerStore } from '../../store/visualizer'
import type { Panel } from '../../types'

// Размер панели в метрах
const PANEL_W = 0.5
const PANEL_H = 0.5
const PANEL_D = 0.019 // 19мм толщина

// PlaneGeometry для фронтальной грани — лучше UV чем BoxGeometry
// Небольшая детализация (4x4) для корректной интерполяции normal map
const panelGeoPlane = new THREE.PlaneGeometry(PANEL_W, PANEL_H, 4, 4)

// BoxGeometry как fallback (при необходимости показать торцы)
const panelGeoBox = new THREE.BoxGeometry(PANEL_W, PANEL_H, PANEL_D)

interface PanelTilingProps {
  wallWidth: number
  wallHeight: number
  panels: (Panel | null)[]
  isPreview?: boolean // hover preview — чуть прозрачнее
  normalStrength?: number // интенсивность normal map (default 1.5)
}

export function PanelTiling({
  wallWidth,
  wallHeight,
  panels,
  isPreview = false,
  normalStrength = 1.5,
}: PanelTilingProps) {
  return (
    <Suspense fallback={null}>
      <PanelTilingInner
        wallWidth={wallWidth}
        wallHeight={wallHeight}
        panels={panels}
        isPreview={isPreview}
        normalStrength={normalStrength}
      />
    </Suspense>
  )
}

function PanelTilingInner({
  wallWidth,
  wallHeight,
  panels,
  isPreview,
  normalStrength,
}: PanelTilingProps) {
  const panelA = panels[0]
  const panelB = panels[1]

  const urlA = panelA?.texture_url ?? '/textures/consul_a.jpg'
  const urlB = panelB?.texture_url ?? urlA

  // Проверяем наличие normal map (опционально)
  const normalUrlA = urlA.replace('.jpg', '_normal.jpg').replace('.png', '_normal.jpg')
  const normalUrlB = urlB.replace('.jpg', '_normal.jpg').replace('.png', '_normal.jpg')
  const aoUrlA = urlA.replace('.jpg', '_ao.jpg').replace('.png', '_ao.jpg')
  const aoUrlB = urlB.replace('.jpg', '_ao.jpg').replace('.png', '_ao.jpg')

  return (
    <PanelLayer
      wallWidth={wallWidth}
      wallHeight={wallHeight}
      albedoUrlA={urlA}
      albedoUrlB={urlB}
      normalUrlA={normalUrlA}
      normalUrlB={normalUrlB}
      aoUrlA={aoUrlA}
      aoUrlB={aoUrlB}
      hasTwoPatterns={!!panelB}
      isPreview={isPreview ?? false}
      normalStrength={normalStrength!}
    />
  )
}

/* ── Основной слой тайлинга ───────────────────────────────────── */
interface LayerProps {
  wallWidth: number
  wallHeight: number
  albedoUrlA: string
  albedoUrlB: string
  normalUrlA: string
  normalUrlB: string
  aoUrlA: string
  aoUrlB: string
  hasTwoPatterns: boolean
  isPreview: boolean
  normalStrength: number
}

function PanelLayer({
  wallWidth,
  wallHeight,
  albedoUrlA,
  albedoUrlB,
  normalUrlA,
  normalUrlB,
  aoUrlA,
  aoUrlB,
  hasTwoPatterns,
  isPreview,
  normalStrength,
}: LayerProps) {
  // Загружаем albedo (обязательно)
  const texA = useTexture(albedoUrlA)
  const texB = useTexture(hasTwoPatterns ? albedoUrlB : albedoUrlA)

  // Пробуем загрузить normal maps (если файлы существуют)
  const [hasNormalA, setHasNormalA] = useState(false)
  const [hasNormalB, setHasNormalB] = useState(false)
  const [normalTexA, setNormalTexA] = useState<THREE.Texture | null>(null)
  const [normalTexB, setNormalTexB] = useState<THREE.Texture | null>(null)
  const [aoTexA, setAoTexA] = useState<THREE.Texture | null>(null)
  const [aoTexB, setAoTexB] = useState<THREE.Texture | null>(null)

  // Lazy load normal maps с fallback
  useEffect(() => {
    const loader = new THREE.TextureLoader()

    loader.load(
      normalUrlA,
      (t) => {
        t.colorSpace = THREE.LinearSRGBColorSpace
        setNormalTexA(t)
        setHasNormalA(true)
      },
      undefined,
      () => {
        /* normal map не найден — используем без него */
      }
    )
    loader.load(
      aoUrlA,
      (t) => {
        t.colorSpace = THREE.LinearSRGBColorSpace
        setAoTexA(t)
      },
      undefined,
      () => {}
    )

    if (hasTwoPatterns) {
      loader.load(
        normalUrlB,
        (t) => {
          t.colorSpace = THREE.LinearSRGBColorSpace
          setNormalTexB(t)
          setHasNormalB(true)
        },
        undefined,
        () => {}
      )
      loader.load(
        aoUrlB,
        (t) => {
          t.colorSpace = THREE.LinearSRGBColorSpace
          setAoTexB(t)
        },
        undefined,
        () => {}
      )
    }
  }, [normalUrlA, normalUrlB, aoUrlA, aoUrlB, hasTwoPatterns])

  // Настраиваем albedo текстуры
  useEffect(() => {
    ;[texA, texB].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(1, 1)
      t.needsUpdate = true
    })
  }, [texA, texB])

  // Вариант Б — поворот 180° для шахматного паттерна
  const texBRot = useMemo(() => {
    const t = texB.clone()
    t.rotation = Math.PI
    t.center.set(0.5, 0.5)
    t.needsUpdate = true
    return t
  }, [texB])

  const normalTexBRot = useMemo(() => {
    if (!normalTexB) return null
    const t = normalTexB.clone()
    t.rotation = Math.PI
    t.center.set(0.5, 0.5)
    t.needsUpdate = true
    return t
  }, [normalTexB])

  // Сетка панелей
  const cols = Math.ceil(wallWidth / PANEL_W)
  const rows = Math.ceil(wallHeight / PANEL_H)
  const count = cols * rows

  const refA = useRef<THREE.InstancedMesh>(null)
  const refB = useRef<THREE.InstancedMesh>(null)

  // Расставляем матрицы
  useEffect(() => {
    const mx = new THREE.Matrix4()
    const posA: [number, number, number][] = []
    const posB: [number, number, number][] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -wallWidth / 2 + PANEL_W / 2 + col * PANEL_W
        const y = PANEL_H / 2 + row * PANEL_H
        // Шахматный паттерн: нечётные (row+col) → вариант Б
        if (hasTwoPatterns && (row + col) % 2 === 1) {
          posB.push([x, y, 0])
        } else {
          posA.push([x, y, 0])
        }
      }
    }

    if (refA.current) {
      posA.forEach((p, i) => {
        mx.setPosition(...p)
        refA.current!.setMatrixAt(i, mx)
      })
      refA.current.count = posA.length
      refA.current.instanceMatrix.needsUpdate = true
    }
    if (refB.current && posB.length > 0) {
      posB.forEach((p, i) => {
        mx.setPosition(...p)
        refB.current!.setMatrixAt(i, mx)
      })
      refB.current.count = posB.length
      refB.current.instanceMatrix.needsUpdate = true
    }
  }, [cols, rows, wallWidth, wallHeight, hasTwoPatterns])

  // PBR материал — ГЛАВНОЕ ИЗМЕНЕНИЕ
  // Гипс: очень матовый (roughness ~0.92), не металл, белый/кремовый
  const matA = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // ── Albedo ──────────────────────────────────────────
        map: texA,
        color: '#ffffff', // НЕ МЕНЯТЬ — цвет в map, не здесь

        // ── PBR параметры для гипса ──────────────────────────
        roughness: 0.92, // матовый (не глянцевый)
        metalness: 0, // не металл

        // ── Normal map (если загрузился) ─────────────────────
        ...(hasNormalA && normalTexA
          ? {
              normalMap: normalTexA,
              normalScale: new THREE.Vector2(normalStrength, normalStrength),
            }
          : {}),

        // ── AO map (если загрузился) ─────────────────────────
        ...(aoTexA
          ? {
              aoMap: aoTexA,
              aoMapIntensity: 0.7,
            }
          : {}),

        // ── Preview состояние ───────────────────────────────
        transparent: isPreview,
        opacity: isPreview ? 0.72 : 1,
      }),
    [texA, normalTexA, aoTexA, hasNormalA, normalStrength, isPreview]
  )

  const matB = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texBRot,
        color: '#ffffff',
        roughness: 0.92,
        metalness: 0,
        ...(hasNormalB && normalTexBRot
          ? {
              normalMap: normalTexBRot,
              normalScale: new THREE.Vector2(normalStrength, normalStrength),
            }
          : {}),
        ...(aoTexB
          ? {
              aoMap: aoTexB,
              aoMapIntensity: 0.7,
            }
          : {}),
        transparent: isPreview,
        opacity: isPreview ? 0.72 : 1,
      }),
    [texBRot, normalTexBRot, aoTexB, hasNormalB, normalStrength, isPreview]
  )

  // Обновляем материал при изменении normal map (async load)
  useEffect(() => {
    if (refA.current && hasNormalA) {
      refA.current.material = matA
    }
  }, [hasNormalA, matA])

  return (
    <>
      {/* Вариант А (основной паттерн) */}
      <instancedMesh ref={refA} args={[panelGeoPlane, matA, count]} castShadow receiveShadow />
      {/* Вариант Б (чередующийся паттерн повёрнутый 180°) */}
      {hasTwoPatterns && (
        <instancedMesh ref={refB} args={[panelGeoPlane, matB, count]} castShadow receiveShadow />
      )}
    </>
  )
}
