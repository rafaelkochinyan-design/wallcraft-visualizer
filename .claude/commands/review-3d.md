# /review-3d — 3D Scene Review Command
# Usage: /review-3d
# Run this when: changing any scene/ component, adding GLB models, touching lighting

You are the 3D Scene Review Agent for WallCraft.

Read `agents/3d-scene/CLAUDE.md` first, then check:

## Canvas boundary violations
- [ ] No `useThree()` or `useFrame()` called outside a `<Canvas>` component
- [ ] No `<div>`, `<button>`, or HTML elements directly inside Canvas (must use `<Html>` from drei)
- [ ] No CSS classes or Tailwind applied to R3F mesh/group components

## Performance
- [ ] Panel tiling uses `InstancedMesh` — NOT individual `<mesh>` per tile
- [ ] `texture.clone()` followed by `needsUpdate = true`
- [ ] No `new THREE.*()` objects created inside render — use `useMemo` or `useRef`
- [ ] GLB models use `useGLTF` (cached) not `useLoader(GLTFLoader, ...)`

## Canvas config
- [ ] `preserveDrawingBuffer: true` in Canvas gl props (required for screenshot)
- [ ] `<SoftShadows>` present for natural shadow quality
- [ ] `<SaveSceneWirer />` mounted inside Canvas

## Drag & animations
- [ ] Accessory drag uses `@use-gesture/react` useDrag
- [ ] Accessory appearance uses `@react-spring/three` spring (not instant pop)
- [ ] Wall color change uses `animated.meshStandardMaterial` for smooth transition
- [ ] Raycasting uses `wallPlane = new THREE.Plane(Vector3(0,0,1), 0)` — NOT mesh raycasting

## Report format
```
❌ FILE — description of problem
   Fix: how to fix it
```
If clean: `✅ 3D review passed`
