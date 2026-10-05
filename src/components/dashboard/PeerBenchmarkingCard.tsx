"use client";

import React, { useState } from "react";
import { UserPeerBenchmark } from "@/lib/services/PeerBenchmarkingService";
import { Users, Award, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PeerBenchmarkingCardProps {
  benchmark: UserPeerBenchmark;
}

export default function PeerBenchmarkingCard({ benchmark }: PeerBenchmarkingCardProps) {
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  const displayedSubjects = showAllSubjects
    ? benchmark.subjectBenchmarks
    : benchmark.subjectBenchmarks.slice(0, 4);

  return (
    <div className="glass-card p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm mb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Peer Benchmarking</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                Live Cohort
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time standing across {benchmark.totalUsers.toLocaleString()} active platform aspirants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Rank</p>
            <p className="text-lg font-black text-emerald-600">{benchmark.rankLabel}</p>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* National Percentile */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900 to-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-200 mb-1">
              National Percentile
            </p>
            <p className="text-3xl font-black text-white mb-2">
              {benchmark.percentile}%ile
            </p>
            <p className="text-xs text-brand-100 font-medium">
              Outperforming {benchmark.percentile}% of peer GATE aspirants nationwide.
            </p>

            {/* Visual Gauge Bar */}
            <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
              <motion.div
                className="bg-emerald-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${benchmark.percentile}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Estimated National Rank */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Est. National GATE Rank
            </p>
            <p className="text-3xl font-black text-slate-900">
              ~{benchmark.estimatedNationalRank.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3">
            Estimated out of ~100,000 national GATE CSE candidates.
          </p>
        </div>

        {/* Dynamic Relative Insights */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Cohort Insight
          </p>
          {benchmark.insights.topSubject ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-slate-700">
                Strongest Subject: <span className="font-black text-emerald-600">{benchmark.insights.topSubject.name}</span> (+{benchmark.insights.topSubject.advantage}% above peer avg)
              </p>
            </div>
          ) : null}

          {benchmark.insights.focusSubject ? (
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-slate-700">
                Peer Opportunity Gap: <span className="font-black text-amber-600">{benchmark.insights.focusSubject.name}</span> ({benchmark.insights.focusSubject.gap}% behind peer avg)
              </p>
            </div>
          ) : null}

          {!benchmark.insights.topSubject && !benchmark.insights.focusSubject && (
            <p className="text-xs text-slate-500 font-medium">
              Perform more diagnostic tests and topic practice to unlock subject cohort insights.
            </p>
          )}
        </div>
      </div>

      {/* Subject-Wise Peer Comparison Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            Subject Cohort Mastery vs Peers
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Legend: You vs Peer Average vs Top 10%
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {displayedSubjects.map((sub) => (
              <motion.div
                key={sub.subjectId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-brand-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{sub.subjectName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-slate-900">You: {sub.userMastery}%</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">Peer Avg: {sub.peerAverageMastery}%</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-emerald-600">Top 10%: {sub.topPerformersMastery}%</span>

                    <span className={cn(
                      "ml-2 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                      sub.diffFromAverage >= 0
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                      {sub.diffFromAverage >= 0 ? `+${sub.diffFromAverage}%` : `${sub.diffFromAverage}%`}
                    </span>
                  </div>
                </div>

                {/* Stacked / Comparison Progress visualizer */}
                <div className="space-y-1.5 pt-1">
                  {/* User mastery bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                    <motion.div
                      className="bg-brand-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.userMastery}%` }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Marker line for peer average */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                      style={{ left: `${sub.peerAverageMastery}%` }}
                      title={`Peer Average: ${sub.peerAverageMastery}%`}
                    />
                    {/* Marker line for top 10% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10"
                      style={{ left: `${sub.topPerformersMastery}%` }}
                      title={`Top 10%: ${sub.topPerformersMastery}%`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {benchmark.subjectBenchmarks.length > 4 && (
          <button
            onClick={() => setShowAllSubjects(!showAllSubjects)}
            className="w-full mt-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-100"
          >
            {showAllSubjects ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show All {benchmark.subjectBenchmarks.length} Subjects <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
