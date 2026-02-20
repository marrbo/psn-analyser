// lib/playstation-search.ts
import { 
  PlayStationSearchResponse, 
  ExtractedGameData, 
  MediaRole,
  SearchOptions 
} from '@/types/playstation';
import { PSNAuth } from './psn/auth';

export class PlayStationSearchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'PlayStationSearchError';
  }
}

export class PlayStationSearch {
  private readonly BASE_URL = 'https://m.np.playstation.com/api/graphql/v1/op';
  private readonly PERSISTED_QUERY = {
    version: 1,
    sha256Hash: 'ac5fb2b82c4d086ca0d272fba34418ab327a7762dd2cd620e63f175bbc5aff10'
  };

  private validateOptions(options: SearchOptions): void {
    if (!options.searchTerm?.trim()) {
      throw new PlayStationSearchError('Search term is required');
    }
  }

  private constructHeaders(): HeadersInit {
    const authorizationToken = new PSNAuth().getAccessToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authorizationToken}`,
      'apollographql-client-name': 'PlayStationApp-Android',
      'extensions': JSON.stringify({
        persistedQuery: this.PERSISTED_QUERY
      }),
      'Accept': 'application/json',
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
    };
  }

  private constructBody(options: SearchOptions): any {
    return {
      variables: {
        searchTerm: options.searchTerm.trim(),
        searchContext: options.searchContext || 'MobileUniversalSearchGame',
        searchDomain: options.searchDomain || 'MobileGames',
        displayTitleLocale: options.locale || 'pt-BR',
        localizedStoreDisplayClassification: 'Jogo completo'
      },
      extensions: {
        persistedQuery: this.PERSISTED_QUERY
      }
    };
  }

  private constructParams(pageSize: number): URLSearchParams {
    const params = new URLSearchParams();
    params.append('operationName', 'metGetContextSearchResults');
    params.append('pageSize', pageSize.toString());
    return params;
  }

  private extractMediaByRole(media: any[], roles: MediaRole[]): Record<string, string> {
    const extracted: Record<string, string> = {};
    
    for (const role of roles) {
      const mediaItem = media.find(m => m.role === role);
      if (mediaItem?.url) {
        // Convert role to camelCase for object key
        const key = role.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        extracted[key] = mediaItem.url;
      }
    }
    
    return extracted;
  }

  private extractGameData(item: any): ExtractedGameData | null {
    try {
      const game = item.result;
      const defaultProduct = game.defaultProduct || game;
      
      // Use media from defaultProduct if available, otherwise from concept
      const mediaSource = defaultProduct.media || game.media || [];
      
      // Extract required media roles
      const mediaRoles: MediaRole[] = [
        'EDITION_KEY_ART',
        'FOUR_BY_THREE_BANNER',
        'PREVIEW',
        'GAMEHUB_COVER_ART',
        'LOGO',
        'PORTRAIT_BANNER',
        'MASTER'
      ];
      
      const extractedMedia = this.extractMediaByRole(mediaSource, mediaRoles);
      
      return {
        id: game.id,
        name: game.name || game.invariantName,
        platforms: game.platforms || defaultProduct.platforms || [],
        media: extractedMedia,
        highlight: item.highlight?.name?.filter(Boolean) || [],
        storeDisplayClassification: game.localizedStoreDisplayClassification || 
                                   game.storeDisplayClassification,
        type: game.type || defaultProduct.type
      };
    } catch (error) {
      console.warn('Failed to extract game data:', error);
      return null;
    }
  }

  private async makeRequest(url: string, options: RequestInit): Promise<PlayStationSearchResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const auth = new PSNAuth();
    const token = await auth.getAccessToken();
    
    if (!token) {
      throw new PlayStationSearchError('Failed to obtain authorization token');
    }

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        throw new PlayStationSearchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data?.data?.universalContextSearch?.results) {
        throw new PlayStationSearchError('Invalid response structure from PlayStation API');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof PlayStationSearchError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new PlayStationSearchError('Request timeout after 30 seconds');
      }
      
      throw new PlayStationSearchError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  async search(options: SearchOptions): Promise<ExtractedGameData[]> {
    try {
      this.validateOptions(options);
      
      const pageSize = options.pageSize || 1;
      const url = `${this.BASE_URL}?${this.constructParams(pageSize)}`;
      const headers = this.constructHeaders();
      const body = this.constructBody(options);

      const data = await this.makeRequest(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-cache',
        redirect: 'follow'
      });

      // Extract games from all domains
      const allGames: ExtractedGameData[] = [];
      
      for (const domainResult of data.data.universalContextSearch.results) {
        if (domainResult.domain === 'MobileGames') {
          for (const item of domainResult.searchResults) {
            const extracted = this.extractGameData(item);
            if (extracted) {
              allGames.push(extracted);
            }
          }
        }
      }

      return allGames;
    } catch (error) {
      if (error instanceof PlayStationSearchError) {
        throw error;
      }
      
      throw new PlayStationSearchError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async searchWithPagination(
    options: SearchOptions, 
    maxPages: number = 3
  ): Promise<{ games: ExtractedGameData[]; totalCount: number }> {
    const allGames: ExtractedGameData[] = [];
    let currentPage = 1;
    let nextCursor: string | null = null;
    let totalCount = 0;

    try {

      while (currentPage <= maxPages) {
        const pageOptions = { ...options };
        
        // For subsequent pages, we would need to implement cursor-based pagination
        // based on the 'next' field in the response
        // This is a simplified version - actual implementation would need to handle the cursor
        const games = await this.search(pageOptions);
        allGames.push(...games);
        
        // In a real implementation, you would extract 'next' cursor and continue
        if (games.length === 0 || !nextCursor) {
          break;
        }
        
        currentPage++;
      }

      return {
        games: allGames,
        totalCount: allGames.length
      };
    } catch (error) {
      throw new PlayStationSearchError(
        `Pagination search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  filterByPlatform(games: ExtractedGameData[], platforms: string[]): ExtractedGameData[] {
    if (!platforms.length) return games;
    
    return games.filter(game => 
      game.platforms.some(platform => 
        platforms.some(p => 
          platform.toLowerCase().includes(p.toLowerCase())
        )
      )
    );
  }

  sortGames(games: ExtractedGameData[], sortBy: 'name' | 'platforms' = 'name'): ExtractedGameData[] {
    return [...games].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by number of platforms (more platforms first)
        return b.platforms.length - a.platforms.length;
      }
    });
  }
}