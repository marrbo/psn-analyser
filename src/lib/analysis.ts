import { Game, PlayerProfile } from '../types/psn';

export class AnalysisService {
  static analyzeProfile(games: Game[], accountId: string): PlayerProfile {
    const totalStats = this.calculateTotalStats(games);
    const score = this.calculateScore(games, totalStats);
    const category = this.getCategory(score);
    const playerArchetype = this.determineArchetype(games);

    return {
      accountId,
      username: 'Player',
      games,
      totalStats,
      playerArchetype,
      score,
      category
    };
  }

  private static calculateTotalStats(games: Game[]) {
    const totals = {
      games: games.length,
      platinums: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      totalTrophies: 0,
      completionRate: 0,
      efficiency: 75, // Placeholder
      psnpScore: 0
    };

    games.forEach(game => {
      totals.platinums += game.earnedCounts.platinum;
      totals.gold += game.earnedCounts.gold;
      totals.silver += game.earnedCounts.silver;
      totals.bronze += game.earnedCounts.bronze;
    });

    totals.totalTrophies = totals.bronze + totals.silver + totals.gold + totals.platinums;
    totals.completionRate = this.calculateOverallCompletion(games);
    totals.psnpScore = this.calculatePSNPScore(totals);

    return totals;
  }

  private static calculateScore(games: Game[], totals: any): number {
    let score = 0;

    // 1. Platinas (0-30 pontos)
    const platinaRate = (totals.platinums / totals.games) * 100;
    score += Math.min(platinaRate, 100) * 0.3;

    // 2. Taxa de Completude (0-20 pontos)
    const completionScore = totals.completionRate * 0.2;
    score += completionScore;

    // 3. Platinas Raras (0-20 pontos)
    const rarePlatinas = this.countRarePlatinas(games);
    score += Math.min(rarePlatinas * 2, 20);

    // 4. Jogos GOTY (0-15 pontos)
    const gotyGames = this.countGOTYGames(games);
    score += Math.min(gotyGames * 3, 15);

    // 5. Alta Dificuldade (0-15 pontos)
    const hardGames = this.countHardGames(games);
    score += Math.min(hardGames * 2, 15);

    return Math.min(score, 100);
  }

  private static getCategory(score: number): string {
    if (score >= 91) return 'Miseravão';
    if (score >= 76) return 'Miserê';
    if (score >= 41) return 'Migué';
    return 'Miado';
  }

  private static determineArchetype(games: Game[]): string {
    return 'Completista Dedicado';
  }

  private static calculateOverallCompletion(games: Game[]): number {
    const totalCompletion = games.reduce((sum, game) => sum + (game.completionPercentage || 0), 0);
    return games.length > 0 ? totalCompletion / games.length : 0;
  }

  private static calculatePSNPScore(totals: any): number {
    return (totals.bronze * 15 + totals.silver * 30 + totals.gold * 90 + totals.platinums * 300) / 100;
  }

  private static countRarePlatinas(games: Game[]): number {
    return games.filter(game => 
      game.earnedCounts.platinum > 0
    ).length;
  }

  private static countGOTYGames(games: Game[]): number {
    const gotyTitles = ['The Last of Us', 'God of War', 'Elden Ring', 'Baldur\'s Gate 3'];
    return games.filter(game => 
      gotyTitles.some(title => game.gameName.includes(title))
    ).length;
  }

  private static countHardGames(games: Game[]): number {
    return games.filter(game => 
      game.trophyList.some(trophy => trophy.earnedRate < 10) &&
      game.earnedCounts.platinum > 0
    ).length;
  }
}