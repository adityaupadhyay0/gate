"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitDiagnosticResults } from "@/lib/actions/onboarding";
import { Timer, ArrowRight, Zap, Target } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-20 text-center">
         <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-8"></div>
         <h2 className="text-3xl font-jakarta font-black text-slate-900 mb-2">Analyzing Performance...</h2>
         <p className="text-slate-500 font-medium max-w-sm">Generating your personalized ROI roadmap and identifying conceptual weak points.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return <div className="text-center py-20 font-bold">No questions available.</div>;

  const options = JSON.parse(currentQuestion.options);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1.5">
           {questions.map((_, i) => (
             <div
               key={i}
               className={`h-2 rounded-full transition-all duration-500 ${
                 i < currentIndex ? 'bg-brand-600 w-6' :
                 i === currentIndex ? 'bg-brand-400 w-12 shadow-md shadow-brand-100' :
                 'bg-slate-200 w-4'
               }`}
             ></div>
           ))}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm tracking-widest border-2 transition-colors ${
          timeLeft < 10 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-brand-50 border-brand-100 text-brand-600'
        }`}>
          <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />
          {timeLeft}S
        </div>
      </div>

      <div className="premium-card p-12">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
           <Target className="w-3.5 h-3.5" />
           Question {currentIndex + 1} of {questions.length}
        </div>

        <h2 className="text-3xl font-jakarta font-black text-slate-900 mb-12 leading-tight">
          {currentQuestion.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option: string, i: number) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="group flex items-center gap-6 w-full text-left p-6 border-2 border-slate-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50/50 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center font-black text-slate-400 transition-colors">
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-lg font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                {option}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-12 pt-8 border-t border-slate-50">
          <button
            onClick={() => handleAnswer(null)}
            className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-brand-600 transition-colors group"
          >
            Skip this question
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-brand-50 rounded-3xl border border-brand-100 flex items-start gap-4">
         <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <Zap className="w-5 h-5" />
         </div>
         <div>
            <p className="text-sm font-bold text-slate-900 mb-1">Diagnostic Mode Active</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We&apos;re testing breadth over depth. These questions cover Digital Logic, COA, PDS, and Algorithms to estimate your base level.
            </p>
         </div>
      </div>
    </div>
  );
}
