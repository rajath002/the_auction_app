"use client";
import { useEffect, useRef, useState } from "react";
import constate from "constate";
import { Player, PlayerStatus, Team } from "../interface/interfaces";

import teamList from "@/data/teamslist.json";
// import playersList from "@/data/playerslist.json";
import { getTeams, updateTeam } from "@/services/teams";
import { getPlayers, updatePlayer } from "@/services/player";
import { ShufflePlayers } from "@/utils/playerUtils";

enum FilterType {
  ALL = "ALL",
  SOLD = "SOLD",
  UNSOLD = "UNSOLD",
  AUCTION = "AUCTION",
}

type FilterTypeValue = FilterType | "ALL" | "SOLD" | "UNSOLD" | "AUCTION";

function useAppState() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0); // Current player index
  const [teams, setTeams] = useState<Team[]>([]);
  // const [playersMasterData, setPlayersMasterData] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerFilter, setPlayerFilter] = useState<FilterTypeValue>(FilterType.ALL);
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
    const responsePlayer = await getPlayers();
    
    const shuffledPlayers = ShufflePlayers(responsePlayer.data);
    
    setTeams(teamList);
    setPlayers(shuffledPlayers);
  }

  function getFilteredPlayers(filter: FilterTypeValue, category?: string | null) {
    let func: ((p: Player) => boolean) | null;
    if (filter === FilterType.UNSOLD || filter === FilterType.SOLD) {
      func = (p: Player) => p.status === filter && (category ? p.category === category : true);
    } else if (filter === FilterType.AUCTION) {
      func = (p: Player) => !(p.status === FilterType.SOLD || p.status === FilterType.UNSOLD) && (category ? p.category === category : true);
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
    
    // Update team purse in database
    // updateTeam({ id: team.id, purse: points });
  }

  function updatePlayerPoints(
    playerId: number,
    team: Team,
    points: number,
    status?: any
  ) {
    const newStatus = status || "AVAILABLE";
    setPlayers((players) => {
      return players.map((playr) => {
        if (playr.id === playerId) {
          playr.bidValue = points;
          playr.currentTeamId = team.id;
          playr.status = newStatus;
        }
        return playr;
      });
    });
    
    // Update player in database
    newStatus !== 'In-Progress' && updatePlayer(playerId, {
      status: newStatus,
      bidValue: points,
      currentTeamId: team.id,
    });
  }

  // function isSoldPlayer(id: number) {
  //   return id ? !!soldPlayers.get(id) : false;
  // }

  // function playerSold(player: Player) {
  //   setSoldPlayers(soldPlayers.set(player.id, player));
  // }

  function updatePlayerStatus(playerToUpdate: Player, status: PlayerStatus) {
    let teams_: Team[] = [];
    let teamPointsToDeduct: number | null = null;
    let _totalSoldPlayers = 0;
    let _totalUnSoldPlayers = 0;
    let _noStatusPlayers= 0
    const players_ = players.map((player) => {
      if (player.id === playerToUpdate.id) {
        player.status = status;
        if (status === "UNSOLD" && player.currentTeamId) {
          teams_ = teams.map((t) => {
            if (t.id === player.currentTeamId) {
              t.purse = t.purse + player.bidValue;
              
              // Update team purse in database
              // updateTeam({ id: t.id, purse: t.purse });
            }
            return t;
          });
          teamPointsToDeduct = player.bidValue;

          // remove the team reference
          player.bidValue = player.baseValue;
          player.currentTeamId = null;
        }
        
        // If player is sold, update team purse in database
        if (status === "SOLD" && player.currentTeamId) {
          const team = teams.find(t => t.id === player.currentTeamId);
          if (team) {
            updateTeam({ id: team.id, purse: team.purse });
          }
        }
        
        // Update player in database
        updatePlayer(player.id, {
          status: player.status,
          bidValue: player.bidValue,
          currentTeamId: player.currentTeamId,
        });
      }
      // check Total Players status SOLD and UNSOLD
      if (player.status === "SOLD") {
        _totalSoldPlayers ++;
      } else if (player.status === "UNSOLD") {
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
      (p) => p.status === filter
    );
    if (currentPlayerIndex === players_and_status.length) {
      if (currentPlayerIndex - 1 !== -1) {
        setCurrentPlayerIndex(currentPlayerIndex - 1);
      }
    }
  }

  function getPlayersOfTeam(teamId: number) {
    return players.filter((playr) => {
      if (playr.currentTeamId === teamId) {
        return true;
      } else {
        return false;
      }
    });
  }

  function resetPlayerTeamAndPoints(player: Player) {
    let teamData = teams.map((t) => {
      if (t.id === player.currentTeamId) {
        t.purse += player.bidValue;
        
        // Update team purse in database
        updateTeam({ id: t.id, purse: t.purse });
      }
      return t;
    });
    let playersData = players.map((p) => {
      if (p.id === player.id) {
        p.currentTeamId = null;
        p.status = "AVAILABLE";
        p.bidValue = p.baseValue;
        
        // Update player in database
        updatePlayer(p.id, {
          currentTeamId: null,
          status: "AVAILABLE",
          bidValue: p.baseValue,
        });
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
    initDataValues,
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
