import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraTargetMode } from '../../types';

interface CameraControllerProps {
  mode: CameraTargetMode;
  targetPosition: [number, number, number] | null;
  isFinale: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  mode,
  targetPosition,
  isFinale,
}) => {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const desiredPos = useRef(new THREE.Vector3(0, 0, 8.8));
  const desiredLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ pointer, clock }) => {
    const t = clock.getElapsedTime();

    // Subtle continuous floating motion
    const floatOffsetX = Math.sin(t * 0.4) * 0.08;
    const floatOffsetY = Math.cos(t * 0.5) * 0.06;

    // Pointer parallax offset (subtle)
    const parallaxX = pointer.x * 0.4;
    const parallaxY = pointer.y * 0.3;

    if (mode === 'focus-diya' && targetPosition) {
      // Zoom close to the diya with high intimacy
      desiredPos.current.set(
        targetPosition[0] * 0.85 + parallaxX * 0.2,
        targetPosition[1] * 0.85 + 0.15 + parallaxY * 0.2,
        2.6 // Close-up distance
      );
      desiredLookAt.current.set(
        targetPosition[0],
        targetPosition[1] + 0.08,
        targetPosition[2]
      );
    } else if (isFinale || mode === 'finale') {
      // Majestic panoramic overview
      desiredPos.current.set(
        parallaxX * 0.5 + floatOffsetX,
        -0.2 + parallaxY * 0.3 + floatOffsetY,
        9.6
      );
      desiredLookAt.current.set(0, 0, 0);
    } else {
      // Hero default overview
      desiredPos.current.set(
        parallaxX * 0.6 + floatOffsetX,
        parallaxY * 0.5 + floatOffsetY,
        8.6
      );
      desiredLookAt.current.set(0, 0, 0);
    }

    // Smooth dampening interpolation
    const lerpSpeed = mode === 'focus-diya' ? 0.045 : 0.035;
    camera.position.lerp(desiredPos.current, lerpSpeed);
    currentLookAt.current.lerp(desiredLookAt.current, lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

