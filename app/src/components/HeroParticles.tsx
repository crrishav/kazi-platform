"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 60;

const vertexShader = `
  attribute float aOpacity;
  attribute float aSize;
  varying float vOpacity;

  void main() {
    vec3 p = position;
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying float vOpacity;

  float circle(vec2 uv, float r) {
    return 1.0 - smoothstep(r - 0.01, r + 0.01, length(uv - vec2(0.5)));
  }

  const vec3 COLOR = vec3(1.0, 0.97, 0.94);

  void main() {
    vec2 uv = gl_PointCoord;
    float shape = circle(uv, 0.5);
    if (shape < 0.01) discard;
    gl_FragColor = vec4(COLOR, vOpacity * shape * 0.6);
  }
`;

export default function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const rafRef = useRef<number>(0);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const phasesRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // Particle geometry
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    velocitiesRef.current = velocities;
    phasesRef.current = phases;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      positions[i * 3 + 2] = 0;
      opacities[i] = 0.1 + Math.random() * 0.2;
      sizes[i] = 1.5 + Math.random() * 2.5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.0003;
      velocities[i * 3 + 1] = 0.0002 + Math.random() * 0.0004;
      velocities[i * 3 + 2] = 0;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation
    const clock = new THREE.Clock();
    clockRef.current = clock;

    const animate = () => {
      const t = clock.getElapsedTime();

      (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = t;

      const posArray = particles.geometry.attributes.position.array as Float32Array;
      const velArray = velocities;
      const phaseArray = phases;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        posArray[idx] += velArray[idx] + Math.sin(t * 0.3 + phaseArray[i]) * 0.0001;
        posArray[idx + 1] += velArray[idx + 1];

        if (posArray[idx + 1] > 1.0) {
          posArray[idx + 1] = -1.0;
          posArray[idx] = (Math.random() - 0.5) * 2.0;
        }

        if (posArray[idx] > 1.0 || posArray[idx] < -1.0) {
          velArray[idx] *= -1;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Resize handler
    const onResize = () => {
      const heroEl = containerRef.current;
      if (!heroEl) return;
      const w = heroEl.clientWidth;
      const h = heroEl.clientHeight;
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
