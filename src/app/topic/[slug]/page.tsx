import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import PYQPlayer from "./PYQPlayer";
import TopicTabs from "./TopicTabs";
import {
  BookOpen,
  ChevronLeft,
  Target,
  Info,
  History,
  Zap,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    include: {
      subject: true,
      pyqs: {
        include: { metadata: true }
      },
      summaries: true,
      userProgress: {
         where: { userId }
      }
    }
  });

  if (!topic) notFound();

  const coverage = topic.userProgress[0]?.coverageScore || 0;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Topic Header */}
        <div className="mb-12">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Roadmap
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                     <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-brand-600">{topic.subject.name}</span>
               </div>
               <h1 className="text-5xl font-black tracking-tight text-slate-900">{topic.name}</h1>
            </div>

            <div className="flex flex-col items-end gap-3">
               <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Target Mastery
                  <span className="text-slate-900">{Math.round(coverage * 100)}%</span>
               </div>
               <div className="w-64 h-3 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                  <div
                    className="h-full bg-brand-600 transition-all duration-1000"
                    style={{ width: `${coverage * 100}%` }}
                  />
               </div>
            </div>
          </div>
        </div>

        <TopicTabs topicSummary={topic.summaries}>
           <PYQPlayer pyqs={topic.pyqs} topicSlug={topic.slug} />
        </TopicTabs>
      </div>
    </div>
  );
}
