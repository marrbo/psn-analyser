export interface Trophy {
  isEarned: boolean;
  earnedOn: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: string;
  earnedRate: number;
  trophyName: string;
  groupId: string;
}

export interface PlayerProfile {
  accountId: string;
  username: string;
  games: Game[];
  totalStats: {
    games: number;
    platinums: number;
    gold: number;
    silver: number;
    bronze: number;
    totalTrophies: number;
    completionRate: number;
    efficiency: number;
    psnpScore: number;
  };
  playerArchetype: string;
  score: number;
  category: string;
}

export interface PlayerProfile {
  accountId: string;
  overallSummary: {
    totalGames: number;
    totalPlatinums: number;
    totalTrophies: number;
    completionRate: number;
    averageTimeToPlatinum: number;
    efficiency: number;
    psnpScore: number;
  };
  genreAnalysis: GenreStats[];
  timePatterns: TimePattern;
  gotyGames: Game[];
  performanceMetrics: {
    conversionRate: number;
    highQualityGamesPercentage: number;
    averagePlatinumSpeed: number;
  };
  playerProfile: PlayerArchetype;
  recommendations: string[];
  miseraveScore: {
    total: number;
    breakdown: {
      platinas: number;
      completeness: number;
      rarePlatinas: number;
      goty: number;
      highDifficulty: number;
    };
    classification: string;
  };
  games: Game[];
}

export interface GenreStats {
  genre: string;
  count: number;
  platinums: number;
  averageTime: number;
  averageMetacritic: number;
  completionRate: number;
}

export interface TimePattern {
  quick: number;
  moderate: number;
  long: number;
}

export interface PlayerArchetype {
  archetype: string;
  preferences: string[];
  completenessPatterns: string;
  trophyHuntingStrategy: string;
  challengeBalance: string;
}

export interface Game {
  title: string;
  platform: string;
  trophyCount: {
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
  lastPlayed: Date;
  genre: string;
  timeToPlatinum: number;
  metacriticScore: number;
  isGoty: boolean;
  difficulty: number;
  rarity: number;
  hasPlatinum?: boolean;
  completionPercentage?: number;
  isRare?: boolean;
  isHighDifficulty?: boolean;
}