import { PontuacaoPlatinasResult } from "@/lib/calcular-platinas";
import { NormalizedScore, UserPlatinumData } from "@/lib/score.types";
import { ObjectId } from "mongodb";

export interface GOTYGame {
  _id?: ObjectId;
  titulo: string;
  ano_premiacao: number;
  desenvolvedora: string;
  metacritic_score: number;
  plataformas: string[];
  imagem_capa: string;
  search_terms: string[];
  alternative_titles: string[];
}

export interface GotyMatchResult {
  isGoty: boolean;
  gameData?: GOTYGame;
  matchType: 'exact' | 'partial' | 'alternative' | 'none';
  confidence: number;
}

export interface GameAward {
  titulo: string;
  ano_premiacao: number;
  desenvolvedora: string;
  metacritic_score: number;
  plataformas: string[];
  imagem_capa: string;
  search_terms: string[];
  alternative_titles: string[];
};

export interface CacheItem<T> {
  data: T;
  expiry: number;
}

export interface ScoringFactors {
  platinumCount: number;
  platinumCount100: number;
  platinumGroupScore: Record<string, number>;
  platinumData: UserPlatinumData;
  trophyLevel: number;
  totalGames: number;
  completedGames: number,
  completionRate: number;
  platinasOcultas: number;
  highDifficultyGames: number;
  highMetacriticScoreGames: number;
}

export interface ScoreBreakdown {
  platinasScore: NormalizedScore;
  completudeScore: number;
  platinas100: number;
  platinasOcultas: number;
  platinasRazao: number;
  platinumData: UserPlatinumData;
  highDifficultyScore: number;
  highMetacriticScore: number;
  completedGames: number;
  totalScore: number;
  classification: string;
  emoji: string;
  description: string;
}