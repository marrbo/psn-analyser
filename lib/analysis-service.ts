// /lib/psn/analysis-service.ts
import { MongoClient } from 'mongodb';
import { PSNAuth } from './psn/auth';
import { PSNUser, SocialMetadata } from '@/types/psn';
import { CacheService } from './psn/cache-service';
import { metacriticScraper } from './metacritc-scraper';
import { TrophyDetail, TrophyGroup, TrophyTitle } from '@/types/trophies';
import { CacheItem, GOTYGame, GotyMatchResult, ScoreBreakdown, ScoringFactors } from '@/types/analysis.type';

export default class AnalysisService {
  private readonly auth: PSNAuth;
  private readonly cache: Map<string, CacheItem<any>>;
  private readonly cacheTTL = 60 * 60 * 1000;
  private GOTY_GAMES_DATABASE: GOTYGame[] = [];

  constructor() {
    this.auth = new PSNAuth();
    this.cache = new Map<string, CacheItem<any>>();
    this.cacheTTL = 5 * 60 * 1000;
  }

  async getCompleteProfile(accountId: string) {
    try {
      console.log(`🎯 Buscando perfil completo para: ${accountId}`);

      const token = await this.auth.getAccessToken();

      if (!token) {
        throw new Error('Erro ao obter token de autenticação');
      }

      this.GOTY_GAMES_DATABASE = await this.getGOTYGames();
      const trophySummary = await this.getTrophySummary(accountId, token);
      console.log(`📊 Sumário de troféus: Level ${trophySummary.trophyLevel}, ${trophySummary.totalTrophies} troféus totais`);

      const allTitles = await this.getUserTitlesWithPagination(accountId, token);
      console.log(`📚 Encontrados ${allTitles.length} jogos no total`);

      // Usado uma vez para fazer scraper da página do Metacritic
      // const metacritcScraper = new MetacriticScraper();
      // await metacritcScraper.scrapeMultiplePages(300);

      const games = await this.processGamesInBatches(allTitles, accountId, token);

      // Calcular estatísticas GOTY
      const gotyStats = await this.getGotyStats(games);

      // Gerar análise completa
      const analysis = await this.generateAnalysis(trophySummary, games, gotyStats);

      const psnUser: PSNUser = await new CacheService(accountId, 'users').getItem<PSNUser>();

      const fullPsnProfile = await this.getUserProfile(psnUser.accountId);

      if (fullPsnProfile) {
        psnUser.fullProfile = fullPsnProfile;
      }

      await new CacheService(accountId, 'users').setItem(psnUser);

      // // Calcular estatísticas de gênero
      // // const genreStats = calculateGenreStats(games);

      // Dados para o TrophyMeter com valores padrão
      // const trophyMeterData: RarityStats = {
      //   earnedTrophies: trophySummary.earnedTrophies || {
      //     bronze: trophySummary.earnedTrophies.bronze,
      //     silver: trophySummary.earnedTrophies.silver,
      //     gold: trophySummary.earnedTrophies.gold,
      //     platinum: trophySummary.earnedTrophies.platinum,
      //   },
      //   totalTrophies: trophySummary.totalTrophies || 0,
      //   totalEarned: trophySummary.totalTrophies || 0,
      //   completionPercentage: analysis.completionRate || 0, 
      //   trophyGroups: analysis.games || [], 
      //   gameName: data.gameName,
      //   psnId: data.username
      // };

      // // console.log('📊 Dados para o TrophyMeter:', trophyMeterData);

      const dadosProcessados = {
        _cacheId: accountId,
        accountId,
        psnUser,
        completionRate: analysis.completionRate,
        games: analysis.games,
        gotyStats: analysis.gotyStats,
        migueScore: analysis.migueScore,
        totalGames: analysis.totalGames,
        trophySummary
      }

      await new CacheService(psnUser.accountId?.toString(), 'analyses').setItem(dadosProcessados);

      console.log('✅ Dados processados:', dadosProcessados);

      return dadosProcessados;
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
      throw error;
    }
  }

  private async getTrophySummary(accountId: string, token: string): Promise<TrophySummary> {
    console.log(`📈 Buscando sumário de troféus...`);

    const response = await fetch(
      `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophySummary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        }
      }
    );

    console.log(`📥 Status sumário: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar sumário: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      accountId,
      trophyLevel: data.trophyLevel || 1,
      progress: data.progress || 0,
      tier: data.tier || 1,
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
  }

  private async getUserTitlesWithPagination(accountId: string, token: string): Promise<TrophyTitle[]> {
    console.log(`📖 Buscando títulos com paginação...`);

    const allTitles: TrophyTitle[] = [];
    let offset = 0;
    const limit = 500;
    let hasMore = true;

    while (hasMore) {
      console.log(`↘️  Buscando página: offset=${offset}, limit=${limit}`);

      const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles?` +
        new URLSearchParams({
          'fields': '@default,trophyCount,earnedTrophies,progress',
          'npLanguage': 'pt-BR',
          'offset': offset.toString(),
          'limit': limit.toString()
        });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro paginado ao buscar títulos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const titles = data.trophyTitles || [];

      console.log(`📄 Página retornou: ${titles.length} títulos`);

      const validTitles = titles.filter((title: TrophyTitle) =>
        title.definedTrophies?.bronze > 0 ||
        title.definedTrophies?.silver > 0 ||
        title.definedTrophies?.gold > 0 ||
        title.definedTrophies?.platinum > 0
      );

      allTitles.push(...validTitles);

      if (titles.length < limit) {
        hasMore = false;
        console.log(`✅ Fim da paginação. Total: ${allTitles.length} títulos`);
      } else {
        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allTitles;
  }

  private async processGamesInBatches(
    titles: TrophyTitle[],
    accountId: string,
    token: string
  ): Promise<any[]> {
    console.log(`⚡ Processando ${titles.length} jogos em lotes paralelos...`);

    const batchSize = 500;
    const games: any[] = [];

    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      console.log(`🔄 Processando lote ${Math.floor(i / batchSize) + 1}: ${batch.length} jogos`);

      const batchPromises = batch.map(title =>
        this.transformGameData(title, accountId)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          games.push(result.value);
        } else {
          console.warn(`⚠️  Erro ao processar jogo ${batch[index].trophyTitleName}:`, result.reason);
        }
      });

      if (i + batchSize < titles.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`✅ Processamento concluído: ${games.length} jogos processados`);
    return games;
  }

  private async transformGameData(title: TrophyTitle, accountId: string): Promise<any> {
    const hasPlatinum = title.earnedTrophies.platinum > 0;
    const completionRate = title.progress;

    const totalTrophies = Object.values(title.definedTrophies).reduce((a, b) => a + b, 0);
    const earnedTrophies = Object.values(title.earnedTrophies).reduce((a, b) => a + b, 0);

    const rarity = this.calculateRarity(completionRate, earnedTrophies);
    const difficulty = this.calculateDifficulty(completionRate, rarity);

    // Usar a nova função isGotyGame
    const gotyMatch = this.isGotyGame(title.trophyTitleName);

    const metacriticScore = await metacriticScraper.getMetacritcScore(title.trophyTitleName, title.npCommunicationId);


    // pega todos ps grupos de Troféus (DLCs)
    const trophyGroups = await this.getGameTrophyGroups(title.npCommunicationId);
    
    title.trophyGroups = trophyGroups;

    return {
      title: title.trophyTitleName,
      platform: title.trophyTitlePlatform,
      trophyCount: title.definedTrophies,
      earnedTrophies: title.earnedTrophies,
      progress: completionRate,
      lastPlayed: new Date(title.lastUpdatedDateTime),
      genre: this.determineGenre(title.trophyTitleName),
      timeToPlatinum: this.estimateTimeToPlatinum(totalTrophies, completionRate),
      metacriticScore: metacriticScore,
      isGoty: gotyMatch.isGoty,
      gotyData: gotyMatch.gameData, // Incluir dados completos do GOTY
      difficulty,
      rarity,
      hasPlatinum,
      completionPercentage: completionRate,
      isRare: rarity < 20,
      isHighDifficulty: difficulty >= 7,
      totalTrophies,
      npCommunicationId: title.npCommunicationId,
      trophyTitleIconUrl: title.trophyTitleIconUrl,
      trophyGroups: title.trophyGroups
    };
  }

  async temporarioGetTrophyGroups(accountId: string, npCommunicationId: string): Promise<TrophyGroup[]> {
    // Buscar troféus do usuário de cada grupo
    // for (const group of trophyGroups) {
    //   const userGroupTrophies = await this.getUserTrophiesForGame(
    //     accountId, 
    //     title.npCommunicationId, 
    //     group.trophyGroupId
    //   );

    //   // let userTrophies = [];

    //   const lastUpdated = userGroupTrophies.map(a => a.earnedDateTime === undefined ? new Date('1900-01-01T00:00:00Z') : new Date(a.earnedDateTime)).sort((a, b) => a - b).reverse()[0]

    //   const userTrophiesWithMeta: TrophyGroup = ({
    //     accountId,
    //     npCommunicationId: title.npCommunicationId,
    //     trophyGroupId: group.trophyGroupId,
    //     trophyGroupName: group.trophyGroupName,
    //     trophyGroupIconUrl: group.trophyGroupIconUrl,
    //     definedTrophies: group.definedTrophies,
    //     trophies: [...userGroupTrophies],
    //     lastUpdated: lastUpdated,
    //   });

    //   group.trophies = userTrophiesWithMeta.trophies;

    //   // userTrophies.push(userTrophiesWithMeta);

    //   // const stats = this.calculateRarityStats(userTrophiesWithMeta, userGroupTrophies);

    //   // rarityStats.totalEarned += stats.totalEarned;
    //   // rarityStats.totalTrophies += stats.totalTrophies;
    //   // rarityStats.trophyGroups.push(stats.trophyGroups[0]);
    // }
    return null;
  }

  async getUserTrophiesForGame(accountId: string, npCommunicationId: string, trophyGroupId: string = 'default', needExtraParams: boolean = false): Promise<TrophyDetail[]> {
    const token = await this.auth.getToken();
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

  private async generateAnalysis(trophySummary: TrophySummary, games: any[], gotyStats: any) {
    // Garantir que games seja um array
    const safeGames = Array.isArray(games) ? games : [];

    const completedGames = safeGames.filter(game => game.completionPercentage === 100).length;
    const platinumGames = safeGames.filter(game => game.hasPlatinum).length;
    const rareGames = safeGames.filter(game => game.isRare && game.rarity <= 10 && game.completionPercentage === 100).length;
    const highDifficultyGames = safeGames.filter(game => game.completionPercentage === 100 && game.difficulty >= 8).length;
    const highMetacriticScoreGames = safeGames.filter(game => game.metacriticScore >= 80).length;
    const completedGotygames = gotyStats?.gotyGames.filter((game: any) => game.userGame.completionPercentage === 100).length;

    // Calcular score Mi Mi Mi baseado em múltiplos fatores
    const migueScore = this.calculateMigueScore({
      trophyLevel: trophySummary.trophyLevel || 1,
      platinumCount: platinumGames,
      totalGames: games.length,
      completionRate: safeGames.length > 0 ? (completedGames / safeGames.length) * 100 : 0,
      platinasOcultas: rareGames,
      completedGames,
      platinumCount100: 0,
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

    console.log('✅ Análise gerada com sucesso:', profileAnalisys);

    this.setToCache(`profile_analisys_${trophySummary.accountId}`, profileAnalisys);

    console.log('Análise gerada e armazenada no cache');

    return profileAnalisys;
  }

  public calculateMigueScore(factors: ScoringFactors): ScoreBreakdown {
    const {
      platinumCount,
      totalGames,
      completionRate,
      completedGames,
      gotyGames,
      highDifficultyGames,
      highMetacriticScoreGames
    } = factors;

    let totalScore = 0;

    // Level de troféus (máx 20 pontos)
    // const trophyScore = Math.min(trophyLevel * 2, 20);

    // 1. PLATINAS (10 pontos): Taxa de platinas = (platinas conquistadas ÷ total de jogos) × 100
    const platinumRate = (platinumCount / totalGames) * 100;
    const platinasScore = Number((Math.min(platinumRate, 100) * 0.2).toFixed(1)); // 20 pontos no máximo

    // 2. COMPLETUDE (30 pontos): % de completude média do perfil × 0.3
    const completudeScore = Number((Math.min(completionRate, 100) * 0.3).toFixed(1));

    // 3. PLATINAS RARAS (20 pontos): Platinas com raridade < 20% no PSN
    // const rarePlatinasScore = Number((Math.min(completionRate / rarePlatinas, 10)).toFixed(1));

    // 4. JOGOS GOTY (15 pontos): Jogos que ganharam Game of The Year
    const gotyScore = Number((Math.min(gotyGames, 15)).toFixed(1));

    // 5. ALTA DIFICULDADE (15 pontos): Jogos com dificuldade 8/10+
    const highDifficultyScore = Number((Math.min(highDifficultyGames, 15)).toFixed(1));

    // 6. NOTA METACRITIC >= 80 (20 pontos): Jogos com dificuldade 8/10+
    const metacriticRate = Number((highMetacriticScoreGames / 10).toFixed(1));
    const highMetacriticScore = Number((Math.min(metacriticRate, 20).toFixed(1))); // 20 pontos no máximo

    totalScore = Math.min(platinasScore + completudeScore + gotyScore + highDifficultyScore + highMetacriticScore, 100);
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
      platinumScoreOld: platinasScore,
      completudeScore: completudeScore,
      completedGames: completedGames,
      platinas100: 0,
      gotyScore: gotyScore,
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

  private determineGenre(gameTitle: string): string {
    const lowerTitle = gameTitle.toLowerCase();

    // Mapeamento de palavras-chave para gêneros baseado na taxonomia
    const genreKeywords: { [key: string]: string[] } = {
      'Platform': ['crash', 'spyro', 'ratchet', 'jak', 'sackboy', 'littlebigplanet', 'mario', 'donkey kong', 'celeste', 'hollow knight'],
      'FPS': ['call of duty', 'battlefield', 'destiny', 'doom', 'wolfenstein', 'overwatch', 'counter-strike', 'halo', 'far cry'],
      'TPS': ['grand theft auto', 'red dead redemption', 'uncharted', 'tomb raider', 'the last of us', 'gears of war'],
      'Fighting': ['street fighter', 'tekken', 'mortal kombat', 'guilty gear', 'soulcalibur', 'super smash bros', 'dragon ball fighterz'],
      'Action-Adventure': ['assassin\'s creed', 'batman: arkham', 'horizon', 'spider-man', 'god of war', 'the legend of zelda', 'metroid', 'castlevania'],
      'RPG': ['final fantasy', 'persona', 'witcher', 'elden ring', 'dragon quest', 'mass effect', 'skyrim', 'fallout', 'dark souls', 'bloodborne', 'diablo', 'borderlands'],
      'Sports': ['fifa', 'nba', 'mlb', 'pga', 'ufc', 'wwe', 'madden', 'nhl', 'pro evolution soccer', 'rocket league'],
      'Racing': ['gran turismo', 'need for speed', 'driveclub', 'wreckfest', 'dirt', 'forza', 'burnout', 'mario kart'],
      'Strategy': ['civilization', 'xcom', 'fire emblem', 'star craft', 'age of empires', 'total war', 'hearthstone'],
      'Simulation': ['the sims', 'simcity', 'farming simulator', 'euro truck simulator', 'flight simulator', 'animal crossing'],
      'Puzzle': ['tetris', 'candy crush', 'bejeweled', 'portal', 'the witness', 'professor layton'],
      'Horror': ['resident evil', 'silent hill', 'dead space', 'outlast', 'amnesia', 'the evil within'],
      'Indie': ['stardew valley', 'minecraft', 'terraria', 'undertale', 'cuphead', 'among us']
    };

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return genre;
      }
    }

    return 'Other';
  }

  private estimateTimeToPlatinum(totalTrophies: number, progress: number): number {
    if (progress < 100) return 0;

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

  // Database operation with caching
  public async getGOTYGames(): Promise<GOTYGame[]> {
    const cacheKey = 'goty_games_all';

    // Try to get from cache first
    const cached = this.getFromCache<GOTYGame[]>(cacheKey);
    if (cached) {
      console.log('Returning cached GOTY games');
      return cached;
    }

    // If not in cache, fetch from database
    const client = new MongoClient(process.env.MONGODB_URI!);

    try {
      await client.connect();
      const database = client.db();
      const gotyCollection = database.collection<GOTYGame>('goty_games');

      const games = await gotyCollection.find({}).sort({ year: -1 }).toArray();

      // Store in cache
      this.setToCache(cacheKey, games);

      console.log('Fetched GOTY games from database and cached');
      return games;
    } finally {
      await client.close();
    }
  }

  public async getGOTYGameById(id: string): Promise<GOTYGame | null> {
    const cacheKey = `goty_game_${id}`;

    const cached = this.getFromCache<GOTYGame>(cacheKey);
    if (cached) {
      return cached;
    }

    const client = new MongoClient(process.env.MONGODB_URI!);

    try {
      await client.connect();
      const database = client.db();
      const gotyCollection = database.collection<GOTYGame>('goty_games');

      const game = await gotyCollection.findOne({ id });

      if (game) {
        this.setToCache(cacheKey, game);
      }

      return game;
    } finally {
      await client.close();
    }
  }

  public async searchGOTYGames(query: string): Promise<GOTYGame[]> {
    const cacheKey = `goty_search_${query.toLowerCase()}`;

    const cached = this.getFromCache<GOTYGame[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const client = new MongoClient(process.env.MONGODB_URI!);

    try {
      await client.connect();
      const database = client.db();
      const gotyCollection = database.collection<GOTYGame>('goty_games');

      const games = await gotyCollection.find({
        name: { $regex: query, $options: 'i' }
      }).toArray();

      this.setToCache(cacheKey, games);

      return games;
    } finally {
      await client.close();
    }
  }

  // Method to manually refresh cache if needed
  public refreshCache(): void {
    this.clearCache();
    console.log('Trophy service cache refreshed');
  }
  // Função otimizada para normalizar texto
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Nova implementação otimizada do isGotyGame
  public isGotyGame(gameTitle: string): GotyMatchResult {
    const normalizedTitle = this.normalizeText(gameTitle);


    const normalizedDatabase = this.GOTY_GAMES_DATABASE.flatMap(game =>
      game.alternative_titles.map(title => this.normalizeText(game.titulo)));

    if (normalizedDatabase.includes(normalizedTitle)) {
      return {
        isGoty: true,
        matchType: 'exact',
        gameData: this.GOTY_GAMES_DATABASE.find(game => this.normalizeText(game.titulo) === normalizedTitle),
        confidence: 1
      };
    }

    return {
      isGoty: false,
      matchType: 'none',
      confidence: 0
    };
  }

  public async getGotyStats(games: any[]): Promise<{
    totalGotyGames: number;
    gotyGames: Array<GOTYGame & { userGame: any }>;
    completionRate: number;
    byYear: { [year: number]: number };
  }> {
    const gotyGames: Array<GOTYGame & { userGame: any }> = [];
    const byYear: { [year: number]: number } = {};
    let totalGotyGames = 0;
    let completionRate = 0;

    for (const game of games) {
      const match = this.isGotyGame(game.title);
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

    completionRate = totalGotyGames > 0
      ? (gotyGames.filter(g => g.userGame.completionPercentage >= 100).length / totalGotyGames) * 100
      : 0;

    return {
      totalGotyGames,
      gotyGames,
      completionRate,
      byYear
    };
  }

  public async getUserProfile(accountId: number): Promise<SocialMetadata | null> {
    let fullProfile: SocialMetadata | null = null;

    try {
      console.log(`🎯 Buscando Perfil completo: ${accountId}`);

      const token = await this.auth.getToken();

      if (!token) {
        throw new Error('Token de autenticação nulo');
      }

      const response = await fetch(
        `https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
          }
        }
      );

      console.log(`📥 Status sumário: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar sumário: ${response.status} - ${errorText}`);
      }

      fullProfile = await response.json();

      console.log(`👤 Perfil completo: ${JSON.stringify(fullProfile)}`);

    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
    }

    return fullProfile;
  }
  
  async getGameTrophyGroups(npCommunicationId: string, needExtraParams: boolean = false): Promise<TrophyGroup[]> {
    const token = await this.auth.getToken();
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
}

export type { GOTYGame, GotyMatchResult, ScoreBreakdown, ScoringFactors, TrophyTitle };
export const analysisService = new AnalysisService();
