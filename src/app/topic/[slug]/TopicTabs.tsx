"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Video, FileText, History, Info, ChevronRight, Calculator as CalcIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  name: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: "pyqs", name: "PYQs", icon: History },
  { id: "notes", name: "Notes", icon: FileText },
  { id: "videos", name: "Videos", icon: Video },
  { id: "books", name: "Books", icon: BookOpen },
];

export default function TopicTabs({
  children,
  topicSummary
}: {
  children: React.ReactNode,
  topicSummary: any
}) {
  const [activeTab, setActiveTab] = useState("pyqs");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit mb-8 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all",
                activeTab === tab.id
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "pyqs" ? (
              <motion.div
                key="pyqs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            ) : (
              <motion.div
                key="other"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="bg-white rounded-[2rem] p-12 border-2 border-slate-50 shadow-premium flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mb-6">
                   <Info className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Curation in Progress</h3>
                <p className="max-w-md text-slate-500 font-medium leading-relaxed">
                  Our team is curating the most relevant GATE-focused {activeTab} for this topic.
                  Check back soon for high-fidelity resources.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 bg-brand-600 text-white border-none shadow-glow relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black">Gemini Insights</h3>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3">Core Concepts</p>
              <ul className="space-y-2">
                {JSON.parse(topicSummary?.coreConcepts || '[]').map((concept: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-300" />
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3">Key Formulas</p>
               <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 font-mono text-xs text-brand-100">
                  {JSON.parse(topicSummary?.keyFormulas || '[]')[0] || 'Derivations active.'}
               </div>
            </div>
          </div>
        </motion.div>

        <div className="premium-card p-8">
           <h4 className="text-lg font-black text-slate-900 mb-6">Mastery Gate</h4>
           <div className="space-y-6">
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                 <p className="text-xs font-bold text-brand-700 leading-relaxed">
                    GATE topics require high conceptual coverage. You need 80% coverage to unlock the sectional test.
                 </p>
              </div>
              <button className="w-full btn-secondary h-12 text-sm">
                 Full Syllabus ROI <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}
