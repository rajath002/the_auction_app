'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Player {
  id: number;
  name: string;
  image?: string;
  type: string;
  category: string;
  status: string;
  currentTeam?: {
    id: number;
    name: string;
  };
}

interface RecentActions {
  data: Player[];
}

export default function RecentActionsPage() {
  const [data, setData] = useState<{ sold: Player[]; unsold: Player[] }>({ sold: [], unsold: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const response = await fetch('/api/auction/recent-actions');
      if (response.ok) {
        const result: RecentActions = await response.json();
        setData({
            sold: result.data.filter(player => player.status === 'SOLD'),
            unsold: result.data.filter(player => player.status === 'UNSOLD'),
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching recent actions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className='m-10'></div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Recent Auction Actions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sold Players Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-700 flex items-center">
              <span className="mr-2">✅</span> Sold Players
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.sold.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sold players yet</p>
              ) : (
                data.sold.map((player) => (
                  <div key={player.id} className="flex items-center bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <Image
                      src={player.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwaDEwVjIySDR2LTEwaDE2VjIwWk0yNCAyNGMtNC40MiAwLTgtMy41OC04LThzMy41OC04IDgtOCA4IDMuNTggOCA4LTMuNTggOCA4IDh6IiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.type} • {player.category}</p>
                      <p className="text-sm font-medium text-green-700">
                        Sold to {player.currentTeam?.name || 'Unknown Team'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unsold Players Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-700 flex items-center">
              <span className="mr-2">❌</span> Unsold Players
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.unsold.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No unsold players</p>
              ) : (
                data.unsold.map((player) => (
                  <div key={player.id} className="flex items-center bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <Image
                      src={player.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwaDEwVjIySDR2LTEwaDE2VjIwWk0yNCAyNGMtNC40MiAwLTgtMy41OC04LThzMy41OC04IDgtOCA4IDMuNTggOCA4LTMuNTggOCA4IDh6IiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.type} • {player.category}</p>
                      <p className="text-sm font-medium text-red-700">Unsold</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Auto-refreshing every 2 seconds • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}