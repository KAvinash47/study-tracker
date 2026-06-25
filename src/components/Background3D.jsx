import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// A floating rotating torus knot with a metallic glass shader
function FloatingShape({ position, color, speed, args }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * speed * 0.5;
    meshRef.current.rotation.y = time * speed;
    // Slowly hover up and down
    meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusKnotGeometry args={args || [0.4, 0.15, 120, 16]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.9}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.6}
        thickness={0.5}
        ior={1.5}
      />
    </mesh>
  );
}

// Interactive particles reacting to mouse
function ParticleSystem({ count = 80 }) {
  const pointsRef = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 12;
    }
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8b5cf6"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

export default function Background3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#c084fc" />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[0, 3, 0]} intensity={1.2} color="#ec4899" />
        
        <ParticleSystem count={120} />
        
        <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
          <FloatingShape position={[-2.2, 1.2, -1]} color="#a855f7" speed={0.4} args={[0.3, 0.1, 100, 16]} />
        </Float>
        <Float speed={2} rotationIntensity={1.2} floatIntensity={1}>
          <FloatingShape position={[2.5, -1.3, -0.5]} color="#06b6d4" speed={0.3} args={[0.35, 0.1, 100, 16]} />
        </Float>
        <Float speed={1} rotationIntensity={0.8} floatIntensity={0.8}>
          <FloatingShape position={[-2.5, -1.5, -2]} color="#ec4899" speed={0.2} args={[0.25, 0.08, 80, 12]} />
        </Float>
        
        <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1.2} />
      </Canvas>
    </div>
  );
}
