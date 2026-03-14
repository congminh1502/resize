'use client';

import { useState, useRef, ChangeEvent, useCallback, useMemo } from 'react';
import { Upload, Download, RefreshCw, X, Image as ImageIcon, Ruler } from 'lucide-react';
import { readImageDimensions, resizeImage } from '../lib/imageUtils';
import { parseResizePercentInput } from '../lib/validationUtils';
import { generateZip } from '../lib/zipUtils';
import { normalizeRatioLabel } from '../lib/ratioUtils';

interface DimensionEntry {
    width: string;
    height: string;
}

export default function FreeResizeTab() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalDim, setOriginalDim] = useState<{ width: number; height: number } | null>(null);
    const [percentInput, setPercentInput] = useState<string>('100');
    const [isProcessing, setIsProcessing] = useState(false);
    const [prefix, setPrefix] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dimension-based resize state
    const [dimEntries, setDimEntries] = useState<DimensionEntry[]>([{ width: '', height: '' }]);
    const [dimError, setDimError] = useState<string | null>(null);

    // Whether the last edit came from % or dimension inputs (to avoid infinite sync loops)
    const [lastEditSource, setLastEditSource] = useState<'percent' | 'dimension' | null>(null);

    // Compute original ratio label
    const originalRatioLabel = useMemo(() => {
        if (!originalDim) return '';
        return normalizeRatioLabel(originalDim.width, originalDim.height);
    }, [originalDim]);

    const originalRatioNum = useMemo(() => {
        if (!originalDim || originalDim.height === 0) return 1;
        return originalDim.width / originalDim.height;
    }, [originalDim]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        try {
            const dims = await readImageDimensions(selected);
            setFile(selected);
            setOriginalDim(dims);

            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(selected));

            // Reset
            setDimEntries([{ width: '', height: '' }]);
            setDimError(null);
        } catch (err) {
            alert('Không thể đọc ảnh này. Vui lòng chọn file hợp lệ.');
        }
    };

    const clearFile = () => {
        setFile(null);
        setOriginalDim(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setDimEntries([{ width: '', height: '' }]);
        setDimError(null);
    };

    // --- Sync: % -> dimensions ---
    const handlePercentChange = (value: string) => {
        setPercentInput(value);
        setLastEditSource('percent');

        if (!originalDim) return;
        const pcts = parseResizePercentInput(value);
        if (pcts.length > 0) {
            const newEntries = pcts.map(pct => ({
                width: String(Math.round((originalDim.width * pct) / 100)),
                height: String(Math.round((originalDim.height * pct) / 100)),
            }));
            setDimEntries(newEntries);
            setDimError(null);
        }
    };

    // --- Sync: dimension -> % ---
    const handleDimWidthChange = (index: number, widthStr: string) => {
        setLastEditSource('dimension');
        const newEntries = [...dimEntries];
        newEntries[index] = { ...newEntries[index], width: widthStr };

        // Auto-calculate height from width
        const w = parseFloat(widthStr);
        if (originalDim && !isNaN(w) && w > 0) {
            const h = Math.round(w / originalRatioNum);
            newEntries[index].height = String(h);

            // Sync back to %
            const pct = (w / originalDim.width) * 100;
            syncPercentsFromEntries(newEntries);
            setDimError(null);
        }

        setDimEntries(newEntries);
    };

    const handleDimHeightChange = (index: number, heightStr: string) => {
        setLastEditSource('dimension');
        const newEntries = [...dimEntries];
        newEntries[index] = { ...newEntries[index], height: heightStr };

        // Auto-calculate width from height
        const h = parseFloat(heightStr);
        if (originalDim && !isNaN(h) && h > 0) {
            const w = Math.round(h * originalRatioNum);
            newEntries[index].width = String(w);

            syncPercentsFromEntries(newEntries);
            setDimError(null);
        }

        setDimEntries(newEntries);
    };

    const syncPercentsFromEntries = (entries: DimensionEntry[]) => {
        if (!originalDim) return;
        const pcts = entries
            .map(e => {
                const w = parseFloat(e.width);
                if (isNaN(w) || w <= 0) return null;
                return Math.round((w / originalDim.width) * 10000) / 100; // 2 decimal places
            })
            .filter(v => v !== null) as number[];

        if (pcts.length > 0) {
            setPercentInput(pcts.join(', '));
        }
    };

    const addDimEntry = () => {
        setDimEntries([...dimEntries, { width: '', height: '' }]);
    };

    const removeDimEntry = (index: number) => {
        const newEntries = dimEntries.filter((_, i) => i !== index);
        if (newEntries.length === 0) {
            setDimEntries([{ width: '', height: '' }]);
        } else {
            setDimEntries(newEntries);
        }
        syncPercentsFromEntries(newEntries.length > 0 ? newEntries : []);
    };

    const percents = parseResizePercentInput(percentInput);

    const handleGenerate = async () => {
        if (!file || !originalDim || percents.length === 0) return;

        setIsProcessing(true);
        try {
            const jobs = percents.map(async (pct) => {
                const w = Math.round((originalDim.width * pct) / 100);
                const h = Math.round((originalDim.height * pct) / 100);
                const blob = await resizeImage(file, w, h);

                // Naming: [prefix]_[width]x[height].[ext]
                const ext = file.name.substring(file.name.lastIndexOf('.')) || '.jpg';
                const newName = prefix
                    ? `${prefix}_${w}x${h}${ext}`
                    : `${w}x${h}${ext}`;

                return { name: newName, blob, url: URL.createObjectURL(blob) };
            });

            const results = await Promise.all(jobs);

            if (results.length === 1) {
                const a = document.createElement('a');
                a.href = results[0].url;
                a.download = results[0].name;
                a.click();
            } else {
                const zipFiles = results.map(r => ({ name: r.name, blob: r.blob }));
                await generateZip(zipFiles, `free_resize_${Date.now()}.zip`);
            }

            results.forEach(r => URL.revokeObjectURL(r.url));
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi xử lý ảnh.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Column */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center min-h-[400px]">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex-1 border-2 border-dashed border-zinc-700/50 hover:border-blue-500/50 transition-colors rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10"
                    >
                        <Upload className="w-10 h-10 mb-2 opacity-80" />
                        <p className="font-medium text-lg text-center">Tải ảnh lên để bắt đầu</p>
                        <p className="text-sm opacity-60">Kéo thả hoặc click vào đây</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col group relative">
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button onClick={clearFile} className="bg-black/50 hover:bg-red-500/80 backdrop-blur p-2 rounded-full transition-colors" title="Xóa ảnh">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-[300px] relative rounded-xl overflow-hidden bg-black/40 flex items-center justify-center p-4 border border-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain rounded drop-shadow-lg" />
                        </div>
                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div className="truncate">
                                    <p className="font-medium truncate text-sm">{file.name}</p>
                                    <p className="text-xs text-zinc-400">{originalDim?.width} x {originalDim?.height} px</p>
                                </div>
                            </div>
                            {originalDim && (
                                <div className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                                    <Ruler className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-mono text-purple-300">
                                        Original ratio: {originalRatioLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Settings Column */}
            <div className="flex flex-col gap-6">
                <div className="glass-card rounded-2xl p-6 lg:p-8">
                    <h2 className="text-xl font-bold mb-6 text-zinc-100">Thông số Resize</h2>

                    <div className="space-y-5">
                        {/* Prefix */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Prefix tên file đầu ra (tuỳ chọn)
                            </label>
                            <input
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                placeholder="VD: VTS (để trống nếu không cần)"
                                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                            />
                        </div>

                        {/* Percentage input */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                📐 Resize theo phần trăm (%)
                            </label>
                            <input
                                type="text"
                                value={percentInput}
                                onChange={(e) => handlePercentChange(e.target.value)}
                                placeholder="VD: 50, 75, 120"
                                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                Nhập nhiều mức % cách nhau bằng dấu phẩy. Thay đổi ở đây sẽ tự động cập nhật ô kích thước bên dưới.
                            </p>
                        </div>

                        {/* Dimension-based input */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                📏 Resize theo kích thước mong muốn (px)
                            </label>
                            <div className="space-y-3">
                                {dimEntries.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Width"
                                            value={entry.width}
                                            onChange={(e) => handleDimWidthChange(i, e.target.value)}
                                            className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                        />
                                        <span className="text-zinc-500 text-sm">×</span>
                                        <input
                                            type="number"
                                            placeholder="Height"
                                            value={entry.height}
                                            onChange={(e) => handleDimHeightChange(i, e.target.value)}
                                            className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                        />
                                        {dimEntries.length > 1 && (
                                            <button
                                                onClick={() => removeDimEntry(i)}
                                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addDimEntry}
                                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                                + Thêm kích thước
                            </button>
                            <p className="text-xs text-zinc-500 mt-2">
                                Nhập Width hoặc Height, ô còn lại sẽ tự tính theo tỉ lệ gốc. Giá trị này đồng bộ với mức % bên trên.
                            </p>
                            {dimError && (
                                <p className="text-xs text-red-400 mt-2">{dimError}</p>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-8 border-t border-zinc-800 pt-6">
                        <h3 className="text-sm font-medium text-zinc-400 mb-4">Preview Kích thước Đầu ra</h3>
                        {percents.length > 0 && originalDim ? (
                            <ul className="space-y-2">
                                {percents.map((pct, i) => (
                                    <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                                        <span className="text-zinc-300 font-medium">{pct}%</span>
                                        <span className="text-blue-400 font-mono">
                                            {Math.round((originalDim.width * pct) / 100)} x {Math.round((originalDim.height * pct) / 100)} px
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-600 italic">Chưa có thông số hợp lệ</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!file || !originalDim || percents.length === 0 || isProcessing}
                    className="w-full glass-card p-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group"
                >
                    {isProcessing ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                    ) : (
                        <Download className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{isProcessing ? 'Đang xử lý...' : 'Generate & Download'}</span>
                </button>
            </div>
        </div>
    );
}
