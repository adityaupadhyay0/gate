"use client";

import { useState, useEffect } from "react";
import { saveAttempt, logMistake } from "@/lib/actions/attempts";

export default function PYQPlayer({ pyqs, topicSlug }: { pyqs: any[], topicSlug: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [confidence, setConfidence] = useState(3);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  const currentPYQ = pyqs[currentIndex];
  if (!currentPYQ) return <div>All caught up!</div>;

  const options = JSON.parse(currentPYQ.options);

  const handleSubmit = async () => {
    // Show reflection BEFORE final submission to database
    // "How sure were you?" - Post-answer but pre-persistence
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

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          GATE {currentPYQ.year}
        </span>
        <span className="text-sm font-medium text-gray-500">
          PYQ {currentIndex + 1} of {pyqs.length}
        </span>
      </div>

      <div className="mb-8">
        <p className="text-lg font-medium text-gray-900 leading-relaxed">
          {currentPYQ.question}
        </p>
      </div>


      <div className="space-y-3 mb-8">
        {options.map((option: string) => (
          <button
            key={option}
            disabled={isSubmitted}
            onClick={() => setSelectedOption(option)}
            className={`w-full text-left p-4 border rounded-lg transition-all font-medium ${
              selectedOption === option
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                : 'hover:border-gray-300'
            } ${
              isSubmitted && option === currentPYQ.answer ? 'border-green-600 bg-green-50 ring-2 ring-green-100' : ''
            } ${
              isSubmitted && selectedOption === option && option !== currentPYQ.answer ? 'border-red-600 bg-red-50 ring-2 ring-red-100' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{option}</span>
              {isSubmitted && option === currentPYQ.answer && <span className="text-green-600 font-bold">✓</span>}
              {isSubmitted && selectedOption === option && option !== currentPYQ.answer && <span className="text-red-600 font-bold">✗</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        {!isSubmitted ? (
          <button
            disabled={!selectedOption}
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-gray-900 text-white px-8 py-2 rounded-lg font-bold"
          >
            Next Question
          </button>
        )}
        <button className="text-gray-500 font-medium hover:underline">Request Hint</button>
      </div>

      {isSubmitted && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm font-bold text-gray-700 mb-1">Explanation:</p>
          <p className="text-sm text-gray-600">
            {currentPYQ.metadata?.oneLineExplanation || "Explanation loading..."}
          </p>
        </div>
      )}

      {showReflection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-2">How sure were you?</h3>
            <p className="text-gray-500 text-sm mb-8">Reflecting on your certainty helps AI detect mastery patterns.</p>
            <div className="flex justify-between items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => handleFinalSubmit(val)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 text-xl font-bold transition-all"
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>Guessing</span>
              <span>Certain</span>
            </div>
          </div>
        </div>
      )}

      {showMistakeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">What went wrong?</h3>
            <p className="text-gray-500 text-sm mb-8">Capture the root cause to fix it forever.</p>
            <div className="grid grid-cols-1 gap-3">
              {['Conceptual', 'Calculation', 'Misread', 'Time Pressure', 'Silly'].map(type => (
                <button
                  key={type}
                  onClick={() => handleLogMistake(type)}
                  className="w-full text-left p-4 border rounded-xl hover:border-blue-600 hover:bg-blue-50 font-bold transition-all"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
