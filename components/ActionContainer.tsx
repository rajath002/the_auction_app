"use client";
import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { TeamList } from "./TeamList";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Radio } from "antd";
import { useAppContext } from "@/context/useAppState";
import { Player, Team } from "@/interface/interfaces";

const INCREMENTAL_POINTS = 50;
export const AuctionContainer = () => {
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const {
    teams,
    players,
    currentPlayerIndex,
    playerFilter,
    updatePurse,
    updatePlayerPoints,
    resetPlayerTeamAndPoints,
    updatePlayerStatus,
    setCurrentPlayerIndex,
    setPlayerFilter,
    getFilteredPlayers,
  } = useAppContext();

  // Fetch player data (replace with your actual data fetching logic)
  useEffect(() => {
    const players_ = getFilteredPlayers(playerFilter);
    if (!players_.length) {
      let idx = 0;
      if(currentPlayerIndex + 1 > players_?.length) {
        idx = currentPlayerIndex + 1 
      } else {
        idx = currentPlayerIndex - 1
      }
      setCurrentPlayerIndex(idx)

      setCurrentPlayerIndex(0);
    }
    setFilteredPlayers(() => players_);
  }, [currentPlayerIndex, getFilteredPlayers, playerFilter, setCurrentPlayerIndex]);

  const updateTeamAndPlayerPoints = (team: Team) => {
    const playerInfo = players[currentPlayerIndex];
    if (team.id === playerInfo.stats.currentTeamId) {
      return;
    }
    let value = playerInfo.stats.bidValue;
    const oldBidValue = value;
    const oldTeamId = playerInfo.stats.currentTeamId;
    if (oldTeamId) {
      value = value + INCREMENTAL_POINTS;
    }

    updatePurse(team, team.purse - value);
    updatePlayerPoints(playerInfo.id, team, value);
    // Deduct points from previos team
    if (playerInfo.stats.currentTeamId) {
      const oldTeam = teams.find((oldTeam) => oldTeam.id === oldTeamId);
      updatePurse(oldTeam, oldTeam.purse + oldBidValue);
    }
  };

  const handleBidClick = () => {
    // Implement bid logic like updating currentBid in player object and potentially sending bid data to server
    // playerSold(players[currentPlayerIndex])
    updatePlayerStatus(players[currentPlayerIndex], "SOLD");
  };

  const handleRevokeClick = () => {
    updatePlayerStatus(players[currentPlayerIndex], null);
  };

  const onUnsoldHandler = () => {
    updatePlayerStatus(players[currentPlayerIndex], "UNSOLD");
  };

  return (
    <div className="flex flex-col md:w-4/5 my-0 mx-auto">
      {filteredPlayers && filteredPlayers.length && (
        <PlayerCard
          player={filteredPlayers[currentPlayerIndex]}
          onSell={handleBidClick}
          onRevoke={handleRevokeClick}
          onResetPlayer={resetPlayerTeamAndPoints}
          onUnsold={onUnsoldHandler}
          index={currentPlayerIndex}
        />
      )}
      {filteredPlayers && filteredPlayers.length === 0 && (
        <div className="text-5xl rounded-lg my-10 p-5 text-yellow-700 bg-yellow-200 border border-yellow-500">
          Players Not Found!
        </div>
      )}
      <div className="flex justify-between mb-4">
        <Button
          onClick={() => {
            setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0));
          }}
          className="grid items-center"
        >
          <ArrowLeftOutlined style={{ color: "white" }} />
        </Button>
        <div>
          <Radio.Group
            value={playerFilter}
            onChange={(e) => {
              console.log("cliecked", e);
              setPlayerFilter(e.target.value);
            }}
          >
            <Radio.Button value="ALL">ALL</Radio.Button>
            {/* <Radio.Button value="SOLD">SOLD</Radio.Button> */}
            <Radio.Button value="UNSOLD">UNSOLD</Radio.Button>
          </Radio.Group>
        </div>
        <Button
          onClick={() => {
            const list = filteredPlayers;
            setCurrentPlayerIndex(
              Math.min(currentPlayerIndex + 1, list.length - 1)
            );
          }}
          className="grid items-center"
        >
          <ArrowRightOutlined style={{ color: "white" }} />
        </Button>
      </div>
      {currentPlayerIndex}
      {filteredPlayers && teams && (
        <TeamList
          teams={teams}
          updateTeamAndPlayerPoints={updateTeamAndPlayerPoints}
          disabled={filteredPlayers[currentPlayerIndex]?.stats.status === "SOLD"}
          latedBiddedTeam={filteredPlayers[currentPlayerIndex]?.stats.currentTeamId}
        />
      )}
    </div>
  );
};
