"use client";
import Link from "next/link";
import Image from "next/image";
import kplLogo from "@/assets/kpl-logo-large.jpeg";
import kplLogoTransp from "@/assets/kpl-logo-transparent.png";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "antd";
import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";

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
  const { data: session, status } = useSession();
  
  const isActive = (href: string) => {
    return pathName === href ? "text-gray-300" : "";
  }
  const isRegistrationActive =
    pathName === NavLinks.PLAYER_REGISTRATION ||
    pathName === NavLinks.BULK_PLAYER_REGISTRATION;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

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
          <li className={isRegistrationActive ? "border-b-4 border-yellow-300" : ""}>
            <div className="relative group">
              <button
                type="button"
                className="hover:text-gray-300 flex items-center focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={isRegistrationActive}
              >
                Registration
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu - appears on hover/focus */}
              <ul className="absolute left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded shadow-lg transform scale-95 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-20">
                <li>
                  <Link
                    href={NavLinks.PLAYER_REGISTRATION}
                    className={`block px-4 py-2 hover:bg-gray-700 ${pathName === NavLinks.PLAYER_REGISTRATION ? "text-gray-300" : "text-white"}`}
                  >
                    Player Registration
                  </Link>
                </li>
                <li>
                  <Link
                    href={NavLinks.BULK_PLAYER_REGISTRATION}
                    className={`block px-4 py-2 hover:bg-gray-700 ${pathName === NavLinks.BULK_PLAYER_REGISTRATION ? "text-gray-300" : "text-white"}`}
                  >
                    Bulk Player Registration
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li className={pathName === NavLinks.ABOUT_US ? "border-b-4 border-yellow-300": ""}>
            <Link className="hover:text-gray-300" href={NavLinks.ABOUT_US}>
              About Us
            </Link>
          </li>
          
          {/* Authentication buttons */}
          <li className="ml-4">
            {status === "loading" ? (
              <span className="text-gray-400">Loading...</span>
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 flex items-center gap-1">
                  <UserOutlined />
                  {session.user?.name}
                </span>
                <Button
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleSignOut}
                  size="small"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button type="primary" icon={<LoginOutlined />} size="small">
                  Login
                </Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
    <div className="h-16"></div>
    </>
  );
}
