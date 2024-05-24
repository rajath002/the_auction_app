import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between">
      <Link href="/" className="font-bold text-xl">
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
            <Link className="hover:text-gray-300" href="/player-registration">
              Player Registration
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
