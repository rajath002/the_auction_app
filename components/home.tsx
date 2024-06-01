"use client";
import Image from "next/image";
import kplLogo from "@/assets/kpl-logo-large.jpeg";
import kplLogoTransparent from "@/assets/kpl-logo-transparent.png";
import { useAppContext } from "@/context/useAppState";
import { Team } from "@/interface/interfaces";

export default function HomeBase() {
  const { teams } = useAppContext();
  return (
    <>
      <section className="grid justify-center pt-5">
        <Image
          src={kplLogoTransparent}
          alt={"kpl-logo"}
          width={300}
          height={300}
          className="rounded-xl "
        ></Image>
      </section>
      <section className="mt-5">
        {/* <h1 className="text-center font-semibold">Teams</h1> */}
        <div className="flex flex-wrap justify-center gap-10">
          {teams.map((t: Team) => (
            <ShowTeam key={t.id} team={t} />
          ))}
        </div>
      </section>
    </>
  );
}

function ShowTeam({ team }: { team: Team }) {
  return (
    // <div className="px-14 m-10">
    //   <div>{details.name}</div>
    // </div>
    <div className="bg-slate-400 shadow-md rounded-lg w-auto">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-lg font-semibold">Card Title</h2> */}
        {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Action</button> */}
      </div>
      <Image
        src={kplLogo}
        alt="Image"
        className="w-full md:w-60 md:h-44 rounded-t-lg"
      />
      <div className="mt-1 px-2">
        <h2 className="uppercase text-center bg-blue-700 rounded font-bold">
          {team.name}
        </h2>

        <div className="">
          <div className="flex">
            <div className="text-blue-950 font-semibold bg-red w-16">Owner</div>
            <h3 className="font-bold text-slate-600 text-left text-lg">
              {team.owner}
            </h3>
          </div>
          <div className="flex">
            <div className="text-blue-950 font-semibold bg-red w-16">Mentor</div>
            <h4 className="font-bold text-slate-600 text-left text-lg">
              {team.mentor}
            </h4>
          </div>
          <div className="flex">
            <div className="text-blue-950 font-semibold bg-red w-16">Icon</div>
            <h5 className="font-bold text-slate-600 text-left text-lg">
              {team.iconPlayer}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
}
