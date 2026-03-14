import { useRef } from 'react';
import { SourceBlock } from '../lib/types';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    block: SourceBlock;
    fileData?: { file: File; width: number; height: number };
    error?: string;
    onUpload: (file: File) => void;
    onRemove: () => void;
}

export default function SourceUploadBlock({ block, fileData, error, onUpload, onRemove }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        // reset input generic
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`relative glass-card rounded-xl p-5 border transition-all ${error ? 'border-red-500/50' : fileData ? 'border-green-500/30' : 'border-zinc-800'}`}>
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Info Area */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-zinc-100">{block.displayName}</h3>
                        {block.required && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Bắt buộc</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="bg-white/5 rounded p-2 border border-white/5">
                            <span className="text-zinc-500 block text-xs">Gợi ý kích thước</span>
                            <span className="font-mono text-zinc-300">{block.recommendedSize}</span>
                        </div>
                        <div className="bg-white/5 rounded p-2 border border-white/5">
                            <span className="text-zinc-500 block text-xs">Tỉ lệ mục tiêu</span>
                            <span className="font-mono text-blue-400 font-bold">{block.ratioLabel}</span>
                        </div>
                    </div>

                    <div className="text-sm text-zinc-400 mt-2 space-y-1">
                        {block.description && <p>{block.description}</p>}
                        {block.usageHint && <p className="italic text-zinc-500 text-xs">Lưu ý: {block.usageHint}</p>}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm mt-2 p-2 bg-red-500/10 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Upload Area */}
                <div className="sm:w-48 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700/50 rounded-lg p-4 bg-black/20 hover:border-blue-500/30 transition-colors cursor-pointer" onClick={() => !fileData && fileInputRef.current?.click()}>
                    {!fileData ? (
                        <>
                            <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                            <span className="text-xs text-zinc-400 font-medium">Tải ảnh lên</span>
                            <input type="file" ref={fileInputRef} onChange={handleChange} accept="image/*" className="hidden" />
                        </>
                    ) : (
                        <div className="w-full h-full relative group">
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 z-10 transition-colors shadow-lg"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="flex flex-col items-center gap-2 h-full justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                <span className="text-xs text-zinc-300 font-medium truncate w-full text-center px-2">{fileData.file.name}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">{fileData.width}x{fileData.height}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
