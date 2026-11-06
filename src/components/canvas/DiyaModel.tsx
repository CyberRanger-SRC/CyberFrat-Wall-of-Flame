import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DiyaData } from '../../types';

interface DiyaModelProps {
  data: DiyaData;
  position: [number, number, number];
  isSelected: boolean;
  isNewlyAdded?: boolean;
  onSelect: (diya: DiyaData) => void;
}

export const DiyaModel: React.FC<DiyaModelProps> = ({
  data,
  position,
  isSelected,
  isNewlyAdded = false,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameCoreRef = useRef<THREE.Mesh>(null);
  const flameOuterRef = useRef<THREE.Mesh>(null);
  const flameLightRef = useRef<THREE.PointLight>(null);
  const sparksRef = useRef<THREE.Points>(null);

  const [hovered, setHovered] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(isNewlyAdded ? 0.01 : 1.0);

  // Materials based on brass / antique gold / copper
  const brassMaterial = useMemo(() => {
    let baseColor = 0xd4af37; // Royal brass
    if (data.metalColor === 'antique-gold') baseColor = 0xc59d28;
    if (data.metalColor === 'copper') baseColor = 0xc87d55;

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness: 0.28,
      metalness: 0.86,
      emissive: new THREE.Color(0x3d2503),
      emissiveIntensity: 0.2,
    });
  }, [data.metalColor]);

  // Oil pool material (glossy dark golden liquid)
  const oilMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x5a3d10),
      roughness: 0.1,
      metalness: 0.5,
      emissive: new THREE.Color(0x221300),
    });
  }, []);

  // Cotton wick material
  const wickMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1510),
      roughness: 0.9,
      metalness: 0.1,
      emissive: new THREE.Color(0x441100),
      emissiveIntensity: 0.3,
    });
  }, []);

  // Procedural sparks around the flame tip
  const sparkData = useMemo(() => {
    const count = 5;
    const pos = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.06;
      pos[i * 3 + 1] = 0.14 + Math.random() * 0.12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
      life[i] = Math.random();
      speed[i] = 0.4 + Math.random() * 0.6;
    }
    return { pos, life, speed, count };
  }, []);

  // Procedural organic flame teardrop shape using LatheGeometry
  const flameOuterGeometry = useMemo(() => {
    const points = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 (bottom) to 1 (top tip)
      // Teardrop profile: wider at lower third (t = 0.28), tapering to zero at top
      const r = Math.sin(t * Math.PI) * Math.pow(1.0 - t, 0.4) * 0.075;
      const y = t * 0.26;
      points.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(points, 16);
  }, []);

  const flameInnerGeometry = useMemo(() => {
    const points = [];
    const segments = 10;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const r = Math.sin(t * Math.PI) * Math.pow(1.0 - t, 0.45) * 0.045;
      const y = t * 0.18;
      points.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(points, 14);
  }, []);

  // Diya base/bowl sculpted geometry using Lathe
  const diyaBowlGeometry = useMemo(() => {
    const points = [];
    // Foot base
    points.push(new THREE.Vector2(0.0, 0.0));
    points.push(new THREE.Vector2(0.08, 0.01));
    points.push(new THREE.Vector2(0.09, 0.025));
    // Stem neck
    points.push(new THREE.Vector2(0.06, 0.04));
    // Flared bowl belly
    points.push(new THREE.Vector2(0.14, 0.07));
    points.push(new THREE.Vector2(0.18, 0.10));
    // Pinched rim edge
    points.push(new THREE.Vector2(0.175, 0.12));
    points.push(new THREE.Vector2(0.15, 0.115));
    // Inner cavity (oil reservoir)
    points.push(new THREE.Vector2(0.12, 0.09));
    points.push(new THREE.Vector2(0.03, 0.065));
    points.push(new THREE.Vector2(0.0, 0.065));

    return new THREE.LatheGeometry(points, 24);
  }, []);

  // Unique phase offset based on diya id for organic desynchronized flickering
  const phaseOffset = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < data.id.length; i++) {
      hash = (hash << 5) - hash + data.id.charCodeAt(i);
    }
    return Math.abs(hash % 1000) / 1000 * Math.PI * 2;
  }, [data.id]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.8 + phaseOffset;

    // Smooth entry scale
    if (scaleFactor < 1.0) {
      setScaleFactor((prev) => Math.min(1.0, prev + 0.05));
    }

    // Flame natural flicker & organic shape modulation
    if (flameOuterRef.current && flameCoreRef.current) {
      // Harmonic noise combination for natural flame flicker
      const flicker1 = Math.sin(t * 3.5) * 0.08;
      const flicker2 = Math.cos(t * 7.1) * 0.05;
      const flicker3 = Math.sin(t * 11.3) * 0.03;
      const totalFlicker = 1.0 + flicker1 + flicker2 + flicker3;

      // Slight flame sway (wind drift)
      const swayX = Math.sin(t * 1.8) * 0.08;
      const swayZ = Math.cos(t * 2.2) * 0.05;

      flameOuterRef.current.scale.set(
        1.0 + (flicker2 - flicker1) * 0.5,
        totalFlicker,
        1.0 + (flicker1 - flicker3) * 0.5
      );
      flameOuterRef.current.rotation.z = swayX;
      flameOuterRef.current.rotation.x = swayZ;

      flameCoreRef.current.scale.set(
        0.95 + flicker2 * 0.4,
        totalFlicker * 0.98,
        0.95 + flicker1 * 0.4
      );
      flameCoreRef.current.rotation.z = swayX * 0.8;
      flameCoreRef.current.rotation.x = swayZ * 0.8;

      // Dynamic local point light pulse
      if (flameLightRef.current) {
        const baseIntensity = isSelected ? 2.5 : hovered ? 1.8 : 1.2;
        flameLightRef.current.intensity = baseIntensity * totalFlicker;
      }
    }

    // Update rising sparks
    if (sparksRef.current) {
      const posAttr = sparksRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      for (let i = 0; i < sparkData.count; i++) {
        array[i * 3 + 1] += 0.003 * sparkData.speed[i]; // rise Y
        array[i * 3] += (Math.sin(t * 4 + i) * 0.001); // sway X
        if (array[i * 3 + 1] > 0.32) {
          array[i * 3 + 1] = 0.13;
          array[i * 3] = (Math.random() - 0.5) * 0.04;
          array[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const overallScale = (hovered ? 1.18 : isSelected ? 1.25 : 1.0) * scaleFactor;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[overallScale, overallScale, overallScale]}
      // Tilt slightly so flame stands upwards and faces viewer nicely
      rotation={[0.32, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. SOLID BRASS BOWL & PEDESTAL */}
      <mesh geometry={diyaBowlGeometry} material={brassMaterial} castShadow />

      {/* 2. LIQUID OIL RESERVOIR */}
      <mesh position={[0, 0.082, 0]} material={oilMaterial}>
        <cylinderGeometry args={[0.135, 0.12, 0.012, 20]} />
      </mesh>

      {/* 3. COTTON WICK PINCHED AT THE LIP */}
      <mesh
        position={[0, 0.095, 0.045]}
        rotation={[-0.45, 0, 0]}
        material={wickMaterial}
      >
        <cylinderGeometry args={[0.012, 0.018, 0.07, 8]} />
      </mesh>

      {/* 4. FLAME GROUP (resting on the tip of the wick) */}
      <group position={[0, 0.12, 0.055]}>
        {/* Outer Warm Orange/Amber Flame Envelope */}
        <mesh
          ref={flameOuterRef}
          geometry={flameOuterGeometry}
        >
          <meshBasicMaterial
            color="#ff7a00"
            transparent={true}
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Inner Hot Golden-Yellow Flame Core */}
        <mesh
          ref={flameCoreRef}
          geometry={flameInnerGeometry}
          position={[0, 0.01, 0]}
        >
          <meshBasicMaterial
            color="#fff2a0"
            transparent={true}
            opacity={0.96}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Local Point Light for soft golden glow on the logo and surrounding diyas */}
        <pointLight
          ref={flameLightRef}
          color="#ffaa33"
          intensity={1.2}
          distance={1.6}
          decay={2}
          position={[0, 0.06, 0.02]}
        />

        {/* Rising spark embers */}
        <points ref={sparksRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkData.count}
              array={sparkData.pos}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            color="#ffe082"
            transparent={true}
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* 5. SELECTION HALO / ACTIVE INDICATOR */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 32]} />
          <meshBasicMaterial
            color="#ffe082"
            transparent={true}
            opacity={0.7}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

