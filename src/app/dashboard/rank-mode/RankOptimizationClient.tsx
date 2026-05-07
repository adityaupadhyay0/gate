"use client";

import { useState } from "react";
import { getSprintAction } from "@/lib/actions/rank";
import Link from "next/link";

export default function RankOptimizationClient({ topics }: { topics: any[] }) {
  const [sprint, setSprint] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const data = await getSprintAction();
    setSprint(data);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="p-6 bg-blue-900 text-white rounded-xl shadow-lg flex items-center justify-between">
         <div>
           <h2 className="text-xl font-bold mb-1">High ROI Opportunities Detected</h2>
           <p className="opacity-80 text-sm">Targeting these topics could increase your predicted score by 8-12 marks.</p>
         </div>
         <button
           onClick={handleGenerate}
           disabled={loading}
           className="bg-white text-blue-900 px-6 py-2 rounded-lg font-bold disabled:opacity-50"
         >
           {loading ? 'Generating...' : 'Generate 30-Day Sprint'}
         </button>
      </div>

      {sprint && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-amber-900">Your 30-Day Rank Booster Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
             {sprint.map(day => (
               <div key={day.day} className="p-4 bg-white border rounded-lg shadow-sm">
                 <p className="text-xs font-bold text-amber-600 uppercase">Day {day.day}</p>
                 <h4 className="font-bold text-gray-800">{day.topicName}</h4>
                 <p className="text-sm text-gray-500 mt-1">{day.task}</p>
                 <p className="text-xs text-gray-400 mt-2 font-medium">{day.hours} Hours estimated</p>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">PYQs</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ROI Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topics.slice(0, 10).map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{topic.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{topic.subjectName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{topic._count.pyqs}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                    {topic.roi.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/topic/${topic.slug}`} className="text-blue-600 font-bold hover:underline">Study Now</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
