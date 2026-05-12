import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import FlashcardPlayer from "@/components/FlashcardPlayer";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";

export default async function FlashcardsPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  // Fetch all flashcards from topics the user has started
  const flashcards = await prisma.flashcard.findMany({
    where: {
      topic: {
        userProgress: {
          some: { userId, status: { in: ["InProgress", "Completed"] } }
        }
      }
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50/30">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col items-center text-center">
          <Link
            href="/revision"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Revision
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">Active Recall</h1>
          <p className="text-slate-500 font-medium mt-2">AI-generated flashcards for your active topics.</p>
        </div>

        {flashcards.length > 0 ? (
          <FlashcardPlayer flashcards={flashcards} />
        ) : (
          <div className="glass-card p-20 text-center space-y-6">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                <Info className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900">No Flashcards Available</h3>
                <p className="text-slate-500 font-medium mt-2">Start studying topics to unlock AI-generated flashcards.</p>
             </div>
             <Link href="/roadmap" className="btn-primary inline-flex">Go to Roadmap</Link>
          </div>
        )}
      </div>
    </div>
  );
}
