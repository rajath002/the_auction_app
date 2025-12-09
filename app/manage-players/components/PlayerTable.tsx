"use client";
import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, message, Image } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Player } from "@/interface/interfaces";
import type { ColumnsType } from "antd/es/table";

interface PlayerTableProps {
  players: Player[];
  loading: boolean;
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  loading,
  onEdit,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (playerId: number) => {
    setDeletingId(playerId);
    try {
      await onDelete(playerId);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "blue";
      case "SOLD":
        return "green";
      case "UNSOLD":
        return "red";
      case "In-Progress":
        return "orange";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Player> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string, record: Player) => (
        <Image
          src={image || "/placeholder-player.png"}
          alt={record.name}
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="/placeholder-player.png"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      filters: players.map((player) => ({
        text: player.name,
        value: player.name,
      })),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes((value as string).toLowerCase()),
      filterSearch: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Batsman", value: "Batsman" },
        { text: "Bowler", value: "Bowler" },
        { text: "All-Rounder", value: "All-Rounder" },
        { text: "Wicket-Keeper", value: "Wicket-Keeper" },
      ],
      onFilter: (value, record) => record.type === value,
      filterSearch: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      filters: [
        { text: "L1", value: "L1" },
        { text: "L2", value: "L2" },
        { text: "L3", value: "L3" },
        { text: "L4", value: "L4" },
      ],
      onFilter: (value, record) => record.category === value,
      filterSearch: true,
    },
    {
      title: "Base Value",
      dataIndex: "baseValue",
      key: "baseValue",
      sorter: (a, b) => a.baseValue - b.baseValue,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      title: "Bid Value",
      dataIndex: "bidValue",
      key: "bidValue",
      sorter: (a, b) => (a.bidValue || 0) - (b.bidValue || 0),
      render: (value: number) => `₹${(value || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "AVAILABLE", value: "AVAILABLE" },
        { text: "SOLD", value: "SOLD" },
        { text: "UNSOLD", value: "UNSOLD" },
        { text: "In-Progress", value: "In-Progress" },
      ],
      onFilter: (value, record) => record.status === value,
      filterSearch: true,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 190,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Player"
            description="Are you sure you want to delete this player?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deletingId === record.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={players}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} players`,
      }}
    />
  );
};

export default PlayerTable;
