"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { runBatchJob } from "@/lib/actions/admin";

export default function JobButton({ scriptName }: { scriptName: string }) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await runBatchJob(scriptName);
      if (result.success) {
        alert(`Success!\n\nSTDOUT: ${result.stdout}`);
      } else {
        alert(`Failed!\n\nERROR: ${result.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <button
      onClick={handleRun}
      disabled={isRunning}
      className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-2 disabled:opacity-50"
    >
      <RefreshCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
      {isRunning ? 'Running...' : 'Run Job'}
    </button>
  );
}
