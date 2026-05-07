"use client";

import { useState } from "react";
import PYQPlayer from "./PYQPlayer";
import { History, FileText, Video, Book, Sparkles } from "lucide-react";

export default function TopicTabs({ pyqs, topicSlug }: { pyqs: any[], topicSlug: string }) {
  const [activeTab, setActiveTab] = useState('PYQs');

  const tabs = [
    { name: 'PYQs', icon: History },
    { name: 'Notes', icon: FileText },
    { name: 'Videos', icon: Video },
    { name: 'Books', icon: Book },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="text-sm">{tab.name}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'PYQs' && <PYQPlayer pyqs={pyqs} topicSlug={topicSlug} />}
        {activeTab !== 'PYQs' && (
          <div className="premium-card bg-slate-50 border-dashed border-2 py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-premium flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-jakarta font-black text-slate-900 mb-2">Curating {activeTab}...</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-8">
              Our ResourceService is currently scoring the best {activeTab.toLowerCase()} based on average learning gain.
            </p>
            <button
              onClick={() => {
                  alert(`Tracking simulated usage for ${activeTab}. Learning Gain logic activated.`);
              }}
              className="btn-secondary"
            >
              Open External Source
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
