// src/lib/psn/trophy-service.ts
import { PSNAuth } from './auth';

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

export class PSNTrophyService {
  private auth: PSNAuth;

  constructor() {
    this.auth = new PSNAuth();
  }

  async getCompleteProfile(accountId: string) {
    try {
      console.log(`🎯 Buscando perfil para: ${accountId}`);
      
      const token = await this.auth.getToken();

      if (token) {
        console.log(`🔑 Token obtido: ${token.substring(0, 50)}...`);
        
        // BUSCAR OS TÍTULOS DO USUÁRIO ESPECÍFICO (não "me")
        const titles = await this.getUserTitles('me', token);
        
        console.log(`📊 Encontrados ${titles.length} jogos`);
        
        const games = titles.map(title => this.transformGameData(title));

        return {
          accountId,
          games
        };
      }
      
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
      throw error;
    }
  }

  private async getUserTitles(accountId: string, token: string): Promise<TrophyTitle[]> {
    console.log(`🔍 Buscando títulos para: ${accountId}`);
    
    // URL CORRETA baseada na documentação PowerShell
    // Não usar "me", usar o accountId específico
    const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles?fields=@default,trophyCount,earnedTrophies,progress&npLanguage=pt-BR`;
    
    console.log(`📡 URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
      }
    });

    console.log(`📥 Status títulos: ${response.status}`);
    console.log(`📥 Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Resposta completa do erro:', errorText);
      
      // Se for 403, tentar uma abordagem diferente
      if (response.status === 403) {
        return await this.tryAlternativeTitlesEndpoint(accountId, token);
      }
      
      throw new Error(`Erro ao buscar títulos: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos com sucesso');
    
    // A resposta vem com "trophyTitles" não "titles"
    const titles = data.trophyTitles || [];
    
    console.log(`📊 Total de títulos na resposta: ${titles.length}`);
    
    // Filtrar jogos com troféus
    const validTitles = titles.filter((title: TrophyTitle) => 
      title.definedTrophies?.bronze > 0 || 
      title.definedTrophies?.silver > 0 || 
      title.definedTrophies?.gold > 0 || 
      title.definedTrophies?.platinum > 0
    );

    console.log(`✅ ${validTitles.length} títulos válidos com troféus`);
    return validTitles;
  }

  private async tryAlternativeTitlesEndpoint(accountId: string, token: string): Promise<TrophyTitle[]> {
    console.log('🔄 Tentando endpoint alternativo...');
    
    // Tentar endpoint diferente baseado na documentação
    const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles?npLanguage=pt-BR`;
    
    console.log(`📡 URL alternativa: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Endpoint alternativo também falhou: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const titles = data.trophyTitles || [];
    
    console.log(`✅ Endpoint alternativo retornou ${titles.length} títulos`);
    return titles;
  }

  private transformGameData(title: TrophyTitle) {
    const hasPlatinum = title.earnedTrophies.platinum > 0;
    const completionRate = title.progress;
    
    // Calcular métricas baseadas nos dados reais
    const totalTrophies = Object.values(title.definedTrophies).reduce((a, b) => a + b, 0);
    const earnedTrophies = Object.values(title.earnedTrophies).reduce((a, b) => a + b, 0);
    
    const rarity = this.calculateRarity(completionRate, earnedTrophies);
    const difficulty = this.calculateDifficulty(completionRate, rarity);

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
      isGoty: this.isGotyGame(title.trophyTitleName),
      difficulty,
      rarity,
      hasPlatinum,
      completionPercentage: completionRate,
      isRare: rarity < 20,
      isHighDifficulty: difficulty >= 7,
      // Dados adicionais para análise
      totalTrophies,
      // IDs para referência futura
      npCommunicationId: title.npCommunicationId,
      npServiceName: title.npServiceName
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
    
    const genreMap: { [key: string]: string[] } = {
      'Sports': ['fifa', 'nba', 'mlb', 'pga', 'ufc', 'wwe', 'madden', 'nhl'],
      'Shooter': ['call of duty', 'battlefield', 'destiny', 'doom', 'wolfenstein', 'overwatch'],
      'Racing': ['gran turismo', 'need for speed', 'driveclub', 'wreckfest', 'dirt'],
      'RPG': ['final fantasy', 'persona', 'witcher', 'elden ring', 'dragon quest', 'mass effect', 'skyrim'],
      'Platform': ['crash', 'spyro', 'ratchet', 'jak', 'sackboy', 'littlebigplanet'],
      'Action/Adventure': ['uncharted', 'tomb raider', 'assassin', 'horizon', 'spider-man', 'god of war', 'last of us'],
      'Fighting': ['street fighter', 'tekken', 'mortal kombat', 'guilty gear', 'soulcalibur']
    };

    for (const [genre, keywords] of Object.entries(genreMap)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return genre;
      }
    }

    return 'Other';
  }

  private estimateTimeToPlatinum(totalTrophies: number, progress: number): number {
    if (progress < 100) return 0; // Não platina ainda
    
    // Estimativas baseadas em número de troféus
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

  private isGotyGame(gameTitle: string): boolean {
    const gotyGames = [
      'the last of us', 'god of war', 'bloodborne', 'hollow knight',
      'elden ring', 'sekiro', 'witcher 3', 'red dead redemption 2',
      'dragon age inquisition', 'overwatch', 'the legend of zelda'
    ];
    
    return gotyGames.some(goty => gameTitle.toLowerCase().includes(goty));
  }
}