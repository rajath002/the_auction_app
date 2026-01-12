"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Spin,
  Tag,
  Empty,
  Tooltip,
  Badge,
} from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Team {
  id: number;
  name: string;
  image?: string;
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
  innings?: any[];
}

export default function CricketScorePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [tossModalVisible, setTossModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [form] = Form.useForm();
  const [tossForm] = Form.useForm();

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch("/api/cricket");
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, [fetchMatches, fetchTeams]);

  const handleCreateMatch = async (values: any) => {
    try {
      const response = await fetch("/api/cricket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchName: values.matchName,
          team1Id: values.team1Id,
          team2Id: values.team2Id,
          venue: values.venue,
          matchDate: values.matchDate.format("YYYY-MM-DD"),
          overs: values.overs || 20,
        }),
      });

      if (response.ok) {
        message.success("Match created successfully!");
        setCreateModalVisible(false);
        form.resetFields();
        fetchMatches();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to create match");
      }
    } catch (error) {
      message.error("Failed to create match");
    }
  };

  const handleStartMatch = (match: Match) => {
    setSelectedMatch(match);
    tossForm.setFieldsValue({
      team1Id: match.team1Id,
      team2Id: match.team2Id,
    });
    setTossModalVisible(true);
  };

  const handleTossSubmit = async (values: any) => {
    if (!selectedMatch) return;

    try {
      const response = await fetch(`/api/cricket/${selectedMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_match",
          tossWinnerId: values.tossWinnerId,
          tossDecision: values.tossDecision,
        }),
      });

      if (response.ok) {
        message.success("Match started!");
        setTossModalVisible(false);
        tossForm.resetFields();
        router.push(`/cricket-score/${selectedMatch.id}`);
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to start match");
      }
    } catch (error) {
      message.error("Failed to start match");
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    Modal.confirm({
      title: "Delete Match",
      content: "Are you sure you want to delete this match? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(`/api/cricket/${matchId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            message.success("Match deleted successfully");
            fetchMatches();
          } else {
            message.error("Failed to delete match");
          }
        } catch (error) {
          message.error("Failed to delete match");
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "green";
      case "completed":
        return "blue";
      case "upcoming":
        return "orange";
      case "innings_break":
        return "purple";
      case "abandoned":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "🔴 LIVE";
      case "completed":
        return "Completed";
      case "upcoming":
        return "Upcoming";
      case "innings_break":
        return "Innings Break";
      case "abandoned":
        return "Abandoned";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🏏 Cricket Scoring
              </h1>
              <p className="mt-1 text-gray-400">
                Create and manage cricket matches
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="!bg-amber-400 !font-semibold !text-gray-900 hover:!bg-amber-300"
            >
              New Match
            </Button>
          </div>

          {/* Live Matches */}
          {matches.filter((m) => m.status === "live").length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-green-400">
                🔴 Live Matches
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches
                  .filter((m) => m.status === "live")
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onView={() => router.push(`/cricket-score/${match.id}`)}
                      onDelete={() => handleDeleteMatch(match.id)}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Upcoming Matches */}
          {matches.filter((m) => m.status === "upcoming").length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-orange-400">
                📅 Upcoming Matches
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches
                  .filter((m) => m.status === "upcoming")
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onStart={() => handleStartMatch(match)}
                      onView={() => router.push(`/cricket-score/${match.id}`)}
                      onDelete={() => handleDeleteMatch(match.id)}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      showStartButton
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Completed Matches */}
          {matches.filter((m) => ["completed", "abandoned"].includes(m.status)).length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-blue-400">
                ✅ Completed Matches
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches
                  .filter((m) => ["completed", "abandoned"].includes(m.status))
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onView={() => router.push(`/cricket-score/${match.id}`)}
                      onDelete={() => handleDeleteMatch(match.id)}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {matches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Empty
                description={
                  <span className="text-gray-400">No matches yet</span>
                }
              />
              <Button
                type="primary"
                className="!mt-4 !bg-amber-400 !text-gray-900"
                onClick={() => setCreateModalVisible(true)}
              >
                Create First Match
              </Button>
            </div>
          )}
        </div>

        {/* Create Match Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Create New Match</span>}
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateMatch}>
            <Form.Item
              name="matchName"
              label="Match Name"
              rules={[{ required: true, message: "Please enter match name" }]}
            >
              <Input placeholder="e.g., Match 1 - KPL 2025" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="team1Id"
                label="Team 1"
                rules={[{ required: true, message: "Select team 1" }]}
              >
                <Select placeholder="Select team">
                  {teams.map((team) => (
                    <Select.Option key={team.id} value={team.id}>
                      {team.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="team2Id"
                label="Team 2"
                rules={[{ required: true, message: "Select team 2" }]}
              >
                <Select placeholder="Select team">
                  {teams.map((team) => (
                    <Select.Option key={team.id} value={team.id}>
                      {team.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="venue" label="Venue">
              <Input placeholder="e.g., Main Ground" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="matchDate"
                label="Match Date"
                rules={[{ required: true, message: "Select date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item name="overs" label="Overs" initialValue={20}>
                <InputNumber min={1} max={50} className="w-full" />
              </Form.Item>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="!bg-amber-400 !font-semibold !text-gray-900"
              >
                Create Match
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Toss Modal */}
        <Modal
          title={<span className="text-lg font-semibold">🪙 Toss Details</span>}
          open={tossModalVisible}
          onCancel={() => {
            setTossModalVisible(false);
            tossForm.resetFields();
          }}
          footer={null}
          width={400}
        >
          <Form form={tossForm} layout="vertical" onFinish={handleTossSubmit}>
            <Form.Item
              name="tossWinnerId"
              label="Toss Winner"
              rules={[{ required: true, message: "Select toss winner" }]}
            >
              <Select placeholder="Who won the toss?">
                {selectedMatch && (
                  <>
                    <Select.Option value={selectedMatch.team1Id}>
                      {selectedMatch.team1?.name || `Team ${selectedMatch.team1Id}`}
                    </Select.Option>
                    <Select.Option value={selectedMatch.team2Id}>
                      {selectedMatch.team2?.name || `Team ${selectedMatch.team2Id}`}
                    </Select.Option>
                  </>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name="tossDecision"
              label="Elected to"
              rules={[{ required: true, message: "Select decision" }]}
            >
              <Select placeholder="Bat or Bowl?">
                <Select.Option value="bat">🏏 Bat</Select.Option>
                <Select.Option value="bowl">🎯 Bowl</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="!bg-green-500 !font-semibold !text-white"
              >
                Start Match
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RoleGuard>
  );
}

// Match Card Component
function MatchCard({
  match,
  onStart,
  onView,
  onDelete,
  getStatusColor,
  getStatusText,
  showStartButton = false,
}: {
  match: Match;
  onStart?: () => void;
  onView: () => void;
  onDelete: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  showStartButton?: boolean;
}) {
  const innings1 = match.innings?.find((i: any) => i.inningsNumber === 1);
  const innings2 = match.innings?.find((i: any) => i.inningsNumber === 2);

  return (
    <Card
      className="!border-white/10 !bg-gray-900/80 transition-all hover:!border-amber-400/30"
      hoverable
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white">{match.matchName}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <CalendarOutlined />
              <span>{dayjs(match.matchDate).format("DD MMM YYYY")}</span>
              {match.venue && (
                <>
                  <span>•</span>
                  <EnvironmentOutlined />
                  <span>{match.venue}</span>
                </>
              )}
            </div>
          </div>
          <Tag color={getStatusColor(match.status)}>
            {getStatusText(match.status)}
          </Tag>
        </div>

        {/* Teams & Score */}
        <div className="rounded-lg bg-gray-800/50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">
              {match.team1?.name || `Team ${match.team1Id}`}
            </span>
            <span className="text-lg font-bold text-amber-400">
              {innings1
                ? `${innings1.totalRuns}/${innings1.wickets}`
                : "-"}
              {innings1 && (
                <span className="ml-1 text-sm text-gray-400">
                  ({innings1.oversBowled})
                </span>
              )}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-medium text-white">
              {match.team2?.name || `Team ${match.team2Id}`}
            </span>
            <span className="text-lg font-bold text-amber-400">
              {innings2
                ? `${innings2.totalRuns}/${innings2.wickets}`
                : "-"}
              {innings2 && (
                <span className="ml-1 text-sm text-gray-400">
                  ({innings2.oversBowled})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Result */}
        {match.resultSummary && (
          <div className="flex items-center gap-2 text-sm">
            <TrophyOutlined className="text-yellow-400" />
            <span className="text-gray-300">
              {match.winner?.name} {match.resultSummary}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showStartButton && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={onStart}
              className="!flex-1 !bg-green-500 !text-white"
            >
              Start
            </Button>
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={onView}
            className="!flex-1 !border-amber-400/50 !text-amber-400"
          >
            {match.status === "live" ? "Score" : "View"}
          </Button>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
