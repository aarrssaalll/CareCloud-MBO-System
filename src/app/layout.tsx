import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareCloud MBO System",
  description: "Automated Management by Objectives Reporting System for CareCloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 antialiased`}>
        <div className="min-h-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
