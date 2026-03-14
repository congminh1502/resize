'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ResizeBlock, SizePreset } from '../lib/types';
import { readImageDimensions } from '../lib/imageUtils';
import { Upload, X, Trash2, Plus, Target, AlignCenter, AlignLeft, AlignRight, Palette } from 'lucide-react';

interface Props {
    block: ResizeBlock;
    index: number;
    onChange: (id: string, updates: Partial<ResizeBlock>) => void;
    onRemove: (id: string) => void;
    isFocused?: boolean;
    presets: SizePreset[];
}

export default function ResizeBlockCard({ block, index, onChange, onRemove, isFocused = false, presets = [] }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newW, setNewW] = useState('');
    const [newH, setNewH] = useState('');

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dims = await readImageDimensions(file);
            const url = URL.createObjectURL(file);
            
            if (block.previewUrl) URL.revokeObjectURL(block.previewUrl);
            
            onChange(block.id, {
                inputImage: file,
                previewUrl: url,
                originalDim: dims
            });
        } catch (err) {
            alert('Lỗi khi đọc file ảnh.');
        }
    };

    const clearFile = () => {
        if (block.previewUrl) URL.revokeObjectURL(block.previewUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onChange(block.id, { inputImage: undefined, previewUrl: undefined, originalDim: undefined });
    };

    const addOutput = () => {
        const w = parseInt(newW);
        const h = parseInt(newH);
        if (!w || !h) return;
        onChange(block.id, { outputs: [...block.outputs, { width: w, height: h }] });
        setNewW('');
        setNewH('');
    };

    const removeOutput = (idx: number) => {
        const newOutputs = [...block.outputs];
        newOutputs.splice(idx, 1);
        onChange(block.id, { outputs: newOutputs });
    };

    const handlePresetSelected = (e: ChangeEvent<HTMLSelectElement>) => {
        const presetId = e.target.value;
        if (!presetId) return;
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            const existing = new Set(block.outputs.map(o => `${o.width}x${o.height}`));
            const toAdd = preset.sizes.filter(s => !existing.has(`${s.width}x${s.height}`));
            onChange(block.id, { outputs: [...block.outputs, ...toAdd] });
        }
        e.target.value = ''; // Reset select after adding
    };

    return (
        <div className={`glass-card rounded-2xl p-5 relative border transition-all ${isFocused ? 'border-purple-500/50' : 'border-zinc-800/80'} group`}>
            {/* Header / ID */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onRemove(block.id); }} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Xóa Block">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isFocused ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {index + 1}
                </div>
                <h3 className={`text-base font-bold ${isFocused ? 'text-zinc-100' : 'text-zinc-400'}`}>Khu vực Resize Job {isFocused && <span className="ml-2 text-xs font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Đang chọn</span>}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* 1. COMPACT IMAGE (left side, 3 cols) */}
                <div className="md:col-span-3 flex flex-col gap-3">
                    {!block.inputImage ? (
                        <div
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="w-full aspect-square border-2 border-dashed border-zinc-700/50 hover:border-purple-500/50 transition-colors rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-300 bg-black/20"
                        >
                            <Upload className="w-5 h-5" />
                            <span className="text-xs font-medium">Tải một ảnh</span>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="w-full aspect-square relative bg-black/40 border border-zinc-800 rounded-xl overflow-hidden group/img">
                            <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-red-500/80 p-1 rounded-md transition-colors opacity-0 group-hover/img:opacity-100">
                                <X className="w-3 h-3 text-white" />
                            </button>
                            <div className="w-full h-full flex items-center justify-center p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={block.previewUrl} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-4 flex flex-col items-center pointer-events-none">
                                <span className="text-[10px] text-zinc-300 truncate w-full text-center" title={block.inputImage.name}>{block.inputImage.name}</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-100">{block.originalDim?.width} × {block.originalDim?.height} px</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. CONFIGURATION (middle, 4 cols) */}
                <div className="md:col-span-4 flex flex-col gap-4 border-l border-zinc-800/50 pl-6">
                    <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Chế Độ Resize</span>
                        <div className="space-y-2">
                            <label className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg border transition-colors hover:bg-zinc-800/30 ${block.fitMode === 'cover_crop' ? 'bg-purple-600/10 border-purple-500/40' : 'bg-black/20 border-zinc-800/50'}`}>
                                <input type="radio" checked={block.fitMode === 'cover_crop'} onChange={() => onChange(block.id, { fitMode: 'cover_crop' })} className="mt-0.5 text-purple-500 bg-zinc-900 border-zinc-700" />
                                <div>
                                    <div className={`text-sm font-semibold ${block.fitMode === 'cover_crop' ? 'text-purple-300' : 'text-zinc-300'}`}>Cắt lấp đầy (Crop)</div>
                                    <div className="text-[10px] text-zinc-500">Giữ chặt tỉ lệ, mất góc</div>
                                </div>
                            </label>
                            
                            <label className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg border transition-colors hover:bg-zinc-800/30 ${block.fitMode === 'contain_with_background' ? 'bg-purple-600/10 border-purple-500/40' : 'bg-black/20 border-zinc-800/50'}`}>
                                <input type="radio" checked={block.fitMode === 'contain_with_background'} onChange={() => onChange(block.id, { fitMode: 'contain_with_background' })} className="mt-0.5 text-purple-500 bg-zinc-900 border-zinc-700" />
                                <div className="w-full">
                                    <div className={`text-sm font-semibold ${block.fitMode === 'contain_with_background' ? 'text-purple-300' : 'text-zinc-300'}`}>Vừa khung + Màu nền</div>
                                    <div className="text-[10px] text-zinc-500 mb-1">Giữ nguyên ảnh, bù nền</div>
                                    {block.fitMode === 'contain_with_background' && (
                                        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-md mt-1" onClick={e => e.stopPropagation()}>
                                            <Palette className="w-3 h-3 text-zinc-400 ml-1" />
                                            <input type="color" value={block.bgColor} onChange={e => onChange(block.id, { bgColor: e.target.value })} className="w-4 h-4 rounded cursor-pointer p-0 border-0 bg-transparent inline-block" />
                                            <span className="text-[10px] font-mono text-zinc-400">{block.bgColor}</span>
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg border transition-colors hover:bg-zinc-800/30 ${block.fitMode === 'contain_no_background' ? 'bg-purple-600/10 border-purple-500/40' : 'bg-black/20 border-zinc-800/50'}`}>
                                <input type="radio" checked={block.fitMode === 'contain_no_background'} onChange={() => onChange(block.id, { fitMode: 'contain_no_background' })} className="mt-0.5 text-purple-500 bg-zinc-900 border-zinc-700" />
                                <div>
                                    <div className={`text-sm font-semibold ${block.fitMode === 'contain_no_background' ? 'text-purple-300' : 'text-zinc-300'}`}>Thu nhỏ trong suốt</div>
                                    <div className="text-[10px] text-zinc-500">Nền rỗng (dành cho PNG)</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Vị Trí (Align)</span>
                        <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">
                             {[
                                { id: 'left', icon: AlignLeft, label: 'Trái' },
                                { id: 'center', icon: AlignCenter, label: 'Giữa' },
                                { id: 'right', icon: AlignRight, label: 'Phải' }
                            ].map(aln => (
                                <button
                                    key={aln.id}
                                    onClick={(e) => { e.stopPropagation(); onChange(block.id, { align: aln.id as ResizeBlock['align'] }); }}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-medium rounded transition-all ${
                                        block.align === aln.id ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <aln.icon className="w-3 h-3" /> {aln.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. OUTPUT SIZES (right side, 5 cols, primary focus) */}
                <div className="md:col-span-5 flex flex-col bg-black/30 border border-zinc-800/80 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-zinc-200">Kích Thuớc Xuất File</span>
                        <div className="flex items-center gap-2">
                             <select
                                onChange={handlePresetSelected}
                                defaultValue=""
                                className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 max-w-[140px] focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none"
                            >
                                <option value="" disabled>Load từ Preset...</option>
                                {presets.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sizes.length})</option>
                                ))}
                            </select>
                            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-700">{block.outputs.length}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start custom-scrollbar overflow-y-auto max-h-[160px]">
                         {block.outputs.length === 0 ? (
                            <div className="w-full flex items-center justify-center text-xs text-zinc-600 italic text-center h-[100px] border border-dashed border-zinc-800 rounded-lg">
                                Nhập kích thước bên dưới<br/>hoặc chọn preset từ dropdown
                            </div>
                        ) : (
                            block.outputs.map((out, idx) => (
                                <div key={idx} className="flex items-center bg-zinc-800/60 border border-zinc-700/80 pl-3 pr-1 py-1 rounded-full group cursor-default shadow-sm hover:border-purple-500/30 transition-colors">
                                    <span className="font-mono text-sm font-bold text-zinc-200 tracking-tight">
                                        {out.width}<span className="text-zinc-500 font-normal mx-1">×</span>{out.height}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); removeOutput(idx); }} className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-1 ml-2 rounded-full transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Manual entry row inside the outputs area */}
                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 flex-1 bg-zinc-900 border border-zinc-700 p-1 rounded-lg focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                             <input type="number" placeholder="Width" value={newW} onChange={e => setNewW(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOutput()} className="w-full bg-transparent border-0 px-2 py-1 text-sm focus:ring-0 text-center font-mono text-zinc-200" />
                            <span className="text-zinc-600 text-sm">×</span>
                            <input type="number" placeholder="Height" value={newH} onChange={e => setNewH(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOutput()} className="w-full bg-transparent border-0 px-2 py-1 text-sm focus:ring-0 text-center font-mono text-zinc-200" />
                        </div>
                        <button onClick={addOutput} disabled={!newW || !newH} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors shrink-0">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
