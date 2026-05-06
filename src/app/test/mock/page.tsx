import { auth } from "@/lib/auth/auth";
import { TestEngine } from "@/lib/engines/TestEngine";
import TestPlayer from "../[id]/TestPlayer";
import { redirect } from "next/navigation";

export default async function MockTestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const questions = await TestEngine.generateMock(session.user.id);

  return <TestPlayer questions={questions} />;
}
