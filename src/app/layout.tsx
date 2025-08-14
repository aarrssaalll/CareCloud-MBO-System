import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientAppFrame from "@/components/ClientAppFrame";

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
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <div className="min-h-full flex flex-col">
          {/* Client frame wraps app pages with persistent sidebar/right panel */}
          <ClientAppFrame>{children}</ClientAppFrame>
        </div>
      </body>
    </html>
  );
}
