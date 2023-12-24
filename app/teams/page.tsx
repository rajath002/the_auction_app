"use client";
import { TeamList } from "@/components/TeamList";
import { useAppContext } from "@/context/useAppState";
import teams from "@/data/teamslist.json";
import { Team } from "@/interface/interfaces";
import TeamsAndPlayers from "./components/teams-and-players";

export default function TeamsPage() {
  return (
    <>
      <TeamsAndPlayers />
    </>
  );
}
