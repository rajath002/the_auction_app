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
    setPlayers(playersJsonList);
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
  const [bottom, setBottom] = useState<TablePaginationPosition>("bottomRight");
  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});

  const playersColumns: ColumnsType<Player> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filterSearch: true,
      // filteredValue: filteredInfo.name || null,
      // onFilter: (value: string, record) => record.name.includes(value),
      sorter: (a, b) => b.name.localeCompare(a.name),
      // sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      ellipsis: true,
      sortDirections: ["ascend", "descend"]
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      onFilter: (value: string, record) => record.type.startsWith(value),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        {
          text: 'L1',
          value: 'L1',
        },
        {
          text: 'L2',
          value: 'L2',
        },
        {
          text: 'L3',
          value: 'L3',
        },
      ],
      onFilter: (value, record) => record.category.indexOf(value as string) === 0,
      sorter: (a, b) => b.category.localeCompare(a.category),
    },
  ];

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
        <Table
          columns={playersColumns}
          pagination={{ position: [bottom] }}
          dataSource={props.players}
        />
      </div>
    </ConfigProvider>
  );
}
