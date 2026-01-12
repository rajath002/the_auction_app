"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import {
  Card,
  Button,
  Modal,
  Select,
  message,
  Spin,
  Tag,
  Tooltip,
  Badge,
  Popconfirm,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  SwapOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

interface Team {
  id: number;
  name: string;
  image?: string;
}

interface Player {
  id: number;
  name: string;
  image?: string;
  type?: string;
  category?: string;
  role?: string;
}

interface Innings {
  id: number;
  matchId: number;
  inningsNumber: number;
  battingTeamId: number;
  bowlingTeamId: number;
  totalRuns: number;
  wickets: number;
  oversBowled: number;
  extras: number;
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  isCompleted: boolean;
  battingTeam?: Team;
  bowlingTeam?: Team;
}

interface Match {
  id: number;
  matchName: string;
  team1Id: number;
  team2Id: number;
  team1?: Team;
  team2?: Team;
  venue?: string;
  matchDate: string;
  overs: number;
  status: "upcoming" | "live" | "innings_break" | "completed" | "abandoned";
  currentInnings: number;
  battingTeamId?: number;
  battingTeam?: Team;
  winnerId?: number;
  winner?: Team;
  resultSummary?: string;
  innings?: Innings[];
}

interface Ball {
  id: number;
  inningsId: number;
  overNumber: number;
  ballNumber: number;
  runsScored: number;
  ballType: string;
  isBoundary: boolean;
  isSix: boolean;
  isWicket: boolean;
  wicketType?: string;
  batsmanId?: number;
  bowlerId?: number;
}

export default function ScoringPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [innings, setInnings] = useState<Innings[]>([]);
  const [currentOverBalls, setCurrentOverBalls] = useState<Ball[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wicketModalVisible, setWicketModalVisible] = useState(false);
  const [extrasModalVisible, setExtrasModalVisible] = useState(false);
  const [extrasType, setExtrasType] = useState<"wide" | "no_ball">("wide");
  const [selectedWicketType, setSelectedWicketType] = useState<string>("bowled");
  const [pendingRuns, setPendingRuns] = useState<number>(0);

  // Player tracking state
  const [battingTeamPlayers, setBattingTeamPlayers] = useState<Player[]>([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState<Player[]>([]);
  const [strikerId, setStrikerId] = useState<number | null>(null);
  const [nonStrikerId, setNonStrikerId] = useState<number | null>(null);
  const [currentBowlerId, setCurrentBowlerId] = useState<number | null>(null);
  const [previousBowlerId, setPreviousBowlerId] = useState<number | null>(null);
  const [outBatsmenIds, setOutBatsmenIds] = useState<number[]>([]);
  const [ballsInCurrentOver, setBallsInCurrentOver] = useState(0);

  // Player selection modals
  const [selectPlayersModalVisible, setSelectPlayersModalVisible] = useState(false);
  const [newBatsmanModalVisible, setNewBatsmanModalVisible] = useState(false);
  const [changeBowlerModalVisible, setChangeBowlerModalVisible] = useState(false);
  const [tempStrikerId, setTempStrikerId] = useState<number | null>(null);
  const [tempNonStrikerId, setTempNonStrikerId] = useState<number | null>(null);
  const [tempBowlerId, setTempBowlerId] = useState<number | null>(null);
  const [newBatsmanId, setNewBatsmanId] = useState<number | null>(null);
  const [newBowlerId, setNewBowlerId] = useState<number | null>(null);

  const fetchPlayers = useCallback(async (battingTeamId: number, bowlingTeamId: number) => {
    try {
      const [battingRes, bowlingRes] = await Promise.all([
        fetch(`/api/teams/${battingTeamId}/players`),
        fetch(`/api/teams/${bowlingTeamId}/players`),
      ]);
      const battingData = await battingRes.json();
      const bowlingData = await bowlingRes.json();

      if (battingData.success) {
        setBattingTeamPlayers(battingData.players);
      }
      if (bowlingData.success) {
        setBowlingTeamPlayers(bowlingData.players);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, []);

  const fetchScore = useCallback(async () => {
    try {
      const response = await fetch(`/api/cricket/${id}/score`);
      if (response.ok) {
        const data = await response.json();
        setMatch(data.match);
        setInnings(data.innings || []);
        setCurrentOverBalls(data.currentOverBalls || []);
      }
    } catch (error) {
      console.error("Error fetching score:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchScore();
    // Auto-refresh every 10 seconds for live matches
    const interval = setInterval(fetchScore, 10000);
    return () => clearInterval(interval);
  }, [fetchScore]);

  // Fetch players when match data is loaded
  useEffect(() => {
    if (match && match.status === "live") {
      const currentInns = innings.find((i) => i.inningsNumber === match.currentInnings && !i.isCompleted);
      if (currentInns) {
        fetchPlayers(currentInns.battingTeamId, currentInns.bowlingTeamId);
        // Calculate balls in current over
        if (currentOverBalls.length > 0) {
          const legalBalls = currentOverBalls.filter(
            b => b.ballType !== "wide" && b.ballType !== "no_ball"
          ).length;
          setBallsInCurrentOver(legalBalls);
        }
      }
    }
  }, [match, innings, fetchPlayers, currentOverBalls]);

  const rotateStrike = () => {
    setStrikerId(nonStrikerId);
    setNonStrikerId(strikerId);
  };

  const getPlayerName = (playerId: number | null, players: Player[]): string => {
    if (!playerId) return "Not Selected";
    const player = players.find((p) => p.id === playerId);
    return player?.name || "Unknown";
  };

  const recordBall = async (
    runs: number,
    ballType: string = "normal",
    isWicket: boolean = false,
    wicketType?: string
  ) => {
    if (submitting) return;

    // Check if players are selected
    if (!strikerId || !nonStrikerId || !currentBowlerId) {
      setSelectPlayersModalVisible(true);
      message.warning("Please select batsmen and bowler first");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/cricket/${id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runs,
          ballType: isWicket ? "normal" : ballType,
          isWicket,
          wicketType,
          batsmanId: strikerId,
          bowlerId: currentBowlerId,
          dismissedBatsmanId: isWicket ? strikerId : undefined,
        }),
      });

      if (response.ok) {
        // Handle strike rotation and over changes
        const isLegalDelivery = ballType === "normal" || isWicket || ballType === "bye" || ballType === "leg_bye";

        if (isLegalDelivery) {
          const newBallsInOver = ballsInCurrentOver + 1;

          if (newBallsInOver >= 6) {
            // End of over - rotate strike and change bowler
            setBallsInCurrentOver(0);
            rotateStrike();
            setPreviousBowlerId(currentBowlerId);
            setCurrentBowlerId(null);
            setChangeBowlerModalVisible(true);
          } else {
            setBallsInCurrentOver(newBallsInOver);
            // Rotate strike on odd runs (1, 3, 5)
            if (runs % 2 === 1) {
              rotateStrike();
            }
          }
        } else {
          // Wide or no-ball - no legal delivery, but rotate on odd runs
          if (runs % 2 === 1) {
            rotateStrike();
          }
        }

        // Handle wicket - need new batsman
        if (isWicket) {
          setOutBatsmenIds([...outBatsmenIds, strikerId]);
          setStrikerId(null);
          setNewBatsmanModalVisible(true);
        }

        await fetchScore();
        if (isWicket) {
          message.info("Wicket! 🎯");
        }
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to record ball");
      }
    } catch (error) {
      message.error("Failed to record ball");
    } finally {
      setSubmitting(false);
      setWicketModalVisible(false);
    }
  };

  const handleWicket = (runs: number = 0) => {
    if (!strikerId || !nonStrikerId || !currentBowlerId) {
      setSelectPlayersModalVisible(true);
      message.warning("Please select batsmen and bowler first");
      return;
    }
    setPendingRuns(runs);
    setWicketModalVisible(true);
  };

  const confirmWicket = () => {
    recordBall(pendingRuns, "normal", true, selectedWicketType);
  };

  const handleExtras = (type: "wide" | "no_ball") => {
    if (!strikerId || !nonStrikerId || !currentBowlerId) {
      setSelectPlayersModalVisible(true);
      message.warning("Please select batsmen and bowler first");
      return;
    }
    setExtrasType(type);
    setExtrasModalVisible(true);
  };

  const confirmPlayerSelection = () => {
    if (!tempStrikerId || !tempNonStrikerId || !tempBowlerId) {
      message.warning("Please select all players");
      return;
    }
    if (tempStrikerId === tempNonStrikerId) {
      message.warning("Striker and non-striker must be different");
      return;
    }
    setStrikerId(tempStrikerId);
    setNonStrikerId(tempNonStrikerId);
    setCurrentBowlerId(tempBowlerId);
    setSelectPlayersModalVisible(false);
    message.success("Players selected!");
  };

  const confirmNewBatsman = () => {
    if (!newBatsmanId) {
      message.warning("Please select a new batsman");
      return;
    }
    setStrikerId(newBatsmanId);
    setNewBatsmanModalVisible(false);
    setNewBatsmanId(null);
    message.success("New batsman selected!");
  };

  const confirmBowlerChange = () => {
    if (!newBowlerId) {
      message.warning("Please select a new bowler");
      return;
    }
    if (newBowlerId === previousBowlerId) {
      message.warning("Same bowler cannot bowl consecutive overs");
      return;
    }
    setCurrentBowlerId(newBowlerId);
    setChangeBowlerModalVisible(false);
    setNewBowlerId(null);
    message.success("Bowler changed for new over!");
  };

  const availableBatsmen = battingTeamPlayers.filter(
    (p) => !outBatsmenIds.includes(p.id) && p.id !== strikerId && p.id !== nonStrikerId
  );

  const availableBowlers = bowlingTeamPlayers.filter((p) => p.id !== previousBowlerId);

  const confirmExtras = (runs: number) => {
    recordBall(runs, extrasType);
    setExtrasModalVisible(false);
  };

  const undoLastBall = async () => {
    try {
      const response = await fetch(`/api/cricket/${id}/score`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Last ball undone");
        fetchScore();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to undo");
      }
    } catch (error) {
      message.error("Failed to undo");
    }
  };

  const endInnings = async () => {
    try {
      const response = await fetch(`/api/cricket/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end_innings" }),
      });

      if (response.ok) {
        message.success("Innings ended");
        fetchScore();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to end innings");
      }
    } catch (error) {
      message.error("Failed to end innings");
    }
  };

  const getCurrentInnings = (): Innings | undefined => {
    return innings.find((i) => i.inningsNumber === match?.currentInnings && !i.isCompleted);
  };

  const getTarget = (): number | null => {
    if (match?.currentInnings === 2) {
      const firstInnings = innings.find((i) => i.inningsNumber === 1);
      return firstInnings ? firstInnings.totalRuns + 1 : null;
    }
    return null;
  };

  const getRequiredRunRate = (): string | null => {
    const target = getTarget();
    const currentInns = getCurrentInnings();
    if (!target || !currentInns || !match) return null;

    const runsNeeded = target - currentInns.totalRuns;
    const ballsRemaining = match.overs * 6 - Math.floor(currentInns.oversBowled) * 6 - 
      (currentInns.oversBowled % 1) * 10;
    
    if (ballsRemaining <= 0) return null;
    const rrr = (runsNeeded / (ballsRemaining / 6)).toFixed(2);
    return rrr;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Spin size="large" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
        <p className="text-white">Match not found</p>
        <Button onClick={() => router.push("/cricket-score")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const currentInnings = getCurrentInnings();
  const firstInnings = innings.find((i) => i.inningsNumber === 1);
  const secondInnings = innings.find((i) => i.inningsNumber === 2);
  const target = getTarget();
  const requiredRR = getRequiredRunRate();

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/cricket-score")}
              className="!border-white/20 !text-white"
            >
              Back
            </Button>
            <Tag
              color={match.status === "live" ? "green" : match.status === "completed" ? "blue" : "orange"}
              className="!text-sm !font-semibold"
            >
              {match.status === "live" ? "🔴 LIVE" : match.status.toUpperCase()}
            </Tag>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchScore}
              className="!border-white/20 !text-white"
            >
              Refresh
            </Button>
          </div>

          {/* Match Info */}
          <Card className="!mb-6 !border-white/10 !bg-gray-900/80">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{match.matchName}</h1>
              <p className="text-sm text-gray-400">
                {match.venue && `${match.venue} • `}
                {match.overs} Overs
              </p>
            </div>
          </Card>

          {/* Scoreboard */}
          <Card className="!mb-6 !border-white/10 !bg-gray-900/80">
            {/* Team 1 / First Innings */}
            <div
              className={`flex items-center justify-between rounded-lg p-4 ${
                match.currentInnings === 1 && match.status === "live"
                  ? "bg-amber-500/10 ring-1 ring-amber-400/50"
                  : "bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {match.currentInnings === 1 && match.status === "live" && (
                  <Badge status="processing" color="green" />
                )}
                <span className="text-lg font-semibold text-white">
                  {firstInnings?.battingTeam?.name || match.team1?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400">
                  {firstInnings ? `${firstInnings.totalRuns}/${firstInnings.wickets}` : "-/-"}
                </span>
                {firstInnings && (
                  <span className="ml-2 text-gray-400">
                    ({firstInnings.oversBowled}/{match.overs})
                  </span>
                )}
              </div>
            </div>

            {/* Team 2 / Second Innings */}
            <div
              className={`mt-3 flex items-center justify-between rounded-lg p-4 ${
                match.currentInnings === 2 && match.status === "live"
                  ? "bg-amber-500/10 ring-1 ring-amber-400/50"
                  : "bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {match.currentInnings === 2 && match.status === "live" && (
                  <Badge status="processing" color="green" />
                )}
                <span className="text-lg font-semibold text-white">
                  {secondInnings?.battingTeam?.name || match.team2?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400">
                  {secondInnings ? `${secondInnings.totalRuns}/${secondInnings.wickets}` : "-/-"}
                </span>
                {secondInnings && (
                  <span className="ml-2 text-gray-400">
                    ({secondInnings.oversBowled}/{match.overs})
                  </span>
                )}
              </div>
            </div>

            {/* Target & Required Rate */}
            {target && match.status === "live" && currentInnings && (
              <div className="mt-4 flex items-center justify-center gap-6 rounded-lg bg-blue-500/10 p-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="text-xl font-bold text-blue-400">{target}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Need</p>
                  <p className="text-xl font-bold text-orange-400">
                    {target - currentInnings.totalRuns}
                  </p>
                </div>
                {requiredRR && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Req. RR</p>
                    <p className="text-xl font-bold text-purple-400">{requiredRR}</p>
                  </div>
                )}
              </div>
            )}

            {/* Match Result */}
            {match.status === "completed" && match.resultSummary && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-500/10 p-4">
                <TrophyOutlined className="text-2xl text-yellow-400" />
                <span className="text-lg font-semibold text-white">
                  {match.winner?.name} {match.resultSummary}
                </span>
              </div>
            )}
          </Card>

          {/* This Over */}
          {match.status === "live" && currentOverBalls.length > 0 && (
            <Card className="!mb-6 !border-white/10 !bg-gray-900/80">
              <h3 className="mb-3 text-sm font-medium text-gray-400">This Over</h3>
              <div className="flex flex-wrap gap-2">
                {currentOverBalls
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((ball, idx) => (
                    <div
                      key={ball.id || idx}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        ball.isWicket
                          ? "bg-red-500 text-white"
                          : ball.isSix
                          ? "bg-purple-500 text-white"
                          : ball.isBoundary
                          ? "bg-green-500 text-white"
                          : ball.ballType === "wide"
                          ? "bg-yellow-500 text-gray-900"
                          : ball.ballType === "no_ball"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {ball.isWicket
                        ? "W"
                        : ball.ballType === "wide"
                        ? `${ball.runsScored}Wd`
                        : ball.ballType === "no_ball"
                        ? `${ball.runsScored}Nb`
                        : ball.runsScored}
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Current Players on Field */}
          {match.status === "live" && currentInnings && (
            <Card className="!mb-6 !border-white/10 !bg-gray-900/80">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Current Players</h3>
                <Space>
                  <Button
                    size="small"
                    icon={<SwapOutlined />}
                    onClick={rotateStrike}
                    className="!border-amber-400/50 !text-amber-400"
                  >
                    Swap Strike
                  </Button>
                  <Button
                    size="small"
                    icon={<UserSwitchOutlined />}
                    onClick={() => {
                      setTempStrikerId(strikerId);
                      setTempNonStrikerId(nonStrikerId);
                      setTempBowlerId(currentBowlerId);
                      setSelectPlayersModalVisible(true);
                    }}
                    className="!border-blue-400/50 !text-blue-400"
                  >
                    Change
                  </Button>
                </Space>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Striker */}
                <div className="rounded-lg bg-amber-500/10 p-3 ring-1 ring-amber-400/30">
                  <p className="text-xs text-amber-400">🏏 Striker</p>
                  <p className="mt-1 font-semibold text-white">
                    {getPlayerName(strikerId, battingTeamPlayers)}
                  </p>
                </div>

                {/* Non-Striker */}
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-400">Non-Striker</p>
                  <p className="mt-1 font-semibold text-white">
                    {getPlayerName(nonStrikerId, battingTeamPlayers)}
                  </p>
                </div>

                {/* Bowler */}
                <div className="rounded-lg bg-blue-500/10 p-3 ring-1 ring-blue-400/30">
                  <p className="text-xs text-blue-400">⚾ Bowler</p>
                  <p className="mt-1 font-semibold text-white">
                    {getPlayerName(currentBowlerId, bowlingTeamPlayers)}
                  </p>
                </div>

                {/* Over Progress */}
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-400">Over Progress</p>
                  <p className="mt-1 font-semibold text-white">{ballsInCurrentOver}/6 balls</p>
                </div>
              </div>

              {/* Warning if players not selected */}
              {(!strikerId || !nonStrikerId || !currentBowlerId) && (
                <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-center">
                  <p className="text-sm text-red-400">
                    ⚠️ Please select batsmen and bowler to start scoring
                  </p>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => setSelectPlayersModalVisible(true)}
                    className="!mt-2 !bg-amber-400 !text-gray-900"
                  >
                    Select Players
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Scoring Controls - Only show for live matches */}
          {match.status === "live" && currentInnings && (
            <>
              {/* Run Buttons */}
              <Card className="!mb-4 !border-white/10 !bg-gray-900/80">
                <h3 className="mb-4 text-center text-sm font-medium text-gray-400">
                  Runs Scored
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((run) => (
                    <Button
                      key={run}
                      size="large"
                      onClick={() => {
                        if (!strikerId || !nonStrikerId || !currentBowlerId) {
                          setSelectPlayersModalVisible(true);
                          message.warning("Please select batsmen and bowler first");
                          return;
                        }
                        recordBall(run);
                      }}
                      disabled={submitting}
                      className={`!h-16 !text-2xl !font-bold ${
                        run === 4
                          ? "!bg-green-500 !text-white !border-green-500"
                          : run === 6
                          ? "!bg-purple-500 !text-white !border-purple-500"
                          : "!bg-gray-800 !text-white !border-gray-700"
                      }`}
                    >
                      {run}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Extras & Wicket */}
              <Card className="!mb-4 !border-white/10 !bg-gray-900/80">
                <h3 className="mb-4 text-center text-sm font-medium text-gray-400">
                  Extras & Wicket
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Button
                    size="large"
                    onClick={() => handleExtras("wide")}
                    disabled={submitting}
                    className="!h-14 !bg-yellow-500 !font-semibold !text-gray-900 !border-yellow-500"
                  >
                    Wide
                  </Button>
                  <Button
                    size="large"
                    onClick={() => handleExtras("no_ball")}
                    disabled={submitting}
                    className="!h-14 !bg-orange-500 !font-semibold !text-white !border-orange-500"
                  >
                    No Ball
                  </Button>
                  <Button
                    size="large"
                    onClick={() => recordBall(1, "bye")}
                    disabled={submitting}
                    className="!h-14 !bg-gray-600 !font-semibold !text-white !border-gray-600"
                  >
                    Bye
                  </Button>
                  <Button
                    size="large"
                    onClick={() => recordBall(1, "leg_bye")}
                    disabled={submitting}
                    className="!h-14 !bg-gray-600 !font-semibold !text-white !border-gray-600"
                  >
                    Leg Bye
                  </Button>
                </div>

                <div className="mt-4">
                  <Button
                    size="large"
                    block
                    onClick={() => handleWicket(0)}
                    disabled={submitting}
                    className="!h-16 !bg-red-600 !text-xl !font-bold !text-white !border-red-600"
                  >
                    🎯 WICKET
                  </Button>
                </div>
              </Card>

              {/* Actions */}
              <Card className="!mb-4 !border-white/10 !bg-gray-900/80">
                <div className="flex flex-wrap gap-3">
                  <Popconfirm
                    title="Undo last ball?"
                    onConfirm={undoLastBall}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<UndoOutlined />}
                      size="large"
                      className="!flex-1 !border-orange-400/50 !text-orange-400"
                    >
                      Undo
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="End this innings?"
                    description="Are you sure you want to end the current innings?"
                    onConfirm={endInnings}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<CheckCircleOutlined />}
                      size="large"
                      className="!flex-1 !border-blue-400/50 !text-blue-400"
                    >
                      End Innings
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            </>
          )}

          {/* Match not started */}
          {match.status === "upcoming" && (
            <Card className="!border-white/10 !bg-gray-900/80">
              <div className="py-8 text-center">
                <ExclamationCircleOutlined className="mb-4 text-5xl text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">
                  Match Not Started Yet
                </h3>
                <p className="mt-2 text-gray-400">
                  Go back and start the match with toss details
                </p>
                <Button
                  type="primary"
                  onClick={() => router.push("/cricket-score")}
                  className="!mt-4 !bg-amber-400 !text-gray-900"
                >
                  Go to Matches
                </Button>
              </div>
            </Card>
          )}

          {/* Match completed */}
          {match.status === "completed" && (
            <Card className="!border-white/10 !bg-gray-900/80">
              <div className="py-8 text-center">
                <CheckCircleOutlined className="mb-4 text-5xl text-green-400" />
                <h3 className="text-xl font-semibold text-white">Match Completed</h3>
                {match.winner && (
                  <p className="mt-2 text-lg text-amber-400">
                    🏆 {match.winner.name} {match.resultSummary}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Wicket Modal */}
        <Modal
          title={<span className="text-lg font-semibold">🎯 Wicket Type</span>}
          open={wicketModalVisible}
          onCancel={() => setWicketModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setWicketModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={confirmWicket}
              className="!bg-red-500"
            >
              Confirm Wicket
            </Button>,
          ]}
        >
          <div className="py-4">
            <p className="mb-3 text-gray-500">How was the batsman dismissed?</p>
            <Select
              value={selectedWicketType}
              onChange={setSelectedWicketType}
              className="w-full"
              size="large"
            >
              <Select.Option value="bowled">🎳 Bowled</Select.Option>
              <Select.Option value="caught">🖐️ Caught</Select.Option>
              <Select.Option value="lbw">🦵 LBW</Select.Option>
              <Select.Option value="run_out">🏃 Run Out</Select.Option>
              <Select.Option value="stumped">🧤 Stumped</Select.Option>
              <Select.Option value="hit_wicket">💥 Hit Wicket</Select.Option>
              <Select.Option value="retired">🚶 Retired</Select.Option>
            </Select>
          </div>
        </Modal>

        {/* Extras Modal (Wide/No Ball) */}
        <Modal
          title={
            <span className="text-lg font-semibold">
              {extrasType === "wide" ? "🔄 Wide Ball" : "⚠️ No Ball"} - Extra Runs
            </span>
          }
          open={extrasModalVisible}
          onCancel={() => setExtrasModalVisible(false)}
          footer={null}
          width={400}
        >
          <div className="py-4">
            <p className="mb-4 text-center text-gray-500">
              {extrasType === "wide" 
                ? "Wide ball! How many runs were scored?" 
                : "No ball! How many runs were scored (excluding the penalty)?"}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((run) => (
                <Button
                  key={run}
                  size="large"
                  onClick={() => confirmExtras(run)}
                  className={`!h-14 !text-xl !font-bold ${
                    extrasType === "wide"
                      ? "!bg-yellow-500 !text-gray-900 !border-yellow-500"
                      : "!bg-orange-500 !text-white !border-orange-500"
                  }`}
                >
                  {run}
                </Button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button
                size="large"
                onClick={() => confirmExtras(4)}
                className="!h-14 !text-xl !font-bold !bg-green-500 !text-white !border-green-500"
              >
                4 (Boundary)
              </Button>
              <Button
                size="large"
                onClick={() => confirmExtras(6)}
                className="!h-14 !text-xl !font-bold !bg-purple-500 !text-white !border-purple-500"
              >
                6 (Six)
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              {extrasType === "wide" 
                ? "1 run will be added automatically for the wide" 
                : "1 run penalty will be added automatically"}
            </p>
          </div>
        </Modal>

        {/* Select Players Modal */}
        <Modal
          title={<span className="text-lg font-semibold">👥 Select Players</span>}
          open={selectPlayersModalVisible}
          onCancel={() => setSelectPlayersModalVisible(false)}
          onOk={confirmPlayerSelection}
          okText="Confirm"
          width={450}
        >
          <div className="space-y-4 py-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">🏏 Striker (On Strike)</p>
              <Select
                className="w-full"
                placeholder="Select striker"
                value={tempStrikerId}
                onChange={setTempStrikerId}
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {battingTeamPlayers
                  .filter((p) => !outBatsmenIds.includes(p.id) && p.id !== tempNonStrikerId)
                  .map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">Non-Striker</p>
              <Select
                className="w-full"
                placeholder="Select non-striker"
                value={tempNonStrikerId}
                onChange={setTempNonStrikerId}
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {battingTeamPlayers
                  .filter((p) => !outBatsmenIds.includes(p.id) && p.id !== tempStrikerId)
                  .map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">⚾ Bowler</p>
              <Select
                className="w-full"
                placeholder="Select bowler"
                value={tempBowlerId}
                onChange={setTempBowlerId}
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {bowlingTeamPlayers.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Modal>

        {/* New Batsman Modal (After Wicket) */}
        <Modal
          title={<span className="text-lg font-semibold">🏏 Select New Batsman</span>}
          open={newBatsmanModalVisible}
          onCancel={() => setNewBatsmanModalVisible(false)}
          onOk={confirmNewBatsman}
          okText="Confirm"
          closable={false}
          maskClosable={false}
          width={400}
        >
          <div className="py-4">
            <p className="mb-4 text-center text-gray-500">
              A wicket has fallen! Please select the new batsman.
            </p>
            <Select
              className="w-full"
              placeholder="Select new batsman"
              value={newBatsmanId}
              onChange={setNewBatsmanId}
              showSearch
              optionFilterProp="children"
              size="large"
            >
              {availableBatsmen.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>

        {/* Change Bowler Modal (End of Over) */}
        <Modal
          title={<span className="text-lg font-semibold">⚾ End of Over - Select New Bowler</span>}
          open={changeBowlerModalVisible}
          onCancel={() => setChangeBowlerModalVisible(false)}
          onOk={confirmBowlerChange}
          okText="Confirm"
          closable={false}
          maskClosable={false}
          width={400}
        >
          <div className="py-4">
            <p className="mb-4 text-center text-gray-500">
              Over completed! Please select the bowler for the next over.
            </p>
            {previousBowlerId && (
              <p className="mb-3 text-center text-sm text-red-500">
                ⚠️ {getPlayerName(previousBowlerId, bowlingTeamPlayers)} cannot bowl consecutive overs.
              </p>
            )}
            <Select
              className="w-full"
              placeholder="Select new bowler"
              value={newBowlerId}
              onChange={setNewBowlerId}
              showSearch
              optionFilterProp="children"
              size="large"
            >
              {availableBowlers.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
