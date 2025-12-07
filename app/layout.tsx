import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "../styles/index.scss";
import Header from "@/components/header";
import { AppProvider } from "@/context/useAppState";
import PageLoader from "@/components/PageLoader";
import AuthProvider from "@/components/AuthProvider";

// const inter = Inter({ subsets: ["latin"] });

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
      <AuthProvider>
        <AppProvider>
          <body className={[
            // inter.className, 
            "relative", "text-white", "bg-slate-700", ].join(" ")}>
            <PageLoader />
            <Header />
            {children}
          </body>
        </AppProvider>
      </AuthProvider>
    </html>
  );
}
