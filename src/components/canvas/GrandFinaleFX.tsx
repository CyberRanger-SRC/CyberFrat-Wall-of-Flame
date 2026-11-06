import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GrandFinaleFXProps {
  active: boolean;
}

export const GrandFinaleFX: React.FC<GrandFinaleFXProps> = ({ active }) => {
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const shockwave2Ref = useRef<THREE.Mesh>(null);
  const fireworksPointsRef = useRef<THREE.Points>(null);

  // Particles for celebratory firework fountains
  const [particles, velocities] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.0;
      pos[i * 3 + 1] = -4.0 + Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.0;

      // Upward burst velocities with spreading fountain
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      vel[i * 3] = Math.cos(angle) * (0.4 + Math.random() * 0.8);
      vel[i * 3 + 1] = speed;
      vel[i * 3 + 2] = Math.sin(angle) * (0.4 + Math.random() * 0.8);
    }

    return [pos, vel];
  }, []);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime();

    // 1. Expanding circular wave of golden light
    if (shockwaveRef.current) {
      const cycle = (t * 0.45) % 1.0;
      const scale = 0.5 + cycle * 14.0;
      shockwaveRef.current.scale.set(scale, scale, 1);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(cycle * Math.PI) * 0.65;
    }

    if (shockwave2Ref.current) {
      const cycle2 = (t * 0.45 + 0.5) % 1.0;
      const scale2 = 0.5 + cycle2 * 14.0;
      shockwave2Ref.current.scale.set(scale2, scale2, 1);
      const mat2 = shockwave2Ref.current.material as THREE.MeshBasicMaterial;
      mat2.opacity = Math.sin(cycle2 * Math.PI) * 0.45;
    }

    // 2. Rising golden sparks / celebratory stream
    if (fireworksPointsRef.current) {
      const posAttr = fireworksPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      const count = array.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        array[idx] += velocities[idx] * 0.012;
        array[idx + 1] += velocities[idx + 1] * 0.015; // Gravity slowdown / ascent
        array[idx + 2] += velocities[idx + 2] * 0.012;

        // Reset if reached ceiling
        if (array[idx + 1] > 6.0) {
          array[idx + 1] = -4.5;
          array[idx] = (Math.random() - 0.5) * 4.0;
          array[idx + 2] = (Math.random() - 0.5) * 3.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Primary Expanding Light Shockwave */}
      <mesh ref={shockwaveRef} position={[0, 0, -0.05]}>
        <ringGeometry args={[0.92, 1.0, 64]} />
        <meshBasicMaterial
          color="#ffe082"
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary Staggered Shockwave */}
      <mesh ref={shockwave2Ref} position={[0, 0, -0.06]}>
        <ringGeometry args={[0.88, 1.0, 64]} />
        <meshBasicMaterial
          color="#ffb300"
          transparent={true}
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Celebratory golden firework particles */}
      <points ref={fireworksPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#fff6cc"
          transparent={true}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

