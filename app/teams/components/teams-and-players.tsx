import { useMemo } from "react";
import { Player, Team } from "@/interface/interfaces";
import { useAppContext } from "@/context/useAppState";
import { useCurrentUser } from "@/hooks/useAuth";

const accentGradient = "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950";

export default function TeamsAndPlayers() {
  const { teams, getPlayersOfTeam } = useAppContext();
  const { user } = useCurrentUser();
  
  const canSeeBidValue = user?.role === "admin" || user?.role === "manager";

  const computedTeams = useMemo(() => teams ?? [], [teams]);

  if (!computedTeams.length) {
    return (
      <section className="min-h-screen px-4 py-12 border-slate-800/60 bg-slate-950/90 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="mt-4 text-sm text-slate-400 animate-pulse">
            Loading teams and players...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 border-slate-800/60 bg-slate-950/90 min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
        {/* <div className="pointer-events-none absolute -bottom-28 -right-24 rounded-full bg-blue-500/10 blur-3xl" /> */}
      <div className="h-20"></div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="text-center">
          <h2 className="text-4xl font-bold uppercase tracking-[0.35em] text-slate-100">
            Teams & Players
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Explore each roster, track the icon player, and monitor how every squad is shaping up as the auction progresses.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {computedTeams.map((team: Team) => {
            const players: Player[] = getPlayersOfTeam(team.id) ?? [];
            const iconPlayer = team.iconPlayer?.trim();
            const totalSpent = players.reduce((sum, p) => sum + (p.bidValue ?? 0), 0);

            return (
              <article
                key={team.id}
                className={[
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/60 p-6 text-slate-100 shadow-lg transition-all duration-300",
                  accentGradient,
                  "hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-2xl",
                ].join(" ")}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="pointer-events-none absolute -top-16 right-[-20%] h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Team</p>
                      <h3 className="text-xl font-semibold uppercase tracking-wide text-slate-100">
                        {team.name}
                      </h3>
                    </div>
                    <span className="rounded-full bg-blue-500/15 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] te
                    xt-blue-300">
                      {players.length} Players
                    </span>
                  </div>

                    <header className="flex flex-col text-[11px] uppercase tracking-[0.35em] text-slate-500 cursor-default">
                    <div className="flex items-center justify-between gap-3 mt-1" title={team.owner || "TBD"}>
                      <span className="text-[10px] tracking-[0.35em] text-slate-400">Owner</span>
                      <span className="ml-2 truncate text-sm font-semibold text-slate-100">{team.owner || "TBD"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3" title={team.mentor || "TBD"}>
                      <span className="text-[10px] tracking-[0.35em] text-slate-400">Mentor</span>
                      <span className="ml-2 truncate text-sm font-semibold text-slate-100">{team.mentor || "TBD"}</span>
                    </div>
                    {canSeeBidValue && (
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-[10px] tracking-[0.35em] text-slate-400">Total Spent</span>
                        <span className="ml-2 truncate text-sm font-semibold text-emerald-300">₹{totalSpent.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </header>

                  {iconPlayer ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-amber-300">
                        Icon
                      </span>
                      <span className="text-sm font-medium text-amber-100">{iconPlayer}</span>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                      Icon player not assigned yet.
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden">
                    <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-1">
                      {players.length ? (
                        players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 px-3 py-2 text-sm transition hover:border-blue-500/50 hover:bg-slate-900/80"
                          >
                            <span className="font-medium text-slate-100">{player.name}</span>
                            <div className="flex items-center gap-3">
                              {canSeeBidValue && (
                                <span className="text-xs font-semibold text-emerald-300">
                                  ₹{player.bidValue?.toLocaleString("en-IN") ?? 0}
                                </span>
                              )}
                              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                {player.type}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 px-3 py-6 text-center text-xs text-slate-400">
                          No players have been assigned to this team yet.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* <footer className="flex flex-col pt-2 text-[11px] uppercase tracking-[0.35em] text-slate-500">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] tracking-[0.35em] text-slate-400">Mentor</span>
                      <span className="ml-2 truncate text-sm font-semibold text-slate-100">{team.mentor || "TBD"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <span className="text-[10px] tracking-[0.35em] text-slate-400">Owner</span>
                      <span className="ml-2 truncate text-sm font-semibold text-slate-100">{team.owner || "TBD"}</span>
                    </div>
                  </footer> */}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}