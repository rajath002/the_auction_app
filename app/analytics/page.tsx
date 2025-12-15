"use client";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, message, Table } from "antd";
import { UserOutlined, TeamOutlined, DollarOutlined, TrophyOutlined } from "@ant-design/icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import RoleGuard from "@/components/RoleGuard";

interface AnalyticsData {
  totalPlayers: number;
  totalTeams: number;
  totalAuctionValue: number;
  soldPlayers: number;
  teamSpending: Array<{
    teamId: number;
    teamName: string;
    totalSpent: number;
    players: Array<{
      playerId: number;
      playerName: string;
      amount: number;
      percentage: string;
    }>;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        message.error('Failed to fetch analytics data');
      }
    } catch (error) {
      message.error('Error fetching analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Prepare data for team summary table
  const teamSummaryData = data?.teamSpending.map((team, index) => ({
    key: team.teamId,
    teamName: team.teamName,
    totalSpent: team.totalSpent,
    playerCount: team.players.length,
    avgSpentPerPlayer: team.players.length > 0 ? Math.round(team.totalSpent / team.players.length) : 0
  })) || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="p-6 bg-gray-950 min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gray-800 border-gray-700">
              <Statistic
                title={<span className="text-gray-300">Total Players</span>}
                value={data?.totalPlayers || 0}
                prefix={<UserOutlined className="text-blue-400" />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gray-800 border-gray-700">
              <Statistic
                title={<span className="text-gray-300">Total Teams</span>}
                value={data?.totalTeams || 0}
                prefix={<TeamOutlined className="text-green-400" />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gray-800 border-gray-700">
              <Statistic
                title={<span className="text-gray-300">Total Auction Value</span>}
                value={data?.totalAuctionValue || 0}
                prefix={<DollarOutlined className="text-yellow-400" />}
                valueStyle={{ color: '#fff' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gray-800 border-gray-700">
              <Statistic
                title={<span className="text-gray-300">Sold Players</span>}
                value={data?.soldPlayers || 0}
                prefix={<TrophyOutlined className="text-purple-400" />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Team Summary Table */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Team Spending Summary</h2>
          <Table
            dataSource={teamSummaryData}
            columns={[
              {
                title: 'Team Name',
                dataIndex: 'teamName',
                key: 'teamName',
                render: (text: string) => <span className="text-white">{text}</span>
              },
              {
                title: 'Total Spent',
                dataIndex: 'totalSpent',
                key: 'totalSpent',
                render: (value: number) => <span className="text-white">₹{value.toLocaleString()}</span>,
                sorter: (a, b) => b.totalSpent - a.totalSpent
              },
              {
                title: 'Players Bought',
                dataIndex: 'playerCount',
                key: 'playerCount',
                render: (value: number) => <span className="text-white">{value}</span>,
                sorter: (a, b) => b.playerCount - a.playerCount
              },
              {
                title: 'Avg Spent per Player',
                dataIndex: 'avgSpentPerPlayer',
                key: 'avgSpentPerPlayer',
                render: (value: number) => <span className="text-white">₹{value.toLocaleString()}</span>,
                sorter: (a, b) => b.avgSpentPerPlayer - a.avgSpentPerPlayer
              }
            ]}
            pagination={false}
            className="bg-gray-800"
            rowClassName={() => 'bg-gray-700 hover:bg-gray-600'}
          />
        </div>

        {/* Team-wise Player Spending Breakdown */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Team-wise Player Spending Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.teamSpending.map((team, teamIndex) => {
              const teamPieData = team.players.map((player, playerIndex) => ({
                name: player.playerName,
                value: player.amount,
                percentage: player.percentage,
                fill: COLORS[playerIndex % COLORS.length]
              }));

              return (
                <Card key={team.teamId} className="bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold mb-2 text-white text-center">
                    {team.teamName}
                  </h3>
                  <p className="text-sm text-gray-400 text-center mb-4">
                    Total: ₹{team.totalSpent.toLocaleString()} | {team.players.length} players
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={teamPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {teamPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `₹${value.toLocaleString()}`,
                          `${name}`
                        ]}
                        labelStyle={{ color: '#000' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}