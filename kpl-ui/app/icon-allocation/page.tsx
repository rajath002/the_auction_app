'use client';

import { useState } from 'react';

export default function IconAllocationPage() {
  const [players, setPlayers] = useState<string[]>(['Dheeraj Shetty', 'Praveen Acharya', 'Adarsh Acharya', 'Shashi', 'Sandesh']);
  const [input, setInput] = useState('');
  const [shuffledCards, setShuffledCards] = useState<{ name: string; revealed: boolean }[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const addPlayer = () => {
    if (input.trim()) {
      setPlayers([...players, input.trim()]);
      setInput('');
    }
  };

  const removePlayer = (indexToRemove: number) => {
    setPlayers(players.filter((_, index) => index !== indexToRemove));
  };

  const shuffleCards = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled.map(name => ({ name, revealed: false })));
  };

  const reshuffleCards = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled.map(name => ({ name, revealed: false })));
      setIsShuffling(false);
    }, 800);
  };

  const revealCard = (index: number) => {
    setShuffledCards(prev =>
      prev.map((card, i) => (i === index ? { ...card, revealed: true } : card))
    );
  };

  const resetAll = () => {
    setShuffledCards([]);
    setPlayers([]);
    setInput('');
  };
  
  return (
    <div className="min-h-screen bg-slate-950/90 text-white px-4 py-8">
      <style jsx>{`
        @keyframes flipCard {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className="h-10"></div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent leading-loose">
          Player Selection
        </h1>

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Enter icon player name"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button 
              onClick={addPlayer} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Add Player
            </button>
          </div>
        </div>

        {/* Players List */}
        {players.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Players List ({players.length})</h2>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all"
              >
                Reset All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {players.map((player, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center bg-slate-800 px-4 py-3 rounded-lg border border-slate-600"
                >
                  <span className="font-medium">{player}</span>
                  <button
                    onClick={() => removePlayer(index)}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {!shuffledCards.length && (
              <button 
                onClick={shuffleCards} 
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🎲 Shuffle Cards
              </button>
            )}
          </div>
        )}

        {/* Shuffled Cards */}
        {shuffledCards.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-6 text-center">Click Cards to Reveal</h2>
            {isShuffling ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4 animate-spin">🎲</div>
                <div className="text-2xl font-semibold animate-pulse">Shuffling...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {shuffledCards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => !card.revealed && revealCard(index)}
                    className={`
                      ${card.revealed 
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                        : 'rgb-card cursor-pointer'
                      }
                      relative aspect-[3/4] rounded-xl transform transition-all duration-500 hover:scale-105
                    `}
                    style={{
                      transformStyle: 'preserve-3d',
                      animation: card.revealed ? 'flipCard 0.6s ease-in-out' : 'none'
                    }}
                  >
                    <div className="card-content absolute inset-0 flex flex-col items-center justify-center p-4 text-center rounded-xl">
                      <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${card.revealed ? 'scale-110' : ''}`}>
                        {index + 1}
                      </div>
                      {card.revealed && (
                        <div className="text-3xl font-bold text-yellow-300 border-t border-white/40 pt-3 mt-3 animate-fadeIn drop-shadow-lg text-center">
                          {card.name}
                        </div>
                      )}
                    </div>
                    {card.revealed && (
                      <>
                        <div className="absolute inset-0 rounded-xl animate-pulse-slow bg-white/10"></div>
                        <div className="absolute top-2 right-2 text-2xl animate-bounce">✨</div>
                        <div className="absolute bottom-2 left-2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={reshuffleCards}
              disabled={isShuffling}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isShuffling ? 'Shuffling...' : 'Shuffle Again'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}