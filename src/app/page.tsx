"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Target, Repeat, Cpu, CheckCircle2, Trophy, Zap, Shield } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-200/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </motion.div>

      <section className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-brand-100 text-brand-700 text-xs font-black uppercase tracking-widest mb-10 shadow-glow"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
            Engineering Excellence · Powered by Gemini
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]"
          >
            Forge Your Path <br />
            To <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent">Rank 1</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-slate-500 mb-14 font-medium leading-relaxed"
          >
            The world&apos;s most advanced GATE preparation system. Built on FSRS v4 algorithms, deterministic roadmaps, and industrial-grade PYQ intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <Link href={session ? "/roadmap" : "/onboarding/test"} className="btn-primary text-lg px-12 group h-16">
              {session ? "Enter Workspace" : "Start Diagnostic Test"}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link href="/roadmap" className="btn-secondary text-lg px-12 h-16">
              View Syllabus
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            <div className="premium-card group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white transition-colors">ROI Roadmap</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
                Stop guessing. Our formula prioritizes topics by exam weight and personal weakness.
              </p>
            </div>

            <div className="premium-card group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 group-hover:-rotate-12">
                <Repeat className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white transition-colors">FSRS Revision</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
                Never forget. We use modern spaced repetition to calculate exactly when you need to review.
              </p>
            </div>

            <div className="premium-card group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white transition-colors">Mistake Intel</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
                Analyze your errors. We classify mistakes to separate silly blunders from conceptual gaps.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-5xl font-black mb-10 text-slate-900 leading-tight">
                Designed for the <br />
                <span className="text-brand-600">Deepest Learning</span>
              </h2>

              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg text-emerald-500">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Rank-Optimized Sequencing</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">Topics are ordered by their ROI to ensure you hit the highest impact areas first as the exam approaches.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg text-brand-500">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Instant AI Derivations</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">Stuck on a PYQ? Tap &apos;Explain&apos; for a live Gemini-powered step-by-step conceptual breakdown.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg text-slate-900">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Zero Hallucination Policy</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">100% real GATE questions. No synthetic noise. No generated distractions. Only actual exam content.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              <div className="relative z-10 p-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 rounded-[2rem] p-10 text-white min-h-[500px]">
                  <div className="flex gap-3 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-2 w-20 bg-slate-800 rounded-full"></div>
                    <div className="h-8 w-3/4 bg-slate-800 rounded-lg"></div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded-lg"></div>
                    <div className="pt-8 space-y-4">
                      <div className="h-24 bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6">
                        <div className="h-2 w-32 bg-brand-400 rounded-full mb-3"></div>
                        <div className="h-4 w-full bg-brand-400/50 rounded-lg"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-white/5 rounded-xl border border-white/10"></div>
                        <div className="h-12 bg-white/5 rounded-xl border border-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black">G</div>
             <span className="font-jakarta font-black text-2xl tracking-tighter text-slate-900">GATE<span className="text-brand-600">CSE</span></span>
          </div>
          <p className="text-slate-400 font-medium mb-8">Developed by engineering experts for the next generation of Rank 1 aspirants.</p>
          <div className="flex justify-center gap-10 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/roadmap" className="hover:text-brand-600 transition-colors">Syllabus</Link>
            <Link href="/onboarding/test" className="hover:text-brand-600 transition-colors">Diagnostic</Link>
            <Link href="/dashboard" className="hover:text-brand-600 transition-colors">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
