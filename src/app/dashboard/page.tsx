import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  // Fetch some stats
  const completedTopics = await prisma.userProgress.count({
    where: { userId: session.user.id, status: "Completed" }
  });

  const totalAttempts = await prisma.attempt.count({
    where: { userId: session.user.id }
  });

  const correctAttempts = await prisma.attempt.count({
    where: { userId: session.user.id, isCorrect: true }
  });

  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
          <p className="text-gray-500">Here&apos;s your preparation status for GATE CSE.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/rank-mode" className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold border border-amber-200 hover:bg-amber-200 transition-colors">
            🔥 Rank Mode
          </Link>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
            Rank Est: #--
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Topics Completed</p>
          <p className="text-3xl font-bold">{completedTopics}</p>
          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${(completedTopics / 65) * 100}%` }}></div>
          </div>
        </div>
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Total Attempts</p>
          <p className="text-3xl font-bold">{totalAttempts}</p>
        </div>
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Accuracy</p>
          <p className="text-3xl font-bold">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Streak</p>
          <p className="text-3xl font-bold">0 Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Current Focus</h2>
            <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold">Boolean Algebra</h3>
                <p className="text-sm text-gray-600">Digital Logic • 4/12 PYQs solved</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold">Continue</button>
            </div>
          </div>

          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Subject Health Map</h2>
            <div className="space-y-4">
               {['Digital Logic', 'COA', 'PDS', 'Algorithms', 'TOC'].map(subject => (
                 <div key={subject} className="flex items-center gap-4">
                   <div className="w-32 text-sm font-medium">{subject}</div>
                   <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
                     <div className="bg-green-500 h-full" style={{ width: '0%' }}></div>
                   </div>
                   <div className="w-12 text-right text-xs text-gray-500">0%</div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl shadow-sm border-t-4 border-t-red-500">
            <h2 className="text-xl font-bold mb-2">Revision Queue</h2>
            <p className="text-gray-500 text-sm mb-4">4 PYQs need urgent review.</p>
            <button className="w-full bg-red-600 text-white py-2 rounded-md font-bold">Start Session</button>
          </div>

          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Weak Areas</h2>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100">Combinational Circuits</div>
              <div className="p-2 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100">Instruction Pipelining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
