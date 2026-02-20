// hooks/usePlayStationSearch.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { PlayStationService } from '@/lib/playstation-service';
import { ExtractedGameData } from '@/types/playstation';

interface UsePlayStationSearchResult {
  games: ExtractedGameData[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  searchGames: (searchTerm: string, pageSize?: number) => Promise<void>;
  searchWithFilter: (
    searchTerm: string, 
    filters: {
      platforms?: string[];
      classification?: string;
      type?: string;
    }
  ) => Promise<void>;
  clearResults: () => void;
  getGameDetails: (gameId: string) => Promise<ExtractedGameData | null>;
}

export function usePlayStationSearch(): UsePlayStationSearchResult {
  const [games, setGames] = useState<ExtractedGameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Usar useRef para manter uma instância persistente do serviço
  const serviceRef = useRef<PlayStationService | null>(null);
  
  if (!serviceRef.current) {
    serviceRef.current = new PlayStationService();
  }
  
  const service = serviceRef.current;

  const searchGames = useCallback(async (searchTerm: string, pageSize: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await service.searchGames(searchTerm, pageSize);
      setGames(results);
      setTotalCount(results.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search games';
      setError(errorMessage);
      setGames([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const searchWithFilter = useCallback(async (
    searchTerm: string,
    filters: {
      platforms?: string[];
      classification?: string;
      type?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await service.searchWithFilter(searchTerm, filters);
      setGames(results);
      setTotalCount(results.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search games with filters';
      setError(errorMessage);
      setGames([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const clearResults = useCallback(() => {
    setGames([]);
    setError(null);
    setTotalCount(0);
  }, []);

  const getGameDetails = useCallback(async (gameId: string) => {
    try {
      return await service.getGameDetails(gameId);
    } catch (err) {
      console.error('Failed to get game details:', err);
      return null;
    }
  }, [service]);

  return {
    games,
    loading,
    error,
    totalCount,
    searchGames,
    searchWithFilter,
    clearResults,
    getGameDetails
  };
}