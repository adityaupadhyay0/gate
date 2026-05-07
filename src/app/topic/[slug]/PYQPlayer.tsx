"use client";

import { useState, useEffect } from "react";
import { saveAttempt, logMistake } from "@/lib/actions/attempts";
import { ChevronRight, HelpCircle, AlertTriangle, ShieldCheck, Timer, Trophy, Target, Sparkles } from "lucide-react";

export default function PYQPlayer({ pyqs, topicSlug }: { pyqs: any[], topicSlug: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [confidence, setConfidence] = useState(3);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  const currentPYQ = pyqs[currentIndex];
  if (!currentPYQ) {
    return (
      <div className="premium-card py-24 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-jakarta font-black text-slate-900 mb-2">Topic Mastery!</h2>
        <p className="text-slate-500 font-medium mb-8">You&apos;ve completed all available PYQs for this topic.</p>
        <button onClick={() => window.location.href = '/roadmap'} className="btn-primary inline-flex">Return to Roadmap</button>
      </div>
    );
  }

  const options = JSON.parse(currentPYQ.options);

  const handleSubmit = async () => {
    setShowReflection(true);
  };

  const handleFinalSubmit = async (selectedConfidence: number) => {
    const isCorrect = selectedOption === currentPYQ.answer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    setConfidence(selectedConfidence);
    setIsSubmitted(true);
    setShowReflection(false);

    await saveAttempt({
      pyqId: currentPYQ.id,
      userAnswer: selectedOption!,
      isCorrect,
      timeSpent,
      confidenceLevel: selectedConfidence
    });

    if (!isCorrect) {
      setShowMistakeModal(true);
    }
  };

  const handleLogMistake = async (type: string) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await logMistake({
      pyqId: currentPYQ.id,
      mistakeType: type,
      confidenceBefore: confidence,
      timeSpent
    });
    setShowMistakeModal(false);
  };

  const handleAskAI = async () => {
    setIsExplaining(true);
    try {
        const response = await fetch('/api/ai/explain', {
            method: 'POST',
            body: JSON.stringify({
                question: currentPYQ.question,
                options: options,
                answer: currentPYQ.answer,
                userAnswer: selectedOption
            })
        });
        const data = await response.json();
        setAiExplanation(data.explanation);
    } catch (e) {
        setAiExplanation("Deep conceptual analysis is temporarily unavailable. Please refer to the one-line explanation below.");
    } finally {
        setIsExplaining(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="premium-card !p-0 overflow-hidden">
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="bg-white/10 text-white/80 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            GATE {currentPYQ.year}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-tight">
            <Timer className="w-3.5 h-3.5" />
            Active Session
          </div>
        </div>
        <div className="font-jakarta font-black text-sm text-brand-400">
           {currentIndex + 1} <span className="text-white/20">/</span> {pyqs.length}
        </div>
      </div>

      <div className="p-10">
        <div className="mb-12">
          <p className="text-xl font-jakarta font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
            {currentPYQ.question}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-12">
          {options.map((option: string, i: number) => {
            const isSelected = selectedOption === option;
            const isCorrect = isSubmitted && option === currentPYQ.answer;
            const isWrong = isSubmitted && isSelected && option !== currentPYQ.answer;

            return (
              <button
                key={option}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(option)}
                className={`group relative w-full text-left p-6 rounded-2xl transition-all duration-300 font-bold border-2 ${
                  isSelected && !isSubmitted ? 'border-brand-500 bg-brand-50/50 shadow-md ring-4 ring-brand-50' :
                  isCorrect ? 'border-emerald-500 bg-emerald-50' :
                  isWrong ? 'border-rose-500 bg-rose-50' :
                  'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                    isSelected && !isSubmitted ? 'bg-brand-600 text-white' :
                    isCorrect ? 'bg-emerald-600 text-white' :
                    isWrong ? 'bg-rose-600 text-white' :
                    'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`text-lg ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
          <button className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-brand-600 transition-colors group">
            <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Request AI Hint
          </button>

          {!isSubmitted ? (
            <button
              disabled={!selectedOption}
              onClick={handleSubmit}
              className="btn-primary w-full sm:w-auto px-12 group"
            >
              Submit Answer
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-slate-900 hover:bg-black text-white px-12 py-3 rounded-xl font-black text-sm flex items-center gap-2 group transition-all"
            >
              Next Question
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {isSubmitted && (
          <div className="mt-12 space-y-6">
            <div className="p-8 bg-brand-50/30 rounded-3xl border border-brand-100/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-brand-600" />
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">CORE LOGIC</p>
                    </div>
                    <button
                        onClick={handleAskAI}
                        disabled={isExplaining}
                        className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                    >
                        {isExplaining ? 'Analyzing...' : 'Deep AI Explanation ✨'}
                    </button>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed italic">
                &ldquo;{currentPYQ.metadata?.oneLineExplanation || "Analysis complete. Refer to the deep explanation for step-by-step logic."}&rdquo;
                </p>
            </div>

            {aiExplanation && (
                <div className="p-8 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-brand-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Step-by-Step Analysis</p>
                   </div>
                   <div className="text-sm font-medium leading-relaxed prose prose-invert max-w-none">
                      {aiExplanation.split('\n').map((line, i) => (
                        <p key={i} className="mb-4">{line}</p>
                      ))}
                   </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS (Simplified styling for brevity, but functional) */}
      {showReflection && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-6">
               <Target className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-jakarta font-black text-slate-900 mb-3 tracking-tight">How sure?</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">Honest self-rating allows us to distinguish &quot;Lucky Guesses&quot; from &quot;Mastery&quot;.</p>
            <div className="flex justify-between items-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => handleFinalSubmit(val)}
                  className="w-14 h-14 rounded-2xl border-2 border-slate-100 hover:border-brand-600 hover:bg-brand-50 text-2xl font-black transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between px-1 text-[10px] text-slate-300 font-black uppercase tracking-widest">
              <span>Blind Guess</span>
              <span>Certain</span>
            </div>
          </div>
        </div>
      )}

      {showMistakeModal && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                 <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight">Mistake Logged.</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">IDENTIFY THE ROOT CAUSE</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: 'Conceptual', desc: 'I didn\'t understand the core logic.' },
                { type: 'Calculation', desc: 'Mathematical error despite correct logic.' },
                { type: 'Misread', desc: 'I skipped a keyword like NOT or ALWAYS.' },
                { type: 'Time Pressure', desc: 'I rushed and made a poor choice.' },
                { type: 'Silly', desc: 'I knew it, but tapped the wrong thing.' }
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => handleLogMistake(item.type)}
                  className="group w-full text-left p-5 border-2 border-slate-100 rounded-2xl hover:border-brand-600 hover:bg-brand-50 transition-all active:scale-[0.98]"
                >
                  <div className="font-black text-slate-900 text-lg mb-0.5">{item.type}</div>
                  <div className="text-sm text-slate-400 font-medium group-hover:text-slate-600 transition-colors">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
