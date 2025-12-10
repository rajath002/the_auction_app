"use client"
import PlayersList from "./components/PlayersList";
export default function PlayersListPage() {

  return (
    <>
      <div className="relative isolate overflow-hidden  border border-slate-800/60 bg-slate-950/90 px-8 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur">
        {/* <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
        <div className="pointer-events-none fixed -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" /> */}
        <div className="h-10" />
        <PlayersList />
      </div>
    </>
  );
}
