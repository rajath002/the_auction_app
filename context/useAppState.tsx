"use client";
import { useEffect, useRef, useState } from "react";
import constate from "constate";
import { Player, PlayerStatus, Team } from "../interface/interfaces";

import teamList from "@/data/teamslist.json";
import playersList from "@/data/playerslist.json";

function useAppState() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0); // Current player index
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  // const [soldPlayers, setSoldPlayers] = useState<Map<number, Player>>(
  //   new Map()
  // );

  useEffect(() => {
    setTeams(teamList);
    setPlayers(playersList);
  }, [players]);

  function updatePurse(team: Team, points: number) {
    const updatedTeams = teams.map((t) => {
      if (t.id === team.id) {
        t.purse = points;
      }
      return t;
    });
    setTeams(() => updatedTeams);
  }

  function updatePlayerPoints(playerId: number, team: Team, points: number) {
    setPlayers((players) => {
      return players.map((playr) => {
        if (playr.id === playerId) {
          playr.stats.bidValue = points;
          playr.stats.currentTeamId = team.id;
          playr.stats.status=null;
        }
        return playr;
      });
    });
  }

  // function isSoldPlayer(id: number) {
  //   return id ? !!soldPlayers.get(id) : false;
  // }

  // function playerSold(player: Player) {
  //   setSoldPlayers(soldPlayers.set(player.id, player));
  // }

  function updatePlayerStatus(updatePlayer: Player, status: PlayerStatus) {
    let teams_: Team[] = [];
    let teamPointsToDeduct: number | null = null;
    const players_ = players.map((player) => {
      if (player.id === updatePlayer.id) {
        player.stats.status = status;
        if (status === "UNSOLD" && player.stats.currentTeamId) {
          teams_ = teams.map((t) => {
            if (t.id === player.stats.currentTeamId) {
              t.purse = t.purse + player.stats.bidValue;
            }
            return t;
          });
          teamPointsToDeduct = player.stats.bidValue;

          // remove the team reference
          player.stats.bidValue = player.stats.baseValue;
          player.stats.currentTeamId = null;
        }
      }
      return player;
    });

    // const teams_ = teams.find

    if (players_.length) setPlayers(() => players_);
    if (teams_.length) setTeams(teams_);
  }

  function getPlayersOfTeam(teamId: number) {
    return players.filter((playr) => {
      if (playr.stats.currentTeamId === teamId) {
        return true;
      } else {
        return false;
      }
    });
  }

  function resetPlayerTeamAndPoints(player: Player) {
    let teamData = teams.map((t) => {
      if (t.id === player.stats.currentTeamId) {
        t.purse += player.stats.bidValue;
      }
      return t;
    });
    let playersData = players.map((p) => {
      if (p.id === player.id) {
        p.stats.currentTeamId = null;
        p.stats.status = null;
        p.stats.bidValue = p.stats.baseValue;
      }
      return p;
    });
    setTeams(teamData);
    setPlayers(playersData);
  }

  return {
    teams,
    players,
    currentPlayerIndex,
    setPlayers,
    updatePurse,
    updatePlayerPoints,
    updatePlayerStatus,
    getPlayersOfTeam,
    resetPlayerTeamAndPoints,
    setCurrentPlayerIndex,
  };
}

export const [AppProvider, useAppContext] = constate(useAppState);
