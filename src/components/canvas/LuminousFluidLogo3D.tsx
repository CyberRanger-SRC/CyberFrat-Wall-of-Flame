import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface LuminousFluidLogo3DProps {
  progress: number; // 0.0 to 1.0
  isFinale: boolean;
  highlightWing?: 'none' | 'red' | 'blue' | 'both';
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const LuminousFluidLogo3D: React.FC<LuminousFluidLogo3DProps> = ({
  progress,
  isFinale,
  highlightWing = 'none',
  onPointerOver,
  onPointerOut,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const fluidMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const rimMeshRef = useRef<THREE.Mesh>(null);

  // Load the official textures
  const [logoTexture, normalTexture, emissiveTexture] = useLoader(THREE.TextureLoader, [
    '/cyberfrat-logo.png',
    '/cyberfrat-normal.png',
    '/cyberfrat-emissive.png',
  ]);

  useMemo(() => {
    [logoTexture, normalTexture, emissiveTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });
  }, [logoTexture, normalTexture, emissiveTexture]);

  // Logo aspect ratio (1024 x 908)
  const logoWidth = 6.8;
  const logoHeight = logoWidth / (1024 / 908); // ~ 6.03

  // Custom Luminous Fluid Fill Shader
  const fluidShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: progress },
        uLogoTex: { value: logoTexture },
        uNormalTex: { value: normalTexture },
        uEmissiveTex: { value: emissiveTexture },
        uHighlightWing: { value: 0.0 }, // 0: none, 1: red, 2: blue, 3: both
        uIsFinale: { value: isFinale ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uProgress;
        uniform sampler2D uLogoTex;
        uniform sampler2D uNormalTex;
        uniform sampler2D uEmissiveTex;
        uniform float uHighlightWing;
        uniform float uIsFinale;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec4 logoColor = texture2D(uLogoTex, vUv);
          if (logoColor.a < 0.1) {
            discard;
          }

          // Distinguish Red Wing vs Blue Wing based on color
          bool isRedWing = (logoColor.r > 0.55 && logoColor.b < 0.4);
          bool isBlueWing = (logoColor.b > 0.45 && logoColor.r < 0.35);

          // Liquid wave surface calculation (fills from bottom to top)
          // vUv.y ranges from 0 (bottom apex) to 1 (top bar)
          float wave1 = sin(vUv.x * 14.0 + uTime * 3.2) * 0.022;
          float wave2 = cos(vUv.x * 28.0 - uTime * 2.1) * 0.012;
          float wave = (wave1 + wave2) * (1.0 - uProgress * 0.7); // waves calm as it fills
          
          // Fluid level threshold
          float fluidHeight = uProgress * 1.04;
          float distToSurface = (vUv.y - wave) - fluidHeight;

          // Liquid internal caustics / bubbles
          float caustic = sin(vUv.x * 35.0 + uTime * 4.0) * cos(vUv.y * 35.0 + uTime * 3.0);
          caustic = smoothstep(0.4, 0.95, caustic);

          // Base colors: Dim unlit metallic logo
          vec3 baseMetallic = logoColor.rgb * 0.35;
          // Metallic specular rim
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          baseMetallic += vec3(0.8, 0.6, 0.2) * fresnel * 0.4;

          vec3 finalColor = baseMetallic;

          // Luminous liquid fluid colors
          vec3 moltenDeep = vec3(1.0, 0.45, 0.05); // Deep amber
          vec3 moltenGold = vec3(1.0, 0.88, 0.35); // Radiant gold
          vec3 fluidColor = mix(moltenDeep, moltenGold, vUv.y * 0.8 + caustic * 0.25);

          // If inside the liquid fluid
          if (distToSurface <= 0.0) {
            // Fill with luminous liquid
            float depthFactor = clamp(-distToSurface * 3.5, 0.0, 1.0);
            vec3 litFluid = mix(fluidColor, logoColor.rgb * 1.3, 0.3);
            
            // Add internal radiant glow
            litFluid += moltenGold * (0.4 + caustic * 0.3);
            finalColor = litFluid;

            // Surface Meniscus Foam (bright glowing edge line of the liquid)
            if (distToSurface > -0.04) {
              float foamIntensity = smoothstep(-0.04, 0.0, distToSurface);
              finalColor = mix(finalColor, vec3(1.5, 1.4, 0.9), foamIntensity * 0.95);
            }
          }

          // Active Panel Highlight (Left wing, Right wing, or Both)
          if ((uHighlightWing == 1.0 && isRedWing) || 
              (uHighlightWing == 2.0 && isBlueWing) || 
              (uHighlightWing == 3.0)) {
            // Energetic pulsating gold shine across the active panel
            float panelPulse = 0.5 + 0.5 * sin(uTime * 5.0 + vUv.y * 10.0);
            finalColor += vec3(1.2, 0.9, 0.3) * panelPulse * 0.45;
          }

          // Grand Finale Ignition
          if (uIsFinale > 0.5) {
            // Entire logo radiates brilliant liquid sun energy
            float pulse = 0.8 + 0.2 * sin(uTime * 4.0);
            finalColor = mix(finalColor, vec3(1.4, 1.25, 0.75), 0.6) * pulse * 1.4;
          }

          gl_FragColor = vec4(finalColor, logoColor.a);
        }
      `,
    };
  }, [logoTexture, normalTexture, emissiveTexture]);

  // Update uniforms in useFrame
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle floating animation
      const floatY = Math.sin(t * 0.9) * 0.07;
      groupRef.current.position.y = floatY;

      // Soft interactive tilt
      const targetRotY = pointer.x * 0.08;
      const targetRotX = -pointer.y * 0.06;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
    }

    if (fluidMaterialRef.current) {
      fluidMaterialRef.current.uniforms.uTime.value = t;
      fluidMaterialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        fluidMaterialRef.current.uniforms.uProgress.value,
        progress,
        0.05
      );

      let wingVal = 0.0;
      if (highlightWing === 'red') wingVal = 1.0;
      else if (highlightWing === 'blue') wingVal = 2.0;
      else if (highlightWing === 'both') wingVal = 3.0;
      fluidMaterialRef.current.uniforms.uHighlightWing.value = wingVal;
      fluidMaterialRef.current.uniforms.uIsFinale.value = isFinale ? 1.0 : 0.0;
    }

    // Glow aura behind logo
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = (progress * 0.6) + (isFinale ? 0.4 : 0.0);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.06);
    }

    // Rim metal shine
    if (rimMeshRef.current) {
      const mat = rimMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + progress * 1.4 + (isFinale ? 1.8 : 0);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* 1. FRONT FACE: Luminous Liquid Gold Fluid Filling Shader */}
      <mesh position={[0, 0, 0.03]} receiveShadow>
        <planeGeometry args={[logoWidth, logoHeight, 64, 64]} />
        <shaderMaterial
          ref={fluidMaterialRef}
          args={[fluidShader]}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. GOLDEN BEVELED RIM / BACKING (physical 3D metallic bevel) */}
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

      {/* 3. DEEPER DIMENSIONAL GOLD SLAB */}
      <mesh
        position={[0, 0, -0.1]}
        scale={[1.025, 1.025, 1]}
      >
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial
          map={logoTexture}
          color={new THREE.Color(0x8a6208)} // Dark antique gold
          transparent={true}
          alphaTest={0.02}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 4. VOLUMETRIC AURA GLOW BEHIND THE LOGO */}
      <mesh
        ref={glowMeshRef}
        position={[0, 0, -0.16]}
        scale={[1.15, 1.15, 1]}
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

      {/* 5. FINALE HALO RAYS */}
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

