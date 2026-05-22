"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Target, Repeat, LayoutDashboard, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Roadmap", href: "/roadmap", icon: Target },
    { name: "Revision", href: "/revision", icon: Repeat },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/20 shadow-premium rounded-3xl px-4 md:px-8 h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black shadow-glow group-hover:rotate-12 transition-transform shrink-0">G</div>
          <span className="font-jakarta font-black text-xl md:text-2xl tracking-tighter text-slate-900">
            GATE<span className="text-brand-600">CSE</span>
          </span>
        </Link>

        {session && (
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-black transition-all",
                  pathname === item.href
                    ? "bg-brand-600 text-white shadow-glow"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {session ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aspirant</p>
                <p className="text-sm font-bold text-slate-900">{session.user?.name}</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-100 hidden lg:block"></div>
              <button
                onClick={() => signOut()}
                className="hidden md:flex btn-secondary h-11 px-4 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <Link href="/onboarding/test" className="btn-primary h-11 md:h-12 px-4 md:px-6 text-xs md:text-sm">
              Get Started <ChevronRight className="w-4 h-4 hidden sm:block" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && session && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-28 left-4 right-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
               {navItems.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   onClick={() => setIsMobileMenuOpen(false)}
                   className={cn(
                     "flex items-center gap-4 p-5 rounded-3xl text-lg font-black transition-all",
                     pathname === item.href
                       ? "bg-brand-600 text-white shadow-glow"
                       : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                   )}
                 >
                   <item.icon className="w-6 h-6" />
                   {item.name}
                 </Link>
               ))}
               <div className="h-[1px] bg-slate-100 my-2" />
               <button
                 onClick={() => signOut()}
                 className="flex items-center gap-4 p-5 rounded-3xl text-lg font-black bg-rose-50 text-rose-600"
               >
                 <LogOut className="w-6 h-6" />
                 Sign Out
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
