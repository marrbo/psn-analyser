// app/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { PlayStationSearchForm } from '@/app/components/PlayStationSearchForm';
import { PlayStationGameCard } from '@/app/components/PlayStationGameCard';
import { usePlayStationSearch } from '@/hooks/usePlayStationSearch';

export default function HomePage() {
  const { 
    games, 
    loading, 
    error, 
    totalCount, 
    searchGames, 
    searchWithFilter,
    clearResults 
  } = usePlayStationSearch();
  
  const [activeTab, setActiveTab] = useState<'search' | 'results'>('search');
  const [lastSearchTerm, setLastSearchTerm] = useState('');

  const handleSearch = useCallback(async (
    searchTerm: string, 
    pageSize: number = 20,
    filters?: {
      platforms?: string[];
      classification?: string;
      type?: string;
    }
  ) => {
    setLastSearchTerm(searchTerm);
    
    if (filters && (filters.platforms || filters.classification || filters.type)) {
      await searchWithFilter(searchTerm, filters);
    } else {
      await searchGames(searchTerm, pageSize);
    }
    
    // Muda para a aba de resultados após a busca
    setActiveTab('results');
  }, [searchGames, searchWithFilter]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative h-12 w-12">
                {/* Adicione sua logo PlayStation aqui */}
                <div className="h-full w-full bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg">PS</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">PlayStation Game Search</h1>
                <p className="text-gray-400 text-sm">Find and explore PlayStation games</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded transition-colors ${
                  activeTab === 'results'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                disabled={totalCount === 0}
              >
                Results ({totalCount})
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar de busca */}
          <div className={`lg:col-span-1 ${activeTab === 'search' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-6">Search Games</h2>
              
              <PlayStationSearchForm 
                onSearch={handleSearch}
                onClear={clearResults}
                loading={loading}
                error={error}
                showFilters={true}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="font-semibold mb-3">Search Tips</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Use specific game titles for best results</li>
                  <li>• Try filtering by platform to narrow results</li>
                  <li>• Results include images, videos, and game details</li>
                  <li>• All data is sourced from PlayStation Network</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Área de resultados */}
          <div className={`lg:col-span-2 ${activeTab === 'results' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Search Results
                    {lastSearchTerm && (
                      <span className="ml-2 text-gray-400 text-base font-normal">
                        for "{lastSearchTerm}"
                      </span>
                    )}
                  </h2>
                  {totalCount > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {totalCount} game{totalCount !== 1 ? 's' : ''} found
                    </p>
                  )}
                </div>
                
                {totalCount > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={clearResults}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors"
                    >
                      New Search
                    </button>
                  </div>
                )}
              </div>
              
              {error ? (
                <div className="p-6 bg-red-900/30 border border-red-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                  <p className="text-red-300">{error}</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Searching PlayStation Network...</p>
                    {lastSearchTerm && (
                      <p className="text-gray-500 text-sm mt-2">Searching for "{lastSearchTerm}"</p>
                    )}
                  </div>
                </div>
              ) : totalCount === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold mb-2">No games found</h3>
                  <p className="text-gray-400 mb-4">
                    {lastSearchTerm 
                      ? `No results found for "${lastSearchTerm}"`
                      : 'Try searching for a PlayStation game'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
                  >
                    Start New Search
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <PlayStationGameCard key={game.id} game={game} />
                    ))}
                  </div>
                  
                  {totalCount > games.length && (
                    <div className="text-center pt-6 border-t border-gray-700">
                      <p className="text-gray-400 mb-4">
                        Showing {games.length} of {totalCount} games
                      </p>
                      <button
                        onClick={() => handleSearch(lastSearchTerm, totalCount)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
                      >
                        Load All Results ({totalCount} total)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 border-t border-gray-800 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-500 text-sm">
            This application uses the PlayStation Network API for educational purposes.
            All game data is property of Sony Interactive Entertainment.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Not affiliated with Sony Interactive Entertainment or PlayStation.
          </p>
        </div>
      </footer>
    </div>
  );
}