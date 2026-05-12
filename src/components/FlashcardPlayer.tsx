"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FlashcardPlayer({ flashcards }: { flashcards: any[] }) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards.length) return null;

  const current = flashcards[index];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div
        className="perspective-1000 h-[400px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-12 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-6">Concept Recall</span>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              {current.front}
            </h3>
            <div className="mt-12 flex items-center gap-2 text-slate-400 text-xs font-bold">
               <RefreshCcw className="w-4 h-4" />
               Click to reveal answer
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl p-12 flex flex-col items-center justify-center text-center rotate-y-180"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-6">Technical Explanation</span>
            <p className="text-xl font-medium text-white leading-relaxed">
              {current.back}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between px-6">
        <button
          onClick={(e) => { e.stopPropagation(); setIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
          disabled={index === 0}
          className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
          {index + 1} <span className="text-slate-200">/</span> {flashcards.length}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setIndex(prev => Math.min(flashcards.length - 1, prev + 1)); setIsFlipped(false); }}
          disabled={index === flashcards.length - 1}
          className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-colors shadow-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
