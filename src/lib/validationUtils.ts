import { Preset, SourceBlock } from './types';
import { isRatioMatch, ratioKeyToNumber } from './ratioUtils';

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>; // blockId -> errorMessage
}

export function validateSourceUploads(
    preset: Preset,
    uploads: Record<string, { file: File; width: number; height: number }>
): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: {}
    };

    preset.sourceBlocks.forEach((block: SourceBlock) => {
        const upload = uploads[block.id];

        if (block.required && !upload) {
            result.isValid = false;
            result.errors[block.id] = `Thiếu ảnh nguồn: ${block.displayName}`;
            return;
        }

        if (upload) {
            const isMatch = isRatioMatch(upload.width, upload.height, block.ratioKey, 0.02);
            if (!isMatch) {
                result.isValid = false;
                result.errors[block.id] = `Ảnh tải lên cho block ${block.displayName} không đúng tỉ lệ ${block.ratioLabel}`;
            }
        }
    });

    return result;
}

export function canGenerateFullPack(validationResult: ValidationResult, preset: Preset, uploads: Record<string, { file: File; width: number; height: number }>): boolean {
    if (!validationResult.isValid) return false;

    // Also check if all required blocks have uploads
    const missingRequired = preset.sourceBlocks.some(b => b.required && !uploads[b.id]);
    return !missingRequired;
}

export function parseResizePercentInput(input: string): number[] {
    if (!input) return [];

    const values = input.split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v) && v > 0);

    return values;
}
