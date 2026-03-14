import { OutputSize, Preset, SourceBlock } from './types';
import { groupOutputsByRatio, normalizeRatioLabel } from './ratioUtils';

export function buildSourceBlocksFromOutputs(outputs: OutputSize[]): SourceBlock[] {
    const groups = groupOutputsByRatio(outputs);
    const sourceBlocks: SourceBlock[] = [];

    Object.entries(groups).forEach(([ratioKey, sizeGroup], index) => {
        // Find the largest size in the group to use as recommended size
        let maxArea = 0;
        let recommendedWidth = 0;
        let recommendedHeight = 0;

        sizeGroup.forEach(size => {
            const area = size.width * size.height;
            if (area > maxArea) {
                maxArea = area;
                recommendedWidth = size.width;
                recommendedHeight = size.height;
            }
        });

        const ratioLabel = normalizeRatioLabel(recommendedWidth, recommendedHeight);

        const block: SourceBlock = {
            id: `src-${ratioKey.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`,
            ratioKey,
            displayName: `Ảnh tỉ lệ ${ratioLabel}`,
            ratioLabel,
            recommendedSize: `${recommendedWidth} x ${recommendedHeight}`,
            description: 'Block ảnh tự sinh.',
            usageHint: '',
            required: true,
        };
        sourceBlocks.push(block);
    });

    return sourceBlocks;
}

export function countRequiredSources(preset: Preset): number {
    return preset.sourceBlocks.filter(b => b.required).length;
}
