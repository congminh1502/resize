'use client';

import { useState, useEffect } from 'react';
import { ResizeBlock, P3OutputSize, SizePreset } from '../lib/types';
import ResizeBlockCard from './ResizeBlockCard';
import { Download, Plus, RefreshCw, Box, Save, PlusCircle, Edit2, Globe } from 'lucide-react';
import { resizeImageAdvanced } from '../lib/imageUtils';
import { generateZip } from '../lib/zipUtils';
import { fetchBlockPresets, saveBlockPreset, updateBlockPreset } from '../lib/blockPresetService';

export default function BlockResizeTab() {
    const [prefix, setPrefix] = useState('');
    const [blocks, setBlocks] = useState<ResizeBlock[]>([{
        id: crypto.randomUUID(),
        outputs: [],
        fitMode: 'contain_with_background',
        align: 'center',
        bgColor: '#ffffff'
    }]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Preset Library State
    const [presets, setPresets] = useState<SizePreset[]>([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(false);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(blocks[0].id);

    // New Preset Form State
    const [showNewPresetForm, setShowNewPresetForm] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetAuthor, setNewPresetAuthor] = useState('');
    const [newPresetSizes, setNewPresetSizes] = useState<P3OutputSize[]>([]);
    const [newW, setNewW] = useState('');
    const [newH, setNewH] = useState('');
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        setIsLoadingPresets(true);
        try {
            const fetched = await fetchBlockPresets();
            setPresets(fetched);
        } catch (e) {
            console.error("Failed to load block presets", e);
        } finally {
            setIsLoadingPresets(false);
        }
    };

    // --- Block Management ---

    const handleAddBlock = () => {
        const newId = crypto.randomUUID();
        setBlocks([...blocks, {
            id: newId,
            outputs: [],
            fitMode: 'contain_with_background',
            align: 'center',
            bgColor: '#ffffff'
        }]);
        setFocusedBlockId(newId);
    };

    const handleUpdateBlock = (id: string, updates: Partial<ResizeBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleRemoveBlock = (id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        if (focusedBlockId === id) {
            setFocusedBlockId(newBlocks.length > 0 ? newBlocks[0].id : null);
        }
    };

    // --- Preset Creation ---

    const addSizeToNewPreset = () => {
        const w = parseInt(newW);
        const h = parseInt(newH);
        if (!w || !h) return;
        setNewPresetSizes([...newPresetSizes, { width: w, height: h }]);
        setNewW('');
        setNewH('');
    };

    const removeSizeFromNewPreset = (idx: number) => {
        const newSizes = [...newPresetSizes];
        newSizes.splice(idx, 1);
        setNewPresetSizes(newSizes);
    };

    const handleSaveNewPreset = async () => {
        if (!newPresetName || !newPresetAuthor || newPresetSizes.length === 0) return;
        
        setIsSavingPreset(true);
        try {
            if (editingPresetId) {
                await updateBlockPreset(editingPresetId, newPresetName, newPresetAuthor, newPresetSizes);
            } else {
                await saveBlockPreset(newPresetName, newPresetAuthor, newPresetSizes);
            }
            setShowNewPresetForm(false);
            setNewPresetName('');
            setNewPresetAuthor('');
            setNewPresetSizes([]);
            setEditingPresetId(null);
            await loadPresets();
        } catch (e) {
            alert("Error saving preset");
        } finally {
            setIsSavingPreset(false);
        }
    };

    const handleEditPreset = (preset: SizePreset) => {
        setEditingPresetId(preset.id);
        setNewPresetName(preset.name);
        setNewPresetAuthor(preset.authorName || '');
        setNewPresetSizes([...preset.sizes]);
        setShowNewPresetForm(true);
    };


    // --- Generation ---

    const canGenerate = blocks.some(b => b.inputImage && b.outputs.length > 0);

    const handleGenerate = async () => {
        if (!canGenerate) return;
        setIsProcessing(true);

        try {
            const zipFiles: { name: string; blob: Blob }[] = [];

            for (const block of blocks) {
                if (!block.inputImage || block.outputs.length === 0) continue;

                for (const output of block.outputs) {
                    const blob = await resizeImageAdvanced(
                        block.inputImage,
                        output.width,
                        output.height,
                        block.fitMode,
                        block.align,
                        block.bgColor
                    );

                    // Name format: [prefix]_[width]x[height].[ext]
                    const ext = block.inputImage.name.substring(block.inputImage.name.lastIndexOf('.')) || '.jpg';
                    const newName = prefix
                        ? `${prefix}_${output.width}x${output.height}${ext}`
                        : `${output.width}x${output.height}${ext}`;
                    
                    // Prevent duplicate names in zip if same size requested multiple times or across blocks with same prefix
                    const uniqueName = zipFiles.some(f => f.name === newName) 
                        ? newName.replace(ext, `_${block.id.substring(0,4)}${ext}`)
                        : newName;

                    zipFiles.push({ name: uniqueName, blob });
                }
            }

            if (zipFiles.length > 0) {
                const zipFilename = `block_resize_${Date.now()}.zip`;
                await generateZip(zipFiles, zipFilename);
            } else {
                alert("Không có ảnh nào hợp lệ để xuất.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi quá trình xử lý ảnh!");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Area: Session Config & Preset Library */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Prefix */}
                <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-center h-full">
                    <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                        <Box className="w-4 h-4 text-blue-400" />
                        Tiền tố (Prefix) chung
                    </label>
                    <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="VD: BANNER_SALE"
                        className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                    />
                     <p className="text-xs text-zinc-500 mt-2">
                            Tên mẫu: <span className="text-blue-400 font-mono">[Prefix]_{"{rộng}x{cao}"}.jpg</span>
                    </p>
                </div>

                {/* Preset Library / Form */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-t-4 border-purple-500 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                             Công Cụ Hỗ Trợ
                        </h3>
                        {!showNewPresetForm && (
                            <button 
                                onClick={() => setShowNewPresetForm(true)}
                                className="text-sm px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg font-medium transition-colors border border-purple-500/30 flex items-center gap-1.5"
                            >
                                <PlusCircle className="w-4 h-4" /> Tạo Preset Mới
                            </button>
                        )}
                    </div>

                    {showNewPresetForm ? (
                        <div className="bg-black/30 p-4 rounded-xl border border-zinc-800 space-y-4 animate-in slide-in-from-top-2">
                            <h4 className="font-semibold text-purple-300 text-sm">
                                {editingPresetId ? 'Sửa thông tin Preset' : 'Thông tin Preset Kích Thước'}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Tên chức năng (VD: Facebook Pack)" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />
                                <input type="text" placeholder="Tác giả" value={newPresetAuthor} onChange={e => setNewPresetAuthor(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />
                            </div>
                            
                            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <span className="text-xs text-zinc-500 block mb-2">Các kích thước:</span>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {newPresetSizes.map((sz, i) => (
                                        <div key={i} className="bg-zinc-800 px-2 py-1 rounded text-xs font-mono text-zinc-300 flex items-center gap-1 border border-zinc-700">
                                            {sz.width}×{sz.height}
                                            <button onClick={() => removeSizeFromNewPreset(i)} className="text-zinc-500 hover:text-red-400 ml-1">×</button>
                                        </div>
                                    ))}
                                    {newPresetSizes.length === 0 && <span className="text-xs text-zinc-600 italic">Chưa có kích thước nào</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="W" value={newW} onChange={e => setNewW(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSizeToNewPreset()} className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-xs" />
                                    <span className="text-zinc-500">×</span>
                                    <input type="number" placeholder="H" value={newH} onChange={e => setNewH(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSizeToNewPreset()} className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-xs" />
                                    <button onClick={addSizeToNewPreset} className="bg-zinc-800 px-3 py-1 rounded text-xs hover:bg-zinc-700">Thêm</button>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <button onClick={() => {
                                    setShowNewPresetForm(false);
                                    setEditingPresetId(null);
                                    setNewPresetName('');
                                    setNewPresetAuthor('');
                                    setNewPresetSizes([]);
                                }} className="px-4 py-1.5 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700">Đóng</button>
                                <button 
                                    onClick={handleSaveNewPreset} 
                                    disabled={!newPresetName || !newPresetAuthor || newPresetSizes.length === 0 || isSavingPreset}
                                    className="px-4 py-1.5 rounded-lg text-sm bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
                                >
                                    {isSavingPreset ? 'Đang lưu...' : (editingPresetId ? 'Cập Nhật Preset' : 'Lưu Public Preset')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="text-sm text-zinc-400">
                                Preset giúp lưu nhanh nhiều kích thước đầu ra để sử dụng lại cho các Job sau. Preset được chia sẻ chung cho mọi người. 
                                Hãy chọn Preset tương ứng ở dropdown <span className="text-zinc-300 font-bold">&quot;Load từ Preset&quot;</span> bên trong từng thẻ Block bên dưới!
                            </div>
                            
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {isLoadingPresets ? (
                                    <div className="text-sm text-zinc-500 italic p-4">Đang tải...</div>
                                ) : presets.length === 0 ? (
                                    <div className="text-sm text-zinc-500 italic p-4">Chưa có preset public nào. Hãy tạo mới!</div>
                                ) : (
                                    presets.map(p => (
                                        <div
                                            key={p.id}
                                            className="shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left min-w-[200px] flex flex-col group relative"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm text-zinc-200">{p.name}</span>
                                                <Globe className="w-3 h-3 text-zinc-600" />
                                            </div>
                                            <span className="text-xs text-zinc-500 mb-2">bởi {p.authorName}</span>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {p.sizes.slice(0, 3).map((sz, i) => (
                                                    <span key={i} className="text-[10px] bg-black/50 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-400">
                                                        {sz.width}x{sz.height}
                                                    </span>
                                                ))}
                                                {p.sizes.length > 3 && (
                                                    <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">+{p.sizes.length - 3}</span>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleEditPreset(p)}
                                                className="absolute top-2 right-2 p-1 bg-purple-500/80 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-purple-600"
                                                title="Sửa preset"    
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Blocks List */}
            <div className="space-y-6">
                {blocks.map((block, i) => (
                    <div 
                        key={block.id} 
                        onClick={() => setFocusedBlockId(block.id)}
                        className={`transition-all rounded-2xl ${focusedBlockId === block.id ? 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-900/5' : 'hover:bg-white/5 opacity-80'}`}
                    >
                         <ResizeBlockCard
                            index={i}
                            block={block}
                            onChange={handleUpdateBlock}
                            onRemove={handleRemoveBlock}
                            isFocused={focusedBlockId === block.id}
                            presets={presets}
                        />
                    </div>
                ))}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky bottom-6 z-20">
                <button
                    onClick={handleAddBlock}
                    className="w-full md:w-auto px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-2xl border border-zinc-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5 text-zinc-400" />
                    Thêm Block Mới
                </button>

                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || isProcessing}
                    className="w-full md:flex-1 max-w-md glass-card p-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/20 hover:border-blue-500/50 transition-all border border-zinc-700 shadow-xl shadow-blue-900/10 group"
                >
                    {isProcessing ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                    ) : (
                        <Download className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{isProcessing ? 'Đang xử lý...' : 'Generate Tất Cả (ZIP)'}</span>
                </button>
            </div>
            
            {!canGenerate && blocks.length > 0 && (
                <div className="text-center text-sm text-zinc-500 pb-8">
                    * Vui lòng thêm ít nhất 1 ảnh và 1 kích thước đầu ra để có thể xuất file.
                </div>
            )}
        </div>
    );
}
