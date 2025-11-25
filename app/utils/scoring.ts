// app/utils/scoring.ts

export interface ScoringFactors {
  platinumCount: number;
  totalGames: number;
  completionRate: number;
  rarePlatinas: number;
  gotyGames: number;
  highDifficultyGames: number;
}

export interface ScoreBreakdown {
  platinas: number;
  completude: number;
  rarePlatinas: number;
  goty: number;
  highDifficulty: number;
  total: number;
  classification: string;
  emoji: string;
  description: string;
}

export function calculateMigueScore(factors: ScoringFactors): ScoreBreakdown {
  const {
    platinumCount,
    totalGames,
    completionRate,
    rarePlatinas,
    gotyGames,
    highDifficultyGames
  } = factors;

  // 1. PLATINAS (30 pontos): Taxa de platinas = (platinas conquistadas ÷ total de jogos) × 100
  const platinasRate = totalGames > 0 ? (platinumCount / totalGames) * 100 : 0;
  const platinasScore = Math.min(platinasRate * 0.3, 30);

  // 2. COMPLETUDE (20 pontos): % de completude média do perfil × 0.2
  const completudeScore = Math.min(completionRate * 0.2, 20);

  // 3. PLATINAS RARAS (20 pontos): Platinas com raridade < 20% no PSN (cada = 2 pontos)
  const rarePlatinasScore = Math.min(rarePlatinas * 2, 20);

  // 4. JOGOS GOTY (15 pontos): Jogos que ganharam Game of The Year (cada = 3 pontos)
  const gotyScore = Math.min(gotyGames * 3, 15);

  // 5. ALTA DIFICULDADE (15 pontos): Jogos com dificuldade 7/10+ (cada = 2 pontos)
  const highDifficultyScore = Math.min(highDifficultyGames * 2, 15);

  const totalScore = Math.round(
    platinasScore + completudeScore + rarePlatinasScore + gotyScore + highDifficultyScore
  );

  // Classificação Mi Mi Mi
  let classification, emoji, description;

  if (totalScore <= 40) {
    classification = "MIADO";
    emoji = "🐱";
    description = "Foco em platinas fáceis, jogos simples, poucos troféus raros";
  } else if (totalScore <= 70) {
    classification = "MIGUÉ";
    emoji = "😺";
    description = "Equilíbrio entre dificuldade e variedade, algumas platinas raras";
  } else if (totalScore <= 90) {
    classification = "MISERÊ";
    emoji = "😻";
    description = "Muitas platinas raras, jogos GOTY, alta dificuldade (7/10+)";
  } else {
    classification = "MISERAVÃO";
    emoji = "🏆";
    description = "Lenda do trophy hunting, perfil excepcional em todos os aspectos";
  }

  return {
    platinas: Math.round(platinasScore),
    completude: Math.round(completudeScore),
    rarePlatinas: Math.round(rarePlatinasScore),
    goty: Math.round(gotyScore),
    highDifficulty: Math.round(highDifficultyScore),
    total: totalScore,
    classification,
    emoji,
    description
  };
}

// Função para calcular estatísticas dos gêneros baseada na nova taxonomia
export function calculateGenreStats(games: any[] | undefined | null) {
  // Verificação de segurança
  if (!games || !Array.isArray(games) || games.length === 0) {
    console.warn('⚠️ calculateGenreStats: games é undefined, null ou array vazio');
    return [];
  }

  const genreTaxonomy = {
    "Ação": ["plataforma", "fps", "tps", "luta", "beat em up", "stealth", "battle royale", "hack and slash"],
    "Ação-Aventura": ["metroidvania", "survival horror", "mundo aberto", "stealth-action"],
    "Aventura": ["point-and-click", "visual novel", "walking simulator", "filme interativo"],
    "RPG": ["action rpg", "jrpg", "crpg", "mmorpg", "roguelike", "roguelite", "rpg tático", "soulslike"],
    "Estratégia": ["rts", "tbs", "4x", "moba", "tower defense", "grand strategy", "auto battler"],
    "Simulação": ["life sim", "city builder", "veículos", "immersive sim"],
    "Esportes": ["esportes", "corrida", "simulação esportes", "esportes combate"],
    "Puzzle": ["puzzle", "match-3", "party game", "trivia", "ritmo"],
    "Outros": ["sandbox", "idle", "clicker", "gacha", "fitness"]
  };

  const genreCount: { [key: string]: number } = {};
  const genrePlatinas: { [key: string]: number } = {};
  const genreCompletion: { [key: string]: number } = {};

  try {
    games.forEach(game => {
      // Verificação adicional para cada game
      if (!game || typeof game !== 'object') {
        console.warn('⚠️ Game inválido encontrado:', game);
        return;
      }

      const gameTitle = (game.title || '').toLowerCase();
      let genreFound = "Outros";

      // Buscar gênero baseado na taxonomia
      for (const [genre, keywords] of Object.entries(genreTaxonomy)) {
        if (keywords.some(keyword => gameTitle.includes(keyword.toLowerCase()))) {
          genreFound = genre;
          break;
        }
      }

      // Contagem por gênero
      genreCount[genreFound] = (genreCount[genreFound] || 0) + 1;
      
      // Platinas por gênero
      if (game.hasPlatinum) {
        genrePlatinas[genreFound] = (genrePlatinas[genreFound] || 0) + 1;
      }

      // Acumular completion rate para média
      if (!genreCompletion[genreFound]) {
        genreCompletion[genreFound] = 0;
      }
      
      const completion = Number(game.completionPercentage) || 0;
      genreCompletion[genreFound] += completion;
    });

    // Calcular completion rate médio por gênero
    const genreStats = Object.keys(genreCount).map(genre => {
      const gamesCount = genreCount[genre];
      const platinasCount = genrePlatinas[genre] || 0;
      const totalCompletion = genreCompletion[genre] || 0;
      const avgCompletion = gamesCount > 0 ? totalCompletion / gamesCount : 0;

      return {
        name: genre,
        games: gamesCount,
        platinas: platinasCount,
        completion: Math.round(avgCompletion * 100) / 100,
        completionPercentage: Math.round(avgCompletion)
      };
    });

    return genreStats.sort((a, b) => b.games - a.games);

  } catch (error) {
    console.error('💥 Erro em calculateGenreStats:', error);
    return [];
  }
}

// Função auxiliar para formatar tempo
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}