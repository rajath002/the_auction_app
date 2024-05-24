"use client";
import { Player } from "@/interface/interfaces";
import { getPlayers } from "@/services/player";
import { useEffect, useState } from "react";
import { ConfigProvider, Radio, Space, Table, Tag } from "antd";
import { TableProps, theme } from "antd";
import playersJsonList from "./players.json";

type ColumnsType<T extends object> = TableProps<T>["columns"];
type TablePagination<T extends object> = NonNullable<
  Exclude<TableProps<T>["pagination"], boolean>
>;
type TablePaginationPosition = NonNullable<
  TablePagination<any>["position"]
>[number];

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const topOptions = [
  { label: "topLeft", value: "topLeft" },
  { label: "topCenter", value: "topCenter" },
  { label: "topRight", value: "topRight" },
  { label: "none", value: "none" },
];

const bottomOptions = [
  { label: "bottomLeft", value: "bottomLeft" },
  { label: "bottomCenter", value: "bottomCenter" },
  { label: "bottomRight", value: "bottomRight" },
  { label: "none", value: "none" },
];

const columns: ColumnsType<any> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (tags: string[]) => (
      <span>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];

export default function PlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // getPlayers().then((players) => setPlayers(players));
    setPlayers(playersJsonList as Player[]);
  }, []);

  return (
    <>
      <DataTable players={players} />
    </>
  );
}

type DataTableType = {
  players: Player[];
};

type OnChange = NonNullable<TableProps<DataType>["onChange"]>;
type Filters = Parameters<OnChange>[1];
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

function DataTable(props: DataTableType) {
  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});

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
      <div>
        {/* <div className="flex flex-wrap justify-center gap-6 min-h-screen"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 p-6 min-h-screen">
          {props.players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
}

// bg-black bg-opacity-50
const sampleUrls = [
  "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/316600/316605.png",
  "https://cdn-wp.thesportsrush.com/2022/11/3c08dc77-untitled-design-2022-11-15t234223.843.jpg?format=auto&w=3840&q=75",
  "https://crictoday.com/wp-content/uploads/2024/02/Dhoni.webp",
  "https://thedailyguardian.com/wp-content/uploads/2024/05/1702662144385.png",
  "https://library.sportingnews.com/styles/crop_style_16_9_desktop/s3/2024-03/Dinesh%20Karthik.jpg?h=920929c4&itok=I13vGcki",
  "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202404/will-jacks-11182032-16x9_0.jpeg?VersionId=HTAs3GZWAKV_OUhF3pZoRnmwr3V3rqLd&size=690:388",
];
function PlayerCard({ player }) {
  const randomIndex = Math.floor(Math.random() * sampleUrls.length);
  const url = sampleUrls[randomIndex];
  const color = player.stats.status
    ? player.stats.status === "UNSOLD"
      ? "text-red-500"
      : "text-green-500"
    : "";
  return (
    <div className="rounded overflow-hidden shadow-lg bg-white dark:bg-gray-800">
      <div className="relative">
        <img className="w-full h-60 object-cover" src={sampleUrls[randomIndex]} alt={player.name} />
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
          <span className={`text-base ${color}`}>
            &nbsp;{player.stats.status}
          </span>
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-base">
          Current Bid: ${player.currentBid}
        </p>
      </div>
    </div>
  );
}
