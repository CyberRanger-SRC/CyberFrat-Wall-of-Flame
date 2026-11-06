export interface DiyaData {
  id: string;
  name: string;
  chapter?: string;
  message: string;
  anchorIndex: number;
  timestamp: string;
  metalColor?: 'brass' | 'antique-gold' | 'copper';
}

export interface LogoAnchor {
  id: number;
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
  dist: number;
  wing: 'red' | 'blue';
}

export interface LogoData {
  imageWidth: number;
  imageHeight: number;
  scaleFactor: number;
  totalAnchors: number;
  anchors: LogoAnchor[];
}

export type CameraTargetMode = 'hero' | 'focus-diya' | 'finale';

