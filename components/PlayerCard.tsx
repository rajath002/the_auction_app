import { Button, Popover, Tag } from "antd";
import { Player } from "../interface/interfaces";
import { useEffect, useState, ReactNode } from "react";
import { LikeFilled, DislikeFilled, UndoOutlined } from "@ant-design/icons";
import Image from "next/image";
import ImageWithFallback from "./ImageWithFallback";
import kplImage from "../assets/kpl-logo-large.jpeg";
import Confetti from "react-confetti";
import { PlayerStatus } from "@/types/player-enums";

const sampleURL =
  "https://images.unsplash.com/photo-1595210382051-4d2c31fcc2f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const URI_DOMAIN = "https://lh3.google.com/u/1/d/";
const URI_SIZE = "=w1920-h912-iv1";

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

type StatusKey = "SOLD" | "UNSOLD" | "AVAILABLE" | "In-Progress";

interface StatusMeta {
  label: string;
  badgeClass: string;
  panelClass?: string;
  panelText?: string;
}

const STATUS_STYLES: Record<StatusKey, StatusMeta> = {
  SOLD: {
    label: "Sold",
    badgeClass: "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/50",
    panelClass: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    panelText: "Player is Sold",
  },
  UNSOLD: {
    label: "Unsold",
    badgeClass: "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/50",
    panelClass: "border border-rose-500/40 bg-rose-500/10 text-rose-200",
    panelText: "Player is Unsold",
  },
  AVAILABLE: {
    label: "Available",
    badgeClass: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/40",
  },
  "In-Progress": {
    label: "In-Progress",
    badgeClass: "bg-yellow-500/20 text-yellow-200 ring-1 ring-yellow-400/50",
    panelClass: "border border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
    panelText: "Player bidding in progress",
  }
};

const resolvePlayerImage = (image?: string | null) => {
  if (!image) {
    return null;
  }

  if (/^https?:/i.test(image)) {
    return image;
  }

  return `${URI_DOMAIN}${image}${URI_SIZE}`;
};

// React function components
export const PlayerCard = ({
  player,
  index,
  onSell,
  onRevoke,
  onResetPlayer,
  onUnsold,
  isLastPlayer,
}: {
  player: Player;
  onSell: (player: Player) => void;
  onRevoke: (player: Player) => void;
  onResetPlayer: (player: Player) => void;
  onUnsold: (player: Player) => void;
  index: number | undefined;
  isLastPlayer?: boolean;
}) => {
  const statusKey = (player?.status ?? "AVAILABLE") as StatusKey;
  const statusMeta = STATUS_STYLES[statusKey];
  const formattedBidValue = numberFormatter.format(player?.bidValue ?? 0);
  const formattedBaseValue = numberFormatter.format(player?.baseValue ?? 0);
  const playerImageSrc = resolvePlayerImage(player?.image) ?? sampleURL;
  const pickNumber = typeof index === "number" ? index + 1 : undefined;

  return (
    <div className="relative mx-auto w-full">
      <div className="relative isolate overflow-hidden rounded-[28px] border border-slate-800/60 bg-slate-950/90 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col items-center gap-5">
            <div className="relative aspect-[4/5] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/80 shadow-inner">
              <ImageWithFallback
                src={playerImageSrc}
                fallbackSrc={kplImage}
                alt={player?.name ?? "Player preview"}
                width={810}
                height={1012}
                objectFit="cover"
                objectPosition="top center"
                enablePreview={true}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
            </div>
              {statusKey === "SOLD" && (
                <div className="pointer-events-none absolute left-4 top-4 "> 
                {/* stamp-print */}
                  <Image
                    src="/sold-stamp.png"
                    alt="Sold stamp"
                    width={600}
                    height={600}
                    className="h-40 w-40 -rotate-6 opacity-95 drop-shadow-[0_18px_45px_rgba(22,163,74,0.45)]"
                    priority
                  />
                </div>
              )}
          </div>

          <div className="flex h-full flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {pickNumber !== undefined && (
                <span className="rounded-full border border-slate-700/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                  Pick #{pickNumber}
                </span>
              )}

              <span className={`rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] ${statusMeta.badgeClass}`}>
                {statusMeta.label}
              </span>
            </div>

            <div>
              <h2 className="truncate text-3xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl text-center" title={player?.name}>
                {player?.name}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-slate-300">
              {player?.type && (
                <Tag className="!rounded-full !border-none !bg-sky-500/15 !px-4 !py-1 !text-[11px] !font-semibold !text-sky-200">
                  {player.type}
                </Tag>
              )}
              {player?.category && (
                <Tag className="!rounded-full !border-none !bg-violet-500/15 !px-4 !py-1 !text-[11px] !font-semibold !text-violet-200">
                  {`Category ${player.category}`}
                </Tag>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatTile label="Base Points" value={formattedBaseValue} />
              {/* <StatTile label="Current Bid" value={`₹${formattedBidValue}`} highlight /> */}
              <StatTile label="Player Status" value={statusMeta.label} />
            </div>


            <Buttons
              player={player}
              onRevoke={onRevoke}
              onSell={onSell}
              onResetPlayer={onResetPlayer}
              onUnsold={onUnsold}
            />

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-5 text-center shadow-inner">
              <span className="text-xs uppercase tracking-[0.4em] text-emerald-200">
                Current Bid
              </span>
              <p className="mt-2 text-5xl font-black text-emerald-100">₹{formattedBidValue}</p>
            </div>

            <div className={`rounded-2xl px-4 py-3 text-center text-lg font-semibold transition-all duration-300 ${
              statusMeta.panelText && player?.status 
                ? `${statusMeta.panelClass} opacity-100` 
                : 'border border-transparent bg-transparent text-transparent opacity-0'
            }`}>
              {statusMeta.panelText || 'Placeholder text for layout'}
            </div>

              {isLastPlayer && (
                <div className="w-full mb-3 flex items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-center">
                  <span className="text-pink-200 font-medium">
                  ⚠️ You&apos;ve reached the end of the player list!
                  </span>
                </div>
              )}
          </div>
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
    let timer: NodeJS.Timeout | undefined;

    if (isExploading) {
      timer = setTimeout(() => {
        setIsExploading(false);
      }, 3000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isExploading]);

  const handleOpenChange = () => setOpenPopover(!openPopover);
  const reset = () => {
    setOpenPopover(false);
    setTimeout(() => {
      props.onResetPlayer(props.player);
    }, 600);
  };

  const handleSoldChange = () => setOpenSoldPopover(!openSoldPopover);

  const onSoldHandler = () => {
    setOpenSoldPopover(false);
    setTimeout(() => {
      props.onSell(props.player);
    }, 600);
    setIsExploading(true);
  };

  const handleUnsoldChange = () => setOpenUnsoldPopover(!openUnsoldPopover);

  const onUnsoldHandler = () => {
    setOpenUnsoldPopover(false);
    setTimeout(() => {
      props.onUnsold(props.player);
    }, 600);
  };

  const unsoldBtn = props.player?.status === PlayerStatus.AVAILABLE && (
    <Popover
      content={
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            onClick={onUnsoldHandler}
            className="!rounded-full !border-none !bg-rose-500 !px-4 !py-1.5 !font-semibold !text-white"
          >
            Yes
          </Button>
          <Button
            type="default"
            onClick={handleUnsoldChange}
            className="!rounded-full !border !border-slate-600 !bg-slate-800 !px-3 !py-1.5 !text-slate-200 hover:!border-blue-500 hover:!bg-slate-700 hover:!text-blue-400"
          >
            No
          </Button>
        </div>
      }
      title="Is this player unsold?"
      trigger="click"
      open={openUnsoldPopover}
      placement="bottom"
      onOpenChange={handleUnsoldChange}
    >
      <Button
        type="primary"
        danger
        onClick={handleUnsoldChange}
        className="!flex !items-center !gap-2 !rounded-full !border-none !bg-rose-500 !px-5 !py-2 !text-sm !font-semibold !text-white !shadow-lg !transition hover:!brightness-110"
        icon={<DislikeFilled />}
      >
        Drop
      </Button>
    </Popover>
  );

  const sellButton = (props.player?.status === "AVAILABLE" || props.player?.status === "In-Progress") && props.player?.currentTeamId ? (
    <Popover
      content={
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            onClick={onSoldHandler}
            className="!rounded-full !border-none !bg-emerald-500 !px-4 !py-1.5 !font-semibold !text-white"
          >
            Yes
          </Button>
          <Button
            type="default"
            onClick={handleSoldChange}
            className="!rounded-full !border !border-slate-600 !bg-slate-800 !px-3 !py-1.5 !text-slate-200 hover:!border-blue-500 hover:!bg-slate-700 hover:!text-blue-400"
          >
            No
          </Button>
        </div>
      }
      title="Confirm selling this player"
      trigger="click"
      open={openSoldPopover}
      placement="bottom"
      onOpenChange={handleSoldChange}
    >
      <Button
        className="!flex !items-center !gap-2 !rounded-full !border-none !bg-emerald-500 !px-6 !py-2 !text-sm !font-semibold !text-white !shadow-lg hover:!bg-emerald-400"
        onClick={handleSoldChange}
        icon={<LikeFilled />}
      >
        Sell
      </Button>
    </Popover>
  ) : null;

  const revokeButton = props.player?.status === "SOLD" || props.player?.status === "UNSOLD" ? (
    <Button
      onClick={() => props.onRevoke(props.player)}
      className="!rounded-full !border-none !bg-amber-500 !px-6 !py-2 !text-sm !font-semibold !text-slate-900 !shadow-lg hover:!bg-amber-400"
    >
      Revoke
    </Button>
  ) : null;

  const resetButton = props.player?.currentTeamId ? (
    <Popover
      content={
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            onClick={reset}
            className="!rounded-full !border-none !bg-sky-500 !px-4 !py-1.5 !font-semibold !text-white"
          >
            Yes
          </Button>
          <Button
            type="default"
            onClick={handleOpenChange}
            className="!rounded-full !border !border-slate-600 !bg-slate-800 !px-3 !py-1.5 !text-slate-200 hover:!border-blue-500 hover:!bg-slate-700 hover:!text-blue-400"
          >
            No
          </Button>
        </div>
      }
      title="Reset player points and team?"
      trigger="click"
      open={openPopover}
      placement="bottom"
      onOpenChange={handleOpenChange}
    >
      <Button
        type="primary"
        danger
        className="!flex !items-center !gap-2 !rounded-full !border-none !bg-gradient-to-r !from-sky-500 !to-indigo-600 !px-6 !py-2 !text-sm !font-semibold !text-white !shadow-lg hover:!from-sky-400 hover:!to-indigo-500"
        icon={<UndoOutlined />}
        onClick={handleOpenChange}
      >
        Reset
      </Button>
    </Popover>
  ) : null;

  return (
    <>
      {isExploading && <Confetti recycle={false} />}
      <div className="mt-6 min-h-[44px] flex flex-wrap items-center gap-3">
        {sellButton}
        {revokeButton}
        {resetButton}
        {unsoldBtn}
      </div>
    </>
  );
}

function StatTile({ label, value, highlight = false }: { label: string; value: ReactNode; highlight?: boolean }) {
  const containerClass = highlight
    ? "border-emerald-400/35 bg-emerald-500/10"
    : "border-slate-700/60 bg-slate-900/60";
  const labelClass = highlight ? "text-emerald-200/80" : "text-slate-400";
  const valueClass = highlight ? "text-emerald-100" : "text-slate-100";

  return (
    <div className={`rounded-2xl border px-4 py-4 text-center shadow-inner ${containerClass}`}>
      <span className={`text-[11px] uppercase tracking-[0.35em] ${labelClass}`}>{label}</span>
      <div className={`mt-2 text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
