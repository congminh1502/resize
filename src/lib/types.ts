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
