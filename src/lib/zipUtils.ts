import JSZip from 'jszip';

export interface FileToZip {
    name: string;
    blob: Blob;
}

export async function generateZip(files: FileToZip[], zipFilename: string): Promise<void> {
    const zip = new JSZip();

    files.forEach(file => {
        zip.file(file.name, file.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });

    // Use a simple anchor tag download instead of file-saver to avoid extra deps if possible
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
