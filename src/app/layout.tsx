import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Conversation Analyzer",
  description: "Analyze conversations and lectures with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {}
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between h-16 items-center">
              {}
              <Link href="/upload" className="text-xl font-bold text-blue-600">
                Conversation Analyzer
              </Link>

              {}
              <div className="flex space-x-6">
                <Link href="/upload" className="hover:text-blue-600">
                  Upload
                </Link>
                <Link href="/results/demo" className="hover:text-blue-600">
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {}
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}