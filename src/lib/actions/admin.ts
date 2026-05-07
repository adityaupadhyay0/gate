"use server";

import { auth } from "@/lib/auth/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

const ALLOWED_SCRIPTS = [
  "run-pyq-tagging.ts",
  "run-topic-summaries.ts"
];

export async function runBatchJob(scriptName: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!ALLOWED_SCRIPTS.includes(scriptName)) {
    throw new Error("Forbidden script execution attempt.");
  }

  console.log(`Starting batch job: ${scriptName}`);

  try {
    const { stdout, stderr } = await execPromise(`npx ts-node scripts/${scriptName}`);
    return { success: true, stdout, stderr };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
