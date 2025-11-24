// src/lib/analysis.ts
export class AnalysisService {
  static analyzeProfile(games: any[], accountId: string) {
    const validGames = games.filter(game => game && game.progress > 0);
    
    return {
      accountId,
      overallSummary: this.calculateOverallSummary(validGames),
      genreAnalysis: this.analyzeByGenre(validGames),
      timePatterns: this.analyzeTimePatterns(validGames),
      performanceMetrics: this.calculatePerformanceMetrics(validGames),
      miseraveScore: this.calculateMiseraveScore(validGames),
      games: validGames
    };
  }

  private static calculateOverallSummary(games: any[]) {
    const totalGames = games.length;
    const totalPlatinums = games.filter(game => game.hasPlatinum).length;
    const totalTrophies = games.reduce((sum, game) => sum + 
      game.earnedTrophies.bronze + game.earnedTrophies.silver + 
      game.earnedTrophies.gold + game.earnedTrophies.platinum, 0);

    const averageCompletion = games.reduce((sum, game) => sum + game.progress, 0) / totalGames;

    return {
      totalGames,
      totalPlatinums,
      totalTrophies,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
      completionRate: Math.round(averageCompletion)
    };
  }

  private static analyzeByGenre(games: any[]) {
    const genreMap = new Map();
    
    games.forEach(game => {
      const genre = game.genre;
      if (!genreMap.has(genre)) {
        genreMap.set(genre, []);
      }
      genreMap.get(genre).push(game);
    });

    return Array.from(genreMap.entries()).map(([genre, genreGames]) => ({
      genre,
      count: genreGames.length,
      platinums: genreGames.filter((g: any) => g.hasPlatinum).length,
      averageCompletion: Math.round(genreGames.reduce((sum: number, g: any) => sum + g.progress, 0) / genreGames.length * 100) / 100
    })).sort((a, b) => b.count - a.count);
  }

  private static analyzeTimePatterns(games: any[]) {
    return {
      quick: games.filter(game => game.timeToPlatinum < 20).length,
      moderate: games.filter(game => game.timeToPlatinum >= 20 && game.timeToPlatinum <= 60).length,
      long: games.filter(game => game.timeToPlatinum > 60).length
    };
  }

  private static calculatePerformanceMetrics(games: any[]) {
    const completedGames = games.filter(game => game.progress === 100).length;
    const conversionRate = games.length > 0 ? (completedGames / games.length) * 100 : 0;

    return {
      conversionRate: Math.round(conversionRate * 100) / 100,
      averagePlatinumTime: Math.round(games.filter(g => g.hasPlatinum).reduce((sum, g) => sum + g.timeToPlatinum, 0) / completedGames * 100) / 100 || 0
    };
  }

  private static calculateMiseraveScore(games: any[]) {
    const totalGames = games.length;
    const totalPlatinums = games.filter(game => game.hasPlatinum).length;
    const rarePlatinums = games.filter(game => game.hasPlatinum && game.rarity < 20).length;
    const gotyGames = games.filter(game => game.isGoty).length;
    const hardGames = games.filter(game => game.isHighDifficulty).length;

    const platinaPoints = Math.min(30, (totalPlatinums / totalGames) * 100 * 0.3);
    const completenessPoints = Math.min(20, (games.reduce((sum, g) => sum + g.progress, 0) / totalGames) * 0.2);
    const rarePlatinaPoints = Math.min(20, rarePlatinums * 2);
    const gotyPoints = Math.min(15, gotyGames * 3);
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
}