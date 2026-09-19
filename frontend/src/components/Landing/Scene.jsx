import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';

export function FloatingBlob({ position, color, speed, distort, scale }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
    mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.8}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export function ParticleField() {
  const points = useRef();
  const count = 600;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    points.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6366f1" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export function FloatingRing({ position, color, scale }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.3;
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 48]} />
        <MeshWobbleMaterial
          color={color}
          factor={0.3}
          speed={1.5}
          metalness={0.7}
          roughness={0.15}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#818cf8" />
      <pointLight position={[5, -3, 5]} intensity={0.6} color="#c084fc" />
      <FloatingBlob position={[-2.5, 0.5, 0]} color="#6366f1" speed={0.6} distort={0.45} scale={1.3} />
      <FloatingBlob position={[2.8, -0.8, -2]} color="#8b5cf6" speed={0.4} distort={0.35} scale={0.9} />
      <FloatingBlob position={[0.5, 1.8, -1]} color="#a78bfa" speed={0.5} distort={0.5} scale={0.7} />
      <FloatingRing position={[-1.5, -1.5, -1]} color="#c084fc" scale={0.5} />
      <FloatingRing position={[3, 1.5, -3]} color="#6366f1" scale={0.35} />
      <ParticleField />
    </>
  );
}