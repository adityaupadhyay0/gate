import prisma from "@/lib/db/prisma";
import TopicTabs from "./TopicTabs";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{topic.subject.name}</span>
          <span>/</span>
          <span className="font-medium text-gray-900">{topic.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{topic.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <TopicTabs pyqs={topic.pyqs} topicSlug={topic.slug} />
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Topic Progress</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Coverage Score</span>
              <span className="font-bold">{Math.round(coverage * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-6">
              <div className="bg-blue-600 h-full" style={{ width: `${coverage * 100}%` }}></div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 font-medium">
              Solve at least 15 PYQs (or 100%) to complete this topic.
            </p>
          </div>

          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Quick Summary</h2>
            <div className="space-y-4">
               {topic.summaries ? (
                 <>
                   <div>
                     <p className="text-xs font-bold text-blue-600 uppercase mb-1">Core Concepts</p>
                     <ul className="text-sm text-gray-600 list-disc ml-4">
                        {JSON.parse(topic.summaries.coreConcepts || '[]').map((c: string) => <li key={c}>{c}</li>)}
                     </ul>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-blue-600 uppercase mb-1">Key Formulas</p>
                     <p className="text-sm font-mono bg-gray-50 p-2 rounded">{JSON.parse(topic.summaries.keyFormulas || '[]')[0]}</p>
                   </div>
                 </>
               ) : (
                 <p className="text-sm text-gray-600 italic">Topic summary enriched by Gemini will appear here.</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
