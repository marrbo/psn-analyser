// /lib/psn/trophy-service.ts
import { MongoClient, ObjectId } from 'mongodb';
import { PSNAuth } from './auth';
import { PSNUser, SocialMetadata } from '@/types/psn';
import { CacheService } from './cache-service';
import { metacriticScraper } from '../metacritc-scraper';
import { DefinedTrophies, GameTitle, GotyStats, TrophyDetail, TrophyGroup, TrophySummary, TrophyTitle } from '@/types/trophies';
import { CacheItem, GOTYGame, GotyMatchResult, ScoreBreakdown, ScoringFactors } from '@/types/analysis.type';
import { calculateNormalizedScore, getPlatinumCountsFromTrophies } from '../calcular-platinas';
import { userRepository } from '@/types/repository/user-repository';
import { AnalysisData, getAnalysis } from '../mongodb';
import { UserService } from './user-service';
import { normalizeText } from '../utils/text';
import { toDecimalHours } from '@/utils/durationUtils';
import { gameRepository } from '@/types/repository/game-repository';
import { NormalizedScore, UserPlatinumData } from '../score.types';
import { trophySumaryRepository } from '@/types/repository/trophy-repository';
import { analyseRepository } from '@/types/repository/analyse-repository';
import { gotyRepository } from '@/types/repository/goty-repository';

export default class PSNTrophyService {
  private readonly auth: PSNAuth;
  private readonly cache: Map<string, CacheItem<any>>;
  private readonly cacheTTL = 60 * 60 * 1000;
  private GOTY_GAMES_DATABASE: GOTYGame[] = [];

  constructor() {
    this.auth = new PSNAuth();
    this.cache = new Map<string, CacheItem<object>>();
    this.cacheTTL = 5 * 60 * 1000;
  }

  normalizeText(text: string): string {
    if (!text || text?.length < 1) return '';
    return `${text}`
      .toLowerCase()
      .replace(/ trophies/g,'')
      .replace(/troféus do /g,'')
      .replace(/troféus de /g,'')
      .replace(/ ps4™ e ps5™/g,'')
      .replace(/ trophy set/g,'')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/™/g,'')
      .replace(/®/g,'')
      .replace(/\/n/g,'')
      .trim();
  }

  async getLastAnalysis(analysisId: string) {
    const resultAnalysis: AnalysisData | null = await getAnalysis(analysisId);

    if (!resultAnalysis) return;

    resultAnalysis.renewAt = resultAnalysis.renewAt ? resultAnalysis.renewAt : new Date(new Date().getTime() + this.cacheTTL);

    if (resultAnalysis && resultAnalysis?.renewAt <= new Date()) {
      const _analysisId = resultAnalysis._id?.toJSON() || analysisId;
      const psnUser = await userRepository.findByLastAnalysisId(_analysisId);

      if (psnUser) {
        // const accountId = psnUser.accountId.toString();
        // const username = psnUser.onlineId;

        // const analysisData: AnalysisData | null = await this.getCompleteProfile(accountId);

        // const analysisId = await saveAnalysis(accountId, username, analysisData);

        // await this.updateUser(analysisId, accountId);

        // if (analysisData) {
        //   analysisData._id = new ObjectId(analysisId);
        // }

        resultAnalysis.psnUser = psnUser;
      }
    
      if (resultAnalysis.psnUser) {
        const presence = await UserService.getUserPresence(resultAnalysis?.psnUser.accountId);

        if (presence) {
          resultAnalysis.psnUser.userPresence = presence;
          if (resultAnalysis.psnUser._id) {
            const _id: ObjectId = resultAnalysis.psnUser._id;
            await userRepository.updateById(_id,
              {
                lastAnalysisId: analysisId,
                userPresence: resultAnalysis.psnUser.userPresence
              });
          }

        }
      }
    }

    return resultAnalysis;
  }

  async updateUser(analysisId: string, accountId: string) {
    const user = await userRepository.findByRegex('accountId', accountId);
    if (user) {
      userRepository.updatePartial(new ObjectId(user[0]._id), 'lastAnalysisId', analysisId);
    } else {
      const psnUser: PSNUser = {
        accountId,
        _cacheId: accountId,
        lastAnalysisId: analysisId,
      };
      userRepository.create(psnUser);
    }
  }

  async getPartialProfile(accountId: string, npCommunicationId: string): Promise<AnalysisData> {
    let returnAnalysis: AnalysisData;

    try {
      const token = await this.auth.getAccessToken();

      if (!token) {
        throw new Error('Erro ao obter token de autenticação');
      }

      const resultAnalysis: AnalysisData = (await analyseRepository.find({ _cacheId: accountId }))[0];

      returnAnalysis = resultAnalysis;

      this.GOTY_GAMES_DATABASE = await gotyRepository.getGOTYGames();
      const trophySummary = await this.getTrophySummary(accountId, token);

      if (resultAnalysis) {
        trophySummary.renewAt = resultAnalysis.renewAt;
        const gameIndex = resultAnalysis.games.findIndex(game => game.trophyTitle?.npCommunicationId === npCommunicationId);

        if (gameIndex === -1) {
          throw new Error('Jogo não encontrado');
        }

        let gameUpdated = await this.getGameTrophyList(accountId, token, resultAnalysis.games[gameIndex]);
        gameUpdated = await this.transformGameData(gameUpdated, accountId);
        
        resultAnalysis.games[gameIndex] = JSON.parse(JSON.stringify(gameUpdated));
        resultAnalysis.trophySummary = trophySummary;
        resultAnalysis.renewAt = new Date(new Date().setHours(new Date().getHours() + 1));
        resultAnalysis.lastAccessed = new Date();

        await analyseRepository.updateById(new ObjectId(resultAnalysis._id), resultAnalysis);

        returnAnalysis = resultAnalysis;
      }
      
    } catch (error) {
      console.error('💥 Erro ao atualizar jogo:', error);
      throw error;
    }

    return returnAnalysis;
  }

  async getCompleteProfile(accountId: string): Promise<AnalysisData> {
    try {

      const token = await this.auth.getAccessToken();

      if (!token) {
        throw new Error('Erro ao obter token de autenticação');
      }

      // await metacriticScraper.scrapeMultiplePages(584);


      this.GOTY_GAMES_DATABASE = await gotyRepository.find({ sort: { ano_premiacao: -1 } });
      const trophySummary = await this.getTrophySummary(accountId, token);

      // const allTitles = await this.getUserTitlesWithPaginationOld(accountId, token);

      const allTitlesPurchased = await this.getUserTitlesWithPagination(accountId, token);

      // Usado uma vez para fazer scraper da página do Metacritic
      // const metacritcScraper = new MetacriticScraper();
      // await metacritcScraper.scrapeMultiplePages(300);

      // allTitles.forEach((game: TrophyTitle) => {
      //   const name = normalizeText(game.trophyTitleName);

      //   let titleFinded = undefined;
      //   const filtered = allTitlesPurchased
      //     .filter((t: GameTitle) => t.category.toLocaleUpperCase().includes(game.trophyTitlePlatform))
        
      //   titleFinded = filtered.find((t: GameTitle) => {
      //     if (this.normalizeText(t.name) === name ||
      //       this.normalizeText(t.sortableName) === name ||
      //       this.normalizeText(t.localizedName) === name ||
      //       this.normalizeText(t.concept?.localizedName.metadata["en-US"]) === name) {
      //         return t;
      //       }
      //   });

      //   if (!titleFinded) {
      //     titleFinded = filtered.find((t: GameTitle) => {
      //       if (name.includes(this.normalizeText(t.name)) || 
      //         t.name.includes(this.normalizeText(name))){
      //           return t;
      //         }
      //     });
      //   }

      //   if (titleFinded) {
      //     game.gameTitle = titleFinded;
      //   } 
      // });

      let allGames: GameTitle[] = await this.processGamesInBatches(allTitlesPurchased, accountId, token);
      allGames = allGames.filter(game => game.trophyTitle && game?.trophyTitle?.definedTrophies && Object.values(game?.trophyTitle?.definedTrophies).reduce((a, b) => a + b, 0) > 0);

      const batchPromises = allGames.map((game) => {
        return this.transformGameData(game, accountId);
      });

      allGames = await Promise.all(batchPromises);

      // Calcular estatísticas GOTY
      const gotyStats = await this.getGotyStats(allGames);

      // Gerar análise completa
      const resultAnalysis = await this.generateAnalysis(trophySummary, allGames, gotyStats);

      const psnUser: PSNUser = await new CacheService(accountId, 'users').getItem<PSNUser>();

      const fullPsnProfile = await this.getUserProfile(psnUser.accountId);

      if (fullPsnProfile && !psnUser.fullProfile) {
        psnUser.fullProfile = fullPsnProfile;
      }

      await new CacheService(accountId, 'users').setItem(psnUser);

      resultAnalysis.games.sort((a: GameTitle, b: GameTitle) => new Date(b.lastPlayedDateTime || b.lastUpdatedDateTime).getTime() - new Date(a.lastPlayedDateTime || a.lastUpdatedDateTime).getTime());

      const dadosProcessados: AnalysisData = {
        _cacheId: accountId,
        accountId,
        username: psnUser.onlineId,
        completionRate: resultAnalysis.completionRate,
        games: resultAnalysis.games,
        gotyStats: resultAnalysis.gotyStats,
        migueScore: resultAnalysis.migueScore,
        totalGames: resultAnalysis.totalGames,
        trophySummary,
        createdAt: new Date(),
        renewAt: new Date(new Date().setHours(new Date().getHours() + 1)),
        lastAccessed: new Date()
      };

      return dadosProcessados;
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
      throw error;
    }
  }

  private async getTrophySummary(accountId: string, token: string): Promise<TrophySummary> {

    let trophySummary: TrophySummary | null = await trophySumaryRepository.findByAccountId(accountId);

    if (!trophySummary || trophySummary?.renewAt < new Date()) {
      
      const response = await fetch(
        `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophySummary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'pt-BR',
            'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar sumário: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      trophySummary = {
        accountId,
        trophyLevel: data.trophyLevel || 1,
        trophyPoint: data.trophyPoint || 0,
        trophyLevelBasePoint: data.trophyLevelBasePoint || 0,
        trophyLevelNextPoint: data.trophyLevelNextPoint || 0,
        progress: data.progress || 0,
        tier: data.tier || 1,
        renewAt: new Date(Date.now() + this.cacheTTL),
        earnedTrophies: {
          bronze: data.earnedTrophies?.bronze || 0,
          silver: data.earnedTrophies?.silver || 0,
          gold: data.earnedTrophies?.gold || 0,
          platinum: data.earnedTrophies?.platinum || 0
        },
        totalTrophies: (data.earnedTrophies?.bronze || 0) +
          (data.earnedTrophies?.silver || 0) +
          (data.earnedTrophies?.gold || 0) +
          (data.earnedTrophies?.platinum || 0)
      };

      
      if (trophySummary) {
          await trophySumaryRepository.updateById( trophySummary?._id as ObjectId, trophySummary);
      } else {
          await trophySumaryRepository.create(trophySummary);
      }
    }

    return trophySummary;
  }

  private async getUserTitlesWithPaginationOld(accountId: string, token: string): Promise<TrophyTitle[]> {

    const allTitles: TrophyTitle[] = [];
    let offset = 0;
    const limit = 200;
    let hasMore = true;

    while (hasMore) {
      const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles?` +
        new URLSearchParams({
          'offset': offset.toString(),
          'limit': limit.toString()
        });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'pt-BR',
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro paginado ao buscar títulos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const titles = data.trophyTitles || [];

      allTitles.push(...data.trophyTitles);

      if (titles.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allTitles;
  }


  private async getGameTrophyListFromTitleId(accountId: string, token: string, titleId: string): Promise<TrophyTitle| undefined> {
    const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/titles/trophyTitles?` +
        new URLSearchParams({
          'npTitleIds': titleId,
        });

      const response =  await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'pt-BR',
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro paginado ao buscar títulos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.titles) {
        const trophyTitle: TrophyTitle = data.titles[0].trophyTitles[0];
        trophyTitle.npTitleId = data.titles[0].npTitleId;
        trophyTitle.titleId = trophyTitle.npTitleId;

        return trophyTitle;
      }

      return undefined;
  }

  private async getGameTrophyList(accountId: string, token: string, game: GameTitle): Promise<GameTitle> {
    
    if (game.titleId) {
      const title = await this.getGameTrophyListFromTitleId(accountId, token, game.titleId);

      if (title) {
        game.trophyTitle = title;
      }
    }

    return game;
  }

  private async getUserTitlesWithPagination(accountId: string, token: string): Promise<GameTitle[]> {
    const allTitles: GameTitle[] = [];
    let offset = 0;
    const limit = 200;
    let hasMore = true;

    while (hasMore) {
      const url = `https://m.np.playstation.com/api/gamelist/v2/users/${accountId}/titles?` +
        new URLSearchParams({
          'offset': offset.toString(),
          'limit': limit.toString()
        });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'pt-BR',
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro paginado ao buscar títulos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const titles = data.titles || [];

      
      const validTitles = titles.filter((title: GameTitle) => !['ps4_nongame_mini_app', 'ps5_native_media_app'].includes(title.category));

      allTitles.push(...validTitles);

      if (titles.length < limit) {
        hasMore = false;
        
      } else {
        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allTitles;
  }

  private async processGamesInBatches(
    games: GameTitle[],
    accountId: string,
    token: string
  ): Promise<GameTitle[]> {
    
    const batchSize = 100;

    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      const batchPromises = batch.map((title) => {
        return this.getGameTrophyList(accountId, token, title);
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`${result.value.localizedName} processado com sucesso.`);
        } else {
          console.warn(`⚠️  Erro ao processar jogo ${batch[index].localizedName}:`, result.reason);
        }
      });

      if (i + batchSize < games.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return games;
  }

  private async transformGameData(game: GameTitle, accountId: string): Promise<GameTitle> {
    try {
      const completionRate = game.trophyTitle.progress || 0;

      const totalTrophies = Object.values(game?.trophyTitle.definedTrophies).reduce((a, b) => a + b, 0);
      const earnedTrophies = Object.values(game?.trophyTitle.earnedTrophies).reduce((a, b) => a + b, 0);

      const rarity = this.calculateRarity(completionRate, earnedTrophies);
      const difficulty = this.calculateDifficulty(completionRate, rarity);

      const gameNameTitle: string = (game?.concept?.localizedName.metadata["en-US"]) as string;

      // Usar a nova função isGotyGame
      const gotyMatch = this.isGotyGame(gameNameTitle);

      const metacriticGame = await metacriticScraper.getMetacritcGame(gameNameTitle, game.trophyTitle.npCommunicationId);

      // pega todos ps grupos de Troféus (DLCs)
      const trophyGroups = await this.getGameTrophyGroups(game.trophyTitle.npCommunicationId, game.trophyTitle.npServiceName);

      game.trophyGroups = trophyGroups;
      game.completionPercentage = completionRate;
      game.trophyTitle.metacritic = metacriticGame;
      game.trophyTitle.isGoty = gotyMatch.isGoty;
      game.trophyTitle.gotyData = gotyMatch.gameData || null;

      for (const group of game.trophyGroups) {
        const userTrophies: TrophyDetail[] = await this.getUserGroupTrophiesForGame(
          accountId,
          game.trophyTitle?.npCommunicationId,
          group.trophyGroupId,
          game.trophyTitle?.npServiceName
        );

        const gameTrophies: TrophyDetail[] = await this.getGroupTrophiesForGame(
          game.trophyTitle?.npCommunicationId,
          group.trophyGroupId,
          game.trophyTitle?.npServiceName
        );

        group.trophies = gameTrophies;

        group.trophies.forEach((trophy: TrophyDetail) => {
          const userTrophyItem: TrophyDetail = userTrophies.find((trophyDetail: TrophyDetail) => trophyDetail.trophyId === trophy.trophyId)!;


          if (userTrophyItem) {
            trophy.trophyHidden = userTrophyItem.trophyHidden;
            trophy.earned = userTrophyItem.earned;
            trophy.progress = userTrophyItem.progress || 0;
            trophy.progressRate = userTrophyItem.progressRate || 0;
            trophy.progressedDateTime = userTrophyItem.progressedDateTime || null;
            trophy.trophyRare = userTrophyItem.trophyRare;
            trophy.trophyEarnedRate = userTrophyItem.trophyEarnedRate;
            trophy.earnedDateTime = userTrophyItem.earnedDateTime;
          }
        });

        group.definedTrophies = {
          bronze: group.trophies.filter(trophy => trophy.trophyType === 'bronze').length,
          silver: group.trophies.filter(trophy => trophy.trophyType === 'silver').length,
          gold: group.trophies.filter(trophy => trophy.trophyType === 'gold').length,
          platinum: group.trophies.filter(trophy => trophy.trophyType === 'platinum').length
        }

        group.earnedTrophies = {
          bronze: group.trophies.filter(trophy => trophy.earned && trophy.trophyType === 'bronze').length,
          silver: group.trophies.filter(trophy => trophy.earned && trophy.trophyType === 'silver').length,
          gold: group.trophies.filter(trophy => trophy.earned && trophy.trophyType === 'gold').length,
          platinum: group.trophies.filter(trophy => trophy.earned && trophy.trophyType === 'platinum').length
        }

        group.progress = (group.trophyGroupId === 'default' && game.trophyGroups.length <= 1) 
          ? game.trophyTitle.progress 
          : this.calculateGroupProgress(group.trophies);
      }

      
      game.platform = game.trophyTitle?.trophyTitlePlatform || this.getPlatform(game?.category);
      const hasPlatinum = (game.trophyTitle?.earnedTrophies?.platinum || 0) > 0 || game.hasPlatinum || game.trophyTitle.progress === 100 || false;
      const estimatedTimeToPlatinum = this.estimateTimeToPlatinum(totalTrophies);
      const hoursPlayed = toDecimalHours(game.playDuration);
      const platinumTime = estimatedTimeToPlatinum > hoursPlayed ? hoursPlayed : estimatedTimeToPlatinum;
      
      game.timeToPlatinum = platinumTime;
      game.estimatedTimeToPlatinum = estimatedTimeToPlatinum;
      game.metacriticScore = metacriticGame?.metascore || 0;
      game.difficulty = difficulty;
      game.rarity = rarity;
      game.hasPlatinum = hasPlatinum;
      game.completionPercentage = completionRate;
      game.isRare = rarity < 20;
      game.isHighDifficulty = difficulty >= 7;
      game.totalTrophies = totalTrophies;
      game.trophyCount = totalTrophies;
      game.npCommunicationId = game.trophyTitle?.npCommunicationId;
      game.earnedTrophies = game.trophyTitle?.earnedTrophies;
      
      const gameSaved = await this.saveGameToRepository({ ...game });

      game.trophyTitle.trophyTitleIconUrl = gameSaved.trophyTitle?.trophyTitleIconUrl;
      game.trophyTitle.trophyTitleName = gameSaved.trophyTitle?.trophyTitleName;

      game.backgroundImage = gameSaved.backgroundImage;
      game.heroImage = gameSaved.heroImage;
      game.logoImage = gameSaved.logoImage;

    } catch (error) {
      console.error(`⚠️ [transformGameData] Erro ao processar jogo ${game.name}:`, error);
      return game;
    }

    return game;
  }
  async saveGameToRepository(game: GameTitle) {

    const stringify = JSON.stringify(game);
    const gameData: GameTitle = JSON.parse(stringify);

    // removendo características dinâmicas antes de salvar
    gameData.earnedTrophies = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    gameData.hasPlatinum = false;
    gameData.completionPercentage = 0;
    gameData.timeToPlatinum = 0;
    gameData.firstPlayedDateTime = '';
    gameData.lastPlayedDateTime = '';
    gameData.playDuration = '';

    gameData.earnedTrophies = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    gameData.completionPercentage = 0;

    for (const trophyGroup of gameData.trophyGroups) {
      trophyGroup.trophies.forEach((trophy: TrophyDetail) => {
        trophy.earned = false;
        trophy.progress = 0;
        trophy.progressRate = 0;
        trophy.progressedDateTime = null;
        trophy.earnedDateTime = null;
      });
    }

    const existingGame = await gameRepository.findByNpCommunicationId(gameData.npCommunicationId);

    const images = await gameRepository.getBackgroundImages(gameData);

    if (images && !existingGame?.backgroundImage ) {
      gameData.backgroundImage = images.backgroundImage;
      gameData.heroImage = images.heroImage;
      gameData.logoImage = images.logoImage;
    }

    if (existingGame) {

      const bgImage = await gameRepository.getBackgroundImages(existingGame);

      gameData.trophyTitle.trophyTitleName = existingGame?.trophyTitle.trophyTitleName;
      // gameData.trophyTitle.trophyTitleIconUrl = existingGame?.trophyTitle?.trophyTitleIconUrl;
      gameData.backgroundImage = bgImage.backgroundImage || images.backgroundImage;
      gameData.heroImage = bgImage.heroImage || images.heroImage;
      gameData.logoImage = bgImage.logoImage || images.logoImage;

      gameRepository.updateById(existingGame._id, gameData);
    } else {
      gameRepository.create(gameData);
    }

    return gameData;
  }

  getEarnedTrophyPoints(trophies: TrophyDetail[]): number {
    let totalPoints = 0;

    for (const trophy of trophies) {
      if (trophy.trophyType != 'platinum' && trophy.earned) {
        const pointsPerTrophy = this.getPointsPerTrophy(
          trophy.trophyType as keyof DefinedTrophies,
        );
        totalPoints += pointsPerTrophy;
      }
    }

    return totalPoints;
  }

  getTotalTrophyPoints(trophies: TrophyDetail[]): number {
    let totalPoints = 0;
    for (const trophy of trophies) {
      const pointsPerTrophy = this.getPointsPerTrophy(
          trophy.trophyType as keyof DefinedTrophies,
        );
      totalPoints += pointsPerTrophy;
    }
    return totalPoints;
  }
  
  getPointsPerTrophy(trophyType: keyof DefinedTrophies): number {
    switch (trophyType) {
      case "bronze":
        return 15;
      case "silver":
        return 30;
      case "gold":
        return 90;
      default:
        return 0;
    }
  }

  calculateGroupProgress(trophies: TrophyDetail[]): number {
    // const total = trophies.length;
    // const earned = trophies.filter(t => t.earned).length;
    // return (earned / total) * 100;
    const earnedPoints = this.getEarnedTrophyPoints(trophies);
    const totalPoints = this.getTotalTrophyPoints(trophies);
    
    return Math.trunc((earnedPoints / totalPoints) * 100);
  }

  async getGroupTrophiesForGame(npCommunicationId: string, trophyGroupId: string, npServiceName: string): Promise<TrophyDetail[]> {

    const dataResponse = await gameRepository.findByNpCommunicationId(npCommunicationId);

    if (!dataResponse) {
      const token = await this.auth.getAccessToken();
      const extraParams = `?npServiceName=${npServiceName}&limit=500`;

      const response = await fetch(
        `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies${extraParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'pt-BR',
            'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ Erro ao buscar troféus do jogo ${npCommunicationId}: ${response.status}`);
      }
      
      const data: TrophyGroup = await response.json();

      return data?.trophies || [];
    }

    return dataResponse?.trophyGroups?.find((group) => group.trophyGroupId === trophyGroupId)?.trophies || [];
  }

  getPlatform(category: string): string {
    switch (category) {
      case 'ps5_native_game':
        return 'PS5';
      case 'ps4_game':
        return 'PS4';
      case 'pspc_game':
        return 'PC';
      default:
        return 'unknown';
    }
  }

  async getUserGroupTrophiesForGame(accountId: string, npCommunicationId: string, trophyGroupId: string = 'default', npServiceName: string): Promise<TrophyDetail[]> {
    const token = await this.auth.getAccessToken();
    const extraParams = `?npServiceName=${npServiceName}&limit=500`;
    // corrigido

    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/${trophyGroupId}/trophies${extraParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'pt-BR',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar troféus do usuário: ${response.status}`);
    }

    const data = await response.json();
    return data.trophies || [];
  }

  private async generateAnalysis(trophySummary: TrophySummary, games: GameTitle[], gotyStats: GotyStats) {
    // Garantir que games seja um array
    const safeGames = Array.isArray(games) ? games : [];

    const completedGames = safeGames.filter(game => game?.trophyTitle?.progress === 100).length;
    const platinumGames = trophySummary.earnedTrophies.platinum;
    const platinumFromListItems = safeGames.filter(game => game?.trophyTitle?.earnedTrophies?.platinum === 1);
    const platinumFromList = platinumFromListItems.length;
    const platinumGames100 = platinumFromListItems.filter(game => game?.trophyTitle?.progress === 100).length;
    const platinasOcultas = (platinumGames - platinumFromList) < 0 ? 0 : (platinumGames - platinumFromList);
    const highDifficultyGames = safeGames.filter(game => game?.trophyTitle?.progress === 100 && game?.difficulty || 0 >= 8).length;
    const highMetacriticScoreGames = safeGames.filter(game => game?.metacriticScore >= 80).length;

    const trophyGroups = safeGames.flatMap(game => game.trophyTitle.trophyGroups || []);
    const platinumTrophies = trophyGroups.flatMap(group => group.trophies.filter(trophy => trophy.earned && trophy.trophyType === 'platinum'));

    const platinumGroupScore = platinumTrophies.reduce((acc, trophy) => {
      const trophyEarnedRate = Math.floor(trophy.trophyEarnedRate * 10);
      let points = 0;
      if (trophyEarnedRate >= 91) points = 1;
      else if (trophyEarnedRate >= 81 && trophyEarnedRate <= 90) points = 2;
      else if (trophyEarnedRate >= 71 && trophyEarnedRate <= 80) points = 5;
      else if (trophyEarnedRate >= 51 && trophyEarnedRate <= 70) points = 7;
      else if (trophyEarnedRate >= 31 && trophyEarnedRate <= 50) points = 10;
      else if (trophyEarnedRate <= 30) points = 20;

      const key = `${points}`;
      return {
        ...acc,
        [key]: (acc[key] || 0) + 1
      };
    }, {} as Record<string, number>);


    const platinumData: UserPlatinumData = getPlatinumCountsFromTrophies(platinumTrophies);

    platinumData.platinumCounts.hidden = platinasOcultas;

    // Calcular score Mi Mi Mi baseado em múltiplos fatores
    const migueScore = this.calculateMigueScore({
      trophyLevel: trophySummary.trophyLevel || 1,
      platinumCount: platinumGames,
      platinumCount100: platinumGames100,
      platinumGroupScore,
      platinumData,
      totalGames: games.length,
      completionRate: safeGames.length > 0 ? (completedGames / safeGames.length) * 100 : 0,
      platinasOcultas: platinasOcultas,
      completedGames,
      highDifficultyGames,
      highMetacriticScoreGames
    });

    const profileAnalisys = {
      migueScore,
      gotyStats,
      totalGames: safeGames.length,
      completionRate: safeGames.length > 0 ? (completedGames / safeGames.length) * 100 : 0,
      games: safeGames,
      trophySummary,
    };

    return profileAnalisys;
  }

  public calculateMigueScore(factors: ScoringFactors): ScoreBreakdown {
    const {
      platinumCount,
      platinumCount100,
      platinumData,
      completionRate,
      completedGames,
      platinasOcultas,
      highDifficultyGames,
      highMetacriticScoreGames
    } = factors;

    let totalScore = 0;

    // Level de troféus (máx 20 pontos)
    // const trophyScore = Math.min(trophyLevel * 2, 20);

    // 1. PLATINAS (30 pontos): Taxa de platinas = (platinas conquistadas ÷ total de jogos) × 100
    const platinasScore: NormalizedScore = calculateNormalizedScore(platinumData as UserPlatinumData);

    // 2. COMPLETUDE (30 pontos): % de completude média do perfil × 0.3
    const completudeScore = Number((Math.min(completionRate, 100) * 0.3).toFixed(1));

    // 5. ALTA DIFICULDADE (20 pontos): Jogos com dificuldade 8/10+
    const highDifficultyScore = Number((Math.min(highDifficultyGames, 20)).toFixed(1));

    // 6. NOTA METACRITIC >= 80 (20 pontos): Jogos com avaliação 80+
    const metacriticRate = Number((highMetacriticScoreGames / 10).toFixed(1));
    const highMetacriticScore = Number((Math.min(metacriticRate, 20).toFixed(1))); // 20 pontos no máximo

    // totalScore = Math.min(platinasScore.pontuacaoMigueScore + completudeScore + highDifficultyScore + highMetacriticScore, 100);
    totalScore = Math.min(platinasScore.normalizedScore + completudeScore + highDifficultyScore + highMetacriticScore, 100);

    // Classificação Mi Mi Mi
    let classification, emoji, description;

    if (totalScore <= 40) {
      classification = "MIADO";
      emoji = "class-sprite level-1";
      description = "Foco em platinas fáceis, jogos simples, baixa completude";
    } else if (totalScore <= 70) {
      classification = "MIGUÉ";
      emoji = "class-sprite level-2";
      description = "Equilíbrio entre dificuldade e variedade, alguns jogos difíceis";
    } else if (totalScore <= 90) {
      classification = "MISERÊ";
      emoji = "class-sprite level-3";
      description = "Completude alta, jogos GOTY, alta dificuldade (8/10+)";
    } else {
      classification = "MISERAVÃO";
      emoji = "class-sprite level-4";
      description = "Lenda do trophy hunting, perfil excepcional em todos os aspectos";
    }

    return {
      totalScore: totalScore,
      completudeScore: completudeScore,
      completedGames: completedGames,
      platinasScore: platinasScore,
      platinumData: platinumData,
      platinas100: platinumCount100,
      platinasOcultas: platinasOcultas,
      platinasRazao: (platinumCount100 - platinasOcultas) / platinumCount,
      highDifficultyScore: highDifficultyScore,
      highMetacriticScore: highMetacriticScore,
      emoji: emoji,
      classification: classification,
      description: description
    };
  }

  private calculateRarity(progress: number, earnedTrophies: number): number {
    if (progress === 100 && earnedTrophies > 50) return 10;
    if (progress === 100) return 15;
    if (progress >= 90) return 20;
    if (progress >= 75) return 30;
    if (progress >= 50) return 45;
    return 60;
  }

  private calculateDifficulty(progress: number, rarity: number): number {
    if (progress === 100 && rarity < 15) return 9;
    if (progress === 100 && rarity < 25) return 7;
    if (progress === 100) return 5;
    if (progress >= 80) return 4;
    if (progress >= 50) return 3;
    return 2;
  }

  private estimateTimeToPlatinum(totalTrophies: number): number {
    if (totalTrophies <= 15) return 10;
    if (totalTrophies <= 25) return 20;
    if (totalTrophies <= 40) return 35;
    if (totalTrophies <= 60) return 50;

    return 80;
  }

  // Simple in-memory cache implementation[citation:2]
  public getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  public setToCache<T>(key: string, data: T): void {
    const expiry = Date.now() + this.cacheTTL;
    this.cache.set(key, { data, expiry });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // Method to manually refresh cache if needed
  public refreshCache(): void {
    this.clearCache();
  }

  // Nova implementação otimizada do isGotyGame
  public isGotyGame(gameTitle: string): GotyMatchResult {
    const normalizedTitle = normalizeText(gameTitle);


    const normalizedDatabase = this.GOTY_GAMES_DATABASE.flatMap(game =>
      game.search_terms.map(title => normalizeText(title)) &&
      game.alternative_titles.map(title => normalizeText(title)) &&
      normalizeText(game.titulo)
    );

    if (normalizedDatabase.includes(normalizedTitle)) {
      return {
        isGoty: true,
        matchType: 'exact',
        gameData: this.GOTY_GAMES_DATABASE.find(game => normalizeText(game.titulo) === normalizedTitle),
        confidence: 1
      };
    }

    return {
      isGoty: false,
      matchType: 'none',
      confidence: 0
    };
  }

  public async getGotyStats(games: GameTitle[]): Promise<GotyStats> {
    const gotyGames: Array<GOTYGame & { userGame: any }> = [];
    const byYear: { [year: number]: number } = {};
    let totalGotyGames = 0;
    let completionRate = 0;

    for (const game of games) {
      const match = this.isGotyGame(game.name);
      if (match.gameData) {
        // Verificar se o jogo já foi adicionado (evitar duplicatas)
        const gameAlreadyAdded = gotyGames.some(gotyGame =>
          gotyGame.titulo === match.gameData!.titulo
        );

        if (!gameAlreadyAdded) {
          gotyGames.push({
            ...match.gameData,
            userGame: game,
          });

          // Estatísticas por ano
          const year = match.gameData.ano_premiacao;
          byYear[year] = (byYear[year] || 0) + 1;
        }
        totalGotyGames++;
      }
    }

    const completedGames = gotyGames.filter(g => g.userGame.progress >= 100).length;

    completionRate = totalGotyGames > 0
      ? (gotyGames.filter(g => g.userGame.progress >= 100).length / totalGotyGames) * 100
      : 0;

    return {
      totalGotyGames,
      gotyGames,
      completionRate,
      completedGames: completedGames,
      byYear
    };
  }

  public async getUserProfile(accountId: string): Promise<SocialMetadata | null> {
    let fullProfile: SocialMetadata | null = null;

    try {
      const token = await this.auth.getAccessToken();

      if (!token) {
        throw new Error('Token de autenticação nulo');
      }

      const response = await fetch(
        `https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'pt-BR',
            'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar sumário: ${response.status} - ${errorText}`);
      }

      fullProfile = await response.json();

      
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
    }

    return fullProfile;
  }

  async getGameTrophyGroups(npCommunicationId: string, npServiceName: string = 'trophy'): Promise<TrophyGroup[]> {
    const token = await this.auth.getAccessToken();
    const extraParams = `?npServiceName=${npServiceName}`;

    let response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups${extraParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'pt-BR',
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Tentando buscar com npServiceName: trophy2`);
      response = await fetch(
        `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups?npServiceName=trophy2`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'pt-BR',
          }
        }
      );

      if (response.ok) {
        npServiceName = 'trophy2';
      }
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar grupos de troféus: ${response.status}`);
    }

    const data = await response.json();

    // trophy details
    await Promise.all(data.trophyGroups.map(async (group: TrophyGroup) => {
      group.trophies = await this.getGroupTrophiesForGame(npCommunicationId, group.trophyGroupId, npServiceName);
    }));

    const game = await gameRepository.findByNpCommunicationId(npCommunicationId);

    if (game) {
      await gameRepository.updateById(game._id, {
          trophyGroups: data.trophyGroups
        });
    } else {
      await gameRepository.create({...data} as GameTitle);
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    return data.trophyGroups || [];
  }
}

export type { GOTYGame, GotyMatchResult, ScoreBreakdown, ScoringFactors, TrophySummary, TrophyTitle };
export const TrophyService = new PSNTrophyService();
