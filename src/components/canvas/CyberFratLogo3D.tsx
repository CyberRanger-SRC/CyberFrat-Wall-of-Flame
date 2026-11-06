import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface CyberFratLogo3DProps {
  progress: number; // 0.0 to 1.0
  isFinale: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const CyberFratLogo3D: React.FC<CyberFratLogo3DProps> = ({
  progress,
  isFinale,
  onPointerOver,
  onPointerOut,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshFrontRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const rimMeshRef = useRef<THREE.Mesh>(null);

  // Load the official textures
  const [logoTexture, normalTexture, emissiveTexture] = useLoader(THREE.TextureLoader, [
    '/cyberfrat-logo.png',
    '/cyberfrat-normal.png',
    '/cyberfrat-emissive.png',
  ]);

  // Configure textures for high fidelity
  useMemo(() => {
    [logoTexture, normalTexture, emissiveTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });
  }, [logoTexture, normalTexture, emissiveTexture]);

  // Dimensions of the logo (width: 1024, height: 908 -> aspect ratio ~ 1.1277)
  const logoWidth = 6.8;
  const logoHeight = logoWidth / (1024 / 908); // ~ 6.03

  // Animation values for subtle float and dynamic illumination
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle floating animation (subtle breathing bob + pointer parallax tilt)
      const floatY = Math.sin(t * 0.9) * 0.07;
      groupRef.current.position.y = floatY;

      // Soft interactive tilt towards cursor (very subtle to preserve front readability)
      const targetRotY = pointer.x * 0.08;
      const targetRotX = -pointer.y * 0.06;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
    }

    // Dynamic glow pulse when illuminated
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
      const pulseSpeed = 1.8 + progress * 1.5;
      const pulse = 0.5 + Math.sin(t * pulseSpeed) * 0.25;
      const targetOpacity = Math.max(0.0, (progress - 0.1) * 1.25) * (0.4 + pulse * 0.4);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
    }

    // Progressive emissive intensity on the front mesh
    if (meshFrontRef.current) {
      const mat = meshFrontRef.current.material as THREE.MeshStandardMaterial;
      // Emissive color transitions from deep amber to brilliant gold
      const goldColor = isFinale ? new THREE.Color(0xffe082) : new THREE.Color(0xffb300);
      mat.emissive = goldColor;
      // Emissive intensity scales strictly with participation progress
      const targetEmissive = Math.pow(progress, 1.4) * (isFinale ? 2.8 : 1.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.06);

      // Metalness & roughness adapt for glorious liquid gold reflections at higher progress
      mat.roughness = THREE.MathUtils.lerp(0.42, 0.22, progress);
      mat.metalness = THREE.MathUtils.lerp(0.45, 0.75, progress);
    }

    // Rim edge shine
    if (rimMeshRef.current) {
      const mat = rimMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + progress * 1.2 + (isFinale ? 1.5 : 0);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* 1. FRONT FACE: Official CyberFrat Logo with Metallic Gold Response & Dynamic Illumination */}
      <mesh ref={meshFrontRef} position={[0, 0, 0.02]} receiveShadow>
        <planeGeometry args={[logoWidth, logoHeight, 64, 64]} />
        <meshStandardMaterial
          map={logoTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          emissiveMap={emissiveTexture}
          emissive={new THREE.Color(0xff9900)}
          emissiveIntensity={0.0}
          transparent={true}
          alphaTest={0.02}
          roughness={0.35}
          metalness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. GOLDEN BEVELED RIM / BACKING (creates physical 3D metallic dimensional depth) */}
      <mesh
        ref={rimMeshRef}
        position={[0, 0, -0.04]}
        scale={[1.018, 1.018, 1]}
      >
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial
          map={logoTexture}
          color={new THREE.Color(0xd4af37)} // Metallic Royal Gold
          emissive={new THREE.Color(0xffa726)}
          emissiveIntensity={0.4}
          transparent={true}
          alphaTest={0.02}
          roughness={0.22}
          metalness={0.92}
        />
      </mesh>

      {/* 3. DEEPER DIMENSIONAL GOLD SLAB (Z-extrusion illusion) */}
      <mesh
        position={[0, 0, -0.1]}
        scale={[1.025, 1.025, 1]}
      >
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial
          map={logoTexture}
          color={new THREE.Color(0x8a6208)} // Dark antique gold backing
          transparent={true}
          alphaTest={0.02}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 4. VOLUMETRIC AURA GLOW BEHIND THE LOGO (grows as diyas accumulate) */}
      <mesh
        ref={glowMeshRef}
        position={[0, 0, -0.16]}
        scale={[1.12, 1.12, 1]}
      >
        <planeGeometry args={[logoWidth * 1.15, logoHeight * 1.15]} />
        <meshBasicMaterial
          map={emissiveTexture}
          color={isFinale ? '#ffe082' : '#ff9800'}
          transparent={true}
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. GOLDEN LIGHT RAYS / HALO PLANE FOR FINALE */}
      {isFinale && (
        <mesh position={[0, 0, -0.22]} scale={[1.4, 1.4, 1]}>
          <planeGeometry args={[logoWidth * 1.3, logoHeight * 1.3]} />
          <meshBasicMaterial
            map={emissiveTexture}
            color="#ffe57f"
            transparent={true}
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

