"use client";
import Link from "next/link";
import Image from "next/image";
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

const navItems = [
  { label: "Home", href: NavLinks.HOME },
  { label: "Players", href: NavLinks.PLAYERS },
  { label: "Auction", href: NavLinks.AUCTION },
  { label: "Teams", href: NavLinks.TEAMS },
  { label: "About Us", href: NavLinks.ABOUT_US },
];

export default function Header() {
  // get current nav link active
  const pathName = usePathname();
  const { data: session, status } = useSession();

  const getNavItemClass = (href: string) =>
    `inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
      pathName === href
        ? "bg-white/10 text-yellow-300"
        : "text-gray-200 hover:text-white hover:bg-white/5"
    }`;

  const currentYear = new Date().getFullYear();

  const isRegistrationActive =
    pathName === NavLinks.PLAYER_REGISTRATION ||
    pathName === NavLinks.BULK_PLAYER_REGISTRATION;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gray-950/80 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide transition-opacity hover:opacity-90">
          <Image
            src={kplLogoTransp}
            alt={"kpl-logo"}
            width={40}
            height={40}
            className="rounded-xl border border-white/10"
          ></Image>
          <div className="flex items-baseline gap-1">
            <span className="uppercase tracking-[0.2em] text-xs text-gray-300">KPL</span>
            <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-violet-300 bg-clip-text text-base font-bold text-transparent">
              {currentYear}
            </span>
          </div>
        </Link>
        <nav>
          <ul className="flex flex-wrap items-center gap-1 md:gap-2">
            {navItems.map(({ label, href }) => (
              <li key={href}>
                <Link className={getNavItemClass(href)} href={href}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <div className="group relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring focus-visible:ring-amber-300/60 ${
                    isRegistrationActive
                      ? "bg-white/10 text-yellow-300"
                      : "text-gray-200 hover:text-white hover:bg-white/5"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={isRegistrationActive}
                >
                  Registration
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isRegistrationActive ? "rotate-180" : ""
                    } group-hover:rotate-180 group-focus-within:rotate-180`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="pointer-events-none invisible absolute left-0 top-full z-20 w-64 translate-y-2 pt-3 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible group-hover:duration-150 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible">
                  <ul className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur">
                    <li>
                      <Link
                        href={NavLinks.PLAYER_REGISTRATION}
                        className={`block px-4 py-3 text-sm transition-colors duration-150 ${
                          pathName === NavLinks.PLAYER_REGISTRATION
                            ? "bg-white/10 text-yellow-300"
                            : "text-gray-200 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        Player Registration
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={NavLinks.BULK_PLAYER_REGISTRATION}
                        className={`block px-4 py-3 text-sm transition-colors duration-150 ${
                          pathName === NavLinks.BULK_PLAYER_REGISTRATION
                            ? "bg-white/10 text-yellow-300"
                            : "text-gray-200 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        Bulk Player Registration
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </li>

            <li className="ml-2 flex items-center">
              {status === "loading" ? (
                <span className="px-4 py-2 text-sm text-gray-400">Loading...</span>
              ) : session ? (
                <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-200">
                  <span className="flex items-center gap-1">
                    <UserOutlined />
                    {session.user?.name}
                  </span>
                  <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    onClick={handleSignOut}
                    size="small"
                    className="!rounded-full !border-white/10 !bg-white/20 !text-white hover:!bg-white/30"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    size="small"
                    className="!rounded-full !bg-amber-400 !font-semibold !text-gray-900 hover:!bg-amber-300"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <div className="h-20"></div>
    </>
  );
}
