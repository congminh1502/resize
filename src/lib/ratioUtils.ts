import { OutputSize, RatioKey } from './types';

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

export function getRatioKey(width: number, height: number): RatioKey {
    const divisor = gcd(width, height);
    const rw = width / divisor;
    const rh = height / divisor;

    // Clean up common large ratios for readability if needed, but for programmatic use:
    return `${rw}:${rh}`;
}

// Convert a ratio string like "16:9" or "1.91:1" to a numeric value
export function ratioKeyToNumber(ratio: string): number {
    const parts = ratio.split(':');
    if (parts.length === 2) {
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return 1;
}

// Check if an image matches a target ratio given a tolerance
export function isRatioMatch(width: number, height: number, targetRatioKey: RatioKey, tolerance: number = 0.01): boolean {
    if (width === 0 || height === 0) return false;

    const actualRatio = width / height;
    const targetRatio = ratioKeyToNumber(targetRatioKey);

    return Math.abs(actualRatio - targetRatio) <= tolerance;
}

// Group outputs by ratio
export function groupOutputsByRatio(outputs: OutputSize[]): Record<RatioKey, OutputSize[]> {
    const groups: Record<RatioKey, OutputSize[]> = {};
    outputs.forEach(output => {
        if (!groups[output.ratioKey]) {
            groups[output.ratioKey] = [];
        }
        groups[output.ratioKey].push(output);
    });
    return groups;
}

// Helper to format a friendly ratio label like 16:9 instead of 1920:1080
export function normalizeRatioLabel(width: number, height: number): string {
    const divisor = gcd(width, height);
    const rw = width / divisor;
    const rh = height / divisor;

    // Handle some common marketing ratios like 1.91:1 which don't simplify cleanly with GCD
    const ratioNum = width / height;
    if (Math.abs(ratioNum - 1.91) < 0.02) return '1.91:1';

    return `${rw}:${rh}`;
}
