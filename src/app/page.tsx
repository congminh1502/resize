'use client';

import { useState } from 'react';
import PresetResizeTab from '../components/PresetResizeTab';
import FreeResizeTab from '../components/FreeResizeTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'preset' | 'free'>('preset');

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
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'preset' ? <PresetResizeTab /> : <FreeResizeTab />}
      </div>
    </main>
  );
}
