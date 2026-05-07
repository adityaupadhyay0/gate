"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calculator, Maximize, AlertCircle, HelpCircle, Save, Send } from "lucide-react";

export default function TestPlayer({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelect = (qId: string, option: string) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const submitTest = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-8 animate-bounce">
           <Send className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-jakarta font-black text-slate-900 mb-4 tracking-tight">Examination Complete.</h1>
        <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl">
          Your responses have been securely logged. The Mistake Intelligence engine is now analyzing your patterns and recalibrating your Roadmap.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl mb-12">
           <div className="premium-card !p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SCORE</p>
              <p className="text-4xl font-black text-slate-900">--</p>
           </div>
           <div className="premium-card !p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ACCURACY</p>
              <p className="text-4xl font-black text-slate-900">--%</p>
           </div>
           <div className="premium-card !p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RANK EST.</p>
              <p className="text-4xl font-black text-brand-600">--</p>
           </div>
        </div>
        <button onClick={() => window.location.href = '/dashboard'} className="btn-primary px-12">
          Go to Dashboard
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <div className="p-20 text-center font-bold">Initializing Examination...</div>;

  const options = JSON.parse(currentQ.options);

  return (
    <div className="flex flex-col h-screen bg-[#F5F7F9] text-slate-900 font-sans select-none overflow-hidden">
      {/* Premium Industrial Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center px-6 justify-between border-b-4 border-amber-500 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 px-2 py-1 rounded font-black text-xs">GATE</div>
          <div className="font-jakarta font-black uppercase tracking-tighter text-sm">Industrial Mastery Simulator v2.0</div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-lg border border-white/10">
             <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Time Remaining</span>
             <span className="font-mono text-lg font-black text-white">{formatTime(timeLeft)}</span>
           </div>

           <div className="h-8 w-px bg-white/10 mx-2"></div>

           <button
             onClick={() => setShowCalculator(!showCalculator)}
             className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-black border border-slate-700 transition-colors shadow-inner"
           >
             <Calculator className="w-4 h-4 text-brand-400" />
             Scientific Calculator
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Question Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="h-12 bg-slate-50 border-b flex items-center px-6 justify-between">
             <div className="flex items-center gap-3">
                <span className="bg-white border-x border-t border-slate-200 px-6 py-3 -mb-[13px] rounded-t-xl text-xs font-black text-slate-900 shadow-sm">
                  Question No. {currentIndex + 1}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${currentQ.type === 'NAT' ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'}`}>
                  {currentQ.type || 'MCQ'}
                </span>
             </div>
             <div className="flex gap-6">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-black text-slate-400">+{currentQ.marks || 1}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-black text-slate-400">-{((currentQ.marks || 1) * 0.33).toFixed(2)}</span>
               </div>
             </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto border-r border-slate-100">
            <div className="max-w-4xl">
              <div className="mb-12">
                <p className="text-lg font-jakarta font-bold text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              <div className="space-y-4">
                {options.map((option: string, i: number) => {
                  const isChecked = answers[currentQ.id] === option;
                  return (
                    <label
                      key={option}
                      className={`flex items-start gap-5 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/50 shadow-md ring-4 ring-brand-50'
                          : 'border-slate-50 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pyq"
                        checked={isChecked}
                        onChange={() => handleSelect(currentQ.id, option)}
                        className="mt-1.5 accent-brand-600 w-5 h-5"
                      />
                      <div className="text-base font-bold flex gap-4">
                        <span className={`transition-colors font-black ${isChecked ? 'text-brand-600' : 'text-slate-400'}`}>
                          {String.fromCharCode(65 + i)})
                        </span>
                        <span className={isChecked ? 'text-slate-900' : 'text-slate-600'}>{option}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Bar - Navigation */}
          <div className="h-20 bg-white border-t border-slate-100 flex items-center px-8 justify-between shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex gap-4">
              <button
                onClick={() => toggleMarkForReview(currentQ.id)}
                className="bg-white border-2 border-amber-500 text-amber-700 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-amber-50 transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Mark for Review & Next
              </button>
              <button
                onClick={() => setAnswers({ ...answers, [currentQ.id]: '' })}
                className="bg-white border-2 border-slate-200 text-slate-400 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-4">
               <button
                 onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                 className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-2.5 rounded-xl text-xs font-black hover:bg-slate-50 transition-all flex items-center gap-2"
               >
                 <ChevronLeft className="w-4 h-4" />
                 Previous
               </button>
               <button
                 onClick={() => {
                   if (currentIndex < questions.length - 1) {
                     setCurrentIndex(currentIndex + 1);
                   } else {
                     // Auto-save logic
                   }
                 }}
                 className="bg-slate-900 text-white px-10 py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
               >
                 <Save className="w-4 h-4 text-brand-400" />
                 Save & Next
               </button>
            </div>
          </div>
        </main>

        {/* Right Side - Palette & Status */}
        <aside className="w-80 bg-slate-50 flex flex-col border-l border-slate-200 p-6">
           <div className="premium-card !p-5 mb-6 !bg-white shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                  {sessionStorage.getItem('userName')?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">GATE ASPIRANT</p>
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Section: CS Core</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                 {[
                   { label: 'Answered', count: Object.keys(answers).filter(k => !!answers[k]).length, color: 'bg-emerald-500', shape: 'clip-trapezoid' },
                   { label: 'Not Answered', count: questions.length - Object.keys(answers).length, color: 'bg-rose-500', shape: 'rounded-sm' },
                   { label: 'Not Visited', count: 0, color: 'bg-slate-200', shape: 'rounded-sm' },
                   { label: 'Marked', count: Object.keys(markedForReview).filter(k => markedForReview[k]).length, color: 'bg-indigo-600', shape: 'rounded-full' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className={`w-5 h-5 ${stat.color} text-white flex items-center justify-center text-[9px] font-black ${stat.shape}`}>
                       {stat.count}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{stat.label}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
              <div className="bg-slate-900 text-white text-[10px] font-black px-6 py-4 uppercase tracking-widest flex items-center justify-between">
                 <span>Question Palette</span>
                 <Maximize className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                 <div className="grid grid-cols-4 gap-3">
                    {questions.map((q, i) => {
                      const isAnswered = !!answers[q.id];
                      const isMarked = markedForReview[q.id];
                      const isCurrent = currentIndex === i;

                      let statusClass = "bg-slate-100 text-slate-400 border-transparent";
                      let shapeClass = "rounded-lg";

                      if (isMarked && isAnswered) {
                        statusClass = "bg-indigo-600 text-white border-transparent";
                        shapeClass = "rounded-full";
                      } else if (isMarked) {
                        statusClass = "bg-indigo-600 text-white border-transparent";
                        shapeClass = "rounded-full";
                      } else if (isAnswered) {
                        statusClass = "bg-emerald-500 text-white border-transparent";
                        shapeClass = "clip-trapezoid";
                      } else if (isCurrent) {
                        statusClass = "bg-white text-brand-600 border-brand-500 shadow-sm";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`h-10 w-10 text-xs font-black flex items-center justify-center transition-all border-2 ${statusClass} ${shapeClass} hover:scale-110 active:scale-95`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                 <button
                   onClick={submitTest}
                   className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Send className="w-4 h-4 text-brand-400" />
                   Final Submit
                 </button>
              </div>
           </div>
        </aside>
      </div>

      {showCalculator && (
        <div className="fixed top-20 right-80 w-96 bg-white border border-slate-200 shadow-2xl z-[100] rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-xs font-black text-white uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <Calculator className="w-4 h-4 text-brand-400" />
               Scientific Calculator
            </div>
            <button onClick={() => setShowCalculator(false)} className="hover:text-brand-400">✕</button>
          </div>
          <div className="p-6 bg-slate-50">
             <div className="bg-white text-right p-4 font-mono text-2xl mb-6 border-2 border-slate-100 rounded-2xl h-16 flex items-center justify-end text-slate-900 shadow-inner-soft">0</div>
             <div className="grid grid-cols-4 gap-2">
               {['sin', 'cos', 'tan', 'C', 'log', 'ln', 'sqrt', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')', 'exp', 'mod', 'pi', '='].map(key => (
                 <button
                   key={key}
                   className={`h-11 rounded-xl text-xs font-black transition-all active:scale-90 flex items-center justify-center ${
                     key === '=' ? 'bg-brand-600 text-white col-span-1 shadow-md shadow-brand-100' :
                     key === 'C' ? 'bg-rose-500 text-white' :
                     'bg-white text-slate-600 border border-slate-100 hover:border-slate-300 shadow-sm'
                   }`}
                 >
                   {key}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
