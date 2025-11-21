export interface Trophy {
  isEarned: boolean;
  earnedOn: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: string;
  earnedRate: number;
  trophyName: string;
  groupId: string;
}

export interface Game {
  gameName: string;
  platform: string;
  trophyTypeCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  earnedCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  trophyList: Trophy[];
  completionPercentage?: number;
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