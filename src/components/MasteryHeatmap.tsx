"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopicMastery {
  id: string;
  name: string;
  slug: string;
  coverageScore: number;
}

interface SubjectMastery {
  id: string;
  name: string;
  topics: TopicMastery[];
}

export default function MasteryHeatmap({ subjects }: { subjects: SubjectMastery[] }) {
  return (
    <div className="space-y-8">
      {subjects.map((subject) => (
        <div key={subject.id} className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {subject.name}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {subject.topics.length} Units
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {subject.topics.map((topic) => {
              const score = topic.coverageScore || 0;
              return (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className={cn(
                    "w-6 h-6 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer shadow-sm",
                    score === 0 ? "bg-slate-100" :
                    score < 0.3 ? "bg-emerald-100" :
                    score < 0.6 ? "bg-emerald-300" :
                    score < 0.9 ? "bg-emerald-500" :
                    "bg-emerald-700 shadow-[0_0_10px_rgba(5,150,105,0.3)]"
                  )}
                  title={`${topic.name}: ${Math.round(score * 100)}%`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
