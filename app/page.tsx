import HomeBase from "@/components/home";
import Image from "next/image";
import Link from "next/link";
// import FireWave from "@/assets/fire_wave.jpg";

export default function Home() {
  return (
    <main >
      <div className="home-background"></div>
      <div>
      <HomeBase />
      </div>
   </main>
  );
}
