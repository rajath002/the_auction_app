import { Player } from "@/interface/interfaces";

interface PlayerStatsProps {
  filteredPlayers: Player[];
}

export default function PlayerStats({ filteredPlayers }: PlayerStatsProps) {
  return (
    <div className="bg-gray-900 text-white py-2 mb-4 overflow-hidden">
      <div className="whitespace-nowrap">
        <span className="mx-8 text-lg">
          Total Players: {filteredPlayers.length}
        </span>
        <span className="mx-8 text-lg">
          L1: {filteredPlayers.filter(p => p.category === 'L1').length}
        </span>
        <span className="mx-8 text-lg">
          L2: {filteredPlayers.filter(p => p.category === 'L2').length}
        </span>
        <span className="mx-8 text-lg">
          L3: {filteredPlayers.filter(p => p.category === 'L3').length}
        </span>
        <span className="mx-8 text-lg">
          L4: {filteredPlayers.filter(p => p.category === 'L4').length}
        </span>
        <span className="mx-8 text-lg">
          L5: {filteredPlayers.filter(p => p.category === 'L5').length}
        </span>
      </div>
    </div>
  );
}