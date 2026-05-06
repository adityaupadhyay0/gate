import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center text-xl font-bold text-blue-600" href="/">
          GATE CSE
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/roadmap">
            Roadmap
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="text-sm font-medium hover:underline underline-offset-4">Sign Out</button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
            >
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">Sign In</button>
            </form>
          )}
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl text-gray-900 mb-4">
          Master GATE CSE with <span className="text-blue-600">Precision</span>
        </h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl mb-8">
          The only system designed to guarantee rank 1. Built on Next.js, powered by Gemini, and focused on PYQs.
        </p>
        <div className="flex gap-4">
          <Link
            href="/onboarding/test"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Start Diagnostic Test
          </Link>
          <Link
            href="/roadmap"
            className="border-2 border-gray-200 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
          >
            View Roadmap
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 mx-auto">
              🎯
            </div>
            <h3 className="text-xl font-bold mb-2">Learning Experience</h3>
            <p className="text-gray-500">Know exactly what to study next with our deterministic roadmap.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 mx-auto">
              🔁
            </div>
            <h3 className="text-xl font-bold mb-2">Revision Surety</h3>
            <p className="text-gray-500">Our memory algorithm ensures you never forget what you&apos;ve learned.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 mx-auto">
              🤖
            </div>
            <h3 className="text-xl font-bold mb-2">AI Precomputation</h3>
            <p className="text-gray-500">Gemini-enriched PYQs and summaries for deep conceptual clarity.</p>
          </div>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t text-center">
        <p className="text-xs text-gray-500">© 2024 GATE CSE Prep System. Built for Rank 1.</p>
      </footer>
    </div>
  );
}
