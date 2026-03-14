import { Preset } from '../lib/types';
import { Box } from 'lucide-react';

export default function OutputSizeList({ preset }: { preset: Preset }) {
    // Group outputs by ratio for display
    const grouped = preset.outputs.reduce((acc, curr) => {
        if (!acc[curr.ratioKey]) acc[curr.ratioKey] = [];
        acc[curr.ratioKey].push(curr);
        return acc;
    }, {} as Record<string, typeof preset.outputs>);

    return (
        <div className="glass-card rounded-2xl p-6 h-full border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <Box className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-zinc-100">Kích thước đầu ra ({preset.outputs.length})</h3>
            </div>

            <div className="space-y-6">
                {Object.entries(grouped).map(([ratioKey, sizes]) => {
                    const block = preset.sourceBlocks.find(b => b.ratioKey === ratioKey);
                    return (
                        <div key={ratioKey}>
                            <div className="text-xs font-bold text-zinc-500 mb-3 border-b border-zinc-800 pb-1 uppercase tracking-wider">
                                Ratio {block?.ratioLabel || ratioKey}
                            </div>
                            <ul className="space-y-2 grid grid-cols-2 gap-2">
                                {sizes.map(size => (
                                    <li key={size.id} className="bg-black/30 border border-zinc-800/50 rounded-lg p-3 flex flex-col justify-center items-center text-center">
                                        <span className="text-sm font-mono text-blue-400 mb-1">
                                            {size.width} × {size.height}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 truncate w-full" title={size.label}>
                                            {size.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
