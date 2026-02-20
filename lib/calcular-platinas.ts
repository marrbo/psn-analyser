// calcular-platinas.ts
import { TrophyDetail } from "@/types/trophies";
import { CalculationMemory, NormalizedScore, UserPlatinumData } from "./score.types";

// Pesos fixos para cada categoria (em porcentagem)
const CATEGORY_WEIGHTS = {
  COMMON: 0.07,      // 7%
  RARE: 0.15,        // 15%
  VERY_RARE: 0.25,   // 25%
  ULTRA_RARE: 0.50,  // 50%
  HIDDEN_PENALTY: 0.2 // -20%
} as const;

// Pontuação por categoria
const CATEGORY_POINTS = {
  COMMON: 3,
  RARE: 5,
  VERY_RARE: 7,
  ULTRA_RARE: 15,
  HIDDEN_PENALTY: -30
} as const;

/**
 * Calcula a média ponderada das platinas
 */
function calculateWeightedAverage(platinumCounts: UserPlatinumData['platinumCounts']): number {
  const { common, rare, veryRare, ultraRare } = platinumCounts;
  const totalVisible = common + rare + veryRare + ultraRare;
  
  if (totalVisible === 0) return 0;
  
  // Calcular percentuais de cada categoria
  const pCommon = common / totalVisible;
  const pRare = rare / totalVisible;
  const pVeryRare = veryRare / totalVisible;
  const pUltraRare = ultraRare / totalVisible;
  
  // Média ponderada: soma(pontuação * peso * percentual)
  const weightedAverage = 
    (CATEGORY_POINTS.COMMON * CATEGORY_WEIGHTS.COMMON * pCommon) +
    (CATEGORY_POINTS.RARE * CATEGORY_WEIGHTS.RARE * pRare) +
    (CATEGORY_POINTS.VERY_RARE * CATEGORY_WEIGHTS.VERY_RARE * pVeryRare) +
    (CATEGORY_POINTS.ULTRA_RARE * CATEGORY_WEIGHTS.ULTRA_RARE * pUltraRare);
  
  return weightedAverage;
}

/**
 * Calcula a pontuação total com penalidades
 */
function calculateTotalScore(platinumCounts: UserPlatinumData['platinumCounts']): {
  totalPoints: number;
  visiblePoints: number;
  hiddenPenalty: number;
} {
  const visiblePoints = 
    platinumCounts.common * CATEGORY_POINTS.COMMON +
    platinumCounts.rare * CATEGORY_POINTS.RARE +
    platinumCounts.veryRare * CATEGORY_POINTS.VERY_RARE +
    platinumCounts.ultraRare * CATEGORY_POINTS.ULTRA_RARE;
  
  const hiddenPenalty = (platinumCounts.hidden || 0) * CATEGORY_POINTS.HIDDEN_PENALTY;
  const totalPoints = visiblePoints + hiddenPenalty;
  
  return {
    totalPoints: Math.max(0, totalPoints),
    visiblePoints,
    hiddenPenalty
  };
}

/**
 * Normaliza o score para a faixa de 0-30
 */
function normalizeScore(
  weightedAverage: number,
  totalPlatinas: number,
  hiddenCount: number
): number {
  // Score base da média ponderada (0-30)
  const baseScore = weightedAverage * 2; // Ajuste para escala 0-30
  
  // Penalidade por platinas ocultas (-1% por cada)
  const hiddenPenaltyMultiplier = 1 - (hiddenCount * CATEGORY_WEIGHTS.HIDDEN_PENALTY);
  
  // Fator de volume: incentivar mais platinas, mas com decrescimento marginal
  const volumeFactor = Math.min(1, Math.log10(totalPlatinas + 1) / 2);
  
  // Cálculo final
  let finalScore = baseScore * hiddenPenaltyMultiplier * volumeFactor;
  
  // Limitar entre 0 e 30
  finalScore = Math.max(0, Math.min(30, finalScore));
  
  return finalScore;
}

// FÓRMULA PRINCIPAL DE NORMALIZAÇÃO - REVISADA
export function calculateNormalizedScore(userData: UserPlatinumData): NormalizedScore {
  const memory: CalculationMemory[] = [];
  const { platinumCounts } = userData;
  
  // Passo 1: Contagem total de platinas
  const totalPlatinas = 
    platinumCounts.common +
    platinumCounts.rare +
    platinumCounts.veryRare +
    platinumCounts.ultraRare +
    (platinumCounts.hidden || 0);
  
  memory.push({
    step: 1,
    description: "Total de platinas",
    value: totalPlatinas,
    unit: "platinas"
  });
  
  // Passo 2: Calcular distribuição percentual
  const totalVisible = platinumCounts.common + platinumCounts.rare + 
                      platinumCounts.veryRare + platinumCounts.ultraRare;
  
  const percentages = {
    common: totalVisible > 0 ? (platinumCounts.common / totalVisible) * 100 : 0,
    rare: totalVisible > 0 ? (platinumCounts.rare / totalVisible) * 100 : 0,
    veryRare: totalVisible > 0 ? (platinumCounts.veryRare / totalVisible) * 100 : 0,
    ultraRare: totalVisible > 0 ? (platinumCounts.ultraRare / totalVisible) * 100 : 0,
    hidden: totalPlatinas > 0 ? ((platinumCounts.hidden || 0) / totalPlatinas) * 100 : 0
  };
  
  memory.push({
    step: 2,
    description: "Distribuição percentual",
    value: 100,
    unit: "%",
    formula: Object.entries(percentages)
      .map(([cat, val]) => `${cat}: ${val.toFixed(1)}%`)
      .join(', ')
  });
  
  // Passo 3: Calcular média ponderada
  const weightedAverage = calculateWeightedAverage(platinumCounts);
  memory.push({
    step: 3,
    description: "Média ponderada",
    value: weightedAverage,
    unit: "pontos",
    formula: `(3×0.07×${percentages.common.toFixed(1)}%) + (5×0.15×${percentages.rare.toFixed(1)}%) + (7×0.25×${percentages.veryRare.toFixed(1)}%) + (15×0.50×${percentages.ultraRare.toFixed(1)}%)`
  });
  
  // Passo 4: Calcular pontuação total
  const { totalPoints, visiblePoints, hiddenPenalty } = calculateTotalScore(platinumCounts);
  memory.push({
    step: 4,
    description: "Pontuação visível",
    value: visiblePoints,
    unit: "pontos",
    formula: `(${platinumCounts.common}×3) + (${platinumCounts.rare}×5) + (${platinumCounts.veryRare}×7) + (${platinumCounts.ultraRare}×15)`
  });
  
  if (platinumCounts.hidden) {
    memory.push({
      step: 5,
      description: "Penalidade por ocultas",
      value: hiddenPenalty,
      unit: "pontos",
      formula: `${platinumCounts.hidden} × (-10)`
    });
  }
  
  // Passo 6: Calcular dificuldade média
  const averageDifficulty = totalVisible > 0 ? visiblePoints / totalVisible : 0;
  memory.push({
    step: 6,
    description: "Dificuldade média",
    value: averageDifficulty,
    unit: "pontos/platina",
    formula: `${visiblePoints} ÷ ${totalVisible}`
  });
  
  // Passo 7: Normalizar para 0-30
  const normalizedScore = normalizeScore(
    weightedAverage,
    totalPlatinas,
    platinumCounts.hidden || 0
  );
  
  memory.push({
    step: 7,
    description: "Score normalizado",
    value: normalizedScore,
    unit: "/30",
    formula: `MédiaPonderada×2 × (1 - ${platinumCounts.hidden || 0}×0.1) × min(1, log10(${totalPlatinas}+1)/2)`
  });
  
  // Criar breakdown
  const scoreBreakdown = [
    {
      category: "Comum",
      count: platinumCounts.common,
      points: CATEGORY_POINTS.COMMON,
      subtotal: platinumCounts.common * CATEGORY_POINTS.COMMON,
      percentage: percentages.common
    },
    {
      category: "Raro",
      count: platinumCounts.rare,
      points: CATEGORY_POINTS.RARE,
      subtotal: platinumCounts.rare * CATEGORY_POINTS.RARE,
      percentage: percentages.rare
    },
    {
      category: "Muito Raro",
      count: platinumCounts.veryRare,
      points: CATEGORY_POINTS.VERY_RARE,
      subtotal: platinumCounts.veryRare * CATEGORY_POINTS.VERY_RARE,
      percentage: percentages.veryRare
    },
    {
      category: "Ultra Raro",
      count: platinumCounts.ultraRare,
      points: CATEGORY_POINTS.ULTRA_RARE,
      subtotal: platinumCounts.ultraRare * CATEGORY_POINTS.ULTRA_RARE,
      percentage: percentages.ultraRare
    },
    {
      category: "Oculto",
      count: platinumCounts.hidden,
      points: CATEGORY_POINTS.HIDDEN_PENALTY,
      subtotal: (platinumCounts.hidden || 0) * CATEGORY_POINTS.HIDDEN_PENALTY,
      percentage: percentages.hidden
    }
  ];
  
  return {
    totalPoints,
    totalGames: totalPlatinas,
    averageDifficulty: Math.round(averageDifficulty * 100) / 100,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    scoreBreakdown,
    calculationMemory: memory,
    distributionScore: weightedAverage * 10 // Convertendo para escala 0-10
  };
}

// Mantenha as outras funções existentes para compatibilidade
export function getPlatinumCountsFromTrophies(trophies: TrophyDetail[]): UserPlatinumData {
  const counts = {
    common: 0,
    rare: 0,
    veryRare: 0,
    ultraRare: 0,
    hidden: 0
  };
  
  trophies.forEach(trophy => {
    const rarity = trophy.trophyRare;
    
    if (rarity === 3) counts.common++;
    else if (rarity === 2) counts.rare++;
    else if (rarity === 1) counts.veryRare++;
    else if (rarity === 0) counts.ultraRare++;
  });
  
  return { platinumCounts: counts };
}

export function processTrophiesToNormalizedScore(trophies: TrophyDetail[]): NormalizedScore {
  const userData = getPlatinumCountsFromTrophies(trophies);
  return calculateNormalizedScore(userData);
}