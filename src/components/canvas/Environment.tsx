import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnvironmentProps {
  progress: number;
  isFinale: boolean;
}

export const InstallationEnvironment: React.FC<EnvironmentProps> = ({ progress, isFinale }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const lightGroupRef = useRef<THREE.Group>(null);

  // Generate floating golden dust particles
  const [positions, scales, speeds, phases] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Cylinder distribution around logo
      const radius = 1.5 + Math.random() * 8.0;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = (Math.random() - 0.5) * 6.0;
      const y = (Math.random() - 0.5) * 8.0;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      scl[i] = 0.02 + Math.random() * 0.05;
      spd[i] = 0.15 + Math.random() * 0.35;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return [pos, scl, spd, phs];
  }, []);

  // Golden particle texture with soft radial glow
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 240, 180, 1)');
    grad.addColorStop(0.3, 'rgba(255, 190, 60, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 140, 20, 0.25)');
    grad.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      const count = array.length / 3;

      for (let i = 0; i < count; i++) {
        // Slow gentle upward and swirl drift
        const idx = i * 3;
        array[idx + 1] += speeds[i] * 0.008; // Y upwards
        array[idx] += Math.sin(t * 0.5 + phases[i]) * 0.003; // slight X sway
        array[idx + 2] += Math.cos(t * 0.4 + phases[i]) * 0.003; // slight Z sway

        // Wrap around bounds
        if (array[idx + 1] > 5.5) {
          array[idx + 1] = -5.5;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Gentle breathing of ambient volumetric light
    if (lightGroupRef.current) {
      lightGroupRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  const ambientIntensity = 0.35 + progress * 0.45 + (isFinale ? 0.4 : 0);
  const warmLightIntensity = 1.2 + progress * 1.5 + (isFinale ? 2.0 : 0);

  return (
    <>
      {/* Background color is deep midnight black */}
      <color attach="background" args={['#030308']} />
      <fog attach="fog" args={['#030308', 8, 22]} />

      {/* Atmospheric lighting */}
      <ambientLight intensity={ambientIntensity} color="#ffdfa0" />

      <group ref={lightGroupRef}>
        {/* Warm key light from top-front */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={warmLightIntensity}
          color="#ffeedd"
          castShadow={false}
        />

        {/* Soft cool rim light from behind for silhouette depth */}
        <directionalLight
          position={[-4, 2, -5]}
          intensity={0.6 + progress * 0.3}
          color="#1e2c4d"
        />

        {/* Golden warm bottom reflection */}
        <pointLight
          position={[0, -3.5, 2.5]}
          intensity={0.8 + progress * 1.2}
          distance={10}
          color="#ffaa33"
        />

        {/* Center warm ambient pool */}
        <pointLight
          position={[0, 0, 1.5]}
          intensity={0.5 + progress * 1.8}
          distance={8}
          color="#ffb74d"
        />
      </group>

      {/* Floating golden dust particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          map={particleTexture}
          transparent={true}
          opacity={0.75 + progress * 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color={isFinale ? '#fff2cc' : '#ffcf70'}
        />
      </points>
    </>
  );
};

