"use Client"
import { Button } from "antd";
import Image from "next/image";
import { Team } from "../interface/interfaces";

const url =
  "https://1000logos.net/wp-content/uploads/2022/02/RCB-Logo-2016.png";

interface TeamListType {
  updateTeamAndPlayerPoints: (team: Team) => void;
  teams: Team[];
  disabled: boolean;
  latedBiddedTeam: number;
  isPlayersAvailable: boolean;
}

export const TeamList = (props: TeamListType) => {
  const updatePurse = (team: Team) => {
    props.updateTeamAndPlayerPoints(team);
  };
  return (
    <div className="grid grid-flow-col gap-2 justify-between">
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
  return (
    <>
      <div
        className={[isBiddedTeam ? "shadow-md shadow-blue-200": "border border-gray-500", "p-4"].join(" ")}
        // className="shadow"
      >
        <Image src={url} alt="team icon" height={200} width={200} />
        <h2 className="grid justify-center">{team.name}</h2>
        <div>
          <div className="text-center">
            <Button
              type="primary"
              className="text-white bg-blue-600 disabled:text-white"
              onClick={() => onBid(team)}
              disabled={disableButton || !isPlayersAvailable}
            >
              Bid
            </Button>
          </div>
          {isPlayersAvailable ? "TR": "FL"}<br/>
          {disableButton ? "D-TR": "D_FL"}
          <div className="text-center mt-2">
            <div className="text-lg bg-teal-700 rounded">{team.purse}</div>
          </div>
        </div>
      </div>
    </>
  );
}
