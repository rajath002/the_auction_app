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

interface TeamListType {
  updateTeamAndPlayerPoints: (team: Team) => void;
  teams: Team[];
  disabled: boolean;
  latedBiddedTeam: number | null;
  isPlayersAvailable: boolean;
}

export const TeamList = (props: TeamListType) => {
  const updatePurse = (team: Team) => {
    props.updateTeamAndPlayerPoints(team);
  };
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {props.teams?.map((t) => (
        <Team
          key={t.id}
          team={t}
          onBid={updatePurse}
          disableButton={props.disabled}
          isBiddedTeam={props.latedBiddedTeam === t.id}
          isPlayersAvailable={props.isPlayersAvailable}
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
}

function Team({ team, onBid, disableButton, isBiddedTeam, isPlayersAvailable }: TeamType) {
  const formattedPurse = currencyFormatter.format(team.purse);
  const disableBid = disableButton || !isPlayersAvailable;
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

  return (
    <div
      className={[
        "flex w-full flex-col items-center gap-5 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 text-slate-100 shadow-md transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-2xl",
        disableBid ? "opacity-90" : "",
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

        <div className="flex w-full items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
          <span className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
            Purse
          </span>
          <span className="text-lg font-bold text-emerald-300">₹{formattedPurse}</span>
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
