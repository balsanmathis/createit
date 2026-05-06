'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Main sphere with wireframe
    const sphereGeometry = new THREE.SphereGeometry(1.8, 32, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c6dfa,
      emissive: 0x4a3fbf,
      emissiveIntensity: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Inner solid sphere
    const innerGeo = new THREE.SphereGeometry(1.5, 64, 64)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x1a1540,
      emissive: 0x7c6dfa,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.6,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerSphere)

    // Particle system
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2.2 + Math.random() * 2.5

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const t = Math.random()
      colors[i * 3] = 0.48 + t * 0.28
      colors[i * 3 + 1] = 0.43 + t * 0.2
      colors[i * 3 + 2] = 0.98
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Floating orbs
    const orbData: { mesh: THREE.Mesh; speed: number; offset: number }[] = []
    const orbColors = [0x7c6dfa, 0xa78bfa, 0x6366f1, 0x8b5cf6]
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.12, 16, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: orbColors[i % orbColors.length],
        emissive: orbColors[i % orbColors.length],
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
      })
      const orb = new THREE.Mesh(geo, mat)
      const angle = (i / 5) * Math.PI * 2
      orb.position.set(
        Math.cos(angle) * (2.5 + Math.random()),
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * (2.5 + Math.random())
      )
      scene.add(orb)
      orbData.push({ mesh: orb, speed: 0.3 + Math.random() * 0.5, offset: i * 1.2 })
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x7c6dfa, 0.4)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x7c6dfa, 2, 10)
    pointLight1.position.set(3, 3, 3)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xa78bfa, 1.5, 10)
    pointLight2.position.set(-3, -2, 2)
    scene.add(pointLight2)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Resize
    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      sphere.rotation.y = t * 0.08
      sphere.rotation.x = t * 0.04
      innerSphere.rotation.y = -t * 0.05
      particles.rotation.y = t * 0.02

      // Mouse parallax
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.03
      camera.lookAt(scene.position)

      // Animate orbs
      orbData.forEach(({ mesh, speed, offset }) => {
        mesh.position.y += Math.sin(t * speed + offset) * 0.005
        mesh.rotation.y = t * speed
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
