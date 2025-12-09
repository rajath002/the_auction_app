"use client";
import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { TeamList } from "./TeamList";
import { ArrowLeftOutlined, ArrowRightOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Radio, Select } from "antd";
import { useAppContext } from "@/context/useAppState";
import { Player, Team } from "@/interface/interfaces";

const BID_INCREMENT_OPTIONS = [
  { value: 50, label: "₹50" },
  { value: 100, label: "₹100" },
  { value: 150, label: "₹150" },
  { value: 200, label: "₹200" },
];

const CATEGORY_OPTIONS = [
  { id: 1, name: "Batsman", category: "L1", description: "Batsman" },
  { id: 2, name: "All Rounder", category: "L2", description: "All Rounder" },
  { id: 3, name: "Batsman", category: "L3", description: "Batsman" },
  { id: 4, name: "All Rounder", category: "L4", description: "All Rounder" },
];

const categories = ["All", ...CATEGORY_OPTIONS.map((item) => item.category)];

export const AuctionContainer = () => {
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [bidIncrement, setBidIncrement] = useState<number>(50);
  const [auctionStarted, setAuctionStarted] = useState<boolean>(false);
  const [selectedStartCategory, setSelectedStartCategory] = useState<string | null>(null);
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
    updateSelectedCategory,
  } = useAppContext();

  // Filter players locally instead of calling getFilteredPlayers to avoid infinite loop
  useEffect(() => {
    let filtered: Player[];
    
    if (playerFilter === "SOLD" || playerFilter === "UNSOLD") {
      filtered = players.filter(
        (p) => p.status === playerFilter && (selectedCategory ? p.category === selectedCategory : true)
      );
    } else if (playerFilter === "AUCTION") {
      filtered = players.filter(
        (p) => !(p.status === "SOLD" || p.status === "UNSOLD") && (selectedCategory ? p.category === selectedCategory : true)
      );
    } else {
      // ALL
      filtered = selectedCategory ? players.filter((p) => p.category === selectedCategory) : players;
    }
    
    setFilteredPlayers(filtered);
  }, [players, playerFilter, selectedCategory]);

  const updateUnsoldPlayerTeamAndPoints = (player: Player, team: Team) => {
    // Check if team has enough funds for this bid
    if (team.purse < bidIncrement) {
      return; // Don't allow bid if it would make purse negative
    }
    updatePlayerPoints(player.id, team, player.bidValue + bidIncrement, player.status);
    updatePurse(team, team.purse - bidIncrement);
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
      value += bidIncrement;
    }

    // Check if team has enough funds for this bid
    if (team.purse < value) {
      return; // Don't allow bid if it would make purse negative
    }

    updatePurse(team, team.purse - value);
    updatePlayerPoints(playerInfo.id, team, value, oldTeamId ? playerInfo.status : "In-Progress");

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
      updatePlayerStatus(activePlayer, "In-Progress");
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
    setCurrentPlayerIndex(0);
  };

  const handleStartAuction = () => {
    if (selectedStartCategory) {
      updateSelectedCategory(selectedStartCategory);
      setAuctionStarted(true);
    }
  };

  const hasPlayers = filteredPlayers.length > 0;
  const isBiddingActive = filteredPlayers[currentPlayerIndex]?.status === "In-Progress";
  const isLastPlayer = hasPlayers && currentPlayerIndex === filteredPlayers.length - 1;

  // Show Start Screen if auction hasn't started
  if (!auctionStarted) {
    return (
      <ConfigProvider>
        <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col items-center justify-center gap-8 px-4">
          <div className="relative w-full overflow-hidden rounded-[32px] border border-slate-800/60 bg-slate-950/90 px-8 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur">
            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" />
            <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-8">
              {/* Title */}
              <div className="text-center">
                <h1 className="mb-3 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                  Let&apos;s Start the Bid!
                </h1>
                <p className="text-lg text-slate-400">
                  Select a category to begin the auction
                </p>
              </div>

              {/* Category Selection */}
              <div className="w-full max-w-md">
                <label className="mb-3 block text-center text-sm uppercase tracking-[0.25em] text-slate-500">
                  Choose Starting Category
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedStartCategory(option.category)}
                      className={`group relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 transition-all duration-300 ${
                        selectedStartCategory === option.category
                          ? "border-blue-500/50 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                          : "border-slate-700/50 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60"
                      }`}
                    >
                      <span
                        className={`text-2xl font-bold ${
                          selectedStartCategory === option.category
                            ? "text-blue-300"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {option.category}
                      </span>
                      <span
                        className={`text-xs ${
                          selectedStartCategory === option.category
                            ? "text-blue-400"
                            : "text-slate-500"
                        }`}
                      >
                        {option.name}
                      </span>
                      {selectedStartCategory === option.category && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartAuction}
                disabled={!selectedStartCategory}
                className={`!mt-4 !h-14 !min-w-[200px] !rounded-full !border-none !text-lg !font-semibold !tracking-wide !transition-all !duration-300 ${
                  selectedStartCategory
                    ? "!bg-gradient-to-r !from-blue-600 !to-cyan-500 hover:!from-blue-500 hover:!to-cyan-400 !shadow-[0_10px_40px_rgba(59,130,246,0.4)]"
                    : "!bg-slate-700 !text-slate-400"
                }`}
              >
                Start Auction
              </Button>

              {/* Hint text */}
              {selectedStartCategory && (
                <p className="animate-pulse text-sm text-slate-500">
                  Click &quot;Start Auction&quot; to begin with {selectedStartCategory} players
                </p>
              )}
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

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

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Progress</span>
              <div className="flex items-center gap-1 text-lg font-semibold">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-cyan-200">
                  {filteredPlayers.length - currentPlayerIndex - 1} remaining of {filteredPlayers.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Bid Increment</span>
              <Select
                className="min-w-28 [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!bg-slate-900/80 [&_.ant-select-selector]:!text-slate-100 [&_.ant-select-selection-item]:!text-slate-100 [&_.ant-select-arrow]:!text-slate-400"
                popupClassName="[&_.ant-select-item]:!bg-slate-900 [&_.ant-select-item]:!text-slate-100 [&_.ant-select-item-option-active]:!bg-slate-700 [&_.ant-select-item-option-selected]:!bg-slate-600 [&.ant-select-dropdown]:!bg-slate-900 [&_.ant-select-item-option-content]:!text-slate-100"
                dropdownStyle={{ backgroundColor: "#0f172a" }}
                value={bidIncrement}
                onChange={(value) => setBidIncrement(value)}
                options={BID_INCREMENT_OPTIONS}
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-1 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Players by category</span>
              <Select
                className="min-w-60 [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!bg-slate-900/80 [&_.ant-select-selector]:!text-slate-100"
                placeholder="Select category"
                title="Search by Category"
                onChange={handleCategoryChange}
                value={selectedCategory ?? "All"}
                disabled={isBiddingActive}
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
                isLastPlayer={isLastPlayer}
              />
            ) : (
              <div className="relative flex min-h-[600px] items-center justify-center overflow-hidden rounded-[28px] border border-slate-800/60 bg-slate-950/90 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
                <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <span className="relative text-2xl font-semibold text-slate-300">Players Not Found</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/60 bg-slate-950/80 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.45)]">
              <Button
                onClick={() => {
                  setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0));
                }}
                disabled={isBiddingActive}
                className="!flex !h-12 !w-12 !items-center !justify-center !rounded-full !border-none !bg-gradient-to-br !from-slate-800 !to-slate-900 !text-slate-200 hover:!from-slate-700 hover:!to-slate-800 disabled:!opacity-50 disabled:!cursor-not-allowed"
              >
                <ArrowLeftOutlined />
              </Button>

              <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                <span>Filter Players</span>
                <Radio.Group
                  value={playerFilter}
                  onChange={(e) => {
                    setPlayerFilter(e.target.value);
                    setCurrentPlayerIndex(0);
                  }}
                  disabled={isBiddingActive}
                  className="rounded-full border border-slate-800 bg-slate-900/60 px-1 py-1 [&_.ant-radio-button-wrapper]:!bg-slate-800 [&_.ant-radio-button-wrapper]:!text-slate-200 [&_.ant-radio-button-wrapper]:!border-none [&_.ant-radio-button-wrapper:not(:first-child)::before]:!hidden [&_.ant-radio-button-wrapper-checked]:!bg-slate-600 [&_.ant-radio-button-wrapper-checked]:!text-white"
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
                disabled={isBiddingActive}
                className="!flex !h-12 !w-12 !items-center !justify-center !rounded-full !border-none !bg-gradient-to-br !from-slate-800 !to-slate-900 !text-slate-200 hover:!from-slate-700 hover:!to-slate-800 disabled:!opacity-50 disabled:!cursor-not-allowed"
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
                  requiredBidAmount={filteredPlayers[currentPlayerIndex]?.currentTeamId ? filteredPlayers[currentPlayerIndex]?.bidValue + bidIncrement : (filteredPlayers[currentPlayerIndex]?.status === "UNSOLD" ? bidIncrement : filteredPlayers[currentPlayerIndex]?.bidValue || 0)}
                  isAuctionInProgress={isBiddingActive}
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
