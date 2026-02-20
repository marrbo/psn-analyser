// components/PlayStationSearchForm.tsx
'use client';

import { useState, FormEvent } from 'react';

interface PlayStationSearchFormProps {
  onSearch: (searchTerm: string, pageSize?: number, filters?: {
    platforms?: string[];
    classification?: string;
    type?: string;
  }) => Promise<void>;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  showFilters?: boolean;
}

export function PlayStationSearchForm({ 
  onSearch, 
  onClear,
  loading,
  error,
  showFilters = true 
}: PlayStationSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [classificationFilter, setClassificationFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    try {
      const filters: {
        platforms?: string[];
        classification?: string;
        type?: string;
      } = {};
      
      if (platformFilter.length > 0) {
        filters.platforms = platformFilter;
      }
      
      if (classificationFilter) {
        filters.classification = classificationFilter;
      }
      
      await onSearch(searchTerm, pageSize, filters);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setPlatformFilter(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="search">
            Game Name
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter game name (e.g., Rogue Company)"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        
        {showFilters && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Filter by Platform
              </label>
              <div className="flex flex-wrap gap-2">
                {['PS5', 'PS4', 'PS3', 'PS Vita'].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      platformFilter.includes(platform)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="classification">
                Classification
              </label>
              <select
                id="classification"
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
                disabled={loading}
              >
                <option value="">All Classifications</option>
                <option value="Jogo completo">Full Game</option>
                <option value="Demo">Demo</option>
                <option value="Beta">Beta</option>
              </select>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="pageSize">
            Results per page
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
            disabled={loading}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Search Games'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setPlatformFilter([]);
              setClassificationFilter('');
              onClear();
            }}
            disabled={loading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}