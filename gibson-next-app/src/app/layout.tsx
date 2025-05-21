import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SplitReceipt - Easy Expense Splitting",
  description: "Split receipts and track expenses with friends and groups easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <header className="bg-white border-b border-slate-200">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                  <a href="/" className="text-2xl font-bold text-blue-600">SplitReceipt</a>
                  <nav className="flex items-center space-x-4">
                    <a href="/login" className="text-sm font-medium text-slate-700 hover:text-blue-600">Login</a>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
              {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-4">
              <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} SplitReceipt App
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}