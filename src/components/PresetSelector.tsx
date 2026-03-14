'use client';

import { Preset } from '../lib/types';
import { systemPresets } from '../data/systemPresets';
import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Shield, User, Globe, RefreshCcw } from 'lucide-react';
import { fetchSharedPresets, deleteSharedPreset } from '../lib/sharedPresetService';

interface Props {
    selectedPreset: Preset | null;
    onSelect: (preset: Preset) => void;
    onEdit: (preset: Preset) => void;
    onDelete: (presetId: string) => void;
    refreshKey?: number; // triggers re-load
}

export default function PresetSelector({ selectedPreset, onSelect, onEdit, onDelete, refreshKey }: Props) {
    const [customPresets, setCustomPresets] = useState<Preset[]>([]);
    const [sharedPresets, setSharedPresets] = useState<Preset[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isLoadingShared, setIsLoadingShared] = useState(false);

    // Kept for backward compatibility if any local presets exist, but we emphasize shared now
    const loadCustomPresets = useCallback(() => {
        try {
            const stored = localStorage.getItem('customPresets');
            if (stored) {
                setCustomPresets(JSON.parse(stored));
            } else {
                setCustomPresets([]);
            }
        } catch (e) { }
    }, []);

    const loadSharedPresets = useCallback(async () => {
        setIsLoadingShared(true);
        try {
            const presets = await fetchSharedPresets();
            setSharedPresets(presets);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingShared(false);
        }
    }, []);

    useEffect(() => {
        loadCustomPresets();
        loadSharedPresets();
    }, [loadCustomPresets, loadSharedPresets, refreshKey]);

    const handleSelect = (preset: Preset) => {
        onSelect(preset);
    };

    const handleDeleteConfirm = async (preset: Preset) => {
        try {
            if (preset.type === 'shared') {
                await deleteSharedPreset(preset.id);
                setSharedPresets(prev => prev.filter(p => p.id !== preset.id));
            } else {
                // Local custom
                const stored = localStorage.getItem('customPresets');
                const presets: Preset[] = stored ? JSON.parse(stored) : [];
                const updated = presets.filter(p => p.id !== preset.id);
                localStorage.setItem('customPresets', JSON.stringify(updated));
                setCustomPresets(updated);
            }
            setConfirmDeleteId(null);
            onDelete(preset.id);
        } catch (e) {
            alert('Lỗi khi xóa preset');
        }
    };

    const renderPresetList = (presets: Preset[], emptyMessage: string, themeColor: 'emerald' | 'purple') => {
        if (presets.length === 0) {
            return <p className="text-sm text-zinc-600 italic px-4 py-3">{emptyMessage}</p>;
        }

        const bgColorClass = themeColor === 'emerald' ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300' : 'bg-purple-600/15 border-purple-500/40 text-purple-300';
        const colorClass = themeColor === 'emerald' ? 'text-emerald-400 hover:text-emerald-300' : 'text-purple-400 hover:text-purple-300';
        const hoverBgClass = themeColor === 'emerald' ? 'hover:bg-emerald-500/20' : 'hover:bg-purple-500/20';

        return (
            <div className="space-y-2">
                {presets.map(p => (
                    <div key={p.id} className="relative">
                        {/* Delete Confirmation Modal */}
                        {confirmDeleteId === p.id && (
                            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 px-4">
                                <span className="text-sm text-zinc-300 mr-2">Xóa &ldquo;{p.name}&rdquo;?</span>
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDeleteConfirm(p)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        )}

                        <div
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${selectedPreset?.id === p.id
                                ? bgColorClass
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                                }`}
                        >
                            <button
                                onClick={() => handleSelect(p)}
                                className="flex items-center gap-3 flex-1 text-left"
                            >
                                <div>
                                    <span className="font-medium">{p.name}</span>
                                    {p.authorName && (
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                                            bởi <strong className="text-zinc-300">{p.authorName}</strong>
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500">{p.outputs.length} sizes · {p.sourceBlocks.length} blocks</span>
                            </button>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                                    className={`p-2 rounded-lg ${hoverBgClass} text-zinc-400 ${colorClass} transition-colors`}
                                    title="Sửa preset"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                    title="Xóa preset"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Chọn Bộ kích thước (Preset)
                </label>

                {/* System Presets */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Presets</span>
                    </div>
                    <div className="space-y-2">
                        {systemPresets.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${selectedPreset?.id === p.id
                                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-xs text-zinc-500">{p.outputs.length} sizes · {p.sourceBlocks.length} blocks</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Shared Presets */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Public Shared Presets</span>
                        </div>
                        <button
                            onClick={loadSharedPresets}
                            disabled={isLoadingShared}
                            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                        >
                            <RefreshCcw className={`w-3 h-3 ${isLoadingShared ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>
                    {isLoadingShared && sharedPresets.length === 0 ? (
                        <div className="flex justify-center p-4">
                            <RefreshCcw className="w-5 h-5 text-purple-400 animate-spin" />
                        </div>
                    ) : (
                        renderPresetList(sharedPresets, "Chưa có preset được public. Hãy tạo một preset mới!", "purple")
                    )}
                </div>

                {/* Custom Presets (Legacy Local) */}
                {customPresets.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Local Private Presets</span>
                        </div>
                        {renderPresetList(customPresets, "Chưa có preset tùy chỉnh nào.", "emerald")}
                    </div>
                )}
            </div>
        </div>
    );
}
