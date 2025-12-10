"use client";
import Image from "next/image";
import kplLogo from "@/assets/kpl-logo-large.jpeg";
import kplLogoTransparent from "@/assets/kpl-logo-transparent.png";
import { useAppContext } from "@/context/useAppState";
import { Team } from "@/interface/interfaces";

export default function HomeBase() {
  const { teams } = useAppContext();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <section className="flex justify-center mb-8 align-middle">
        <Image
          src={kplLogoTransparent}
          alt={"kpl-logo"}
          width={300}
          height={300}
          className="rounded-xl"
        ></Image>
      </section>
      <section className="w-full">
        {/* <h1 className="text-center font-semibold">Teams</h1> */}
        <div className="flex flex-wrap justify-center gap-5">
          {teams.map((t: Team) => (
            <ShowTeam key={t.id} team={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ShowTeam({ team }: { team: Team }) {
  return (    
    <article className="w-64 2xl:w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Hero image (bigger visual footprint) */}
      <div className="w-full h-44 2xl:h-56 overflow-hidden">
        <Image
          src={team.image || kplLogo}
          alt={`${team.name} banner`}
          width={200}
          height={250}
          className="w-full h-44 2xl:h-56 object-cover"
        />
      </div>

      {/* Header */}
      <header className="px-3 2xl:px-4 py-2 2xl:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold uppercase text-sm 2xl:text-base">
        <h2 className="truncate">{team.name}</h2>
      </header>

      {/* Body */}
      <div className="p-3 2xl:p-4 space-y-2 2xl:space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 2xl:w-11 h-9 2xl:h-11 rounded-full bg-blue-100 text-blue-700 font-semibold text-base 2xl:text-lg">😎</span>
          <div className="flex-1">
            <div className="text-xs 2xl:text-sm text-slate-500 uppercase">Owner</div>
            <div className="text-sm 2xl:text-base font-semibold text-slate-700 truncate">{team.owner || '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 2xl:w-11 h-9 2xl:h-11 rounded-full bg-amber-100 text-amber-700 font-semibold text-base 2xl:text-lg">🧭</span>
          <div className="flex-1">
            <div className="text-xs 2xl:text-sm text-slate-500 uppercase">Mentor</div>
            <div className="text-sm 2xl:text-base font-semibold text-slate-700 truncate">{team.mentor || '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 2xl:w-11 h-9 2xl:h-11 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-base 2xl:text-lg">🦸‍♂️</span>
          <div className="flex-1">
            <div className="text-xs 2xl:text-sm text-slate-500 uppercase">Icon Player</div>
            <div className="text-sm 2xl:text-base font-semibold text-slate-700 truncate">{team.iconPlayer || '—'}</div>
          </div>
        </div>

        {/* CTA / actions placeholder */}
        {/* <div className="pt-1">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label={`View ${team.name}`}
          >
            View
          </button>
        </div> */}
      </div>
    </article>
  );
}
