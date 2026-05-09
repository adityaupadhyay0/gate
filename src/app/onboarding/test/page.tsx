export const dynamic = "force-dynamic";
import { DiagnosticEngine } from "@/lib/engines/DiagnosticEngine";
import DiagnosticTestClient from "./DiagnosticTestClient";

export default async function OnboardingTestPage() {
  const questions = await DiagnosticEngine.getTestQuestions();

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
             Baseline Evaluation v2.0
          </div>
          <h1 className="text-5xl font-jakarta font-black text-slate-900 mb-4 tracking-tight">Entry Diagnosis</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Let&apos;s map your current mastery. We&apos;ve curated {questions.length} high-signal questions across core GATE subjects.
          </p>
        </div>
        <DiagnosticTestClient questions={questions} />
      </div>
    </div>
  );
}
