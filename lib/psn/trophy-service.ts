// src/lib/psn/trophy-service.ts
import { PSNAuth } from './auth';

interface TrophySummary {
  accountId: string;
  trophyLevel: number;
  progress: number;
  tier: number;
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  totalTrophies: number;
}

interface TrophyTitle {
  npServiceName: string;
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleDetail: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  progress: number;
  lastUpdatedDateTime: string;
}

interface GotyGame {
  titulo: string;
  ano_premiacao: number;
  desenvolvedora: string;
  metacritic_score: number;
  plataformas: string[];
  imagem_capa: string;
  search_terms: string[];
  alternative_titles: string[];
}

interface GotyMatchResult {
  isGoty: boolean;
  gameData?: GotyGame;
  matchType: 'exact' | 'partial' | 'alternative' | 'none';
  confidence: number;
}

// Base de dados completa de GOTY winners
const GOTY_GAMES_DATABASE: GotyGame[] = [
  {
    titulo: "Baldur's Gate 3",
    ano_premiacao: 2023,
    desenvolvedora: "Larian Studios",
    metacritic_score: 96,
    plataformas: ["PC", "PS5", "Xbox Series X/S"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164bb5f23069e208affe81c572a3d5997e7ppp.jpg",
    search_terms: ["baldur's gate 3", "baldurs gate 3", "bg3"],
    alternative_titles: ["Baldur's Gate III"]
  },
  {
    titulo: "Elden Ring",
    ano_premiacao: 2022,
    desenvolvedora: "FromSoftware",
    metacritic_score: 96,
    plataformas: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202108/0410/1fkamaL5be1C9GW5W2K2L74E.png",
    search_terms: ["elden ring"],
    alternative_titles: []
  },
  {
    titulo: "It Takes Two",
    ano_premiacao: 2021,
    desenvolvedora: "Hazelight Studios",
    metacritic_score: 88,
    plataformas: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202101/0812/4WIlq9JPFBEuQJ1tYk1FfSxN.png",
    search_terms: ["it takes two"],
    alternative_titles: []
  },
  {
    titulo: "The Last of Us Part II",
    ano_premiacao: 2020,
    desenvolvedora: "Naughty Dog",
    metacritic_score: 93,
    plataformas: ["PS4"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202010/0221/6Cw0prdMxFNlXxX0VUjv4X1c.png",
    search_terms: ["the last of us part ii", "the last of us part 2", "the last of us 2", "tlou2"],
    alternative_titles: ["The Last of Us Part 2", "The Last of Us 2"]
  },
  {
    titulo: "Sekiro: Shadows Die Twice",
    ano_premiacao: 2019,
    desenvolvedora: "FromSoftware",
    metacritic_score: 90,
    plataformas: ["PC", "PS4", "Xbox One"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/201901/0310/7nJZru5WJ9778M9U9bQJqJxY.png",
    search_terms: ["sekiro", "sekiro shadows die twice"],
    alternative_titles: ["Sekiro: Shadows Die Twice"]
  },
  {
    titulo: "God of War",
    ano_premiacao: 2018,
    desenvolvedora: "Santa Monica Studio",
    metacritic_score: 94,
    plataformas: ["PS4", "PC"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["god of war", "gow 2018"],
    alternative_titles: ["God of War (2018)"]
  },
  {
    titulo: "The Legend of Zelda: Breath of the Wild",
    ano_premiacao: 2017,
    desenvolvedora: "Nintendo",
    metacritic_score: 97,
    plataformas: ["Switch", "Wii U"],
    imagem_capa: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000025/7137262b7a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58",
    search_terms: ["zelda breath of the wild", "breath of the wild", "botw"],
    alternative_titles: ["Zelda: BOTW", "Breath of the Wild"]
  },
  {
    titulo: "Overwatch",
    ano_premiacao: 2016,
    desenvolvedora: "Blizzard Entertainment",
    metacritic_score: 91,
    plataformas: ["PC", "PS4", "Xbox One", "Switch"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202010/1516/9QkJnM6c6E5Y5Y5Y5Y5Y5Y5Y.png",
    search_terms: ["overwatch"],
    alternative_titles: ["Overwatch 1"]
  },
  {
    titulo: "The Witcher 3: Wild Hunt",
    ano_premiacao: 2015,
    desenvolvedora: "CD Projekt Red",
    metacritic_score: 92,
    plataformas: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X/S"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["witcher 3", "the witcher 3", "wild hunt"],
    alternative_titles: ["The Witcher 3", "Witcher 3: Wild Hunt"]
  },
  {
    titulo: "Dragon Age: Inquisition",
    ano_premiacao: 2014,
    desenvolvedora: "BioWare",
    metacritic_score: 85,
    plataformas: ["PC", "PS3", "PS4", "Xbox 360", "Xbox One"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["dragon age inquisition"],
    alternative_titles: ["Dragon Age 3"]
  },
  {
    titulo: "Grand Theft Auto V",
    ano_premiacao: 2013,
    desenvolvedora: "Rockstar North",
    metacritic_score: 97,
    plataformas: ["PC", "PS3", "PS4", "PS5", "Xbox 360", "Xbox One", "Xbox Series X/S"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["gta v", "grand theft auto v", "gta 5"],
    alternative_titles: ["GTA V", "Grand Theft Auto 5"]
  },
  {
    titulo: "The Walking Dead",
    ano_premiacao: 2012,
    desenvolvedora: "Telltale Games",
    metacritic_score: 89,
    plataformas: ["PC", "PS3", "Xbox 360", "Mobile"],
    imagem_capa: "https://cdn.cloudflare.steamstatic.com/steam/apps/207610/header.jpg",
    search_terms: ["the walking dead", "walking dead telltale"],
    alternative_titles: ["Walking Dead: The Game"]
  },
  {
    titulo: "The Elder Scrolls V: Skyrim",
    ano_premiacao: 2011,
    desenvolvedora: "Bethesda Game Studios",
    metacritic_score: 96,
    plataformas: ["PC", "PS3", "Xbox 360", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X/S"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["skyrim", "elder scrolls skyrim", "the elder scrolls v"],
    alternative_titles: ["Skyrim", "Elder Scrolls V"]
  },
  {
    titulo: "Red Dead Redemption",
    ano_premiacao: 2010,
    desenvolvedora: "Rockstar San Diego",
    metacritic_score: 95,
    plataformas: ["PS3", "Xbox 360", "Switch", "PS4"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["red dead redemption"],
    alternative_titles: ["RDR"]
  },
  {
    titulo: "Uncharted 2: Among Thieves",
    ano_premiacao: 2009,
    desenvolvedora: "Naughty Dog",
    metacritic_score: 96,
    plataformas: ["PS3"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["uncharted 2", "among thieves"],
    alternative_titles: ["Uncharted 2"]
  },
  {
    titulo: "Grand Theft Auto IV",
    ano_premiacao: 2008,
    desenvolvedora: "Rockstar North",
    metacritic_score: 98,
    plataformas: ["PC", "PS3", "Xbox 360"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["gta iv", "grand theft auto iv", "gta 4"],
    alternative_titles: ["GTA IV", "Grand Theft Auto 4"]
  },
  {
    titulo: "BioShock",
    ano_premiacao: 2007,
    desenvolvedora: "Irrational Games",
    metacritic_score: 96,
    plataformas: ["PC", "PS3", "Xbox 360"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["bioshock"],
    alternative_titles: []
  },
  {
    titulo: "The Elder Scrolls IV: Oblivion",
    ano_premiacao: 2006,
    desenvolvedora: "Bethesda Game Studios",
    metacritic_score: 94,
    plataformas: ["PC", "PS3", "Xbox 360"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["oblivion", "elder scrolls oblivion"],
    alternative_titles: ["Oblivion"]
  },
  {
    titulo: "Resident Evil 4",
    ano_premiacao: 2005,
    desenvolvedora: "Capcom",
    metacritic_score: 96,
    plataformas: ["GameCube", "PS2", "PC", "Wii", "PS3", "Xbox 360", "PS4", "Xbox One", "Switch"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["resident evil 4", "re4"],
    alternative_titles: ["RE4"]
  },
  {
    titulo: "Grand Theft Auto: San Andreas",
    ano_premiacao: 2004,
    desenvolvedora: "Rockstar North",
    metacritic_score: 95,
    plataformas: ["PS2", "PC", "Xbox"],
    imagem_capa: "https://image.api.playstation.com/vulcan/ap/rnd/202009/1715/7dG3t6NQJjUQbQ5Q5Q5Q5Q5Q.png",
    search_terms: ["gta san andreas", "san andreas"],
    alternative_titles: ["GTA: San Andreas"]
  }
];

// Função otimizada para normalizar texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Nova implementação otimizada do isGotyGame
function isGotyGame(gameTitle: string): GotyMatchResult {
  const normalizedTitle = normalizeText(gameTitle);
  
  // Busca exata primeiro
  for (const game of GOTY_GAMES_DATABASE) {
    const exactMatch = game.search_terms.some(term => 
      normalizeText(term) === normalizedTitle
    );
    
    if (exactMatch) {
      return {
        isGoty: true,
        gameData: game,
        matchType: 'exact',
        confidence: 1.0
      };
    }
  }
  
  // Busca por inclusão
  for (const game of GOTY_GAMES_DATABASE) {
    const partialMatch = game.search_terms.some(term => 
      normalizedTitle.includes(normalizeText(term)) || 
      normalizeText(term).includes(normalizedTitle)
    );
    
    if (partialMatch) {
      return {
        isGoty: true,
        gameData: game,
        matchType: 'partial',
        confidence: 0.8
      };
    }
  }
  
  // Busca em títulos alternativos
  for (const game of GOTY_GAMES_DATABASE) {
    const alternativeMatch = game.alternative_titles.some(altTitle => 
      normalizeText(altTitle) === normalizedTitle
    );
    
    if (alternativeMatch) {
      return {
        isGoty: true,
        gameData: game,
        matchType: 'alternative',
        confidence: 0.9
      };
    }
  }
  
  return {
    isGoty: false,
    matchType: 'none',
    confidence: 0
  };
}

function getGotyStats(games: any[]): {
  totalGotyGames: number;
  gotyGames: Array<GotyGame & { userGame: any }>;
  completionRate: number;
  byYear: { [year: number]: number };
} {
  const gotyGames: Array<GotyGame & { userGame: any }> = [];
  const byYear: { [year: number]: number } = {};
  const addedTitles = new Set<string>(); // Para evitar duplicatas

  games.forEach(game => {
    const match = isGotyGame(game.title);
    if (match.isGoty && match.gameData) {
      // Verificar se o jogo já foi adicionado (evitar duplicatas)
      const gameAlreadyAdded = gotyGames.some(gotyGame => 
        gotyGame.titulo === match.gameData!.titulo
      );
      
      if (!gameAlreadyAdded) {
        gotyGames.push({
          ...match.gameData,
          userGame: game
        });
        
        // Estatísticas por ano
        const year = match.gameData.ano_premiacao;
        byYear[year] = (byYear[year] || 0) + 1;
      }
    }
  });
  
  const totalGotyGames = gotyGames.length;
  const completionRate = totalGotyGames > 0 
    ? (gotyGames.filter(g => g.userGame.completionPercentage >= 100).length / totalGotyGames) * 100
    : 0;
  
  return {
    totalGotyGames,
    gotyGames,
    completionRate,
    byYear
  };
}

export class PSNTrophyService {
  private auth: PSNAuth;

  constructor() {
    this.auth = new PSNAuth();
  }

  async getCompleteProfile(accountId: string) {
    try {
      console.log(`🎯 Buscando perfil completo para: ${accountId}`);
      
      const token = await this.auth.getToken();

      if (!token) {
        throw new Error('Erro ao obter token de autenticação');
      }
      
      const trophySummary = await this.getTrophySummary(accountId, token);
      console.log(`📊 Sumário de troféus: Level ${trophySummary.trophyLevel}, ${trophySummary.totalTrophies} troféus totais`);
      
      const allTitles = await this.getUserTitlesWithPagination(accountId, token);
      console.log(`📚 Encontrados ${allTitles.length} jogos no total`);
      
      const games = await this.processGamesInBatches(allTitles, accountId, token);
      
      // Calcular estatísticas GOTY
      const gotyStats = getGotyStats(games);
      
      // Gerar análise completa
      const analysis = this.generateAnalysis(trophySummary, games, gotyStats);
      
      console.log('✅ Dados processados:', {
        trophySummary: !!trophySummary,
        gamesCount: games.length,
        gotyStats: !!gotyStats,
        analysis: !!analysis,
        migueScore: analysis.migueScore,
        platinumGames: analysis.platinumGames
      });
      
      // Retornar estrutura plana (não aninhada)
      return {
        accountId,
        trophySummary,
        games,
        gotyStats,
        analysis // Este campo contém as métricas calculadas
      };
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
    const limit = 100;
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
    
    const batchSize = 5;
    const games: any[] = [];

    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      console.log(`🔄 Processando lote ${Math.floor(i/batchSize) + 1}: ${batch.length} jogos`);
      
      const batchPromises = batch.map(title => 
        this.transformGameData(title)
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

  private transformGameData(title: TrophyTitle) {
    const hasPlatinum = title.earnedTrophies.platinum > 0;
    const completionRate = title.progress;
    
    const totalTrophies = Object.values(title.definedTrophies).reduce((a, b) => a + b, 0);
    const earnedTrophies = Object.values(title.earnedTrophies).reduce((a, b) => a + b, 0);
    
    const rarity = this.calculateRarity(completionRate, earnedTrophies);
    const difficulty = this.calculateDifficulty(completionRate, rarity);
    
    // Usar a nova função isGotyGame
    const gotyMatch = isGotyGame(title.trophyTitleName);

    return {
      title: title.trophyTitleName,
      platform: title.trophyTitlePlatform,
      trophyCount: title.definedTrophies,
      earnedTrophies: title.earnedTrophies,
      progress: completionRate,
      lastPlayed: new Date(title.lastUpdatedDateTime),
      genre: this.determineGenre(title.trophyTitleName),
      timeToPlatinum: this.estimateTimeToPlatinum(totalTrophies, completionRate),
      metacriticScore: this.getMetacriticScore(title.trophyTitleName),
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
      trophyTitleIconUrl: title.trophyTitleIconUrl
    };
  }

  private generateAnalysis(trophySummary: TrophySummary, games: any[], gotyStats: any) {
    // Garantir que games seja um array
    const safeGames = Array.isArray(games) ? games : [];
    
    const completedGames = safeGames.filter(game => game && game.completionPercentage === 100).length;
    const platinumGames = safeGames.filter(game => game && game.hasPlatinum).length;
    const rareGames = safeGames.filter(game => game && game.isRare).length;
    const highDifficultyGames = safeGames.filter(game => game && game.isHighDifficulty).length;
    
    // Calcular score Mi Mi Mi baseado em múltiplos fatores
    const migueScore = this.calculateMigueScore({
      trophyLevel: trophySummary.trophyLevel || 1,
      platinumCount: platinumGames,
      totalGames: games.length,
      completionRate: safeGames.length > 0 ? (completedGames / safeGames.length) * 100 : 0,
      rareGamesCount: rareGames,
      gotyGames: gotyStats?.totalGotyGames || 0,
      highDifficultyGames: highDifficultyGames
    });

    return {
      migueScore,
      completedGames,
      platinumGames,
      rareGames,
      highDifficultyGames,
      gotyStats,
      totalGames: safeGames.length,
      completionRate: safeGames.length > 0 ? (completedGames / safeGames.length) * 100 : 0
    };
  }

  private calculateMigueScore(factors: {
    trophyLevel: number;
    platinumCount: number;
    totalGames: number;
    completionRate: number;
    rareGamesCount: number;
    gotyGames: number;
    highDifficultyGames: number;
  }): number {
    const {
      trophyLevel,
      platinumCount,
      totalGames,
      completionRate,
      rareGamesCount,
      gotyGames,
      highDifficultyGames
    } = factors;

    let score = 0;

    // Level de troféus (máx 20 pontos)
    score += Math.min(trophyLevel * 2, 20);

    // 1. PLATINAS (30 pontos): Taxa de platinas = (platinas conquistadas ÷ total de jogos) × 100
    const platinumRate = (platinumCount / totalGames) * 100;
    score += Math.min(platinumRate, 100) * 0.3; // 30 pontos no máximo

    // 2. COMPLETUDE (20 pontos): % de completude média do perfil × 0.2
    score += Math.min(completionRate, 100) * 0.2;

    // 3. PLATINAS RARAS (20 pontos): Platinas com raridade < 20% no PSN (cada = 2 pontos)
    score += Math.min(rareGamesCount * 2, 20);

    // 4. JOGOS GOTY (15 pontos): Jogos que ganharam Game of The Year (cada = 3 pontos)
    score += Math.min(gotyGames * 3, 15);

    // 5. ALTA DIFICULDADE (15 pontos): Jogos com dificuldade 7/10+ (cada = 2 pontos)
    score += Math.min(highDifficultyGames * 2, 15);

    return Math.min(Math.round(score), 100);
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

  private getMetacriticScore(gameTitle: string): number {
    const scores: { [key: string]: number } = {
      'the last of us': 95, 'god of war': 94, 'bloodborne': 92,
      'persona 5': 93, 'hollow knight': 90, 'elden ring': 96,
      'spider-man': 87, 'horizon': 89, 'uncharted': 93,
      'ghost of tsushima': 83, 'returnal': 86, 'ratchet & clank': 88,
      'final fantasy': 87, 'witcher': 93, 'red dead redemption': 97
    };
    
    for (const [key, score] of Object.entries(scores)) {
      if (gameTitle.toLowerCase().includes(key)) {
        return score;
      }
    }
    
    return 75;
  }
}

// Exportar funções auxiliares para uso externo
export { isGotyGame, getGotyStats, GOTY_GAMES_DATABASE };
export type { GotyGame, GotyMatchResult };