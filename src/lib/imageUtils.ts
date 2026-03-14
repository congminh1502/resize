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

// Part 3: Advanced Resize with Fit Modes and Alignment
export function resizeImageAdvanced(
    file: File,
    targetWidth: number,
    targetHeight: number,
    fitMode: 'contain_with_background' | 'contain_no_background' | 'cover_crop',
    align: 'center' | 'left' | 'right',
    bgColor: string
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                URL.revokeObjectURL(url);
                return;
            }

            // Draw background if needed
            if (fitMode === 'contain_with_background') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            }

            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;
            
            let drawWidth = 0;
            let drawHeight = 0;
            let drawX = 0;
            let drawY = 0;

            if (fitMode === 'cover_crop') {
                // Cover: image fills the entire canvas, crop overflow
                if (imgRatio > targetRatio) {
                    // Image is wider than target => scale to match height, crop width
                    drawHeight = targetHeight;
                    drawWidth = img.width * (targetHeight / img.height);
                    drawY = 0;
                    
                    if (align === 'left') drawX = 0;
                    else if (align === 'right') drawX = targetWidth - drawWidth;
                    else drawX = (targetWidth - drawWidth) / 2; // center
                } else {
                    // Image is taller than target => scale to match width, crop height
                    drawWidth = targetWidth;
                    drawHeight = img.height * (targetWidth / img.width);
                    drawX = 0;
                    
                    // Vertical alignment defaults to center/top based on logic, we use center for vertical usually
                    drawY = (targetHeight - drawHeight) / 2;
                }
            } else {
                // Contain modes: image fits entirely inside canvas, pad with bg or transparent
                if (imgRatio > targetRatio) {
                    // Image is wider than target => scale to match width, pad height
                    drawWidth = targetWidth;
                    drawHeight = img.height * (targetWidth / img.width);
                    drawX = 0;
                    drawY = (targetHeight - drawHeight) / 2; // Vertical always center
                } else {
                    // Image is taller than target => scale to match height, pad width
                    drawHeight = targetHeight;
                    drawWidth = img.width * (targetHeight / img.height);
                    drawY = 0;
                    
                    if (align === 'left') drawX = 0;
                    else if (align === 'right') drawX = targetWidth - drawWidth;
                    else drawX = (targetWidth - drawWidth) / 2; // center
                }
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
                URL.revokeObjectURL(url);
            }, file.type || 'image/png');
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image for advanced resizing'));
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    });
}
