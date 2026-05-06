import { auth } from "@/lib/auth/auth";
import { RevisionEngine } from "@/lib/engines/RevisionEngine";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RevisionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const queue = await RevisionEngine.getQueue(session.user.id);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Revision Queue</h1>
        <p className="text-gray-500">Items that need review based on your memory decay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {queue.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed">
              <p className="text-gray-500 mb-4">Your revision queue is empty. Great job!</p>
              <Link href="/roadmap" className="text-blue-600 font-bold hover:underline">Keep learning →</Link>
            </div>
          ) : (
            queue.map(item => (
              <div key={item.id} className="p-6 bg-white border rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`w-2 h-2 rounded-full ${item.currentMemoryScore < 0.4 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                     <h3 className="font-bold text-gray-800">{item.pyq.topic.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.pyq.question}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold uppercase ${item.currentMemoryScore < 0.4 ? 'text-red-600' : 'text-amber-600'}`}>
                    Memory: {Math.round(item.currentMemoryScore * 100)}%
                  </p>
                  <Link href={`/topic/${item.pyq.topic.slug}`} className="text-sm text-blue-600 font-medium hover:underline">Review Now</Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-4">Daily Summary</h2>
             <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Critical</span>
                  <span className="font-bold text-red-600">{queue.filter(i => i.currentMemoryScore < 0.4).length} PYQs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Needs Review</span>
                  <span className="font-bold text-amber-600">{queue.filter(i => i.currentMemoryScore >= 0.4).length} PYQs</span>
                </div>
             </div>
             <button disabled={queue.length === 0} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
               Start Revision Session
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
