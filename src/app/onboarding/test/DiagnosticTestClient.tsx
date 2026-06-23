"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitDiagnosticResults } from "@/lib/actions/onboarding";
import { Timer, ArrowRight, Zap, Target, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiagnosticTestClient({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ pyqId: string, isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleAnswer(null); // Time out
    }
  }, [timeLeft, currentIndex]);

  const handleAnswer = (selectedOption: string | null) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    const newAnswers = [...answers, { pyqId: currentQuestion.id, isCorrect }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(45);
    } else {
      submitResults(newAnswers);
    }
  };

  const submitResults = async (finalAnswers: any[]) => {
    setIsSubmitting(true);
    try {
      await submitDiagnosticResults(finalAnswers);
      router.push("/roadmap");
    } catch (e) {
      console.error(e);
      alert("Please sign in to save your results.");
      router.push("/");
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
         <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative mb-12"
         >
           <div className="w-24 h-24 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
           <Target className="w-8 h-8 text-brand-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
         </motion.div>
         <h2 className="text-4xl font-jakarta font-black text-slate-900 mb-4 tracking-tight">Analyzing Your Potential</h2>
         <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
           Our engine is processing your responses to build a <span className="text-brand-600 font-bold">rank-optimized</span> roadmap tailored to your baseline.
         </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return <div className="text-center py-20 font-bold">No questions available.</div>;

  const options = JSON.parse(currentQuestion.options);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-12 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5">
             {questions.map((_, i) => (
               <div
                 key={i}
                 className={`h-1.5 rounded-full transition-all duration-700 ${
                   i < currentIndex ? 'bg-brand-600 w-4' :
                   i === currentIndex ? 'bg-brand-500 w-8 shadow-sm shadow-brand-100' :
                   'bg-slate-100 w-2'
                 }`}
               ></div>
             ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Step {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-xs tracking-widest border-2 transition-all duration-500 ${
          timeLeft < 10
            ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-lg shadow-rose-100/50 scale-110'
            : 'bg-brand-50 border-brand-50 text-brand-600'
        }`}>
          <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />
          {timeLeft}S REMAINING
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="premium-card p-12 md:p-16 relative overflow-hidden"
        >
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-black text-brand-600/60 uppercase tracking-[0.25em] mb-8">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
               Industrial Diagnosis · {currentQuestion.topic?.subject?.name || "Core Subject"}
            </div>

            <h2 className="text-3xl md:text-4xl font-jakarta font-black text-slate-900 mb-16 leading-[1.15] tracking-tight">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-5">
              {options.map((option: string, i: number) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="group flex items-center gap-6 w-full text-left p-6 border-2 border-slate-100 rounded-[1.5rem] hover:border-brand-500 hover:bg-brand-50/30 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center font-black text-slate-400 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-sm border border-slate-100">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-xl font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-16 pt-8 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Double-check your intuition. Accuracy {'>'} Speed.
              </p>
              <button
                onClick={() => handleAnswer(null)}
                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand-600 transition-colors group"
              >
                Skip Question
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-between shadow-2xl"
      >
         <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 shrink-0 border border-brand-500/20">
               <Zap className="w-7 h-7" />
            </div>
            <div>
               <p className="text-lg font-bold text-white mb-1 tracking-tight">Adaptive Calibration</p>
               <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
                 We&apos;re testing across the full breadth of GATE CSE. Your performance here dictates your initial <span className="text-brand-400">ROI Roadmap</span>.
               </p>
            </div>
         </div>
         <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Engine Integrity</span>
            <div className="flex gap-1">
               {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>)}
            </div>
         </div>
      </motion.div>
    </div>
  );
}
