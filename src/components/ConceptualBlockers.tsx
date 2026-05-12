"use client";

import { AlertTriangle, Brain, Target } from "lucide-react";

export default function ConceptualBlockers({ blockers }: { blockers: { concept: string, count: number }[] }) {
  if (!blockers || blockers.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Conceptual Blockers</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Root Cause Analysis</p>
        </div>
      </div>

      <div className="space-y-3">
        {blockers.map((blocker, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-bold text-slate-700">{blocker.concept}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">{blocker.count} Errors</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
        Targeted revision of these concepts is required before attempting advanced mock tests.
      </p>
    </div>
  );
}
