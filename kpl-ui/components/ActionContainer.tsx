"use client";
import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { TeamList } from "./TeamList";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Col, ConfigProvider, Form, Radio, Row, Select, Statistic } from "antd";
import { useAppContext } from "@/context/useAppState";
import { Player, Team } from "@/interface/interfaces";

const INCREMENTAL_POINTS = 50;

// Sample data
const data = [
  { id: 1, name: "Level 1", category: "L1" },
  { id: 2, name: "Level 2", category: "L2" },
  { id: 3, name: "Level 3", category: "L3" },
  { id: 4, name: "Level 4", category: "L4" },
  { id: 5, name: "Level 5", category: "L5" },
];
const categories = ["All", ...new Set(data.map((item) => item.category))];

export const AuctionContainer = () => {
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const {
    teams,
    players,
    currentPlayerIndex,
    playerFilter,
    totalSoldPlayers,
    totalUnsoldPlayers,
    selectedCategory,
    updatePurse,
    updatePlayerPoints,
    resetPlayerTeamAndPoints,
    updatePlayerStatus,
    setCurrentPlayerIndex,
    setPlayerFilter,
    getFilteredPlayers,
    updateSelectedCategory
  } = useAppContext();

  // Fetch player data (replace with your actual data fetching logic)
  useEffect(() => {
    const players_ = getFilteredPlayers(playerFilter, selectedCategory);
    setFilteredPlayers(() => players_);
    return () => {
      // getFilteredPlayers("ALL");
    }
  }, [getFilteredPlayers, playerFilter, selectedCategory]);

  const updateUnsoldPlayerTeamAndPoints = (player: Player, team: Team) => {
    updatePlayerPoints(player.id, team, player.stats.bidValue+INCREMENTAL_POINTS, player.stats.status);
    updatePurse(team, team.purse - INCREMENTAL_POINTS);
  }

  const updateTeamAndPlayerPoints = (team: Team) => {
    const playerInfo = filteredPlayers[currentPlayerIndex];
    if (team.id === playerInfo.stats.currentTeamId) {
      return;
    }
    if (playerInfo.stats.status === "UNSOLD") {
      updateUnsoldPlayerTeamAndPoints(playerInfo, team);
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
      if (oldTeam)
        updatePurse(oldTeam, oldTeam.purse + oldBidValue);
    }
  };

  const handleBidClick = () => {
    // Implement bid logic like updating currentBid in player object and potentially sending bid data to server
    // playerSold(players[currentPlayerIndex])
    updatePlayerStatus(filteredPlayers[currentPlayerIndex], "SOLD");
  };

  const handleRevokeClick = () => {
    updatePlayerStatus(filteredPlayers[currentPlayerIndex], null);
  };

  const onUnsoldHandler = (player:Player) => {
    updatePlayerStatus(filteredPlayers[currentPlayerIndex], "UNSOLD");
  };

  const handleCategoryChange = (value) => {
    if (value === "All") {
      updateSelectedCategory(null);
    } else {
      updateSelectedCategory(value);
    }
  };

  return (
    <ConfigProvider
    <div className="flex flex-col md:w-4/5 my-0 mx-auto">
      <div className="w-full flex items-center flex-wrap">
        Toal Players Sold: {totalSoldPlayers}, 
        Toal Players UnSold: {totalUnsoldPlayers}
            <div className="ml-auto flex">
            <p className="px-2">Players by category</p>
              <Select
                className="min-w-52"
                placeholder="Players by category"
                title="Search by Category"
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select></div>
      </div>
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
            <Radio.Button value="SOLD">SOLD</Radio.Button>
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
          isPlayersAvailable={filteredPlayers.length !== 0}
          updateTeamAndPlayerPoints={updateTeamAndPlayerPoints}
          disabled={filteredPlayers[currentPlayerIndex]?.stats.status === "SOLD"}
          latedBiddedTeam={filteredPlayers[currentPlayerIndex]?.stats.currentTeamId}
        />
      )}
    </div>
    </ConfigProvider>
  );
};
