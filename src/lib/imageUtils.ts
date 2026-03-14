export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
}

export function resizeImage(file: File, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            // Simple resize drawing
            ctx.drawImage(img, 0, 0, width, height);

            // Export to blob
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
                URL.revokeObjectURL(url);
            }, file.type || 'image/png'); // Preserve original format or default to png
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for resizing'));
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
}
