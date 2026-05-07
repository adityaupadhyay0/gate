"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BrainCircuit,
  Loader2,
  Trophy,
  History,
  Binary,
  Layers,
  Sparkles,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScientificCalculator from "@/components/ScientificCalculator";

export default function PYQPlayer({ pyqs, questionBank, topicSlug }: { pyqs: any[], questionBank: any[], topicSlug: string }) {
  const [source, setSource] = useState<"pyq" | "bank">("pyq");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const pool = source === "pyq" ? pyqs : questionBank;

  const filteredPool = filterDifficulty === "all"
    ? pool
    : pool.filter(p => p.difficulty === filterDifficulty);

  const currentQ = filteredPool[currentIndex];
  const options = JSON.parse(currentQ?.options || '[]');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, currentIndex, source]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentQ.answer;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < filteredPool.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setStartTime(Date.now());
    setTimer(0);
    setAiExplanation(null);
  };

  const getAiHelp = async () => {
    setIsAiLoading(true);
    try {
        const resp = await fetch('/api/ai/explain', {
            method: 'POST',
            body: JSON.stringify({
                question: currentQ.question,
                options,
                answer: currentQ.answer,
                userAnswer: selectedOption
            })
        });
        const data = await resp.json();
        setAiExplanation(data.explanation);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAiLoading(false);
    }
  };

  if (filteredPool.length === 0) return (
     <div className="premium-card py-32 text-center flex flex-col items-center">
        <Search className="w-16 h-16 text-slate-200 mb-6" />
        <h3 className="text-2xl font-black text-slate-900 mb-2">No Matching Challenges</h3>
        <p className="text-slate-500 font-medium max-w-sm mb-8">
           We don&apos;t have any questions matching the &quot;{filterDifficulty}&quot; filter in the {source === "pyq" ? "Real PYQ" : "Practice Bank"} set yet.
        </p>
        <button
           onClick={() => { setFilterDifficulty("all"); setCurrentIndex(0); resetState(); }}
           className="btn-primary bg-slate-900"
        >
           Clear Filters
        </button>
     </div>
  );

  return (
    <div className="space-y-8">
      {/* Filters & navigation */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-100 rounded-xl">
               <button
                onClick={() => { setSource("pyq"); setCurrentIndex(0); resetState(); }}
                className={cn("px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", source === "pyq" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
               >
                  <History className="w-3.5 h-3.5" />
                  Real PYQs
               </button>
               <button
                onClick={() => { setSource("bank"); setCurrentIndex(0); resetState(); }}
                className={cn("px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", source === "bank" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
               >
                  <Sparkles className="w-3.5 h-3.5" />
                  Practice Bank
               </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-100 mx-2" />

            <div className="flex p-1 bg-slate-100 rounded-xl">
               {['all', 'easy', 'medium', 'hard'].map(d => (
                 <button
                  key={d}
                  onClick={() => { setFilterDifficulty(d); setCurrentIndex(0); resetState(); }}
                  className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filterDifficulty === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                 >
                    {d}
                 </button>
               ))}
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-900 px-4 py-2 rounded-xl text-emerald-400 border border-emerald-500/20">
               <Timer className="w-4 h-4 text-emerald-500" />
               {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
         </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border border-slate-800">
        <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</span>
                 <div className="flex items-center gap-2">
                    {source === "pyq" ? <History className="w-4 h-4 text-brand-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                    <span className="text-white font-black text-sm">{source === "pyq" ? `GATE ${currentQ.year}` : 'Adaptive Practice'}</span>
                 </div>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Architecture</span>
                 <div className="flex items-center gap-2">
                    <Binary className="w-4 h-4 text-brand-400" />
                    <span className="text-white font-black text-sm uppercase">{currentQ.class}</span>
                 </div>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Set Progress</p>
              <div className="text-white font-black text-xl leading-none">
                 {currentIndex + 1} <span className="text-slate-700 text-sm">/</span> {filteredPool.length}
              </div>
           </div>
        </div>

        <div className="p-16 min-h-[450px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={`${source}-${currentQ.id}`}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-16"
             >
                <div className="space-y-6">
                   <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border",
                      currentQ.difficulty === 'hard' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      currentQ.difficulty === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                   )}>
                      <Layers className="w-3 h-3" />
                      {currentQ.difficulty} Rank Challenge
                   </div>
                   <h2 className="text-3xl md:text-4xl font-bold text-white leading-[1.2] tracking-tight">
                      {currentQ.question}
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {options.map((option: string, i: number) => {
                      const letter = String.fromCharCode(65 + i);
                      const isSelected = selectedOption === option;
                      const isCorrectOption = showExplanation && option === currentQ.answer;
                      const isWrongSelection = showExplanation && isSelected && option !== currentQ.answer;

                      return (
                        <button
                          key={i}
                          disabled={showExplanation}
                          onClick={() => setSelectedOption(option)}
                          className={cn(
                            "group flex items-center gap-6 p-8 rounded-[2rem] text-left transition-all duration-500 border-2 relative overflow-hidden",
                            isSelected && !showExplanation ? "bg-brand-600 border-brand-400 text-white shadow-2xl shadow-brand-600/40" :
                            isCorrectOption ? "bg-emerald-500 border-emerald-400 text-white shadow-2xl shadow-emerald-500/40" :
                            isWrongSelection ? "bg-red-500 border-red-400 text-white shadow-2xl shadow-red-500/40" :
                            "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500",
                            isSelected || isCorrectOption || isWrongSelection ? "bg-white/20 text-white" :
                            "bg-white/10 text-slate-500 group-hover:bg-brand-500 group-hover:text-white"
                          )}>
                             {letter}
                          </div>
                          <span className="font-bold text-lg">{option}</span>
                          {isCorrectOption && <CheckCircle2 className="w-8 h-8 ml-auto text-white" />}
                          {isWrongSelection && <XCircle className="w-8 h-8 ml-auto text-white" />}
                        </button>
                      );
                   })}
                </div>
             </motion.div>
           </AnimatePresence>
        </div>

        <div className="px-12 py-10 border-t border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex gap-4 w-full md:w-auto">
              {!showExplanation ? (
                 <button onClick={handleSubmit} disabled={!selectedOption} className="btn-primary h-16 px-12 bg-brand-600 hover:bg-brand-500 text-lg w-full md:w-auto shadow-glow">
                    Validate Strategy
                 </button>
              ) : (
                 <button onClick={nextQuestion} disabled={currentIndex === filteredPool.length - 1} className="btn-primary h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-lg w-full md:w-auto">
                    Advance Module <ArrowRight className="w-5 h-5" />
                 </button>
              )}
           </div>

           <div className="flex items-center gap-4">
              <button onClick={getAiHelp} className="w-16 h-16 rounded-[1.5rem] bg-white/5 text-slate-400 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all group shadow-xl">
                 {isAiLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <BrainCircuit className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
              </button>
              <div className="h-10 w-[1px] bg-white/10 mx-2" />
              <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industrial</span>
                  <span className="text-white font-bold">Standard Active</span>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {aiExplanation && (
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="premium-card p-12 bg-slate-900 border-brand-500/30 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-[120px] opacity-20 -z-10"></div>
              <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                 <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-glow">
                    <BrainCircuit className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tight text-white">Gemini Conceptual Derivation</h3>
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Scientific Rigor v2.0</p>
                 </div>
                 <button onClick={() => setAiExplanation(null)} className="ml-auto w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>
              <div className="prose prose-invert max-w-none font-medium leading-[1.8] text-slate-300 text-lg">
                 {aiExplanation.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      <ScientificCalculator />
    </div>
  );
}
