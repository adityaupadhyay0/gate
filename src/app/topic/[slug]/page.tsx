import prisma from "@/lib/db/prisma";
import TopicTabs from "./TopicTabs";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ChevronLeft, Info, BookOpen, Calculator, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import ScientificCalculator from "@/components/ScientificCalculator";

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const userId = session?.user?.id;

  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    include: {
      subject: true,
      pyqs: {
        include: { metadata: true }
      },
      summaries: true,
      resources: true,
      userProgress: userId ? { where: { userId } } : false
    }
  });

  if (!topic) notFound();

  const progress = topic.userProgress?.[0];
  const coverage = progress?.coverageScore || 0;

  const attemptedCount = userId ? await prisma.attempt.count({
    where: {
      userId,
      pyq: { topicId: topic.id }
    }
  }) : 0;

  const summaryData = topic.summaries ? {
    coreConcepts: JSON.parse(topic.summaries.coreConcepts || '[]'),
    keyFormulas: JSON.parse(topic.summaries.keyFormulas || '[]'),
    commonPatterns: JSON.parse(topic.summaries.commonExamPatterns || '[]')
  } : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-6">
          <Link href="/roadmap" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-brand-600 mb-6 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO ROADMAP
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest mb-2">
                <BookOpen className="w-4 h-4" />
                {topic.subject.name}
              </div>
              <h1 className="text-4xl font-jakarta font-black text-slate-900 tracking-tight">{topic.name}</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Mastery</p>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner-soft">
                      <div className="bg-brand-500 h-full transition-all duration-1000" style={{ width: `${coverage * 100}%` }}></div>
                    </div>
                    <span className="font-jakarta font-black text-slate-900">{Math.round(coverage * 100)}%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
             <TopicTabs pyqs={topic.pyqs} topicSlug={topic.slug} />
          </div>

          <div className="space-y-8">
            <div className="premium-card border-brand-100 bg-brand-50/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-jakarta font-bold text-slate-900 tracking-tight">Gemini Insights</h2>
              </div>

              {summaryData ? (
                <div className="space-y-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest mb-3">
                      <Target className="w-3.5 h-3.5" />
                      CORE CONCEPTS
                    </p>
                    <ul className="space-y-3">
                      {summaryData.coreConcepts.map((c: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest mb-3">
                      <Calculator className="w-3.5 h-3.5" />
                      KEY FORMULAS
                    </p>
                    <div className="space-y-2">
                      {summaryData.keyFormulas.map((f: string, i: number) => (
                        <code key={i} className="block p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono border border-slate-800 shadow-lg">
                          {f}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Info className="w-8 h-8 text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500 font-medium italic px-6">
                    Deep conceptual summaries enriched by Gemini are currently being precomputed for this topic.
                  </p>
                </div>
              )}
            </div>

            <div className="premium-card">
              <h2 className="text-xl font-jakarta font-bold text-slate-900 tracking-tight mb-6">Mastery Gate</h2>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-700 font-bold leading-relaxed">
                    GATE topics require high conceptual density. We require <span className="text-amber-900 underline">80% coverage</span> before unlocking the next stage.
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">PYQs Solved</span>
                  <span className="text-slate-900 font-black">{attemptedCount} / {topic.pyqs.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Requirement</span>
                  <span className="text-slate-900 font-black">Min. 15 PYQs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScientificCalculator />
    </div>
  );
}
