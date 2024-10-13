
import Link from "next/link";
import Image from "next/image";
import kplLogo from "@/assets/kpl-logo-large.jpeg";
import kplLogoTransp from "@/assets/kpl-logo-transparent.png";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between">
      <Link href="/" className="font-bold text-xl flex items-center">
      <Image
          src={kplLogoTransp}
          alt={"kpl-logo"}
          width={30}
          height={30}
          className="rounded-xl"
        ></Image>
        KPL
      </Link>
      <nav>
        <ul className="flex items-center space-x-4">
          <li>
            <Link className="hover:text-gray-300" href="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="hover:text-gray-300" href="/players-list">
              Players
            </Link>
          </li>
          <li>
            <Link className="hover:text-gray-300" href="/auction">
              Auction
            </Link>
          </li>
          <li>
            <Link className="hover:text-gray-300" href="/teams">
              Teams
            </Link>
          </li>
          <li>
            <Link className="hover:text-gray-300" href="/registration/player-registration">
              Player Registration
            </Link>
          </li>
          <li>
            <Link className="hover:text-gray-300" href="/registration/bulk-player-registration">
              Bulk Player Registration
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
