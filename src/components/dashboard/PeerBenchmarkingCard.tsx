import React from "react";
import { UserBenchmarkingResult } from "@/lib/services/PeerBenchmarkingService";
import { Users, Award, TrendingUp, BarChart2, ShieldCheck } from "lucide-react";

interface PeerBenchmarkingCardProps {
  benchmarking: UserBenchmarkingResult;
}

export default function PeerBenchmarkingCard({ benchmarking }: PeerBenchmarkingCardProps) {
  const {
    rank,
    totalUsers,
    topPercentile,
    overallPercentile,
    overallScore,
    syllabusCoverage,
    diagnosticAverage,
    peerAverageScore
  } = benchmarking;

  const scoreDiff = Math.round((overallScore - peerAverageScore) * 10) / 10;
  const isAboveAverage = scoreDiff >= 0;

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Peer Benchmarking</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Rank distribution based on syllabus coverage (60%) and diagnostic mastery (40%).</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shrink-0">
          <Award className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Standing</span>
            <span className="text-xl font-black tracking-tighter text-emerald-600">Top {topPercentile}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Global Percentile</span>
          <p className="text-2xl md:text-3xl font-black tracking-tighter text-emerald-600">
            {overallPercentile}<span className="text-sm text-slate-400 font-bold ml-0.5">th</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Top {topPercentile}% Aspirants</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Estimated Rank</span>
          <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
            #{rank} <span className="text-xs text-slate-400 font-bold">/ {totalUsers}</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Rank Position</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Composite Score</span>
          <p className="text-2xl md:text-3xl font-black tracking-tighter text-brand-600">
            {overallScore}
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Out of 100 max</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">vs Peer Average</span>
          <p className={`text-2xl md:text-3xl font-black tracking-tighter ${isAboveAverage ? "text-emerald-600" : "text-amber-600"}`}>
            {isAboveAverage ? `+${scoreDiff}` : `${scoreDiff}`}
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Avg Peer: {peerAverageScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Syllabus Coverage (60% weight)</span>
            <span className="text-xs text-slate-400 font-medium">Topic completion mastery</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">{syllabusCoverage}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Diagnostic Average (40% weight)</span>
            <span className="text-xs text-slate-400 font-medium">Subject strength map mean</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">{diagnosticAverage}%</span>
        </div>
      </div>
    </div>
  );
}
