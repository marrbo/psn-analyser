// src/lib/trophies.ts
import { getMockProfile } from './mock-data';
import { PSNAuthService } from './psn-auth';

export class PSNAuth {
  private authService: PSNAuthService;

  constructor() {
    this.authService = PSNAuthService.getInstance();
  }

  public async getToken(): Promise<string> {
    await this.authService.refreshTokenIfNeeded();
    const auth = await this.authService.authenticate();
    const token: string = auth?.accessToken;
    if (!token) {
      throw new Error('No PSN authentication token available');
    }
    return token;
  }
}

export class TrophyService {
  private auth: PSNAuth | null;

  constructor(auth: PSNAuth | null) {
    this.auth = auth;
  }

  async makeUniversalSearch(searchTerm: string) {
    if (!this.auth) {
      throw new Error('Authentication required for PSN API');
    }

    const token = await this.auth.getToken();

    const response = await fetch(
      `https://m.np.playstation.com/api/search/v1/content/universal?query=${encodeURIComponent(searchTerm)}&country=BR&language=pt-BR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`PSN API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getCompleteProfile(psnId: string) {
    try {
      if (!this.auth) {
        console.log('No authentication available, using mock data');
        return getMockProfile(psnId);
      }

      const token = await this.auth.getToken();

      // Tentar buscar dados reais
      const profileResponse = await fetch(
        `https://m.np.playstation.com/api/userProfile/v1/internal/users/${psnId}/profiles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
      }

      const profileData = await profileResponse.json();

      // Buscar troféus
      const trophiesResponse = await fetch(
        `https://m.np.playstation.com/api/trophy/v1/users/${psnId}/titles?fields=@default,trophyCount,earnedTrophies,progress,lastPlayedDateTime&npLanguage=pt-BR`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!trophiesResponse.ok) {
        throw new Error(`Failed to fetch trophies: ${trophiesResponse.statusText}`);
      }

      const trophiesData = await trophiesResponse.json();

      return {
        accountId: psnId,
        profile: profileData,
        games: this.transformGamesData(trophiesData.titles || [])
      };

    } catch (error) {
      console.warn('PSN API failed, using mock data:', error);
      return getMockProfile(psnId);
    }
  }


  private transformGamesData(titles: any[]): Game[] {
    return titles.map(title => ({
      title: title.trophyTitleName || 'Unknown',
      platform: title.trophyTitlePlatform || 'PS4',
      trophyCount: {
        bronze: title.definedTrophies?.bronze || 0,
        silver: title.definedTrophies?.silver || 0,
        gold: title.definedTrophies?.gold || 0,
        platinum: title.definedTrophies?.platinum || 0
      },
      earnedTrophies: {
        bronze: title.earnedTrophies?.bronze || 0,
        silver: title.earnedTrophies?.silver || 0,
        gold: title.earnedTrophies?.gold || 0,
        platinum: title.earnedTrophies?.platinum || 0
      },
      progress: title.progress || 0,
      lastPlayed: new Date(title.lastPlayedDateTime || Date.now()),
      genre: this.determineGenre(title.trophyTitleName),
      timeToPlatinum: this.calculateTimeToPlatinum(title),
      metacriticScore: this.getMetacriticScore(title.trophyTitleName),
      isGoty: this.isGotyGame(title.trophyTitleName),
      difficulty: this.calculateDifficulty(title),
      rarity: this.calculateRarity(title)
    }));
  }

  private determineGenre(gameTitle: string): string {
    // Lógica para determinar gênero baseado no título
    const actionKeywords = ['action', 'adventure', 'war', 'battle', 'combat'];
    const rpgKeywords = ['rpg', 'role', 'fantasy', 'dragon', 'final fantasy'];
    const platformKeywords = ['platform', 'mario', 'sonic', 'crash'];

    const lowerTitle = gameTitle.toLowerCase();

    if (actionKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'Action/Adventure';
    } else if (rpgKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'RPG';
    } else if (platformKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'Platform';
    }

    return 'Other';
  }

  private calculateTimeToPlatinum(title: any): number {
    // Lógica para estimar tempo para platina
    const totalTrophies = title.definedTrophies?.bronze + title.definedTrophies?.silver +
      title.definedTrophies?.gold + title.definedTrophies?.platinum;

    // Estimativa baseada na complexidade
    if (totalTrophies <= 20) return 20; // Jogos curtos
    if (totalTrophies <= 40) return 40; // Jogos médios
    return 80; // Jogos longos
  }

  private getMetacriticScore(gameTitle: string): number {
    // Lógica para obter nota do Metacritic (poderia ser uma API externa)
    const scores: { [key: string]: number } = {
      'the last of us': 95,
      'god of war': 94,
      'bloodborne': 92,
      'hollow knight': 90,
      'persona 5': 93
    };

    return scores[gameTitle.toLowerCase()] || 75;
  }

  private isGotyGame(gameTitle: string): boolean {
    const gotyGames = [
      'the last of us',
      'god of war',
      'bloodborne',
      'hollow knight',
      'elden ring'
    ];

    return gotyGames.some(goty => gameTitle.toLowerCase().includes(goty));
  }

  private calculateDifficulty(title: any): number {
    // Lógica para calcular dificuldade baseada na raridade dos troféus
    const platinumRarity = title.earnedTrophies?.platinum === 0 ? 100 : 50;
    return Math.max(1, Math.min(10, Math.round(platinumRarity / 10)));
  }

  private calculateRarity(title: any): number {
    // Lógica para calcular raridade média
    return title.earnedTrophies?.platinum === 0 ? 30 : 15;
  }

  private getMockProfile(psnId: string) {
    // Retornar dados mockados para desenvolvimento
    const mockGames = [];
    return {
      accountId: psnId,
      games: mockGames
    };
  }
}