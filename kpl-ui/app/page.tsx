import HomeBase from "@/components/home";
import Image from "next/image";
import Link from "next/link";
// import FireWave from "@/assets/fire_wave.jpg";

export default function Home() {
  return (
    <main >
      <div className="home-background">
        <div className="splash splash-1"></div>
        <div className="splash splash-2"></div>
        <div className="splash splash-3"></div>
        <div className="splash splash-4"></div>
      </div>
      <div>
      <HomeBase />
      </div>
   </main>
  );
}
