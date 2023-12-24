import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import Header from "@/components/header";
import { AppProvider } from "@/context/useAppState";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KPL",
  description: "KPL auction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AppProvider >
      <body className={[inter.className, "relative", "text-white", "bg-slate-700", ].join(" ")}>
        <Header />
        {children}
      </body>
      </AppProvider>
    </html>
  );
}
