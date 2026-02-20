// lib/playstation-service.ts
// import { PSNAuth } from './psn/auth';
import { 
  ExtractedGameData, 
} from '@/types/playstation';

export class PlayStationService {
  // private auth: PSNAuth;
  private readonly API_BASE = '/api/playstation';

  constructor() {
    // this.auth = new PSNAuth();
  }

  async searchGames(
    searchTerm: string, 
    pageSize: number = 20,
    locale: string = 'pt-BR'
  ): Promise<ExtractedGameData[]> {
    try {
      const response = await fetch(`${this.API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm,
          pageSize,
          locale
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Search games error:', error);
      throw error;
    }
  }

  async searchWithFilter(
    searchTerm: string,
    filters: {
      platforms?: string[];
      classification?: string;
      type?: string;
    },
    pageSize: number = 20
  ): Promise<ExtractedGameData[]> {
    const games = await this.searchGames(searchTerm, pageSize);
    
    return games.filter(game => {
      if (filters.platforms && filters.platforms.length > 0) {
        const hasPlatform = game.platforms.some(platform =>
          filters.platforms!.some(filter => 
            platform.toLowerCase().includes(filter.toLowerCase())
          )
        );
        if (!hasPlatform) return false;
      }

      if (filters.classification && game.storeDisplayClassification) {
        if (!game.storeDisplayClassification.toLowerCase().includes(
          filters.classification.toLowerCase()
        )) return false;
      }

      if (filters.type && game.type) {
        if (!game.type.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  async getGameDetails(gameId: string): Promise<ExtractedGameData | null> {
    try {
      // Esta é uma rota hipotética - você pode expandir para buscar detalhes específicos
      const games = await this.searchGames(gameId, 1);
      return games[0] || null;
    } catch (error) {
      console.error('Get game details error:', error);
      return null;
    }
  }

  extractMediaUrls(game: ExtractedGameData) {
    const { media } = game;
    return {
      trailer: media.preview,
      cover: media.editionKeyArt || media.gamehubCoverArt,
      logo: media.logo,
      banner: media.portraitBanner || media.fourByThreeBanner,
      master: media.master
    };
  }
}