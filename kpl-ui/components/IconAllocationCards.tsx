"use client";

import { FC, useState } from "react";

interface Card {
  name: string;
  revealed: boolean;
}

interface IconAllocationCardsProps {
  shuffledCards: Card[];
  revealCard: (index: number) => void;
  isShuffling: boolean;
  onReshuffle: () => void;

}

const AllocationCard: FC<{
  card: Card;
  index: number;
  revealCard: (index: number) => void;
}> = ({ card, index, revealCard }) => {
  const [flipped, setFlipped] = useState(false);

  const onClick = () => {
    if (!card.revealed) {
      revealCard(index)
      setTimeout(() => setFlipped(true), 300);
    }
  };

  return (
    <div
      key={index}
      onClick={onClick}
      className={`
                ${
                  flipped
                    ? "bg-gradient-to-br from-green-600 to-emerald-600"
                    : "rgb-card cursor-pointer"
                }
                relative aspect-[3/4] rounded-xl transform transition-all duration-500 hover:scale-105
              `}
      style={{
        transformStyle: "preserve-3d",
        animation: card.revealed ? "flipCard 0.6s ease-in-out" : "none",
      }}
    >
      <div className="card-content absolute inset-0 flex flex-col items-center justify-center p-4 text-center rounded-xl">
        {flipped ? (
          <>
            <div
              className={`text-3xl font-bold mb-2 transition-all duration-300 ${
                flipped ? "scale-110" : ""
              }`}
            >
              {index + 1}
            </div>
            <div className="text-3xl font-bold text-yellow-300 border-t border-white/40 pt-3 mt-3 animate-fadeIn drop-shadow-lg text-center">
              {card.name}
            </div>
          </>
        ) : (
          <div
            className={`text-6xl font-bold mb-2 transition-all duration-300 ${
              flipped ? "scale-110" : ""
            }`}
          >
            {index + 1}
          </div>
        )}
      </div>
      {flipped && (
        <>
          <div className="absolute inset-0 rounded-xl animate-pulse-slow bg-white/10"></div>
          <div className="absolute top-2 right-2 text-2xl animate-bounce">
            ✨
          </div>
          <div
            className="absolute bottom-2 left-2 text-2xl animate-bounce"
            style={{ animationDelay: "0.2s" }}
          >
            🎉
          </div>
        </>
      )}
    </div>
  );
};

export default function IconAllocationCards({
  shuffledCards,
  revealCard,
  isShuffling,
  onReshuffle,
}: IconAllocationCardsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        🎯 Click to Unlock Your Icon!
      </h2>
      {isShuffling ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4 animate-spin">🎲</div>
          <div className="text-2xl font-semibold animate-pulse">
            Shuffling...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {shuffledCards.map((card, index) => (
            <AllocationCard
              key={index}
              card={card}
              index={index}
              revealCard={revealCard}
            />
          ))}
        </div>
      )}
      <button
        onClick={onReshuffle}
        disabled={isShuffling}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isShuffling ? "Shuffling..." : "Shuffle Again"}
      </button>
    </div>
  );
}
