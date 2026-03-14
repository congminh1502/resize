export type RatioKey = string;

export interface OutputSize {
  id: string;
  label: string;
  width: number;
  height: number;
  ratioKey: RatioKey;
  sourceBlockId: string;
}

export interface SourceBlock {
  id: string;
  ratioKey: RatioKey;
  displayName: string;
  ratioLabel: string;
  recommendedSize: string;
  description?: string;
  usageHint?: string;
  required: true;
}

export interface Preset {
  id: string;
  name: string;
  type: 'system' | 'custom' | 'shared';
  outputs: OutputSize[];
  sourceBlocks: SourceBlock[];
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Part 3: Block-based Resize
export interface P3OutputSize {
  width: number;
  height: number;
}

export interface SizePreset {
  id: string;
  name: string;
  sizes: P3OutputSize[];
  authorName?: string;
  type: 'shared' | 'local';
}

export interface ResizeBlock {
  id: string;
  inputImage?: File;
  previewUrl?: string;
  originalDim?: { width: number; height: number };
  outputs: P3OutputSize[];
  fitMode: 'contain_with_background' | 'contain_no_background' | 'cover_crop';
  align: 'center' | 'left' | 'right';
  bgColor: string;
}
