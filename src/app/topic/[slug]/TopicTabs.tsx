"use client";

import { useState } from "react";
import PYQPlayer from "./PYQPlayer";

export default function TopicTabs({ pyqs, topicSlug }: { pyqs: any[], topicSlug: string }) {
  const [activeTab, setActiveTab] = useState('PYQs');

  const tabs = ['PYQs', 'Notes', 'Videos', 'Books'];

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold transition-colors ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 font-medium'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'PYQs' && <PYQPlayer pyqs={pyqs} topicSlug={topicSlug} />}
      {activeTab !== 'PYQs' && (
        <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed">
           <p className="text-gray-500 italic">
             {activeTab} for this topic are being curated by Gemini.
           </p>
           <button
             onClick={() => {
                // Future: track usage in ResourceService
                alert(`Tracking simulated usage for ${activeTab}. Learning Gain/Time logic activated.`);
             }}
             className="mt-4 text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-bold"
           >
             Open {activeTab}
           </button>
        </div>
      )}
    </div>
  );
}
