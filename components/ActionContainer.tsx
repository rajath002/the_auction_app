"use client";
import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { TeamList } from "./TeamList";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useAppContext } from "@/context/useAppState";
import { Team } from "@/interface/interfaces";

const INCREMENTAL_POINTS = 50;
export const AuctionContainer = () => {
  const {
    teams,
    players,
    currentPlayerIndex,
    updatePurse,
    updatePlayerPoints,
    resetPlayerTeamAndPoints,
    updatePlayerStatus,
    setCurrentPlayerIndex,
  } = useAppContext();

  // Fetch player data (replace with your actual data fetching logic)
  useEffect(() => {
    // fetch("/api/players")
    //   .then((response) => response.json())
    //   .then((data) => setPlayers(data));
    // setPlayers(playersList);
  }, []);

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
    updatePlayerStatus(players[currentPlayerIndex], "UNSOLD")
  }

  return (
    <div className="flex flex-col md:w-4/5 my-0 mx-auto">

      {players && (
        <PlayerCard
          player={players[currentPlayerIndex]}
          onSell={handleBidClick}
          onRevoke={handleRevokeClick}
          onResetPlayer={resetPlayerTeamAndPoints}
          onUnsold={onUnsoldHandler}
        />
      )}
      <div className="flex justify-between mb-4">
        <Button
          onClick={() =>
            setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0))
          }
          className="grid items-center"
        >
          <ArrowLeftOutlined style={{ color: "white" }} />
        </Button>
        <Button
          onClick={() =>
            setCurrentPlayerIndex(
              Math.min(currentPlayerIndex + 1, players.length - 1)
            )
          }
          className="grid items-center"
        >
          <ArrowRightOutlined style={{ color: "white" }} />
        </Button>
      </div>
      {players && teams && (
        <TeamList
          teams={teams}
          updateTeamAndPlayerPoints={updateTeamAndPlayerPoints}
          disabled={players[currentPlayerIndex]?.stats.status === "SOLD"}
          latedBiddedTeam={players[currentPlayerIndex]?.stats.currentTeamId}
        />
      )}
    </div>
  );
};
