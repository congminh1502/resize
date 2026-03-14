'use client';

import { useState, useEffect } from 'react';
import { OutputSize, Preset, SourceBlock } from '../lib/types';
import { getRatioKey } from '../lib/ratioUtils';
import { buildSourceBlocksFromOutputs } from '../lib/presetUtils';
import { ArrowLeft, Save, Plus, Trash2, SlidersHorizontal, Info } from 'lucide-react';
import { saveSharedPreset, updateSharedPreset } from '../lib/sharedPresetService';

interface Props {
    onSave: () => void;
    onCancel: () => void;
    editingPreset?: Preset | null; // null = create new, Preset = edit existing
}

export default function PresetBuilder({ onSave, onCancel, editingPreset }: Props) {
    const isEditing = !!editingPreset;

    const [name, setName] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [outputs, setOutputs] = useState<Omit<OutputSize, 'id' | 'ratioKey' | 'sourceBlockId'>[]>([]);
    const [newWidth, setNewWidth] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [newLabel, setNewLabel] = useState('');

    // Save status
    const [isSaving, setIsSaving] = useState(false);

    // Step 2 state
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [analyzedOutputs, setAnalyzedOutputs] = useState<OutputSize[]>([]);
    const [sourceBlocks, setSourceBlocks] = useState<SourceBlock[]>([]);

    // Pre-fill when editing
    useEffect(() => {
        if (editingPreset) {
            setName(editingPreset.name);
            setAuthorName(editingPreset.authorName || '');
            setOutputs(editingPreset.outputs.map(o => ({
                width: o.width,
                height: o.height,
                label: o.label,
            })));
            // Auto-analyze with existing data
            setAnalyzedOutputs(editingPreset.outputs);
            setSourceBlocks(editingPreset.sourceBlocks);
            setIsAnalyzed(true);
        }
    }, [editingPreset]);

    const handleAddOutput = () => {
        const w = parseInt(newWidth);
        const h = parseInt(newHeight);
        if (!w || !h) return;

        setOutputs([...outputs, { width: w, height: h, label: newLabel || `${w}x${h}` }]);
        setNewWidth('');
        setNewHeight('');
        setNewLabel('');
        setIsAnalyzed(false); // Reset analysis if changed
    };

    const handleRemoveOutput = (index: number) => {
        setOutputs(outputs.filter((_, i) => i !== index));
        setIsAnalyzed(false);
    };

    const handleAnalyze = () => {
        if (outputs.length === 0) return;

        // temp assignment of IDs and ratioKeys
        const processedOutputs: OutputSize[] = outputs.map((out, i) => {
            return {
                ...out,
                id: `custom-out-${i}`,
                ratioKey: getRatioKey(out.width, out.height),
                sourceBlockId: '' // assigned later
            };
        });

        const generatedBlocks = buildSourceBlocksFromOutputs(processedOutputs);

        // Link outputs to blocks
        processedOutputs.forEach(out => {
            const block = generatedBlocks.find(b => b.ratioKey === out.ratioKey);
            if (block) {
                out.sourceBlockId = block.id;
            }
        });

        setAnalyzedOutputs(processedOutputs);
        setSourceBlocks(generatedBlocks);
        setIsAnalyzed(true);
    };

    const handleBlockChange = (blockId: string, field: keyof SourceBlock, value: string) => {
        setSourceBlocks(prev => prev.map(b => b.id === blockId ? { ...b, [field]: value } : b));
    };

    const handleSavePreset = async () => {
        if (!name || sourceBlocks.length === 0 || !authorName) {
            alert("Vui lòng nhập tên preset và tên người tạo.");
            return;
        }

        setIsSaving(true);
        try {
            // Preset sharing feature requires saving to Supabase
            if (isEditing && editingPreset && editingPreset.type === 'shared') {
                // Update existing shared preset
                await updateSharedPreset(editingPreset.id, {
                    name,
                    outputs: analyzedOutputs,
                    sourceBlocks: sourceBlocks,
                }, authorName);
            } else {
                // Create new shared preset
                await saveSharedPreset({
                    name,
                    outputs: analyzedOutputs,
                    sourceBlocks: sourceBlocks,
                }, authorName);
            }

            onSave();
        } catch (e) {
            alert("Lỗi khi lưu preset lên server.");
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 lg:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        {isEditing ? `Sửa Preset: ${editingPreset?.name}` : 'Tạo Preset Mới'}
                    </h2>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">
                    Preset bạn tạo sẽ được <strong>Public</strong> và chia sẻ cho tất cả mọi người có thể sử dụng.
                    Vui lòng nhập <span className="font-bold">Tên người tạo</span> để được ghi danh.
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Tên Preset</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Shopee Banner Pack"
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Tên người tạo</label>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="VD: Nguyễn Văn A"
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="bg-black/20 p-5 rounded-xl border border-zinc-800/50">
                    <h3 className="font-semibold text-zinc-200 mb-4">Danh sách kích thước đầu ra</h3>

                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input type="number" placeholder="Rộng (px)" value={newWidth} onChange={e => setNewWidth(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        <input type="number" placeholder="Cao (px)" value={newHeight} onChange={e => setNewHeight(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        <input type="text" placeholder="Nhãn (VD: square)" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        <button onClick={handleAddOutput} disabled={!newWidth || !newHeight} className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg flex items-center justify-center disabled:opacity-50">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {outputs.map((out, i) => (
                            <li key={i} className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-lg">
                                <span className="font-mono text-zinc-300">{out.width} × {out.height} <span className="text-zinc-500 text-sm ml-2">({out.label})</span></span>
                                <button onClick={() => handleRemoveOutput(i)} className="text-red-400 hover:text-red-300 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {outputs.length > 0 && !isAnalyzed && (
                        <button onClick={handleAnalyze} className="mt-6 w-full py-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors">
                            <SlidersHorizontal className="w-5 h-5" /> Mở rộng & Phân tích Preset
                        </button>
                    )}
                </div>

                {isAnalyzed && (
                    <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 border-t border-zinc-800 pt-6">
                        <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                            Đã phân tích <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full">{sourceBlocks.length} Block</span>
                        </h3>

                        <div className="space-y-4">
                            {sourceBlocks.map(block => (
                                <div key={block.id} className="bg-black/30 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-zinc-200">Block Ảnh (Tỉ lệ {block.ratioLabel})</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1 block">Tên hiển thị</label>
                                            <input value={block.displayName} onChange={e => handleBlockChange(block.id, 'displayName', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1 block">Kích thước gợi ý</label>
                                            <input value={block.recommendedSize} onChange={e => handleBlockChange(block.id, 'recommendedSize', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm font-mono" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs text-zinc-500 mb-1 block">Mô tả chi tiết (Tùy chọn)</label>
                                            <input value={block.description || ''} onChange={e => handleBlockChange(block.id, 'description', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs text-zinc-500 mb-1 block">Lưu ý sử dụng (Tùy chọn)</label>
                                            <input value={block.usageHint || ''} onChange={e => handleBlockChange(block.id, 'usageHint', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSavePreset}
                            disabled={!name || !authorName || isSaving}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl py-4 font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                        >
                            {isSaving ? (
                                <span className="animate-spin mr-2">⏳</span>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isSaving ? 'Đang lưu...' : (isEditing ? 'Cập nhật Preset Chia Sẻ' : 'Tạo Preset Chia Sẻ')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
