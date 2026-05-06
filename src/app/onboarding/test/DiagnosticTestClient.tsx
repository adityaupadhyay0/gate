"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitDiagnosticResults } from "@/lib/actions/onboarding";

export default function DiagnosticTestClient({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ pyqId: string, isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleAnswer(null); // Time out
    }
  }, [timeLeft]);

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
    try {
      await submitDiagnosticResults(finalAnswers);
      router.push("/roadmap");
    } catch (e) {
      console.error(e);
      alert("Please sign in to save your results.");
      router.push("/");
    }
  };

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return <div>No questions available.</div>;

  const options = JSON.parse(currentQuestion.options);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border rounded-xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
        <span className={`text-xl font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>
          0:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {options.map((option: string) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="w-full text-left p-4 border rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => handleAnswer(null)}
          className="text-gray-500 font-medium hover:underline"
        >
          Skip Question
        </button>
      </div>
    </div>
  );
}
