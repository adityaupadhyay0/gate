import { auth } from "@/lib/auth/auth";
import { getROISortedTopics } from "@/lib/engines/ROIEngine";
import { redirect } from "next/navigation";
import RankOptimizationClient from "./RankOptimizationClient";

export default async function RankOptimizationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const topics = await getROISortedTopics(session.user.id);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rank Optimization Mode</h1>
        <p className="text-gray-500">Focus on topics with the highest return on investment (ROI) to maximize your GATE score.</p>
      </div>

      <RankOptimizationClient topics={topics} />
    </div>
  );
}
