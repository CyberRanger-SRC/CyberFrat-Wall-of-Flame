import React from 'react';
import { DiyaData, LogoAnchor } from '../../types';
import { DiyaModel } from './DiyaModel';
import logoData from '../../data/logoPoints.json';

interface DiyasManagerProps {
  diyas: DiyaData[];
  selectedDiyaId: string | null;
  newlyAddedId: string | null;
  onSelectDiya: (diya: DiyaData) => void;
}

export const DiyasManager: React.FC<DiyasManagerProps> = ({
  diyas,
  selectedDiyaId,
  newlyAddedId,
  onSelectDiya,
}) => {
  const anchors = logoData.anchors as LogoAnchor[];

  return (
    <group position={[0, 0, 0]}>
      {diyas.map((diya, index) => {
        // Deterministic anchor index (loop safely if diyas count exceeds anchors count)
        const anchorIdx = (diya.anchorIndex !== undefined ? diya.anchorIndex : index) % anchors.length;
        const anchor = anchors[anchorIdx];
        if (!anchor) return null;

        // Position slightly in front of the logo plane
        const pos: [number, number, number] = [anchor.x, anchor.y, 0.14];

        return (
          <DiyaModel
            key={diya.id}
            data={diya}
            position={pos}
            isSelected={selectedDiyaId === diya.id}
            isNewlyAdded={newlyAddedId === diya.id}
            onSelect={onSelectDiya}
          />
        );
      })}
    </group>
  );
};

