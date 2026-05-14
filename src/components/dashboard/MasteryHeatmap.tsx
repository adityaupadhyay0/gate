"use client";

import { cn } from "@/lib/utils";

interface MasteryHeatmapProps {
  topics: {
    id: string;
    name: string;
    userProgress: {
      status: string;
      coverageScore: number;
    }[];
  }[];
}

export default function MasteryHeatmap({ topics }: MasteryHeatmapProps) {
  return (
    <div className="flex flex-wrap gap-1.5 max-w-full">
      {topics.map((topic) => {
        const progress = topic.userProgress[0];
        const status = progress?.status || "Locked";
        const score = progress?.coverageScore || 0;

        return (
          <div
            key={topic.id}
            title={`${topic.name} | Mastery: ${Math.round(score * 100)}% | Status: ${status}`}
            className={cn(
              "w-3 h-3 rounded-sm transition-all duration-300 cursor-help",
              status === "Locked" ? "bg-slate-200" :
              score >= 0.8 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
              score >= 0.5 ? "bg-brand-500 shadow-[0_0_8px_rgba(37,99,235,0.3)]" :
              score >= 0.2 ? "bg-brand-300" :
              "bg-slate-300"
            )}
          />
        );
      })}
    </div>
  );
}
