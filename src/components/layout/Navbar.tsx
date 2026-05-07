import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 glass-card mx-6 my-4 rounded-2xl border-slate-200/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform">
            G
          </div>
          <span className="font-jakarta font-black text-xl tracking-tight text-slate-900">
            GATE<span className="text-brand-600">CSE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/roadmap" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
            Roadmap
          </Link>
          <Link href="/revision" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
            Revision
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
               <div className="hidden lg:block text-right">
                 <p className="text-xs font-bold text-slate-900 leading-none">{session.user?.name}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aspirant</p>
               </div>
               <form
                 action={async () => {
                   "use server";
                   await signOut();
                 }}
               >
                 <button className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">Sign Out</button>
               </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
            >
              <button className="btn-primary py-2 px-5 text-sm">Sign In</button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
