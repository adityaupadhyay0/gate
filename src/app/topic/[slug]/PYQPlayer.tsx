"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BrainCircuit,
  Loader2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScientificCalculator from "@/components/ScientificCalculator";
import { saveAttempt } from "@/lib/actions/attempts";

export default function PYQPlayer({ pyqs, topicSlug }: { pyqs: any[], topicSlug: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentPYQ = pyqs[currentIndex];
  const options = JSON.parse(currentPYQ.options || '[]');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, currentIndex]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentPYQ.answer;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  const handleRate = async (value: number) => {
    setRating(value);
    setIsSubmitting(true);
    try {
        await saveAttempt({
            pyqId: currentPYQ.id,
            userAnswer: selectedOption!,
            isCorrect: isCorrect!,
            timeSpent: timer,
            confidenceLevel: value
        });
    } catch (e) {
        console.error("Failed to save attempt:", e);
        setRating(null);
    } finally {
        setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < pyqs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setRating(null);
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
                pyqId: currentPYQ.id,
                question: currentPYQ.question,
                options,
                answer: currentPYQ.answer,
                userAnswer: selectedOption
            })
        });
        const data = await resp.json();
        if (data.error) {
            setAiExplanation(data.error);
        } else {
            setAiExplanation(data.explanation);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Instant Insight - Grounded Metadata */}
      {showExplanation && currentPYQ.metadata?.oneLineExplanation && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 md:p-6 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1">Instant Insight</h4>
            <p className="text-white font-bold leading-relaxed text-sm md:text-base">
              {currentPYQ.metadata.oneLineExplanation}
            </p>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-800">
        {/* Player Header */}
        <div className="px-6 md:px-10 py-4 md:py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <span className="px-2 md:px-3 py-1 bg-white/10 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                 GATE {currentPYQ.year}
              </span>
              <div className="hidden sm:flex items-center gap-2 text-brand-400 text-xs font-bold">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                 Active Session
              </div>
           </div>
           <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs md:text-sm">
                 <Timer className="w-4 h-4" />
                 {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
                 {currentIndex + 1} <span className="text-slate-700">/</span> {pyqs.length}
              </div>
           </div>
        </div>

        {/* Question Area */}
        <div className="p-6 md:p-12 min-h-[300px] md:min-h-[400px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentPYQ.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8 md:space-y-12"
             >
                <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
                   {currentPYQ.question}
                </h2>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                   {options.map((option: string, i: number) => {
                      const letter = String.fromCharCode(65 + i);
                      const isSelected = selectedOption === option;
                      const isCorrectOption = showExplanation && option === currentPYQ.answer;
                      const isWrongSelection = showExplanation && isSelected && option !== currentPYQ.answer;

                      return (
                        <button
                          key={i}
                          disabled={showExplanation}
                          onClick={() => setSelectedOption(option)}
                          className={cn(
                            "flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-3xl text-left transition-all duration-300 border-2",
                            isSelected && !showExplanation ? "bg-brand-600/20 border-brand-500 text-white" :
                            isCorrectOption ? "bg-emerald-500/20 border-emerald-500 text-white" :
                            isWrongSelection ? "bg-red-500/20 border-red-500 text-white" :
                            "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black transition-all shrink-0",
                            isSelected && !showExplanation ? "bg-brand-500 text-white" :
                            isCorrectOption ? "bg-emerald-500 text-white" :
                            isWrongSelection ? "bg-red-500 text-white" :
                            "bg-white/10 text-slate-500"
                          )}>
                             {letter}
                          </div>
                          <span className="font-bold text-sm md:text-base">{option}</span>
                          {isCorrectOption && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 ml-auto text-emerald-500" />}
                          {isWrongSelection && <XCircle className="w-5 h-5 md:w-6 md:h-6 ml-auto text-red-500" />}
                        </button>
                      );
                   })}
                </div>
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 md:px-10 py-6 md:py-8 border-t border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex w-full md:w-auto gap-4">
              {!showExplanation ? (
                 <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="btn-primary w-full md:w-auto h-12 md:h-14 px-10 bg-brand-600 hover:bg-brand-500 text-sm md:text-base"
                 >
                    Submit Answer
                 </button>
              ) : (!rating || isSubmitting) ? (
                 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest md:mr-4">
                       {isSubmitting ? 'Saving Attempt...' : 'How was the recall?'}
                    </p>
                    <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
                      {[
                        { label: 'Again', val: 1, color: 'hover:bg-rose-500 hover:border-rose-500', active: 'bg-rose-500 border-rose-500 text-white' },
                        { label: 'Hard', val: 2, color: 'hover:bg-orange-500 hover:border-orange-500', active: 'bg-orange-500 border-orange-500 text-white' },
                        { label: 'Good', val: 3, color: 'hover:bg-emerald-500 hover:border-emerald-500', active: 'bg-emerald-500 border-emerald-500 text-white' },
                        { label: 'Easy', val: 4, color: 'hover:bg-brand-600 hover:border-brand-600', active: 'bg-brand-600 border-brand-600 text-white' }
                      ].map((r) => (
                        <button
                            key={r.val}
                            disabled={isSubmitting}
                            onClick={() => handleRate(r.val)}
                            className={cn(
                              "px-4 md:px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 transition-all",
                              r.color,
                              "hover:text-white",
                              rating === r.val && r.active
                            )}
                        >
                            {r.label}
                        </button>
                      ))}
                    </div>
                 </div>
              ) : (
                 <button
                  onClick={nextQuestion}
                  disabled={currentIndex === pyqs.length - 1}
                  className="btn-primary w-full md:w-auto h-12 md:h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-sm md:text-base"
                 >
                    Next Question <ArrowRight className="w-5 h-5" />
                 </button>
              )}
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={getAiHelp}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all group shrink-0"
              >
                 {isAiLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6 group-hover:scale-110" />}
              </button>
              <button className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all shrink-0">
                 <Lightbulb className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {aiExplanation && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             className="premium-card p-6 md:p-10 bg-slate-900 border-brand-500/30 text-white"
           >
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                 <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-500 rounded-lg md:rounded-xl flex items-center justify-center text-white shrink-0">
                    <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />
                 </div>
                 <div>
                    <h3 className="text-lg md:text-xl font-black">Technical Derivation</h3>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Gemini 1.5 Pro Analysis</p>
                 </div>
                 <button onClick={() => setAiExplanation(null)} className="ml-auto text-slate-500 hover:text-white">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>
              <div className="prose prose-invert max-w-none font-medium leading-relaxed text-slate-300 text-sm md:text-base">
                 {aiExplanation.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      <ScientificCalculator />
    </div>
  );
}
