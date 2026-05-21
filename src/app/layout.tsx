import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "GATE CSE Prep | Precision Learning System",
  description: "Designed for Rank 1. Built on Next.js, powered by Gemini AI, and focused on PYQs.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GATE CSE",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <main className="min-h-screen">
            {children}
          </main>
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
