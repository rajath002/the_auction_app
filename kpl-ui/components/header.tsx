"use client";
import Link from "next/link";
import Image from "next/image";
import kplLogo from "@/assets/kpl-logo-large.jpeg";
import kplLogoTransp from "@/assets/kpl-logo-transparent.png";
import { usePathname } from "next/navigation";

enum NavLinks {
  HOME = "/",
  PLAYERS = "/players-list",
  AUCTION = "/auction",
  TEAMS = "/teams",
  PLAYER_REGISTRATION = "/player-registration",
  BULK_PLAYER_REGISTRATION = "/bulk-player-registration",
  ABOUT_US = "/about-us",
}

export default function Header() {
  // get current nav link active
  const pathName = usePathname();
  const isActive = (href: string) => {
    return pathName === href ? "text-gray-300" : "";
  }

  return (
    <>
    <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between top-0 left-0 fixed w-full z-10">
      <Link href="/" className="font-bold text-xl flex items-center">
      <Image
          src={kplLogoTransp}
          alt={"kpl-logo"}
          width={30}
          height={30}
          className="rounded-xl"
        ></Image>
        KPL &nbsp; <div className="bg-gradient-conic from-red-500 via-purple-300 to-yellow-600 bg-clip-text text-transparent">2025</div>
      </Link>
      <nav>
        <ul className="flex items-center space-x-4">
          <li className={pathName === NavLinks.HOME ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.HOME}>
              Home
            </Link>
          </li>
          <li className={pathName === NavLinks.PLAYERS ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.PLAYERS}>
              Players
            </Link>
          </li>
          <li className={pathName === NavLinks.AUCTION ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.AUCTION}>
              Auction
            </Link>
          </li>
          <li className={pathName === NavLinks.TEAMS ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.TEAMS}>
              Teams
            </Link>
          </li>
          <li className={pathName === NavLinks.PLAYER_REGISTRATION ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.PLAYER_REGISTRATION}>
              Player Registration
            </Link>
          </li>
          <li className={pathName === NavLinks.BULK_PLAYER_REGISTRATION ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.BULK_PLAYER_REGISTRATION}>
              Bulk Player Registration
            </Link>
          </li>
          <li className={pathName === NavLinks.ABOUT_US ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.ABOUT_US}>
              About Us
            </Link>
          </li>
        </ul>
      </nav>
    </header>
    <div className="h-16"></div>
    </>
  );
}
