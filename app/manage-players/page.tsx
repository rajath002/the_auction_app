"use client";
import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, Typography, Button, Space, message, Card } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import PlayerTable from "./components/PlayerTable";
import PlayerEditModal from "./components/PlayerEditModal";
import RoleGuard from "@/components/RoleGuard";
import { Player } from "@/interface/interfaces";
import { getPlayers, updatePlayer, deletePlayer } from "@/services/player";

const { Title } = Typography;

export default function ManagePlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await getPlayers();
      if (response.success) {
        setPlayers(response.data);
      } else {
        message.error("Failed to load players");
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      message.error("An error occurred while loading players");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player);
    setEditModalVisible(true);
  };

  const handleSave = async (updatedPlayer: Partial<Player>) => {
    if (!updatedPlayer.id) {
      message.error("Invalid player data");
      return;
    }

    try {
      const result = await updatePlayer(updatedPlayer.id, updatedPlayer);
      if (result) {
        message.success("Player updated successfully!");
        setEditModalVisible(false);
        setSelectedPlayer(null);
        fetchPlayers(); // Refresh the list
      } else {
        message.error("Failed to update player");
      }
    } catch (error) {
      console.error("Error updating player:", error);
      message.error("An error occurred while updating the player");
    }
  };

  const handleDelete = async (playerId: number) => {
    try {
      const result = await deletePlayer(playerId);
      if (result) {
        message.success("Player deleted successfully!");
        fetchPlayers(); // Refresh the list
      } else {
        message.error("Failed to delete player");
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      message.error("An error occurred while deleting the player");
    }
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setSelectedPlayer(null);
  };

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#1890ff",
          },
        }}
      >
        <div className="h-20"></div>
        <div style={{ padding: "20px", minHeight: "100vh" }}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                Manage Players
              </Title>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchPlayers}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            <PlayerTable
              players={players}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <PlayerEditModal
              visible={editModalVisible}
              player={selectedPlayer}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </Card>
        </div>
      </ConfigProvider>
    </RoleGuard>
  );
}
