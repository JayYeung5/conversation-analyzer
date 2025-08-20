import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Conversation Analyzer",
  description: "Analyze conversations and lectures with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className="min-h-screen bg-black text-gray-100">
        <nav className="relative z-20 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between h-16 items-center">
              <Link
                href="/upload"
                className="text-xl font-bold text-blue-400 hover:text-lime-200 transition"
              >
                Conversation Analyzer
              </Link>
              <div className="flex space-x-6 text-blue-400 font-medium">
                <Link href="/upload" className="hover:text-lime-200 transition">
                  Upload
                </Link>
                <Link href="/results/demo" className="hover:text-lime-200 transition">
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}