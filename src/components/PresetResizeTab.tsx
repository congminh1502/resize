'use client';

import { useState, useMemo } from 'react';
import { Preset } from '../lib/types';
import PresetSelector from './PresetSelector';
import SourceUploadBlock from './SourceUploadBlock';
import OutputSizeList from './OutputSizeList';
import { readImageDimensions, resizeImage } from '../lib/imageUtils';
import { validateSourceUploads, canGenerateFullPack } from '../lib/validationUtils';
import { generateZip } from '../lib/zipUtils';
import { Download, RefreshCw, Eye } from 'lucide-react';
import PresetBuilder from './PresetBuilder';

export default function PresetResizeTab() {
    const [preset, setPreset] = useState<Preset | null>(null);
    const [uploads, setUploads] = useState<Record<string, { file: File; width: number; height: number }>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [prefix, setPrefix] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePresetSelect = (selected: Preset) => {
        setPreset(selected);
        setUploads({}); // Reset when changing preset
    };

    const handleUpload = async (blockId: string, file: File) => {
        try {
            const dim = await readImageDimensions(file);
            setUploads(prev => ({
                ...prev,
                [blockId]: { file, width: dim.width, height: dim.height }
            }));
        } catch (e) {
            alert("Lỗi đọc ảnh");
        }
    };

    const handleRemove = (blockId: string) => {
        const newUploads = { ...uploads };
        delete newUploads[blockId];
        setUploads(newUploads);
    };

    // derived validation state
    const validation = useMemo(() => {
        if (!preset) return { isValid: false, errors: {} };
        return validateSourceUploads(preset, uploads);
    }, [preset, uploads]);

    const canGenerate = preset ? canGenerateFullPack(validation, preset, uploads) : false;

    const handleGenerate = async () => {
        if (!preset || !canGenerate) return;
        setIsProcessing(true);

        try {
            const zipFiles = [];

            // Process each output size
            for (const output of preset.outputs) {
                const sourceData = uploads[output.sourceBlockId];
                if (!sourceData) continue; // Should not happen if validation passed

                const blob = await resizeImage(sourceData.file, output.width, output.height);

                // Naming: [prefix]_[width]x[height].[ext]
                const origFile = sourceData.file;
                const ext = origFile.name.substring(origFile.name.lastIndexOf('.')) || '.jpg';
                const newName = prefix
                    ? `${prefix}_${output.width}x${output.height}${ext}`
                    : `${output.width}x${output.height}${ext}`;

                zipFiles.push({ name: newName, blob });
            }

            const zipFilename = `${preset.id}_pack_${Date.now()}.zip`;
            await generateZip(zipFiles, zipFilename);

        } catch (e) {
            console.error(e);
            alert("Lỗi khi xử lý ảnh");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBuilderDone = () => {
        setShowBuilder(false);
        setEditingPreset(null);
        setRefreshKey(k => k + 1);
    };

    const handleEditPreset = (p: Preset) => {
        setEditingPreset(p);
        setShowBuilder(true);
    };

    const handleDeletePreset = (presetId: string) => {
        // If deleted preset is currently selected, deselect it
        if (preset?.id === presetId) {
            setPreset(null);
            setUploads({});
        }
        setRefreshKey(k => k + 1);
    };

    if (showBuilder) {
        return <PresetBuilder onSave={handleBuilderDone} onCancel={() => { setShowBuilder(false); setEditingPreset(null); }} editingPreset={editingPreset} />;
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Top Bar: Selector + Actions */}
            <div className="glass-card rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <PresetSelector
                        selectedPreset={preset}
                        onSelect={handlePresetSelect}
                        onEdit={handleEditPreset}
                        onDelete={handleDeletePreset}
                        refreshKey={refreshKey}
                    />
                </div>
                <button
                    onClick={() => setShowBuilder(true)}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors font-medium border border-zinc-700 whitespace-nowrap"
                >
                    + Tạo Preset Mới
                </button>
            </div>

            {!preset && (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                    <Eye className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg">Vui lòng chọn một preset để bắt đầu</p>
                </div>
            )}

            {preset && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Source Blocks (Left) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Ảnh Nguồn Bắt Buộc
                                    <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                        {preset.sourceBlocks.length}
                                    </span>
                                </h2>
                                <div className="text-sm font-medium">
                                    {Object.keys(uploads).length} / {preset.sourceBlocks.length} đã tải lên
                                </div>
                            </div>

                            {/* Prefix input */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
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
                                <p className="text-xs text-zinc-500 mt-2">
                                    Ví dụ: nhập <span className="text-zinc-400">VTS</span> → file sẽ có tên <span className="text-blue-400">VTS_1080x1080.jpg</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                {preset.sourceBlocks.map(block => (
                                    <SourceUploadBlock
                                        key={block.id}
                                        block={block}
                                        fileData={uploads[block.id]}
                                        error={validation.errors[block.id]}
                                        onUpload={(file) => handleUpload(block.id, file)}
                                        onRemove={() => handleRemove(block.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Config & Output List (Right) */}
                        <div className="flex flex-col gap-6">
                            <OutputSizeList preset={preset} />

                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate || isProcessing}
                                className="w-full glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group border border-zinc-700"
                            >
                                {isProcessing ? (
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                                ) : (
                                    <Download className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                                )}
                                <span>{isProcessing ? 'Đang xuất file...' : 'Generate Full Pack (ZIP)'}</span>
                                {!canGenerate && !isProcessing && (
                                    <span className="text-xs font-normal text-red-400 text-center mt-2 max-w-[200px]">
                                        Vui lòng tải đủ ảnh đúng tỉ lệ
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
