export const dynamic = "force-dynamic";
import { DiagnosticEngine } from "@/lib/engines/DiagnosticEngine";
import DiagnosticTestClient from "./DiagnosticTestClient";

export default async function OnboardingTestPage() {
  const questions = await DiagnosticEngine.getTestQuestions();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Entry Diagnosis</h1>
          <p className="text-gray-500">Let&apos;s see where you stand. 15 questions, 45 seconds each.</p>
        </div>
        <DiagnosticTestClient questions={questions} />
      </div>
    </div>
  );
}
