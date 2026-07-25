'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei'
import { DecalGeometry } from 'three-stdlib'
import * as THREE from 'three'
import { X } from 'lucide-react'
import {
  type DesignLayer,
  type DesignSide,
  type ImageDesignLayer,
  composeDesignCanvas,
  loadImage,
  clamp,
  MIN_LAYER_SIZE,
  DESIGN_CANVAS_PX,
} from '@/lib/design-layers'

function garmentUrl(garment: string): string {
  if (garment === 'hoodie') return '/models/hoodie.glb'
  return '/models/tshirt.glb'
}

// A design area's placement, stored in TARGET-MESH-LOCAL space so it stays correct
// no matter how the garment has rotated by the time we read it back.
interface SideAnchor {
  localPosition: THREE.Vector3
  localRight: THREE.Vector3
  localUp: THREE.Vector3
  localNormal: THREE.Vector3
  width: number
  height: number
}

interface WorldAnchor {
  position: THREE.Vector3
  right: THREE.Vector3
  up: THREE.Vector3
  normal: THREE.Vector3
}

interface ProjectedLayer {
  corners: [number, number][]
  facing: boolean
}

// Plain mutable bridge shared between the r3f tree (which knows camera/geometry) and the
// DOM overlay (which renders drag handles outside the canvas). Written every frame from
// inside <Canvas>, read imperatively from outside — kept off React state so neither side
// re-renders at 60fps.
interface Bridge {
  camera: THREE.Camera | null
  canvasEl: HTMLCanvasElement | null
  target: THREE.Object3D | null
  anchors: Partial<Record<DesignSide, SideAnchor>>
  projected: Record<string, ProjectedLayer>
  dragging: boolean
}

function createBridge(): Bridge {
  return { camera: null, canvasEl: null, target: null, anchors: {}, projected: {}, dragging: false }
}

function worldAnchor(anchor: SideAnchor, targetMatrixWorld: THREE.Matrix4): WorldAnchor {
  return {
    position: anchor.localPosition.clone().applyMatrix4(targetMatrixWorld),
    right: anchor.localRight.clone().transformDirection(targetMatrixWorld),
    up: anchor.localUp.clone().transformDirection(targetMatrixWorld),
    normal: anchor.localNormal.clone().transformDirection(targetMatrixWorld),
  }
}

/** Raycasts a screen point onto a side's design plane, returning normalized (0..1) canvas coords. */
function screenToLocal(bridge: Bridge, side: DesignSide, clientX: number, clientY: number): { x: number; y: number } | null {
  const { camera, canvasEl, target } = bridge
  const anchor = bridge.anchors[side]
  if (!camera || !canvasEl || !target || !anchor) return null

  const world = worldAnchor(anchor, target.matrixWorld)
  const rect = canvasEl.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null

  const ndc = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -(((clientY - rect.top) / rect.height) * 2 - 1),
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndc, camera)
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(world.normal, world.position)
  const hit = new THREE.Vector3()
  if (!raycaster.ray.intersectPlane(plane, hit)) return null

  const rel = hit.sub(world.position)
  const lx = rel.dot(world.right)
  const ly = rel.dot(world.up)
  return { x: lx / anchor.width + 0.5, y: 0.5 - ly / anchor.height }
}

const HANDLES: { id: string; dx: -1 | 0 | 1; dy: -1 | 0 | 1; cursor: string }[] = [
  { id: 'nw', dx: -1, dy: -1, cursor: 'nwse-resize' },
  { id: 'n', dx: 0, dy: -1, cursor: 'ns-resize' },
  { id: 'ne', dx: 1, dy: -1, cursor: 'nesw-resize' },
  { id: 'e', dx: 1, dy: 0, cursor: 'ew-resize' },
  { id: 'se', dx: 1, dy: 1, cursor: 'nwse-resize' },
  { id: 's', dx: 0, dy: 1, cursor: 'ns-resize' },
  { id: 'sw', dx: -1, dy: 1, cursor: 'nesw-resize' },
  { id: 'w', dx: -1, dy: 0, cursor: 'ew-resize' },
]

function GarmentMesh({
  url,
  colour,
  layers,
  bridge,
}: {
  url: string
  colour: string
  layers: DesignLayer[]
  bridge: React.MutableRefObject<Bridge>
}) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const groupRef = useRef<THREE.Group>(null)
  const targetRef = useRef<THREE.Mesh | null>(null)
  const decalMeshes = useRef<Partial<Record<DesignSide, THREE.Mesh>>>({})
  const decalTextures = useRef<Partial<Record<DesignSide, THREE.CanvasTexture>>>({})
  const lastComposedLayers = useRef<Partial<Record<DesignSide, DesignLayer[]>>>({})
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const { camera, size, gl } = useThree()

  useEffect(() => {
    const c = new THREE.Color(colour)
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
        mat.color.set(c)
        mat.roughness = 0.75
        mat.metalness = 0.0
        mat.needsUpdate = true
        mesh.material = mat
      }
    })
  }, [cloned, colour])

  useEffect(() => {
    bridge.current.camera = camera
    bridge.current.canvasEl = gl.domElement
  }, [camera, gl, bridge])

  // Locate the paintable mesh and build fixed front/back design areas once per garment load.
  // Both decals are created up front (front + back can now hold artwork simultaneously) and
  // parented to `target` after being converted into its local space, mirroring the technique
  // that keeps the decal itself glued to the mesh through the idle sway rotation below.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    let target: THREE.Mesh | null = null
    group.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh && !target) target = m
    })
    if (!target) return
    const resolvedTarget = target as THREE.Mesh
    targetRef.current = resolvedTarget
    bridge.current.target = resolvedTarget

    const savedRotY = group.rotation.y
    group.rotation.y = 0
    group.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(group)
    const shirtWidth = box.max.x - box.min.x
    const midY = (box.min.y + box.max.y) / 2
    const areaW = shirtWidth * 0.36
    const areaH = areaW * 1.15
    const projDepth = Math.max(areaW, areaH) * 0.5

    const defs: Record<DesignSide, { pos: THREE.Vector3; rot: THREE.Euler }> = {
      front: {
        pos: new THREE.Vector3(0, midY + (box.max.y - midY) * 0.25, box.max.z + 0.01),
        rot: new THREE.Euler(0, 0, 0),
      },
      back: {
        pos: new THREE.Vector3(0, midY - (box.max.y - box.min.y) * 0.05, box.min.z - 0.01),
        rot: new THREE.Euler(0, Math.PI, 0),
      },
    }

    const invWorld = resolvedTarget.matrixWorld.clone().invert()
    const meshes: Partial<Record<DesignSide, THREE.Mesh>> = {}
    const anchors: Partial<Record<DesignSide, SideAnchor>> = {}

    ;(['front', 'back'] as const).forEach((side) => {
      const { pos, rot } = defs[side]
      const right = new THREE.Vector3(1, 0, 0).applyEuler(rot)
      const up = new THREE.Vector3(0, 1, 0).applyEuler(rot)
      const normal = new THREE.Vector3(0, 0, 1).applyEuler(rot)

      anchors[side] = {
        localPosition: pos.clone().applyMatrix4(invWorld),
        localRight: right.clone().transformDirection(invWorld),
        localUp: up.clone().transformDirection(invWorld),
        localNormal: normal.clone().transformDirection(invWorld),
        width: areaW,
        height: areaH,
      }

      const geo = new DecalGeometry(resolvedTarget, pos, rot, new THREE.Vector3(areaW, areaH, projDepth))
      geo.applyMatrix4(invWorld)

      // One persistent texture per side, reused for every edit — redraw the canvas and flip
      // needsUpdate rather than allocating a fresh CanvasTexture (and GPU upload) per keystroke/drag.
      const blankCanvas = document.createElement('canvas')
      blankCanvas.width = DESIGN_CANVAS_PX
      blankCanvas.height = DESIGN_CANVAS_PX
      const tex = new THREE.CanvasTexture(blankCanvas)
      decalTextures.current[side] = tex

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.04,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.renderOrder = 10
      resolvedTarget.add(mesh)
      meshes[side] = mesh
    })

    decalMeshes.current = meshes
    bridge.current.anchors = anchors

    group.rotation.y = savedRotY
    group.updateWorldMatrix(true, true)

    return () => {
      ;(['front', 'back'] as const).forEach((side) => {
        const mesh = meshes[side]
        if (mesh) {
          mesh.parent?.remove(mesh)
          mesh.geometry.dispose()
          ;(mesh.material as THREE.Material).dispose()
          ;(mesh.material as THREE.MeshBasicMaterial).map?.dispose()
        }
      })
      decalTextures.current = {}
      lastComposedLayers.current = {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned])

  // Recomposite each side's canvas texture whenever its layers change.
  useEffect(() => {
    let cancelled = false

    function sameAsLastRun(side: DesignSide, sideLayers: DesignLayer[]): boolean {
      const prev = lastComposedLayers.current[side]
      if (!prev || prev.length !== sideLayers.length) return false
      return prev.every((l, i) => l === sideLayers[i])
    }

    async function run() {
      for (const side of ['front', 'back'] as const) {
        const mesh = decalMeshes.current[side]
        const tex = decalTextures.current[side]
        if (!mesh || !tex) continue

        const sideLayers = layers.filter((l) => l.side === side)
        if (sameAsLastRun(side, sideLayers)) continue

        const urls = Array.from(
          new Set(sideLayers.filter((l): l is ImageDesignLayer => l.type === 'image').map((l) => l.url)),
        )
        const missing = urls.filter((u) => !imageCache.current.has(u))
        if (missing.length) {
          const loaded = await Promise.all(missing.map((u) => loadImage(u).catch(() => null)))
          loaded.forEach((img, i) => {
            if (img) imageCache.current.set(missing[i], img)
          })
        }
        if (cancelled) return

        composeDesignCanvas(sideLayers, imageCache.current, tex.image as HTMLCanvasElement)
        tex.needsUpdate = true
        lastComposedLayers.current[side] = sideLayers
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [layers])

  useFrame(({ clock }) => {
    const group = groupRef.current
    const target = targetRef.current
    if (!group || !target) return

    if (!bridge.current.dragging) {
      group.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.35
    }
    group.updateWorldMatrix(true, true)

    const proj: Record<string, ProjectedLayer> = {}
    ;(['front', 'back'] as const).forEach((side) => {
      const local = bridge.current.anchors[side]
      if (!local) return
      const world = worldAnchor(local, target.matrixWorld)
      const camDir = camera.position.clone().sub(world.position).normalize()
      const facing = world.normal.dot(camDir) > 0.1

      for (const layer of layers) {
        if (layer.side !== side) continue
        const corners = (
          [
            [layer.x - layer.width / 2, layer.y - layer.height / 2],
            [layer.x + layer.width / 2, layer.y - layer.height / 2],
            [layer.x + layer.width / 2, layer.y + layer.height / 2],
            [layer.x - layer.width / 2, layer.y + layer.height / 2],
          ] as [number, number][]
        ).map(([x, y]) => {
          const lx = (x - 0.5) * local.width
          const ly = (0.5 - y) * local.height
          const p = world.position
            .clone()
            .addScaledVector(world.right, lx)
            .addScaledVector(world.up, ly)
            .project(camera)
          return [(p.x * 0.5 + 0.5) * size.width, (1 - (p.y * 0.5 + 0.5)) * size.height] as [number, number]
        })
        proj[layer.id] = { corners, facing }
      }
    })
    bridge.current.projected = proj
  })

  return (
    <group ref={groupRef} scale={1.4} position={[0, -0.1, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

function LayerHandles({
  bridge,
  layers,
  activeSide,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
}: {
  bridge: React.MutableRefObject<Bridge>
  layers: DesignLayer[]
  activeSide: DesignSide
  selectedLayerId: string | null
  onSelectLayer: (id: string | null) => void
  onUpdateLayer: (id: string, patch: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height'>>) => void
  onDeleteLayer: (id: string) => void
}) {
  const outlineRef = useRef<SVGPolygonElement | null>(null)
  const handleRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const deleteRef = useRef<HTMLDivElement | null>(null)
  const ghostRefs = useRef<Map<string, SVGPolygonElement>>(new Map())
  const hintRef = useRef<HTMLDivElement | null>(null)
  const selectedIdRef = useRef<string | null>(null)

  const sideLayers = layers.filter((l) => l.side === activeSide)
  const selected = layers.find((l) => l.id === selectedLayerId) ?? null

  useEffect(() => {
    selectedIdRef.current = selectedLayerId
  }, [selectedLayerId])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const proj = bridge.current.projected
      const selId = selectedIdRef.current

      ghostRefs.current.forEach((el, id) => {
        if (id === selId) {
          el.style.opacity = '0'
          return
        }
        const p = proj[id]
        if (!p) return
        el.setAttribute('points', p.corners.map((c) => c.join(',')).join(' '))
        el.style.opacity = p.facing ? '0.55' : '0'
        el.style.pointerEvents = p.facing ? 'auto' : 'none'
      })

      const p = selId ? proj[selId] : null
      const visible = p?.facing ? '1' : '0'

      if (outlineRef.current) {
        if (p) outlineRef.current.setAttribute('points', p.corners.map((c) => c.join(',')).join(' '))
        outlineRef.current.style.opacity = visible
        outlineRef.current.style.pointerEvents = p?.facing ? 'auto' : 'none'
      }

      if (p) {
        const [nw, ne, se, sw] = p.corners
        const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
        const positions: Record<string, [number, number]> = {
          nw, ne, se, sw, n: mid(nw, ne), e: mid(ne, se), s: mid(se, sw), w: mid(sw, nw),
        }
        handleRefs.current.forEach((el, hid) => {
          const pos = positions[hid]
          if (!pos) return
          el.style.transform = `translate(${pos[0]}px, ${pos[1]}px) translate(-50%, -50%)`
          el.style.opacity = visible
          el.style.pointerEvents = p.facing ? 'auto' : 'none'
        })
        if (deleteRef.current) {
          deleteRef.current.style.transform = `translate(${ne[0]}px, ${ne[1]}px) translate(-50%, -50%)`
          deleteRef.current.style.opacity = visible
          deleteRef.current.style.pointerEvents = p.facing ? 'auto' : 'none'
        }
      } else {
        handleRefs.current.forEach((el) => {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        })
        if (deleteRef.current) {
          deleteRef.current.style.opacity = '0'
          deleteRef.current.style.pointerEvents = 'none'
        }
      }

      if (hintRef.current) hintRef.current.style.opacity = selId && p && !p.facing ? '1' : '0'

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [bridge])

  function beginMove(e: ReactPointerEvent<SVGPolygonElement>) {
    if (!selected) return
    e.stopPropagation()
    e.preventDefault()
    const side = selected.side
    const start = screenToLocal(bridge.current, side, e.clientX, e.clientY)
    if (!start) return
    const offsetX = selected.x - start.x
    const offsetY = selected.y - start.y
    bridge.current.dragging = true

    const onMove = (ev: PointerEvent) => {
      const cur = screenToLocal(bridge.current, side, ev.clientX, ev.clientY)
      if (!cur) return
      onUpdateLayer(selected.id, {
        x: clamp(cur.x + offsetX, 0, 1),
        y: clamp(cur.y + offsetY, 0, 1),
      })
    }
    const onUp = () => {
      bridge.current.dragging = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function beginResize(e: ReactPointerEvent<HTMLDivElement>, dx: -1 | 0 | 1, dy: -1 | 0 | 1) {
    if (!selected) return
    e.stopPropagation()
    e.preventDefault()
    const side = selected.side
    const fixedX = dx === 0 ? null : dx > 0 ? selected.x - selected.width / 2 : selected.x + selected.width / 2
    const fixedY = dy === 0 ? null : dy > 0 ? selected.y - selected.height / 2 : selected.y + selected.height / 2
    bridge.current.dragging = true

    const onMove = (ev: PointerEvent) => {
      const cur = screenToLocal(bridge.current, side, ev.clientX, ev.clientY)
      if (!cur) return
      const patch: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height'>> = {}
      if (fixedX !== null) {
        const left = Math.min(fixedX, cur.x)
        const right = Math.max(fixedX, cur.x)
        patch.width = Math.max(MIN_LAYER_SIZE, right - left)
        patch.x = (left + right) / 2
      }
      if (fixedY !== null) {
        const top = Math.min(fixedY, cur.y)
        const bottom = Math.max(fixedY, cur.y)
        patch.height = Math.max(MIN_LAYER_SIZE, bottom - top)
        patch.y = (top + bottom) / 2
      }
      onUpdateLayer(selected.id, patch)
    }
    const onUp = () => {
      bridge.current.dragging = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {sideLayers.map((l) => (
          <polygon
            key={l.id}
            ref={(el) => {
              if (el) ghostRefs.current.set(l.id, el)
              else ghostRefs.current.delete(l.id)
            }}
            points=""
            fill="#EBF3EC"
            fillOpacity={0.001}
            stroke="#EBF3EC"
            strokeWidth={1}
            strokeDasharray="4 3"
            style={{ opacity: 0, transition: 'opacity 150ms ease', cursor: 'pointer', pointerEvents: 'auto', touchAction: 'none' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              onSelectLayer(l.id)
            }}
          />
        ))}
        <polygon
          ref={outlineRef}
          points=""
          fill="#1B3D2A"
          fillOpacity={0.001}
          stroke="#3A7D44"
          strokeWidth={1.5}
          style={{ opacity: 0, transition: 'opacity 150ms ease', cursor: 'move', pointerEvents: 'none', touchAction: 'none' }}
          onPointerDown={beginMove}
        />
      </svg>

      {HANDLES.map((h) => (
        <div
          key={h.id}
          ref={(el) => {
            if (el) handleRefs.current.set(h.id, el)
            else handleRefs.current.delete(h.id)
          }}
          onPointerDown={(e) => beginResize(e, h.dx, h.dy)}
          className="absolute top-0 left-0 w-3 h-3 bg-white border border-espresso shadow-sm"
          style={{ opacity: 0, pointerEvents: 'none', cursor: h.cursor, touchAction: 'none' }}
        />
      ))}

      <div
        ref={deleteRef}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (selected) onDeleteLayer(selected.id)
        }}
        className="absolute top-0 left-0 w-5 h-5 rounded-full bg-white border border-rule shadow-sm flex items-center justify-center text-espresso hover:border-red-400 hover:text-red-500 transition-colors"
        style={{ opacity: 0, pointerEvents: 'none', touchAction: 'none' }}
      >
        <X size={10} strokeWidth={2} />
      </div>

      <div
        ref={hintRef}
        className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-espresso/90 text-cream font-inter text-[9px] tracking-nav uppercase rounded-full transition-opacity duration-150 whitespace-nowrap"
        style={{ opacity: 0 }}
      >
        Rotate the model to see this side
      </div>
    </div>
  )
}

export default function GarmentViewer({
  garment,
  colour,
  layers = [],
  activeSide = 'front',
  selectedLayerId = null,
  onSelectLayer = () => {},
  onUpdateLayer = () => {},
  onDeleteLayer = () => {},
}: {
  garment: string
  colour: string
  layers?: DesignLayer[]
  activeSide?: DesignSide
  selectedLayerId?: string | null
  onSelectLayer?: (id: string | null) => void
  onUpdateLayer?: (id: string, patch: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height'>>) => void
  onDeleteLayer?: (id: string) => void
}) {
  const url = garmentUrl(garment)
  const bridge = useRef<Bridge>(createBridge())

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0.2, 2.4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        {/* Warm studio lighting optimised for light background */}
        <ambientLight intensity={1.1} color="#FFF8F0" />
        <directionalLight position={[4, 6, 4]} intensity={1.6} color="#FFFAF4" castShadow />
        <directionalLight position={[-3, 3, -2]} intensity={0.5} color="#F0EBE3" />
        <directionalLight position={[0, -2, 2]} intensity={0.2} color="#E8E4DC" />
        <GarmentMesh key={url} url={url} colour={colour} layers={layers} bridge={bridge} />
        <ContactShadows position={[0, -0.55, 0]} opacity={0.18} blur={3} far={1} color="#1B3D2A" />
        <OrbitControls
          enablePan={false}
          minDistance={1.4}
          maxDistance={4.5}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
      <LayerHandles
        bridge={bridge}
        layers={layers}
        activeSide={activeSide}
        selectedLayerId={selectedLayerId}
        onSelectLayer={onSelectLayer}
        onUpdateLayer={onUpdateLayer}
        onDeleteLayer={onDeleteLayer}
      />
    </div>
  )
}
