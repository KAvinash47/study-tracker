import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// Floating shape that reacts to speed and color props
function FloatingShape({ position, color, baseSpeed, args, speedMultiplier }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const effectiveSpeed = baseSpeed * speedMultiplier;
    meshRef.current.rotation.x = time * effectiveSpeed * 0.5;
    meshRef.current.rotation.y = time * effectiveSpeed;
    meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusKnotGeometry args={args || [0.35, 0.1, 100, 16]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        metalness={0.8}
        clearcoat={1.0}
        transmission={0.4}
        thickness={0.5}
      />
    </mesh>
  );
}

// Particle system whose rotation speed adapts to the study state
function ParticleSystem({ count = 80, speedMultiplier }) {
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
    pointsRef.current.rotation.y = time * 0.02 * speedMultiplier;
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
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.5}
      />
    </points>
  );
}

export default function Background3D({ streak = 0, studiedToday = false }) {
  // Speed multiplier based on streak: base 1.0, increases by 20% per streak day, max 2.5x
  const speedMultiplier = Math.min(1.0 + streak * 0.2, 2.5);
  
  // Muted colors if not studied today, bright glowing neon colors if studied today
  const primaryColor = studiedToday ? "#fbbf24" : "#4b5563"; // Gold vs Muted Gray
  const secondaryColor = studiedToday ? "#ec4899" : "#3b82f6"; // Neon Pink vs Muted Blue
  const tertiaryColor = studiedToday ? "#a855f7" : "#1f2937"; // Purple vs Dark Slate

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={studiedToday ? 0.6 : 0.3} />
        
        {/* Colorful directional lights */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={studiedToday ? 2.0 : 0.8} 
          color={primaryColor} 
        />
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={studiedToday ? 1.5 : 0.5} 
          color={secondaryColor} 
        />
        
        <ParticleSystem count={100} speedMultiplier={speedMultiplier} />
        
        <Float speed={1.5 * speedMultiplier} rotationIntensity={1} floatIntensity={1}>
          <FloatingShape 
            position={[-2.2, 1.2, -1]} 
            color={primaryColor} 
            baseSpeed={0.3} 
            speedMultiplier={speedMultiplier}
            args={[0.3, 0.09, 100, 16]}
          />
        </Float>
        
        <Float speed={2 * speedMultiplier} rotationIntensity={1.2} floatIntensity={1}>
          <FloatingShape 
            position={[2.5, -1.3, -0.5]} 
            color={secondaryColor} 
            baseSpeed={0.25} 
            speedMultiplier={speedMultiplier}
            args={[0.35, 0.1, 100, 16]}
          />
        </Float>

        <Float speed={1 * speedMultiplier} rotationIntensity={0.8} floatIntensity={0.8}>
          <FloatingShape 
            position={[-2.5, -1.5, -2]} 
            color={tertiaryColor} 
            baseSpeed={0.2} 
            speedMultiplier={speedMultiplier}
            args={[0.25, 0.08, 80, 12]}
          />
        </Float>
        
        <Stars 
          radius={100} 
          depth={50} 
          count={studiedToday ? 400 : 150} 
          factor={studiedToday ? 5 : 2} 
          fade 
          speed={1.5 * speedMultiplier} 
        />
      </Canvas>
    </div>
  );
}
