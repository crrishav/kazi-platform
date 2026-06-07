'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { DecalGeometry } from 'three-stdlib'
import * as THREE from 'three'

function garmentUrl(garment: string): string {
  if (garment === 'hoodie') return '/models/hoodie.glb'
  return '/models/tshirt.glb'
}

function GarmentMesh({
  url,
  colour,
  logoUrl,
  placement,
}: {
  url: string
  colour: string
  logoUrl?: string
  placement?: string
}) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const ref = useRef<THREE.Group>(null)
  const decalRef = useRef<THREE.Mesh | null>(null)
  const loadedTex = useRef<THREE.Texture | null>(null)
  const pendingTex = useRef<THREE.Texture | null>(null)

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
    clearDecal()
    loadedTex.current = null
    pendingTex.current = null
    if (!logoUrl) return

    const loader = new THREE.TextureLoader()
    loader.load(
      logoUrl,
      (tex) => {
        tex.needsUpdate = true
        loadedTex.current = tex
        pendingTex.current = tex
      },
      undefined,
      (err) => console.warn('logo load failed', err),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoUrl])

  useEffect(() => {
    if (!loadedTex.current) return
    clearDecal()
    pendingTex.current = loadedTex.current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement])

  function clearDecal() {
    if (decalRef.current) {
      decalRef.current.parent?.remove(decalRef.current)
      decalRef.current.geometry.dispose()
      decalRef.current = null
    }
  }

  useFrame(({ clock }) => {
    if (!ref.current) return
    const rotY = Math.sin(clock.elapsedTime * 0.25) * 0.35
    ref.current.rotation.y = rotY

    if (!pendingTex.current) return
    const tex = pendingTex.current
    pendingTex.current = null

    let target: THREE.Mesh | null = null
    ref.current.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh && !target) target = m
    })
    if (!target) return

    ref.current.rotation.y = 0
    ref.current.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(ref.current)
    const shirtWidth = box.max.x - box.min.x
    const logoSize = shirtWidth * 0.24
    const projDepth = (box.max.z - box.min.z) * 2 + 0.5
    const midY = (box.min.y + box.max.y) / 2

    let wPos: THREE.Vector3
    let wRot: THREE.Euler
    let finalTex = tex

    if (placement === 'back') {
      const backY = midY - (box.max.y - box.min.y) * 0.05
      wPos = new THREE.Vector3(0, backY, box.min.z - 0.01)
      wRot = new THREE.Euler(0, Math.PI, 0)
      finalTex = tex.clone()
      finalTex.wrapS = THREE.RepeatWrapping
      finalTex.repeat.set(-1, 1)
      finalTex.offset.set(1, 0)
      finalTex.needsUpdate = true
    } else {
      const chestY = midY + (box.max.y - midY) * 0.25
      wPos = new THREE.Vector3(0, chestY, box.max.z + 0.01)
      wRot = new THREE.Euler(0, 0, 0)
    }

    const size = new THREE.Vector3(logoSize, logoSize, projDepth)
    const decalGeo = new DecalGeometry(target, wPos, wRot, size)

    const invWorld = (target as THREE.Mesh).matrixWorld.clone().invert()
    decalGeo.applyMatrix4(invWorld)

    const mat = new THREE.MeshBasicMaterial({
      map: finalTex,
      transparent: true,
      alphaTest: 0.04,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    })

    const decalMesh = new THREE.Mesh(decalGeo, mat)
    decalMesh.renderOrder = 10
    ;(target as THREE.Mesh).add(decalMesh)
    decalRef.current = decalMesh

    ref.current.rotation.y = rotY
    ref.current.updateWorldMatrix(true, true)
  })

  return (
    <group ref={ref} scale={1.4} position={[0, -0.1, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

export default function GarmentViewer({
  garment,
  colour,
  logoUrl,
  placement,
}: {
  garment: string
  colour: string
  logoUrl?: string
  placement?: string
}) {
  const url = garmentUrl(garment)
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.4], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      {/* Warm studio lighting optimised for light background */}
      <ambientLight intensity={1.1} color="#FFF8F0" />
      <directionalLight position={[4, 6, 4]}  intensity={1.6} color="#FFFAF4" castShadow />
      <directionalLight position={[-3, 3, -2]} intensity={0.5} color="#F0EBE3" />
      <directionalLight position={[0, -2, 2]}  intensity={0.2} color="#E8E4DC" />
      <GarmentMesh key={url} url={url} colour={colour} logoUrl={logoUrl} placement={placement} />
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.18}
        blur={3}
        far={1}
        color="#1B3D2A"
      />
      <OrbitControls
        enablePan={false}
        minDistance={1.4}
        maxDistance={4.5}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  )
}
