"use client";
import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { TeamList } from "./TeamList";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Radio, Select } from "antd";
import { useAppContext } from "@/context/useAppState";
import { Player, Team } from "@/interface/interfaces";

const INCREMENTAL_POINTS = 50;

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
    updateSelectedCategory,
  } = useAppContext();

  useEffect(() => {
    const playersList = getFilteredPlayers(playerFilter, selectedCategory);
    setFilteredPlayers(playersList);
    return () => {
      // No teardown required
    };
  }, [getFilteredPlayers, playerFilter, selectedCategory]);

  const updateUnsoldPlayerTeamAndPoints = (player: Player, team: Team) => {
    updatePlayerPoints(player.id, team, player.bidValue + INCREMENTAL_POINTS, player.status);
    updatePurse(team, team.purse - INCREMENTAL_POINTS);
  };

  const updateTeamAndPlayerPoints = (team: Team) => {
    const playerInfo = filteredPlayers[currentPlayerIndex];

    if (!playerInfo) {
      return;
    }

    if (team.id === playerInfo.currentTeamId) {
      return;
    }

    if (playerInfo.status === "UNSOLD") {
      updateUnsoldPlayerTeamAndPoints(playerInfo, team);
      return;
    }

    let value = playerInfo.bidValue;
    const oldBidValue = value;
    const oldTeamId = playerInfo.currentTeamId;

    if (oldTeamId) {
      value += INCREMENTAL_POINTS;
    }

    updatePurse(team, team.purse - value);
    updatePlayerPoints(playerInfo.id, team, value);

    if (playerInfo.currentTeamId) {
      const oldTeam = teams.find((existingTeam) => existingTeam.id === oldTeamId);
      if (oldTeam) {
        updatePurse(oldTeam, oldTeam.purse + oldBidValue);
      }
    }
  };

  const handleBidClick = () => {
    const activePlayer = filteredPlayers[currentPlayerIndex];
    if (activePlayer) {
      updatePlayerStatus(activePlayer, "SOLD");
    }
  };

  const handleRevokeClick = () => {
    const activePlayer = filteredPlayers[currentPlayerIndex];
    if (activePlayer) {
      updatePlayerStatus(activePlayer, "AVAILABLE");
    }
  };

  const onUnsoldHandler = (player: Player) => {
    updatePlayerStatus(player, "UNSOLD");
  };

  const handleCategoryChange = (value: string) => {
    if (value === "All") {
      updateSelectedCategory(null);
    } else {
      updateSelectedCategory(value);
    }
  };

  const hasPlayers = filteredPlayers.length > 0;

  return (
    <ConfigProvider>
      <div className="mx-auto flex w-full max-w-full flex-col gap-2 px-4 pb-16 pt-1">
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/80 px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-1 text-slate-200">

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Summary</span>
              <div className="flex items-center gap-1 text-lg font-semibold">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-emerald-200">
                  Sold · {totalSoldPlayers}
                </span>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-rose-200">
                  Unsold · {totalUnsoldPlayers}
                </span>
              </div>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-1 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Players by category</span>
              <Select
                className="min-w-60 [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!bg-slate-900/80 [&_.ant-select-selector]:!text-slate-100"
                placeholder="Select category"
                title="Search by Category"
                onChange={handleCategoryChange}
                value={selectedCategory ?? "All"}
              >
                {categories.map((category) => (
                  <Select.Option key={category} value={category === "All" ? "All" : category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:gap-2">
          <div className="flex flex-col gap-1">
            {hasPlayers ? (
              <PlayerCard 
                player={filteredPlayers[currentPlayerIndex]}
                onSell={handleBidClick}
                onRevoke={handleRevokeClick}
                onResetPlayer={resetPlayerTeamAndPoints}
                onUnsold={onUnsoldHandler}
                index={currentPlayerIndex}
              />
            ) : (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center text-2xl font-semibold text-amber-200 shadow-inner">
                Players Not Found
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/60 bg-slate-950/80 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.45)]">
              <Button
                onClick={() => {
                  setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0));
                }}
                className="!flex !h-12 !w-12 !items-center !justify-center !rounded-full !border-none !bg-gradient-to-br !from-slate-800 !to-slate-900 !text-slate-200 hover:!from-slate-700 hover:!to-slate-800"
              >
                <ArrowLeftOutlined />
              </Button>

              <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                <span>Filter Players</span>
                <Radio.Group
                  value={playerFilter}
                  onChange={(e) => {
                    setPlayerFilter(e.target.value);
                  }}
                  className="rounded-full border border-slate-800 bg-slate-900/60 px-1 py-1"
                >
                  <Radio.Button value="ALL" className="!rounded-full">
                    ALL
                  </Radio.Button>
                  <Radio.Button value="SOLD" className="!rounded-full">
                    SOLD
                  </Radio.Button>
                  <Radio.Button value="UNSOLD" className="!rounded-full">
                    UNSOLD
                  </Radio.Button>
                </Radio.Group>
              </div>

              <Button
                onClick={() => {
                  const list = filteredPlayers;
                  setCurrentPlayerIndex(Math.min(currentPlayerIndex + 1, list.length - 1));
                }}
                className="!flex !h-12 !w-12 !items-center !justify-center !rounded-full !border-none !bg-gradient-to-br !from-slate-800 !to-slate-900 !text-slate-200 hover:!from-slate-700 hover:!to-slate-800"
              >
                <ArrowRightOutlined />
              </Button>
            </div>
          </div>

          <aside className="flex h-full flex-col gap-2 rounded-3xl border border-slate-800/60 bg-slate-950/80 px-5 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between text-slate-200">
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-[0.35em] text-slate-300">Teams</h3>
                {/* <p className="text-sm text-slate-500">Manage live bidding slots</p> */}
              </div>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200">
                {teams.length} Teams
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto pr-2">
              {teams.length ? (
                <TeamList
                  teams={teams}
                  isPlayersAvailable={hasPlayers}
                  updateTeamAndPlayerPoints={updateTeamAndPlayerPoints}
                  disabled={filteredPlayers[currentPlayerIndex]?.status === "SOLD"}
                  latedBiddedTeam={filteredPlayers[currentPlayerIndex]?.currentTeamId}
                  variant="list"
                />
              ) : (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
                  No teams configured yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </ConfigProvider>
  );
};
