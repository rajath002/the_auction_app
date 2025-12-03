'use client';
import { Button, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import type { Team } from "../interface/interfaces";

const url =
  "https://1000logos.net/wp-content/uploads/2022/02/RCB-Logo-2016.png";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

type TeamListVariant = "grid" | "list";

interface TeamListType {
  updateTeamAndPlayerPoints: (team: Team) => void;
  teams: Team[];
  disabled: boolean;
  latedBiddedTeam: number | null;
  isPlayersAvailable: boolean;
  variant?: TeamListVariant;
  requiredBidAmount?: number;
  isAuctionInProgress?: boolean;
}

export const TeamList = (props: TeamListType) => {
  const variant = props.variant ?? "grid";
  const updatePurse = (team: Team) => {
    props.updateTeamAndPlayerPoints(team);
  };
  const containerClass =
    variant === "list"
      ? "flex flex-col gap-2"
      : "grid w-full h-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
  return (
    <div className={containerClass}>
      {props.teams?.map((t) => (
        <Team
          key={t.id}
          team={t}
          onBid={updatePurse}
          disableButton={props.disabled}
          isBiddedTeam={props.latedBiddedTeam === t.id}
          isPlayersAvailable={props.isPlayersAvailable}
          variant={variant}
          hasInsufficientFunds={props.requiredBidAmount !== undefined && t.purse < props.requiredBidAmount}
          hasLowFunds={t.purse < 100}
          isAuctionInProgress={props.isAuctionInProgress ?? false}
        />
      ))}
    </div>
  );
};

interface TeamType {
  team: Team;
  disableButton: boolean;
  onBid: (team: Team) => void;
  isBiddedTeam: boolean;
  isPlayersAvailable: boolean;
  variant: TeamListVariant;
  hasInsufficientFunds: boolean;
  hasLowFunds: boolean;
  isAuctionInProgress: boolean;
}

function Team({ team, onBid, disableButton, isBiddedTeam, isPlayersAvailable, variant, hasInsufficientFunds, hasLowFunds, isAuctionInProgress }: TeamType) {
  const formattedPurse = currencyFormatter.format(team.purse);
  const disableBid = disableButton || !isPlayersAvailable || hasInsufficientFunds;
  const showWarning = hasLowFunds && hasInsufficientFunds;
  const showInsufficientMessage = isAuctionInProgress && hasInsufficientFunds && !isBiddedTeam;
  const infoEntries = [
    { label: "Owner", value: team.owner },
    { label: "Mentor", value: team.mentor },
    { label: "Icon Player", value: team.iconPlayer },
  ].filter((entry) => entry.value);

  const infoContent = infoEntries.length ? (
    <div className="space-y-2 text-xs text-slate-200">
      {infoEntries.map((entry) => (
        <div key={entry.label} className="flex items-start justify-between gap-4">
          <span className="text-slate-400">{entry.label}</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-xs text-slate-200">No team details yet.</span>
  );

  if (variant === "list") {
    return (
      <div
        className={[
          "relative flex min-h-[100px] w-full items-center gap-2 rounded-3xl border bg-gradient-to-br px-4 py-3 text-slate-100 shadow-lg transition-all duration-300 ease-out",
          showWarning 
            ? "border-red-500/50 from-slate-950 via-red-950/20 to-slate-950 opacity-60" 
            : "border-slate-700/50 from-slate-950 via-slate-900 to-slate-950 hover:-translate-y-[2px] hover:border-blue-400/60 hover:shadow-2xl",
          disableBid && !showWarning ? "opacity-90" : "",
          isBiddedTeam ? "ring-1 ring-blue-500/70" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-inner">
            <Image src={url} alt="team icon" height={80} width={80} />
          </div>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            {isBiddedTeam ? (
              <span className="rounded-full bg-green-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                Latest Bid
              </span>
            ) : (
              <div />
            )}
            <Tooltip
              placement="left"
              title={infoContent}
              overlayInnerStyle={{ borderRadius: 12 }}
            >
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-blue-400 hover:text-white"
              >
                <InfoCircleOutlined className="text-blue-400" /> Info
              </button>
            </Tooltip>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-100">
                {team.name}
              </h2>
            </div>
            <div className="flex justify-center items-center">
              <Button
                type="primary"
                className="!rounded-full !border-none !bg-gradient-to-r !from-sky-500 !to-blue-600 !px-6 !py-2 text-sm font-semibold tracking-wide text-white shadow-md transition hover:!from-sky-400 hover:!to-blue-500 disabled:!bg-slate-700 disabled:!from-slate-700 disabled:!to-slate-700 disabled:!text-slate-300"
                onClick={() => onBid(team)}
                disabled={disableBid}
              >
                Bid
              </Button>
              <div className="rounded-2xl bg-slate-950/70 px-2 py-1 text-right">
                <span className="block text-[11px] uppercase tracking-[0.35em] text-slate-400">
                  Purse
                </span>
                <span className={`block text-xl font-semibold ${showInsufficientMessage ? "text-red-400" : "text-emerald-300"}`}>
                  ₹{formattedPurse}
                </span>
                {showInsufficientMessage && (
                  <span className="block text-[10px] font-medium text-red-400">
                    Insufficient funds
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex w-full flex-col items-center gap-5 rounded-2xl border bg-gradient-to-br p-5 text-slate-100 shadow-md transition-all duration-300 ease-out",
        showWarning
          ? "border-red-500/50 from-slate-950 via-red-950/20 to-slate-950 opacity-60"
          : "border-slate-700/50 from-slate-950 via-slate-900 to-slate-950 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-2xl",
        disableBid && !showWarning ? "opacity-90" : "",
        isBiddedTeam ? "ring-1 ring-blue-500/70" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full items-center justify-between">
        {isBiddedTeam ? (
          <span className="rounded-full bg-blue-500/85 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.3em] text-white">
            Latest Bid
          </span>
        ) : (
          <span className="h-2" />
        )}

        <Tooltip placement="left" title={infoContent} overlayInnerStyle={{ borderRadius: 12 }}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-blue-400 hover:text-white"
          >
            <InfoCircleOutlined className="text-blue-400" /> 
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-slate-900/70 shadow-inner">
          <Image src={url} alt="team icon" height={96} width={96} />
        </div>

        <h2 className="text-center text-base font-semibold uppercase tracking-wide">
          {team.name}
        </h2>

        <div className="flex w-full flex-col rounded-2xl bg-slate-950/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Purse
            </span>
            <span className={`text-lg font-bold ${showInsufficientMessage ? "text-red-400" : "text-emerald-300"}`}>₹{formattedPurse}</span>
          </div>
          {showInsufficientMessage && (
            <span className="text-center text-[10px] font-medium text-red-400 mt-1">
              Insufficient funds
            </span>
          )}
        </div>
      </div>

      <Button
        type="primary"
        className="!mt-2 !w-full !rounded-full !border-none !bg-gradient-to-r !from-sky-500 !to-blue-600 !py-2 text-sm font-semibold tracking-wide text-white shadow-md transition hover:!from-sky-400 hover:!to-blue-500 disabled:!bg-slate-700 disabled:!from-slate-700 disabled:!to-slate-700 disabled:!text-slate-300"
        onClick={() => onBid(team)}
        disabled={disableBid}
      >
        Bid
      </Button>
    </div>
  );
}
