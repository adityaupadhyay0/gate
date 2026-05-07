import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { ArrowRight, Target, Repeat, Cpu, CheckCircle2 } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <section className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold mb-8 animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Version 2.0 now live with Gemini integration
        </div>

        <h1 className="text-6xl md:text-7xl font-jakarta font-black tracking-tight text-slate-900 mb-6 leading-tight">
          Master GATE CSE with <br />
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Scientific Precision</span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-12 font-medium leading-relaxed">
          The only preparation system built on a deterministic roadmap, spaced repetition, and Gemini-powered conceptual deep dives.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href={session ? "/roadmap" : "/onboarding/test"} className="btn-primary text-lg px-10 group">
            {session ? "Enter Your Roadmap" : "Start Diagnostic Test"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/roadmap" className="btn-secondary text-lg px-10">
            Explore Syllabus
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="premium-card text-left group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Adaptive Roadmap</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Proprietary ROI formula sorts topics by exam weight, your weaknesses, and dependency order.
            </p>
          </div>

          <div className="premium-card text-left group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
              <Repeat className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Revision Surety</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Nothing important is ever forgotten. Our decay algorithm enqueues PYQs exactly when your memory fades.
            </p>
          </div>

          <div className="premium-card text-left group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Mistake Intelligence</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Capture the root cause of every error. We detect patterns like silly mistakes versus conceptual gaps.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-jakarta font-black mb-8">Why it works.</h2>
            <ul className="space-y-6">
              {[
                { title: "PYQ-First Philosophy", desc: "Theory is only useful if it helps you solve previous year questions." },
                { title: "Gemini Precomputation", desc: "Every question is enriched with one-line explanations and common mistake tags." },
                { title: "Industrial Mock Interface", desc: "Practice in an environment that replicates the actual GATE exam UI." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                   <div className="h-4 bg-slate-700 rounded-full w-3/4"></div>
                   <div className="h-4 bg-slate-700 rounded-full w-1/2"></div>
                   <div className="h-20 bg-slate-700/50 rounded-2xl w-full"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-brand-600 rounded-xl"></div>
                      <div className="h-10 bg-slate-700 rounded-xl"></div>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-6 -right-6 bg-brand-600 p-6 rounded-3xl shadow-xl animate-bounce duration-1000">
                <p className="text-4xl font-black">80%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Syllabus Coverage</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
