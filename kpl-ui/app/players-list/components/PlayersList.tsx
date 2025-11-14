"use client";
import { Player } from "@/interface/interfaces";
import {
  experimental_useEffectEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Badge, Col, ConfigProvider, Form, Input, Row, Select } from "antd";
import { theme } from "antd";
import playersJsonList from "@/data/players.json";
import { SearchOutlined } from "@ant-design/icons";
import PlayerStats from "./PlayerStats";
import { getPlayers } from "@/services/player";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

type Filters = {
  category: string | null;
  searchText: string;
};

export default function PlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const { data: session } = useSession();

  const [filteredInfo, setFilteredInfo] = useState<Filters>({
    category: null,
    searchText: "",
  });

  useEffect(() => {
    getPlayers().then((response) => setPlayers(response.data));
  }, []);

  useEffect(() => {
    setFilteredPlayers(() =>
      players.filter((p) => {
        const matchesSearchText = filteredInfo.searchText
          ? p.name.includes(filteredInfo.searchText)
          : true;
        const matchesCategory = filteredInfo.category
          ? p.category === filteredInfo.category
          : true;
        return matchesSearchText && matchesCategory;
      })
    );
  }, [filteredInfo, players]);

  const setCategory = (category: string) => {
    setFilteredInfo({
      ...filteredInfo,
      category,
    });
  };

  const setSearchText = (searchText: string) => {
    setFilteredInfo({
      ...filteredInfo,
      searchText,
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Table: {
            colorBgContainer: "rgb(31 41 55 / var(--tw-bg-opacity))",
          },
        },
      }}
    >
      {players.length > 0 ? (
        <div>
          {/* <PlayerStats filteredPlayers={filteredPlayers} /> */}

          <div>
            <SearchBar
              setCategory={setCategory}
              setSearchText={setSearchText}
            />
          </div>
          {/* <div className="flex flex-wrap justify-center gap-6 min-h-screen"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 gap-3 md:gap-6 p-6 min-h-screen">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} userRole={session?.user?.role} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center min-h-screen">
          <p className="text-xl font-semibold">Loading Players...</p>
        </div>
      )}
    </ConfigProvider>
  );
}

// bg-black bg-opacity-50
function PlayerCard({ player, userRole }: { player: Player; userRole?: string }) {
  const statusColor = player.status
    ? player.status === "UNSOLD"
      ? "text-red-500"
      : "text-green-500"
    : "";

  // Check if user can see bid values (admin or manager)
  const canSeeBidValue = userRole === "admin" || userRole === "manager";

  const showBadge = useMemo(
    () => canSeeBidValue && (player.bidValue || player.baseValue),
    [canSeeBidValue, player.bidValue, player.baseValue]
  );

  // hover:-translate-y-1 transition ease-in-out delay-150 hover:scale-110
  const cardContent = useMemo(
    () => (
      <div className="hover:border-yellow-600 h-fit border-b-4 border-slate-800 rounded overflow-hidden shadow-lg dark:bg-gray-800">
        <div className="relative">
          <Image
            className="w-full h-60 object-cover"
            src={player.image}
            alt={player.name}
            width={400}
            height={240}
          />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-800 to-transparent text-white p-2 flex items-end">
            <div className="font-bold text-xl">{player.name}</div>
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700 dark:text-gray-300 text-base">
            Type: {player.type}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base">
            Category: {player.category}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base">
            Status:
            <span className={`text-base ${statusColor}`}>
              &nbsp;{player.status}
            </span>
          </p>
          {canSeeBidValue && player.bidValue && (
            <p className="text-gray-700 dark:text-gray-300 text-base">
              Current Bid: {player.bidValue} pts
            </p>
          )}
        </div>
      </div>
    ),
    [
      player.image,
      player.name,
      player.type,
      player.category,
      player.status,
      player.bidValue,
      statusColor,
      canSeeBidValue,
    ]
  );

  return (
    <div className="transition ease-in-out delay-200 md:hover:scale-105">
      {showBadge ? (
        <Badge.Ribbon text={player.bidValue || player.baseValue} color="gold">
          {cardContent}
        </Badge.Ribbon>
      ) : (
        cardContent
      )}
    </div>
  );
}

// Sample data
const data = [
  { id: 1, name: "Level 1", category: "L1" },
  { id: 2, name: "Level 2", category: "L2" },
  { id: 3, name: "Level 3", category: "L3" },
  { id: 4, name: "Level 4", category: "L4" },
  { id: 5, name: "Level 5", category: "L5" },
];

type SearchBarType = {
  setCategory: (category: string | null) => void;
  setSearchText: (text: string) => void;
};
function SearchBar(props: SearchBarType) {
  const handleSearch = (e) => {
    props.setSearchText(e.target.value);
  };

  const handleCategoryChange = (value) => {
    value === "All" ? props.setCategory(null) : props.setCategory(value);
  };

  const categories = ["All", ...new Set(data.map((item) => item.category))];

  return (
    <div className="px-5">
      <Form
        name="dependencies"
        autoComplete="off"
        // style={{ maxWidth: 600 }}
        layout="vertical"
      >
        <Row
          data-testid="search-bar"
          justify="space-between"
          gutter={16}
          className="w-full"
        >
          <Col className="px-2">
            <div className="relative text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Players List
              </h1>
              {/* <p className="text-slate-300 text-lg md:text-xl">Browse and manage all available players</p> */}
            </div>
          </Col>
          <Row>
            <Col className="px-2" data-testid="select-category-col">
              <Form.Item
                data-testid="select-category"
                label="Select Category"
                name="selectCategory"
              >
                <Select
                  defaultValue="All"
                  // style={{ width: 200, marginBottom: "16px" }}
                  className="w-full"
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <Select.Option key={category} value={category}>
                      {category}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col className="px-2">
              <Form.Item label="Search Players" name="searchplayers">
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  onChange={handleSearch}
                  // style={{ marginBottom: "16px" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Row>
      </Form>
    </div>
  );
}
