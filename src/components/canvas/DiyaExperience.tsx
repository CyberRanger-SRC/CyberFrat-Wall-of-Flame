import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { InstallationEnvironment } from './Environment';
import { LuminousFluidLogo3D } from './LuminousFluidLogo3D';
import { DiyasManager } from './DiyasManager';
import { CameraController } from './CameraController';
import { GrandFinaleFX } from './GrandFinaleFX';
import { DiyaData, CameraTargetMode } from '../../types';

interface DiyaExperienceProps {
  diyas: DiyaData[];
  selectedDiya: DiyaData | null;
  newlyAddedId: string | null;
  progress: number;
  isFinale: boolean;
  highlightWing?: 'none' | 'red' | 'blue' | 'both';
  onSelectDiya: (diya: DiyaData) => void;
  onDeselect: () => void;
  aspectMode?: 'standard' | 'ultrawide';
  showDiyasOnLogo?: boolean;
}

export const DiyaExperience: React.FC<DiyaExperienceProps> = ({
  diyas,
  selectedDiya,
  newlyAddedId,
  progress,
  isFinale,
  highlightWing = 'none',
  onSelectDiya,
  onDeselect,
  aspectMode = 'standard',
  showDiyasOnLogo = false, // Clean logo: no diyas placed on the actual logo!
}) => {
  let cameraMode: CameraTargetMode = 'hero';
  let targetPosition: [number, number, number] | null = null;

  if (isFinale) {
    cameraMode = 'finale';
  }

  const fov = aspectMode === 'ultrawide' ? 38 : 46;

  return (
    <div className="w-full h-full relative cursor-default select-none">
      <Canvas
        camera={{ position: [0, 0, 8.6], fov, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).tagName === 'CANVAS') {
            onDeselect();
          }
        }}
      >
        <Suspense fallback={null}>
          <CameraController
            mode={cameraMode}
            targetPosition={targetPosition}
            isFinale={isFinale}
          />

          <InstallationEnvironment
            progress={progress}
            isFinale={isFinale}
          />

          {/* Luminous Liquid Gold Fluid Logo - clean without diyas cluttering the emblem */}
          <LuminousFluidLogo3D
            progress={progress}
            isFinale={isFinale}
            highlightWing={highlightWing}
          />

          {/* Render diyas on logo only if explicitly requested; otherwise clean logo */}
          {showDiyasOnLogo && (
            <DiyasManager
              diyas={diyas}
              selectedDiyaId={selectedDiya ? selectedDiya.id : null}
              newlyAddedId={newlyAddedId}
              onSelectDiya={onSelectDiya}
            />
          )}

          <GrandFinaleFX active={isFinale} />

          {/* Cinematic Post-Processing: Controlled Bloom & Vignette */}
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.52}
              luminanceSmoothing={0.35}
              intensity={1.2}
              mipmapBlur
            />
            <Vignette
              eskil={false}
              offset={0.2}
              darkness={0.88}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
