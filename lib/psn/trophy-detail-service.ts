// lib/psn/trophy-detail-service.ts
import { PSNAuth } from './auth';
import { connectToDatabase } from '../mongodb';
import { TrophyGroup, TrophyDetail, RarityStats, DefinedTrophies } from '../../types/trophies';
import { CacheService } from './cache-service';
import { PSNUser } from '@/types/psn';

export class PSNAuthTrophyDetailService {
  private readonly auth: PSNAuth;

  constructor() {
    this.auth = new PSNAuth();
  }

  async getGameTrophyGroups(npCommunicationId: string, needExtraParams: boolean = false): Promise<TrophyGroup[]> {
    const token = await this.auth.getAccessToken();
    const extraParams = '?npServiceName=trophy';

    let response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups${needExtraParams ? extraParams : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok && response.status === 404) {
      return this.getGameTrophyGroups(npCommunicationId, true);
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar grupos de troféus: ${response.status}`);
    }

    const data = await response.json();
    return data.trophyGroups || [];
  }

  async getUserTrophiesForGame(accountId: string, npCommunicationId: string, trophyGroupId: string = 'default', needExtraParams: boolean = false): Promise<TrophyDetail[]> {
    const token = await this.auth.getAccessToken();
    const extraParams = '?npServiceName=trophy&limit=500';
    // corrigido

    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies${needExtraParams ? extraParams : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok && response.status === 404) {
      return this.getUserTrophiesForGame(accountId, npCommunicationId, trophyGroupId, true);
    }
    else if (!response.ok) {
      throw new Error(`Erro ao buscar troféus do usuário: ${response.status}`);
    }

    const data = await response.json();
    return data.trophies || [];
  }

  async getGameTrophies(npCommunicationId: string, trophyGroupId: string = 'default', needExtraParams: boolean = false): Promise<TrophyDetail[]> {
    const token = await this.auth.getAccessToken();
    const extraParams = '?npServiceName=trophy';

    //corrigido

    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies${needExtraParams ? extraParams : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok && response.status === 404) {
      return this.getGameTrophies(npCommunicationId, trophyGroupId, true);
    } else if (!response.ok) {
      throw new Error(`Erro ao buscar troféus do jogo: ${npCommunicationId}, http.status: ${response.status}`);
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
  private readonly detailService: PSNAuthTrophyDetailService;
  private readonly cacheService: TrophyCacheService;

  constructor() {
    this.detailService = new PSNAuthTrophyDetailService();
    this.cacheService = new TrophyCacheService();
  }

  async analyzeGameRarity(accountId: string, npCommunicationId: string, gameTitle: string) {
    console.log(`🎯 Analisando raridade do jogo: ${npCommunicationId}`);

    try {
      // Verificar cache primeiro
      const cachedGame = await this.cacheService.getCachedGame(npCommunicationId);
      //const cachedTrophies = await this.cacheService.getCachedTrophies(npCommunicationId);
      //const cachedUserTrophies = await this.cacheService.getUserTrophies(accountId, npCommunicationId);
      const lastUpdated = new Date();
      const trophiesWithGroup: TrophyGroup[] = [];

      let gameTrophies = [];
      let userTrophies = [];
      let trophyGroups: TrophyGroup[] = [];

      // Se não tem cache, buscar da API
      if (!cachedGame) {
        console.log(`🔄 Buscando dados da PSN para: ${npCommunicationId}`);
        
        // Buscar grupos de troféus
        trophyGroups = await this.detailService.getGameTrophyGroups(npCommunicationId);
        
        gameTrophies = [];

        // Buscar troféus de cada grupo
        for (const group of trophyGroups) {
          console.log(`🔄 Buscando troféus do grupo: ID: ${group.trophyGroupId}, Name: ${group.trophyGroupName}`);

          const groupTrophies = await this.detailService.getGameTrophies(npCommunicationId, group.trophyGroupId);
          
          gameTrophies.push({
              trophyGroupId: group.trophyGroupId,
              trophyGroupName: group.trophyGroupName,
              trophyGroupIconUrl: group.trophyGroupIconUrl,
              definedTrophies: group.definedTrophies,
              trophies: groupTrophies,
              lastUpdated: lastUpdated
          });
        }

        // Cache dos troféus do jogo
        await this.cacheService.cacheTrophies(gameTrophies);

        gameTitle = gameTrophies[0].trophyGroupName;

        const definedTrophies = this.calculateDefinedTrophies(gameTrophies);

        // Cache do jogo
        await this.cacheService.cacheGame({
          npCommunicationId,
          title: gameTitle,
          trophySetVersion: '01.00', // Você pode obter isso da API principal
          platform: 'PS4/PS5', // Você pode obter isso da API principal
          definedTrophies: definedTrophies,
          trophies: gameTrophies,
          genres: [],
          firstReleased: null,
          lastUpdated: lastUpdated
        });
      }

      const psnUser: PSNUser | null = await new CacheService(accountId, 'users').getItem<PSNUser>();

      const rarityStats: RarityStats = {
        totalEarned: 0,
        totalTrophies: 0,
        earnedTrophies: {
          bronze: 0,
          silver: 0,
          gold: 0,
          platinum: 0
        },
        completionPercentage: 0,
        trophyGroups: [],
        gameName: gameTitle,
        psnUser: psnUser
      };

      // Buscar troféus do usuário se não tem cache
      if (userTrophies.length === 0) {
        console.log(`🔄 Buscando troféus do usuário para: ${gameTitle}`);
        
        if (gameTrophies.length === 0) {
          gameTrophies = await this.detailService.getGameTrophyGroups(npCommunicationId);
        }
        
        userTrophies = [];

        for (const group of gameTrophies) {
          const userGroupTrophies = await this.detailService.getUserTrophiesForGame(
            accountId, 
            npCommunicationId, 
            group.trophyGroupId
          );

          const userTrophiesWithMeta: TrophyGroup = ({
            accountId,
            npCommunicationId,
            trophyGroupId: group.trophyGroupId,
            trophyGroupName: group.trophyGroupName,
            trophyGroupIconUrl: group.trophyGroupIconUrl,
            definedTrophies: group.definedTrophies,
            userTrophies: [...userGroupTrophies],
            lastUpdated: lastUpdated
          });

          userTrophies.push(userTrophiesWithMeta);

          const stats = this.calculateRarityStats(userTrophiesWithMeta, userGroupTrophies);

          rarityStats.totalEarned += stats.totalEarned;
          rarityStats.totalTrophies += stats.totalTrophies;
          rarityStats.trophyGroups.push(stats.trophyGroups[0]);
        }

        await this.cacheService.cacheUserTrophies(userTrophies);
      }
      
      // Calcular estatísticas de raridade
      rarityStats.completionPercentage = rarityStats.totalTrophies > 0 ? (rarityStats.totalEarned / rarityStats.totalTrophies) * 100 : 0;
      return rarityStats;

    } catch (error) {
      console.error(`💥 Erro ao analisar raridade de ${gameTitle}:`, error);
      throw error;
    }
  }

  private calculateDefinedTrophies(trophies: TrophyGroup[]) {
    return trophies.flatMap<DefinedTrophies>(group => Object.values(group.definedTrophies));
  }

  private calculateRarityStats(gameTrophies: TrophyGroup, userTrophies: TrophyDetail[]): RarityStats {
    const earnedTrophyIds = userTrophies.filter(t => t.earned).map(t => t.trophyId);

    const rarityStats: RarityStats = {
      totalEarned: 0,
      totalTrophies: 0,
      earnedTrophies: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0
      },
      completionPercentage: 0,
      trophyGroups: [],
      gameName: gameTrophies.trophyGroupName
    };

    for (const trophy of userTrophies) {
      trophy.earned = earnedTrophyIds.includes(trophy.trophyId);

      if (trophy.earned) {
        rarityStats.totalEarned++;
      }

      rarityStats.totalTrophies++;
      const index = gameTrophies.userTrophies.findIndex(t => t.trophyId === trophy.trophyId );

      if (index < 0) {
        gameTrophies.trophies.push({
          trophyId: trophy.trophyId,
          trophyHidden: trophy.trophyHidden,
          trophyType: trophy.trophyType,
          trophyName: trophy.trophyName,
          trophyDetail: trophy.trophyDetail,
          trophyIconUrl: trophy.trophyIconUrl,
          trophyRare: trophy.trophyRare,
          trophyEarnedRate: trophy.trophyEarnedRate,
          earned: trophy.earned,
          earnedDateTime: trophy.earnedDateTime,
          progress: trophy.progress,
          trophyProgressTarget: trophy.trophyProgressTarget
        });
      } else {
        gameTrophies.trophies[index].trophyId = trophy.trophyId;
        gameTrophies.trophies[index].trophyHidden = trophy.trophyHidden;
        gameTrophies.trophies[index].trophyType = trophy.trophyType;
        gameTrophies.trophies[index].trophyName = trophy.trophyName;
        gameTrophies.trophies[index].trophyDetail = trophy.trophyDetail;
        gameTrophies.trophies[index].trophyIconUrl = trophy.trophyIconUrl;
        gameTrophies.trophies[index].trophyRare = trophy.trophyRare;
        gameTrophies.trophies[index].trophyEarnedRate = trophy.trophyEarnedRate;
        gameTrophies.trophies[index].earned = trophy.earned;
        gameTrophies.trophies[index].earnedDateTime = trophy.earnedDateTime;
        gameTrophies.trophies[index].progress = trophy.progress;
        gameTrophies.trophies[index].trophyProgressTarget = trophy.trophyProgressTarget;
      }
    }

    // TODO: Buscar da API percentual de conclusão do game
    rarityStats.completionPercentage = gameTrophies.userTrophies.length > 0 
      ? (rarityStats.totalEarned / gameTrophies.userTrophies.length) * 100 
      : 0;

    rarityStats.trophyGroups.push(gameTrophies);

    return rarityStats;
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