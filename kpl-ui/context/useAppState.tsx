"use client";
import { useEffect, useRef, useState } from "react";
import constate from "constate";
import { Player, PlayerStatus, Team } from "../interface/interfaces";

import teamList from "@/data/teamslist.json";
// import playersList from "@/data/playerslist.json";
import { getTeams } from "@/services/teams";
import { getPlayers } from "@/services/player";

enum FilterType {
  ALL = "ALL",
  SOLD = "SOLD",
  UNSOLD = "UNSOLD",
  AUCTION = "AUCTION",
}

function useAppState() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0); // Current player index
  const [teams, setTeams] = useState<Team[]>([]);
  // const [playersMasterData, setPlayersMasterData] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerFilter, setPlayerFilter] = useState<FilterType>("ALL");
  const [filteredPlayers, setFilteredPlayers]=useState<Player[]>([]);
  const [totalPlayersAvaiableForBid, setTotalPlayersAvaiableForBid] = useState(0);
  const [totalSoldPlayers, setTotalSoldPlayers] = useState(0);
  const [totalUnsoldPlayers, setTotalUnsoldPlayers] = useState(0);
  const [totalNoStatusPlayers, setTotalNoStatusPlayers] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string|null>(null);

  useEffect(() => {
    initDataValues();
  }, []);

  async function initDataValues() {
    const teamList = await getTeams();
    const playersList = await getPlayers();
    setTeams(teamList);
    setPlayers(playersList);
  }

  function getFilteredPlayers(filter: FilterType, category?: string | null) {
    let func: ((p: Player) => boolean) | null;
    if (filter === FilterType.UNSOLD || filter === FilterType.SOLD) {
      func = (p: Player) => p.stats.status === filter && (category ? p.category === category : true);
    } else if (filter === FilterType.AUCTION) {
      func = (p: Player) => !(p.stats.status === FilterType.SOLD || p.stats.status === FilterType.UNSOLD) && (category ? p.category === category : true);
    } else {
      if (category) {
        func = (p: Player) => p.category === category;
      } else {
        func = null;
      }
    }
    const data = func ? players.filter(func) : players;
    // setPlayers(data);
    setFilteredPlayers(() => data);
    return data;
  }

  function updatePurse(team: Team, points: number) {
    const updatedTeams = teams.map((t) => {
      if (t.id === team.id) {
        t.purse = points;
      }
      return t;
    });
    setTeams(() => updatedTeams);
  }

  function updatePlayerPoints(
    playerId: number,
    team: Team,
    points: number,
    status?: any
  ) {
    setPlayers((players) => {
      return players.map((playr) => {
        if (playr.id === playerId) {
          playr.stats.bidValue = points;
          playr.stats.currentTeamId = team.id;
          playr.stats.status = status || null;
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
    let _totalSoldPlayers = 0;
    let _totalUnSoldPlayers = 0;
    let _noStatusPlayers= 0
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
      // check Total Players status SOLD and UNSOLD
      if (player.stats.status === "SOLD") {
        _totalSoldPlayers ++;
      } else if (player.stats.status === "UNSOLD") {
        _totalUnSoldPlayers ++;
      } else {
        _noStatusPlayers ++;
      }
      return player;
    });

    setTotalSoldPlayers(_totalSoldPlayers);
    setTotalUnsoldPlayers(_totalUnSoldPlayers);
    setTotalNoStatusPlayers(_noStatusPlayers);

    // const teams_ = teams.find

    if (players_.length) setPlayers(() => players_);
    if (teams_.length) setTeams(teams_);

    const filter = playerFilter === "ALL" ? null : playerFilter;
    const players_and_status = players_.filter(
      (p) => p.stats.status === filter
    );
    if (currentPlayerIndex === players_and_status.length) {
      if (currentPlayerIndex - 1 !== -1) {
        setCurrentPlayerIndex(currentPlayerIndex - 1);
      }
    }
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

  function updateSelectedCategory (category: string | null) {
    if (category !== selectedCategory) {
      setSelectedCategory(category);
      setCurrentPlayerIndex(() => 0);
    }
  }

  return {
    teams,
    players,
    currentPlayerIndex,
    playerFilter,
    filteredPlayers,
    totalSoldPlayers,
    totalUnsoldPlayers,
    totalNoStatusPlayers,
    selectedCategory,
    setPlayers,
    updatePurse,
    updatePlayerPoints,
    updatePlayerStatus,
    getPlayersOfTeam,
    resetPlayerTeamAndPoints,
    setCurrentPlayerIndex,
    setPlayerFilter,
    getFilteredPlayers,
    updateSelectedCategory,
  };
}

export const [AppProvider, useAppContext] = constate(useAppState);
