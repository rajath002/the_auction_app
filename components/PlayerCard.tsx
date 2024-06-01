import { Button, Image, Popover, Tag } from "antd";
import { Player } from "../interface/interfaces";
import { useEffect, useState } from "react";
import { LikeFilled, DislikeFilled, UndoOutlined } from "@ant-design/icons";
import ImageWithFallback from "./ImageWithFallback";
import kplImage from "../assets/kpl-logo-large.jpeg";
import Confetti from "react-confetti";

const sampleURL =
  "https://images.unsplash.com/photo-1595210382051-4d2c31fcc2f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const URI_DOMAIN = "https://lh3.google.com/u/1/d/";
const URI_SIZE = "=w1920-h912-iv1";

// React function components
export const PlayerCard = ({
  player,
  index,
  onSell,
  onRevoke,
  onResetPlayer,
  onUnsold,
}: {
  player: Player;
  onSell: (player: Player) => void;
  onRevoke: (player: Player) => void;
  onResetPlayer: (player: Player) => void;
  onUnsold: (player: Player) => void;
  index: number | undefined;
}) => {
  return (
    <div className="flex flex-col p-4 relative">
      <div className="grid md:grid-flow-col gap-2 md:grid-cols-2">
        {/* <div className=" top-52 left-0 right-0 bottom-0  bg-gradient-to-t from-slate-200 to-slate-700 opacity-75" /> */}
        <div className="flex justify-center ">
          {player?.image && (
            // <ImageWithFallback
            //   src={player.image}
            //   fallbackSrc={kplImage}
            //   width={300}
            //   height={300}
            //   alt={player.name}
            // />
            <Image
              src={player.image}
              width={450}
              height={300}
              alt={player.name}
              // style={{objectFit: 'cover'}}
              className="object-cover border-2 rounded-md border-x-fuchsia-300 border-y-red-300"
            />
          )}
        </div>
        <div className="  bottom-0 text-white">
          {/* <div className="">{index + 1}</div> */}
          <h2 className="text-4xl font-bold"> {player?.name}</h2>
          <ul className="text-sm mt-2">
            <h1 className="text-lg">{player?.type}🏏</h1>
            Base Points: {player?.stats?.baseValue}
          </ul>
          <Buttons
            player={player}
            onRevoke={onRevoke}
            onSell={onSell}
            onResetPlayer={onResetPlayer}
            onUnsold={onUnsold}
          />
          <div className="my-3">
            <h1 className="text-5xl font-bold text-center">
              {player?.stats.bidValue}
            </h1>
          </div>

          {player?.stats.status === "SOLD" && (
            <div className="bg-green-300 border border-green-600 text-green-700 text-4xl font-extrabold p-4 text-center rounded-md">
              SOLD
            </div>
          )}
          {player?.stats.status === "UNSOLD" && (
            <div className="bg-red-300 border border-red-600 text-red-700 text-4xl font-extrabold p-4 text-center rounded-md">
              UNSOLD
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Buttons(props: {
  player: Player;
  onSell: (player: Player) => void;
  onRevoke: (player: Player) => void;
  onResetPlayer: (player: Player) => void;
  onUnsold: (player: Player) => void;
}) {
  const [openPopover, setOpenPopover] = useState(false);
  const [openSoldPopover, setOpenSoldPopover] = useState(false);
  const [openUnsoldPopover, setOpenUnsoldPopover] = useState(false);
  const [isExploading, setIsExploading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isExploading) {
      timer = setTimeout(() => {
        setIsExploading(() => false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isExploading]);

  const handleOpenChange = () => setOpenPopover(!openPopover);
  const reset = () => {
    setOpenPopover(() => false);
    setTimeout(() => {
      props.onResetPlayer(props.player);
    }, 600);
  };

  const handleSoldChange = () => setOpenSoldPopover(!openSoldPopover);

  const onSoldHandler = () => {
    setOpenSoldPopover(() => false);
    setTimeout(() => {
      props.onSell(props.player);
    }, 600);
    setIsExploading(() => true);
  };

  const handleUnsoldChange = () => setOpenUnsoldPopover(!openUnsoldPopover);

  const onUnsoldHandler = () => {
    setOpenUnsoldPopover(() => false);
    setTimeout(() => {
      props.onUnsold(props.player);
    }, 5000);
  };

  const unsoldBtn = props.player?.stats.status === null && (
    <Popover
      content={
        <>
          <Button onClick={onUnsoldHandler}>Yes</Button>
          <Button className="mx-2" onClick={handleUnsoldChange}>
            No
          </Button>
        </>
      }
      title="Is this Player is Unsold?"
      trigger="click"
      open={openUnsoldPopover}
      placement="bottom"
      onOpenChange={handleUnsoldChange}
    >
      <Button
        type="primary"
        danger
        onClick={handleUnsoldChange}
        className=" text-white bg-green-500"
        icon={<DislikeFilled />}
      >
        Drop
      </Button>
    </Popover>
  );

  if (!props.player?.stats.currentTeamId) {
    return <>{unsoldBtn}</>;
  }
  const btn =
    props.player?.stats.status === null ||
    props.player?.stats.status === "UNSOLD" ? (
      <>
        <Popover
          content={
            <>
              <Button onClick={onSoldHandler}>Yes</Button>
              <Button className="mx-2" onClick={handleSoldChange}>
                No
              </Button>
            </>
          }
          title="Are you sure to sell the Player?"
          trigger="click"
          open={openSoldPopover}
          placement="bottom"
          onOpenChange={handleSoldChange}
        >
          <Button
            type="primary"
            className=" text-white bg-green-500"
            onClick={handleSoldChange}
            icon={<LikeFilled />}
          >
            Sell
          </Button>
        </Popover>
      </>
    ) : (
      <Button
        type="primary"
        ghost
        onClick={() => props.onRevoke(props.player)}
        className=" text-white"
      >
        Revoke
      </Button>
    );

  return (
    <>
      {isExploading && <Confetti recycle={false} />}
      <div className="grid grid-flow-col gap-3 mt-5">
        {btn}
        <Popover
          content={
            <>
              <Button onClick={() => reset()}>Yes</Button>
              <Button onClick={handleOpenChange}>No</Button>
            </>
          }
          title="Are you sure to reset the points of the and teams?"
          trigger="click"
          open={openPopover}
          placement="bottom"
          onOpenChange={handleOpenChange}
        >
          <Button
            type="primary"
            danger
            className="text-white"
            icon={<UndoOutlined />}
            onClick={handleOpenChange}
          >
            Reset
          </Button>
        </Popover>
      </div>
    </>
  );
}
