"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAttempt } from "@/lib/actions/attempts";

export default function TestPlayer({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="h-16 bg-gray-900 text-white flex items-center px-6 justify-between sticky top-0 z-10">
        <div className="font-bold text-xl tracking-tight">GATE SECTIONAL TEST</div>
        <div className="flex items-center gap-8">
           <div className="text-lg font-mono bg-gray-800 px-4 py-1 rounded border border-gray-700">
             {formatTime(timeLeft)}
           </div>
           <button onClick={submitTest} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold transition-colors">
             Submit Test
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-blue-600">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-sm text-gray-500 font-bold">{currentQ.marks} Marks</span>
              </div>

              <p className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                {currentQ.question}
              </p>

              <div className="space-y-4">
                {options.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(currentQ.id, option)}
                    className={`w-full text-left p-4 border rounded-lg transition-all flex items-center gap-4 ${
                      answers[currentQ.id] === option ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-100' : 'hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      answers[currentQ.id] === option ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'
                    }`}>
                       {String.fromCharCode(65 + options.indexOf(option))}
                    </div>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="w-80 bg-white border-l overflow-y-auto p-6 hidden md:block">
           <h3 className="font-bold mb-4 uppercase text-xs text-gray-500 tracking-widest">Question Palette</h3>
           <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-10 w-10 rounded text-sm font-bold border transition-colors ${
                    currentIndex === i ? 'border-blue-600 bg-blue-600 text-white' :
                    answers[questions[i].id] ? 'bg-green-100 border-green-200 text-green-700' :
                    'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </aside>
      </div>
    </div>
  );
}
