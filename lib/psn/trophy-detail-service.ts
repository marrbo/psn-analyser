// lib/psn/trophy-detail-service.ts
import { PSNAuth } from './auth';
import { connectToDatabase } from '../../mongodb';

interface TrophyGroup {
  trophyGroupId: string;
  trophyGroupName: string;
  trophyGroupIconUrl: string;
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

interface TrophyDetail {
  trophyId: number;
  trophyHidden: boolean;
  trophyType: 'bronze' | 'silver' | 'gold' | 'platinum';
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyRare: number;
  trophyEarnedRate: number;
  earned: boolean;
  earnedDateTime?: string;
  progress?: number;
  trophyProgressTarget?: number;
}

export class PSNAuthTrophyDetailService {
  private auth: PSNAuth;

  constructor() {
    this.auth = new PSNAuth();
  }

  async getGameTrophyGroups(npCommunicationId: string): Promise<TrophyGroup[]> {
    const token = await this.auth.getToken();
    
    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar grupos de troféus: ${response.status}`);
    }

    const data = await response.json();
    return data.trophyGroups || [];
  }

  async getUserTrophiesForGame(accountId: string, npCommunicationId: string, trophyGroupId: string = 'default'): Promise<TrophyDetail[]> {
    const token = await this.auth.getToken();
    
    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar troféus do usuário: ${response.status}`);
    }

    const data = await response.json();
    return data.trophies || [];
  }

  async getGameTrophies(npCommunicationId: string, trophyGroupId: string = 'default'): Promise<TrophyDetail[]> {
    const token = await this.auth.getToken();
    
    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar troféus do jogo: ${response.status}`);
    }

    const data = await response.json();
    return data.trophies || [];
  }
}

// Serviço de cache para troféus
export class TrophyCacheService {
  async getCachedGame(npCommunicationId: string): Promise<any> {
    const { db } = await connectToDatabase();
    return await db.collection('games').findOne({ npCommunicationId });
  }

  async cacheGame(gameData: any): Promise<void> {
    const { db } = await connectToDatabase();
    
    await db.collection('games').updateOne(
      { npCommunicationId: gameData.npCommunicationId },
      { 
        $set: {
          ...gameData,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );
  }

  async getCachedTrophies(npCommunicationId: string): Promise<any[]> {
    const { db } = await connectToDatabase();
    return await db.collection('trophies')
      .find({ npCommunicationId })
      .sort({ trophyId: 1 })
      .toArray();
  }

  async cacheTrophies(trophies: any[]): Promise<void> {
    const { db } = await connectToDatabase();
    
    for (const trophy of trophies) {
      await db.collection('trophies').updateOne(
        { 
          npCommunicationId: trophy.npCommunicationId,
          trophyId: trophy.trophyId
        },
        { 
          $set: {
            ...trophy,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );
    }
  }

  async cacheUserTrophies(userTrophies: any[]): Promise<void> {
    const { db } = await connectToDatabase();
    
    for (const userTrophy of userTrophies) {
      await db.collection('user_trophies').updateOne(
        { 
          accountId: userTrophy.accountId,
          npCommunicationId: userTrophy.npCommunicationId,
          trophyId: userTrophy.trophyId
        },
        { 
          $set: {
            ...userTrophy,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );
    }
  }

  async getUserTrophies(accountId: string, npCommunicationId: string): Promise<any[]> {
    const { db } = await connectToDatabase();
    return await db.collection('user_trophies')
      .find({ 
        accountId,
        npCommunicationId 
      })
      .toArray();
  }
}

// Serviço principal de análise de raridade
export class TrophyRarityService {
  private detailService: PSNAuthTrophyDetailService;
  private cacheService: TrophyCacheService;

  constructor() {
    this.detailService = new PSNAuthTrophyDetailService();
    this.cacheService = new TrophyCacheService();
  }

  async analyzeGameRarity(accountId: string, npCommunicationId: string, gameTitle: string) {
    console.log(`🎯 Analisando raridade do jogo: ${gameTitle}`);

    try {
      // Verificar cache primeiro
      const cachedGame = await this.cacheService.getCachedGame(npCommunicationId);
      const cachedTrophies = await this.cacheService.getCachedTrophies(npCommunicationId);
      const cachedUserTrophies = await this.cacheService.getUserTrophies(accountId, npCommunicationId);

      let gameTrophies = cachedTrophies;
      let userTrophies = cachedUserTrophies;

      // Se não tem cache, buscar da API
      if (!cachedGame || gameTrophies.length === 0) {
        console.log(`🔄 Buscando dados da PSN para: ${gameTitle}`);
        
        // Buscar grupos de troféus
        const trophyGroups = await this.detailService.getGameTrophyGroups(npCommunicationId);
        
        // Buscar troféus de cada grupo
        gameTrophies = [];
        for (const group of trophyGroups) {
          const groupTrophies = await this.detailService.getGameTrophies(npCommunicationId, group.trophyGroupId);
          const trophiesWithGroup = groupTrophies.map(trophy => ({
            ...trophy,
            npCommunicationId,
            trophyGroup: group.trophyGroupId,
            trophyGroupName: group.trophyGroupName
          }));
          gameTrophies.push(...trophiesWithGroup);
        }

        // Cache dos troféus do jogo
        await this.cacheService.cacheTrophies(gameTrophies);

        // Cache do jogo
        await this.cacheService.cacheGame({
          npCommunicationId,
          title: gameTitle,
          trophySetVersion: '01.00', // Você pode obter isso da API principal
          platform: 'PS4/PS5', // Você pode obter isso da API principal
          definedTrophies: this.calculateDefinedTrophies(gameTrophies),
          genres: [],
          firstReleased: null,
          lastUpdated: new Date()
        });
      }

      // Buscar troféus do usuário se não tem cache
      if (userTrophies.length === 0) {
        console.log(`🔄 Buscando troféus do usuário para: ${gameTitle}`);
        
        const trophyGroups = await this.detailService.getGameTrophyGroups(npCommunicationId);
        userTrophies = [];

        for (const group of trophyGroups) {
          const userGroupTrophies = await this.detailService.getUserTrophiesForGame(
            accountId, 
            npCommunicationId, 
            group.trophyGroupId
          );
          
          const userTrophiesWithMeta = userGroupTrophies.map(trophy => ({
            accountId,
            npCommunicationId,
            trophyId: trophy.trophyId,
            earned: trophy.earned,
            earnedDateTime: trophy.earnedDateTime ? new Date(trophy.earnedDateTime) : null,
            progress: trophy.progress || 0,
            lastUpdated: new Date()
          }));

          userTrophies.push(...userTrophiesWithMeta);
        }

        await this.cacheService.cacheUserTrophies(userTrophies);
      }

      // Calcular estatísticas de raridade
      return this.calculateRarityStats(gameTrophies, userTrophies);

    } catch (error) {
      console.error(`💥 Erro ao analisar raridade de ${gameTitle}:`, error);
      throw error;
    }
  }

  private calculateDefinedTrophies(trophies: any[]) {
    return trophies.reduce((acc, trophy) => {
      acc[trophy.trophyType] = (acc[trophy.trophyType] || 0) + 1;
      return acc;
    }, { bronze: 0, silver: 0, gold: 0, platinum: 0 });
  }

  private calculateRarityStats(gameTrophies: any[], userTrophies: any[]) {
    const earnedTrophyIds = new Set(
      userTrophies
        .filter(t => t.earned)
        .map(t => t.trophyId)
    );

    const rarityStats = {
      common: { count: 0, trophies: [] as any[] },
      uncommon: { count: 0, trophies: [] as any[] },
      rare: { count: 0, trophies: [] as any[] },
      epic: { count: 0, trophies: [] as any[] },
      legendary: { count: 0, trophies: [] as any[] },
      totalEarned: 0,
      totalTrophies: gameTrophies.length,
      completionPercentage: 0
    };

    gameTrophies.forEach(trophy => {
      const earned = earnedTrophyIds.has(trophy.trophyId);
      const rarity = this.classifyRarity(trophy.trophyEarnedRate);

      if (earned) {
        rarityStats[rarity].count++;
        rarityStats[rarity].trophies.push(trophy);
        rarityStats.totalEarned++;
      }
    });

    rarityStats.completionPercentage = gameTrophies.length > 0 
      ? (rarityStats.totalEarned / gameTrophies.length) * 100 
      : 0;

    return rarityStats;
  }

  private classifyRarity(earnedRate: number): string {
    if (earnedRate >= 50) return 'common';
    if (earnedRate >= 25) return 'uncommon';
    if (earnedRate >= 10) return 'rare';
    if (earnedRate >= 5) return 'epic';
    return 'legendary';
  }

  async getUserOverallRarity(accountId: string, games: any[]) {
    console.log(`📊 Calculando raridade geral do usuário`);

    const overallRarity = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      totalEarned: 0,
      totalTrophies: 0
    };

    // Amostrar alguns jogos para análise (para performance)
    const sampleGames = games.slice(0, 20); // Analisar até 20 jogos

    for (const game of sampleGames) {
      try {
        const gameRarity = await this.analyzeGameRarity(
          accountId, 
          game.npCommunicationId, 
          game.title
        );

        overallRarity.common += gameRarity.common.count;
        overallRarity.uncommon += gameRarity.uncommon.count;
        overallRarity.rare += gameRarity.rare.count;
        overallRarity.epic += gameRarity.epic.count;
        overallRarity.legendary += gameRarity.legendary.count;
        overallRarity.totalEarned += gameRarity.totalEarned;
        overallRarity.totalTrophies += gameRarity.totalTrophies;

      } catch (error) {
        console.warn(`⚠️ Não foi possível analisar raridade de ${game.title}`);
      }
    }

    return overallRarity;
  }
}