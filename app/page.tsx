import HomeBase from "@/components/home";
import Image from "next/image";
import Link from "next/link";
import SplashBackground from "@/components/SplashBackground";
// import FireWave from "@/assets/fire_wave.jpg";

export const metadata = {
  title: "KPL Auction App",
  description: "Manage your cricket auction events and teams.",
  keywords: ["cricket", "auction", "fantasy", "KPL", "teams", "players"],
  authors: [{ name: "Rajath" }],
  openGraph: {
    title: "KPL Auction App",
    description: "Manage your cricket auction events and teams.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main >
      <SplashBackground />
      <div>
        <HomeBase />
      </div>
   </main>
  );
}
