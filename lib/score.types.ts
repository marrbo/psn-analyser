export interface UserPlatinumData {
  platinumCounts: {
    common: number;
    hidden?: number;
    rare: number;
    veryRare: number;
    ultraRare: number;
  };
}

export interface NormalizedScore {
  totalPoints: number;
  totalGames: number;
  averageDifficulty: number;
  normalizedScore: number; // 0-30
  scoreBreakdown: {
    category: string;
    count: number;
    points: number;
    subtotal: number;
    percentage: number;
  }[];
  distributionScore: number; // Pontuação da distribuição (0-10)
  calculationMemory: CalculationMemory[];
}

export interface CalculationMemory {
  step: number;
  description: string;
  value: number;
  unit?: string;
  formula?: string;
}