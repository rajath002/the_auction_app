import { Player, Team } from "@/interface/interfaces";
import { useAppContext } from "@/context/useAppState";

export default function TeamsAndPlayers() {
  const { teams, getPlayersOfTeam } = useAppContext();

  function filterPlayers(teamId: number) {
    const playrs = getPlayersOfTeam(teamId);
    return playrs.map((p: Player) => {
      return (
        <div key={p.id} className="text-center">
          {p.name}
        </div>
      );
    });
  }
  return (
    <>
      <div>
        <h2 className="text-center text-4xl p-10 text-slate-200 font-bold">TEAMS AND PLAYERS</h2>
        <div className="grid gap-2 grid-cols-5 justify-between">
          {teams&& teams.map((team: Team) => (
            <div key={team.id}>
              <div className="border-b-2 text-center text-lg bg-blue-600 rounded">{team.name} </div>
              <div className="text-center text-yellow-400">
                {team.iconPlayer}
               </div>
              {filterPlayers(team.id)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}