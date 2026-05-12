import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "GATE CSE Prep | Precision Learning System",
  description: "Designed for Rank 1. Built on Next.js, powered by Gemini AI, and focused on PYQs.",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <MobileNav />
          <footer className="bg-white border-t border-slate-100 py-12 mt-20">
            <div className="container mx-auto px-6 text-center">
              <p className="text-slate-400 font-medium">© 2024 GATE CSE Prep System. Built for Rank 1.</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
