'use client';

import { useState } from 'react';
import IconAllocationCards from '@/components/IconAllocationCards';
import MagicCards from '@/components/MagicCards';
import './icon-allocation.scss';

export default function IconAllocationPage() {
  const [players, setPlayers] = useState<string[]>(['Dheeraj Shetty', 'Praveen Acharya', 'Adarsh Acharya', 'Shreepad Poojary', 'Sandesh Poojary']);
  const [input, setInput] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
    // Start animation
    setIsAnimating(true);
    
    // After animation completes, shuffle and show cards
    setTimeout(() => {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      setPlayers(shuffled);
      setShowCards(true);
      setIsAnimating(false);
    }, 2000);
  };

  const resetAll = () => {
    setShowCards(false);
    setPlayers([]);
    setInput('');
  };
  
  return (
    <div className={`min-h-screen text-white ${showCards ? 'p-0' : 'px-4 py-8 bg-slate-950/90'}`}>
      {/* Loading Animation Overlay */}
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
          <div className="text-center">
            <div className="mb-8 text-8xl dice-animation">
              🎲
            </div>
            <div className="shimmer-bg px-8 py-4 rounded-2xl mb-4">
              <h2 className="text-4xl font-bold text-cyan-400 mb-2">
                Shuffling Cards...
              </h2>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full sparkle" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full sparkle" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full sparkle" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full sparkle" style={{ animationDelay: '0.6s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full sparkle" style={{ animationDelay: '0.8s' }}></div>
            </div>
            <p className="text-lg text-cyan-300 animate-pulse">
              Preparing your magical cards...
            </p>
          </div>
        </div>
      )}
      
      {!showCards && <div className="h-10"></div>}
      <div className={showCards ? '' : 'max-w-6xl mx-auto'}>
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent leading-loose">
          Icon Player Allocation
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
            {!showCards && (
              <button 
                onClick={shuffleCards} 
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🎲 Let&apos;s Roll the Dice!
              </button>
            )}
          </div>
        )}

        {/* Shuffled Cards */}
        {showCards && (
          <MagicCards 
            hiddenWords={players}
            onBack={() => setShowCards(false)}
          />
        )}

      </div>
    </div>
  );
}