'use client';

import { useState } from 'react';
import PresetResizeTab from '../components/PresetResizeTab';
import FreeResizeTab from '../components/FreeResizeTab';
import BlockResizeTab from '../components/BlockResizeTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'preset' | 'free' | 'block'>('preset');

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Image Resizer Pro
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Công cụ cắt và resize ảnh hàng loạt không làm méo hình. Giữ nguyên tỉ lệ chuẩn cho Meta, Google, TikTok, Moloco.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="glass-card p-1 rounded-full inline-flex">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'preset'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            Preset Resize
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'free'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            Free Resize
          </button>
          <button
            onClick={() => setActiveTab('block')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'block'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            Block Resize
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'preset' && <PresetResizeTab />}
        {activeTab === 'free' && <FreeResizeTab />}
        {activeTab === 'block' && <BlockResizeTab />}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Made by <span className="text-zinc-400 font-medium hover:text-blue-400 transition-colors cursor-pointer">cole_minh</span>
        </p>
      </div>
    </main>
  );
}
