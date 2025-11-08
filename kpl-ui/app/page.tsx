import HomeBase from "@/components/home";
import Image from "next/image";
import Link from "next/link";
import SplashBackground from "@/components/SplashBackground";
// import FireWave from "@/assets/fire_wave.jpg";

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
