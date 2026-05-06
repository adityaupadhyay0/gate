"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAttempt } from "@/lib/actions/attempts";

export default function TestPlayer({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      submitTest();
    }
  }, [timeLeft, isSubmitted]);

  const handleSelect = (pyqId: string, option: string) => {
    setAnswers({ ...answers, [pyqId]: option });
  };

  const toggleMarkForReview = (pyqId: string) => {
    setMarkedForReview({ ...markedForReview, [pyqId]: !markedForReview[pyqId] });
  };

  const submitTest = async () => {
    setIsSubmitted(true);

    // Save all attempts
    for (const q of questions) {
      const userAnswer = answers[q.id];
      if (userAnswer) {
        await saveAttempt({
          pyqId: q.id,
          userAnswer,
          isCorrect: userAnswer === q.answer,
          timeSpent: 0 // In real app, track per-question time
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white border rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Test Submitted!</h2>
        <p className="text-gray-500 mb-8">Your results are being processed. Check the report below.</p>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold">
           Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <div>Loading...</div>;

  const options = JSON.parse(currentQ.options);

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f1f1] text-[#333] font-sans">
      {/* Header - Industrial GATE style */}
      <header className="h-12 bg-[#2c3e50] text-white flex items-center px-4 justify-between border-b-4 border-amber-500">
        <div className="font-bold uppercase tracking-widest text-sm">GATE Online Examination</div>
        <div className="flex items-center gap-6">
           <div className="text-sm font-bold flex items-center gap-2 bg-black/20 px-3 py-1 rounded">
             <span className="text-amber-400">Time Left:</span>
             <span className="font-mono">{formatTime(timeLeft)}</span>
           </div>
           <button
             onClick={() => setShowCalculator(!showCalculator)}
             className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs font-bold border border-gray-500"
           >
             Scientific Calculator
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Question Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="h-10 bg-[#e5e5e5] border-b flex items-center px-4 justify-between text-xs font-bold">
             <span className="bg-white border px-4 py-1.5 -mb-[1px] border-b-white rounded-t">Question No. {currentIndex + 1}</span>
             <div className="flex gap-4">
               <span className="text-green-700">Correct: +{currentQ.marks}</span>
               <span className="text-red-700">Wrong: -{(currentQ.marks * 0.33).toFixed(2)}</span>
             </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto border-r">
            <div className="mb-8">
              <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            <div className="space-y-3">
              {options.map((option: string, i: number) => (
                <label
                  key={option}
                  className="flex items-start gap-4 p-2 hover:bg-gray-50 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="pyq"
                    checked={answers[currentQ.id] === option}
                    onChange={() => handleSelect(currentQ.id, option)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>
                    {option}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Bottom Bar - Navigation */}
          <div className="h-14 bg-[#f8f8f8] border-t flex items-center px-4 justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => toggleMarkForReview(currentQ.id)}
                className="bg-white border-2 border-amber-500 text-amber-700 px-4 py-1.5 rounded text-xs font-bold hover:bg-amber-50"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={() => setAnswers({ ...answers, [currentQ.id]: '' })}
                className="bg-white border-2 border-gray-400 text-gray-600 px-4 py-1.5 rounded text-xs font-bold hover:bg-gray-50"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-2">
               <button
                 onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                 className="bg-white border-2 border-gray-400 text-gray-600 px-6 py-1.5 rounded text-xs font-bold"
               >
                 Previous
               </button>
               <button
                 onClick={() => {
                   if (currentIndex < questions.length - 1) {
                     setCurrentIndex(currentIndex + 1);
                   } else {
                     submitTest();
                   }
                 }}
                 className="bg-[#2c3e50] text-white px-8 py-1.5 rounded text-xs font-bold hover:bg-[#34495e]"
               >
                 Save & Next
               </button>
            </div>
          </div>
        </main>

        {/* Right Side - Palette & Status */}
        <aside className="w-72 bg-[#e5e5e5] flex flex-col border-l">
           <div className="p-4 bg-white m-4 rounded shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="text-xs">
                  <p className="font-bold">STUDENT NAME</p>
                  <p className="text-blue-600">View Profile</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-[10px]">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-green-600 text-white flex items-center justify-center text-[8px]">0</div>
                   <span>Answered</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-red-600 text-white flex items-center justify-center text-[8px]">0</div>
                   <span>Not Answered</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-gray-300 flex items-center justify-center text-[8px]">0</div>
                   <span>Not Visited</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-purple-600 text-white flex items-center justify-center text-[8px] rounded-full">0</div>
                   <span>Marked</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-white mx-4 mb-4 rounded shadow-sm overflow-hidden flex flex-col">
              <div className="bg-[#2c3e50] text-white text-[10px] font-bold px-3 py-2 uppercase">Question Palette</div>
              <div className="flex-1 overflow-y-auto p-4">
                 <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, i) => {
                      const isAnswered = !!answers[q.id];
                      const isMarked = markedForReview[q.id];

                      let statusClass = "bg-gray-100 text-gray-600";
                      let shapeClass = "rounded-sm";

                      if (isMarked && isAnswered) {
                        statusClass = "bg-purple-600 text-white";
                        shapeClass = "rounded-full";
                      } else if (isMarked) {
                        statusClass = "bg-purple-600 text-white";
                        shapeClass = "rounded-full";
                      } else if (isAnswered) {
                        statusClass = "bg-green-600 text-white";
                        shapeClass = "clip-trapezoid"; // Simplified for this demo
                      } else if (currentIndex === i) {
                        statusClass = "bg-red-600 text-white";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`h-8 w-8 text-[10px] font-bold flex items-center justify-center transition-all ${statusClass} ${shapeClass}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                 </div>
              </div>
              <div className="p-2 border-t flex flex-col gap-1">
                 <button onClick={submitTest} className="w-full bg-[#2c3e50] text-white py-2 rounded text-xs font-bold uppercase">Submit</button>
              </div>
           </div>
        </aside>
      </div>

      {showCalculator && (
        <div className="fixed top-16 right-72 w-80 bg-[#f8f8f8] border-2 border-gray-400 shadow-2xl z-50 rounded overflow-hidden">
          <div className="bg-gray-200 px-2 py-1 flex justify-between items-center text-xs font-bold border-b border-gray-400">
            <span>Scientific Calculator</span>
            <button onClick={() => setShowCalculator(false)}>✕</button>
          </div>
          <div className="p-4 grid grid-cols-4 gap-1 bg-[#d0d0d0]">
             <div className="col-span-4 bg-white text-right p-2 font-mono text-xl mb-2 border border-gray-500 h-10 overflow-hidden">0</div>
             {['sin', 'cos', 'tan', 'C', 'log', 'ln', 'sqrt', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')', 'exp', 'mod', 'pi', '='].map(key => (
               <button key={key} className="bg-gray-100 border border-gray-400 py-1 text-xs font-bold hover:bg-white">{key}</button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
