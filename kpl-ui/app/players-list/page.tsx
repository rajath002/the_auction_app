"use client"
import { useEffect, useState } from "react";
import PlayersList from "./components/PlayersList";
import { getPlayers } from "@/services/player";
import { Player } from "@/interface/interfaces";
export default function PlayersListPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    getPlayers().then((players) => setPlayers(players));
  }, []);

  console.log("#from UI players", players);

  return (
    <>
      <h1 className="text-xl text-center p-10">Players list</h1>
      <PlayersList players={players}/>
    </>
  );
}
