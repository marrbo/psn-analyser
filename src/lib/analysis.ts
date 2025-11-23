// src/lib/analysis.ts
import { PlayerProfile, Game, GenreStats, TimePattern, PlayerArchetype } from '@/types/psn';

export class AnalysisService {
  static analyzeProfile(games: Game[], accountId: string): PlayerProfile {
    // 1. Resumo Geral
    const overallSummary = this.calculateOverallSummary(games);
    
    // 2. Análise por Gênero
    const genreAnalysis = this.analyzeByGenre(games);
    
    // 3. Padrões de Tempo
    const timePatterns = this.analyzeTimePatterns(games);
    
    // 4. Jogos GOTY
    const gotyGames = this.findGotyGames(games);
    
    // 5. Métricas de Desempenho
    const performanceMetrics = this.calculatePerformanceMetrics(games);
    
    // 6. Perfil do Jogador
    const playerProfile = this.determinePlayerProfile(games, genreAnalysis);
    
    // 7. Recomendações
    const recommendations = this.generateRecommendations(playerProfile, genreAnalysis);
    
    // 8. Classificação Mi Mi Mi
    const miseraveScore = this.calculateMiseraveScore(games, gotyGames, overallSummary);

    return {
      accountId,
      overallSummary,
      genreAnalysis,
      timePatterns,
      gotyGames,
      performanceMetrics,
      playerProfile,
      recommendations,
      miseraveScore,
      games: this.enrichGamesData(games)
    };
  }

  private static calculateOverallSummary(games: Game[]) {
    const totalGames = games.length;
    const totalPlatinums = games.filter(game => game.trophyCount.platinum > 0 && 
      game.earnedTrophies.platinum === game.trophyCount.platinum).length;
    
    const totalTrophies = games.reduce((sum, game) => 
      sum + game.earnedTrophies.bronze + game.earnedTrophies.silver + 
      game.earnedTrophies.gold + game.earnedTrophies.platinum, 0);

    const totalPossibleTrophies = games.reduce((sum, game) => 
      sum + game.trophyCount.bronze + game.trophyCount.silver + 
      game.trophyCount.gold + game.trophyCount.platinum, 0);

    const completionRate = totalPossibleTrophies > 0 ? 
      (totalTrophies / totalPossibleTrophies) * 100 : 0;

    const averageTimeToPlatinum = games
      .filter(game => game.timeToPlatinum)
      .reduce((sum, game) => sum + game.timeToPlatinum, 0) / 
      games.filter(game => game.timeToPlatinum).length;

    return {
      totalGames,
      totalPlatinums,
      totalTrophies,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTimeToPlatinum: Math.round(averageTimeToPlatinum * 100) / 100,
      efficiency: this.calculateEfficiency(games),
      psnpScore: this.calculatePSNPScore(games)
    };
  }

  private static analyzeByGenre(games: Game[]): GenreStats[] {
    const genreMap = new Map<string, Game[]>();
    
    games.forEach(game => {
      if (!genreMap.has(game.genre)) {
        genreMap.set(game.genre, []);
      }
      genreMap.get(game.genre)!.push(game);
    });

    return Array.from(genreMap.entries()).map(([genre, genreGames]) => {
      const platinums = genreGames.filter(game => 
        game.earnedTrophies.platinum === game.trophyCount.platinum && 
        game.trophyCount.platinum > 0
      ).length;

      const totalTime = genreGames
        .filter(game => game.timeToPlatinum)
        .reduce((sum, game) => sum + game.timeToPlatinum, 0);
      
      const avgTime = platinums > 0 ? totalTime / platinums : 0;

      const metacriticScores = genreGames
        .filter(game => game.metacriticScore)
        .map(game => game.metacriticScore);
      
      const avgMetacritic = metacriticScores.length > 0 ? 
        metacriticScores.reduce((sum, score) => sum + score, 0) / metacriticScores.length : 0;

      return {
        genre,
        count: genreGames.length,
        platinums,
        averageTime: Math.round(avgTime * 100) / 100,
        averageMetacritic: Math.round(avgMetacritic * 100) / 100,
        completionRate: this.calculateGenreCompletionRate(genreGames)
      };
    }).sort((a, b) => b.count - a.count);
  }

  private static analyzeTimePatterns(games: Game[]): TimePattern {
    const timePatterns = {
      quick: 0,      // < 20h
      moderate: 0,   // 20-60h
      long: 0        // > 60h
    };

    games.forEach(game => {
      if (!game.timeToPlatinum) return;
      
      if (game.timeToPlatinum < 20) {
        timePatterns.quick++;
      } else if (game.timeToPlatinum <= 60) {
        timePatterns.moderate++;
      } else {
        timePatterns.long++;
      }
    });

    return timePatterns;
  }

  private static findGotyGames(games: Game[]): Game[] {
    return games.filter(game => game.isGoty || game.metacriticScore >= 90);
  }

  private static calculatePerformanceMetrics(games: Game[]) {
    const startedGames = games.length;
    const completedGames = games.filter(game => 
      game.progress === 100
    ).length;

    const conversionRate = startedGames > 0 ? 
      (completedGames / startedGames) * 100 : 0;

    const highQualityGames = games.filter(game => 
      game.metacriticScore >= 85
    ).length;

    const highQualityPercentage = games.length > 0 ? 
      (highQualityGames / games.length) * 100 : 0;

    return {
      conversionRate: Math.round(conversionRate * 100) / 100,
      highQualityGamesPercentage: Math.round(highQualityPercentage * 100) / 100,
      averagePlatinumSpeed: this.calculateAveragePlatinumSpeed(games)
    };
  }

  private static determinePlayerProfile(games: Game[], genreAnalysis: GenreStats[]): PlayerArchetype {
    const topGenres = genreAnalysis.slice(0, 3).map(g => g.genre);
    const completionRate = this.calculateOverallCompletionRate(games);
    const hasRarePlatinums = games.some(game => 
      game.rarity < 20 && game.earnedTrophies.platinum > 0
    );

    let archetype = 'Explorer';
    let strategy = 'Casual';
    
    if (completionRate > 80) {
      archetype = 'Completionist';
      strategy = '100% Focus';
    } else if (hasRarePlatinums) {
      archetype = 'Trophy Hunter';
      strategy = 'Rare Trophies';
    }

    return {
      archetype,
      preferences: topGenres,
      completenessPatterns: completionRate > 70 ? 'High' : completionRate > 40 ? 'Medium' : 'Low',
      trophyHuntingStrategy: strategy,
      challengeBalance: this.determineChallengeBalance(games)
    };
  }

  private static calculateMiseraveScore(games: Game[], gotyGames: Game[], overallSummary: any) {
    // 1. PLATINAS (30 pontos)
    const platinaRate = (overallSummary.totalPlatinums / overallSummary.totalGames) * 100;
    const platinaPoints = Math.min(30, (platinaRate / 100) * 30);

    // 2. COMPLETUDE (20 pontos)
    const completenessPoints = Math.min(20, overallSummary.completionRate * 0.2);

    // 3. PLATINAS RARAS (20 pontos)
    const rarePlatinas = games.filter(game => 
      game.rarity < 20 && game.earnedTrophies.platinum > 0
    ).length;
    const rarePlatinaPoints = Math.min(20, rarePlatinas * 2);

    // 4. JOGOS GOTY (15 pontos)
    const gotyPoints = Math.min(15, gotyGames.length * 3);

    // 5. ALTA DIFICULDADE (15 pontos)
    const hardGames = games.filter(game => game.difficulty >= 7).length;
    const difficultyPoints = Math.min(15, hardGames * 2);

    const totalScore = platinaPoints + completenessPoints + rarePlatinaPoints + gotyPoints + difficultyPoints;

    let classification = '🐱 MIADO';
    if (totalScore >= 91) classification = '🏆 MISERAVÃO';
    else if (totalScore >= 76) classification = '😻 MISERÊ';
    else if (totalScore >= 41) classification = '😺 MIGUÉ';

    return {
      total: Math.round(totalScore),
      breakdown: {
        platinas: Math.round(platinaPoints),
        completeness: Math.round(completenessPoints),
        rarePlatinas: Math.round(rarePlatinaPoints),
        goty: Math.round(gotyPoints),
        highDifficulty: Math.round(difficultyPoints)
      },
      classification
    };
  }

  private static generateRecommendations(playerProfile: PlayerArchetype, genreAnalysis: GenreStats[]): string[] {
    const recommendations: string[] = [];
    
    if (playerProfile.completenessPatterns === 'Low') {
      recommendations.push('Foque em completar mais jogos para aumentar sua taxa de completude');
    }
    
    if (playerProfile.rarePlatinas < 5) {
      recommendations.push('Tente conquistar mais platinas raras para melhorar seu score');
    }

    const topGenre = genreAnalysis[0];
    if (topGenre) {
      recommendations.push(`Você domina ${topGenre.genre}, experimente explorar novos gêneros`);
    }

    return recommendations;
  }

  private static enrichGamesData(games: Game[]): Game[] {
    return games.map(game => ({
      ...game,
      hasPlatinum: game.trophyCount.platinum > 0,
      completionPercentage: this.calculateGameCompletion(game),
      isRare: game.rarity < 20,
      isHighDifficulty: game.difficulty >= 7
    }));
  }

  // Métodos auxiliares...
  private static calculateEfficiency(games: Game[]): number {
    // Implementar cálculo de eficiência
    return 85;
  }

  private static calculatePSNPScore(games: Game[]): number {
    // Implementar cálculo de score PSNP
    return 4.5;
  }

  private static calculateGenreCompletionRate(games: Game[]): number {
    const total = games.reduce((sum, game) => sum + game.progress, 0);
    return games.length > 0 ? total / games.length : 0;
  }

  private static calculateAveragePlatinumSpeed(games: Game[]): number {
    const platinumGames = games.filter(game => game.timeToPlatinum);
    return platinumGames.length > 0 ? 
      platinumGames.reduce((sum, game) => sum + game.timeToPlatinum, 0) / platinumGames.length : 0;
  }

  private static calculateOverallCompletionRate(games: Game[]): number {
    const totalProgress = games.reduce((sum, game) => sum + game.progress, 0);
    return games.length > 0 ? totalProgress / games.length : 0;
  }

  private static calculateGameCompletion(game: Game): number {
    return game.progress;
  }

  private static determineChallengeBalance(games: Game[]): string {
    const hardGames = games.filter(game => game.difficulty >= 7).length;
    const ratio = hardGames / games.length;
    
    if (ratio > 0.6) return 'Challenge Seeker';
    if (ratio > 0.3) return 'Balanced';
    return 'Casual Focus';
  }
}