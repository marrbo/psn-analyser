import { ObjectId } from "mongodb";
import { GOTYGame } from "./analysis.type";
import { GameMetacritic } from "./metacritc";
import { PSNUser } from "./psn";

export interface DefinedTrophies {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface TrophyGroup {
  accountId?: string;
  npCommunicationId?: string;
  trophyGroupId: string;
  trophyGroupName: string;
  trophyGroupIconUrl: string;
  definedTrophies: DefinedTrophies;
  earnedTrophies: DefinedTrophies;
  progress: number;
  trophies: Array<TrophyDetail>;
  lastUpdated?: Date;
}

export interface TrophyDetail {
  trophyId: number;
  trophyHidden: boolean;
  trophyType: 'bronze' | 'silver' | 'gold' | 'platinum';
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyRare: number;
  trophyEarnedRate: number;
  trophyProgressTarget: number;
  earned: boolean;
  earnedDateTime?: string | null;
  progress?: number;
  progressRate: number;
  progressedDateTime: Date | null;
  trophyProgressTargetValue?: string;
  rarestTrophies: TrophyDetail[];
}

export interface RarityStats {
  earnedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
  totalEarned: number;
  totalTrophies: number;
  completionPercentage: number;
  trophyGroups: TrophyGroup[];
  gameName: string;
  psnUser?: PSNUser | null;
}


export interface TrophySummary {
  _id?: ObjectId;
  accountId: string;
  trophyLevel: number;
  progress: number;
  tier: number;
  trophyPoint: number;
  trophyLevelBasePoint: number;
  trophyLevelNextPoint: number;
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  totalTrophies: number;
  renewAt: Date;
}

export interface GotyStats {
  totalGotyGames: number;
  gotyGames: Array<GOTYGame & { userGame: GameTitle }>;
  completionRate: number;
  completedGames: number;
  byYear: { [year: number]: number };
}

export interface TrophyTitle {
  npTitleId: any;
  titleId: string
  backgroundImage?: string;
  heroImage?: string;
  logoImage?: string;
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleDetail: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  definedTrophies: DefinedTrophies;
  earnedTrophies: DefinedTrophies;
  progress: number;
  metacritc: GameMetacritic | null;
  lastUpdatedDateTime: string;
  trophyGroups: TrophyGroup[];
  isGoty: boolean;
  gotyData?: GOTYGame | undefined | null;
  gameTitle: GameTitle;
  hasTrophyGroups: boolean;
  hidden: boolean;
  npServiceName: string;
  trophyGroupCount: number;
  trophySetVersion: string;
}


// Enums para valores fixos
export enum MediaFormat {
  UNKNOWN = 'UNKNOWN',
  // Adicione outros formatos conforme necessário
}

export enum MediaType {
  BACKGROUND_LAYER_ART = 'BACKGROUND_LAYER_ART',
  FOUR_BY_THREE_BANNER = 'FOUR_BY_THREE_BANNER',
  GAMEHUB_COVER_ART = 'GAMEHUB_COVER_ART',
  HERO_CHARACTER = 'HERO_CHARACTER',
  LOGO = 'LOGO',
  PORTRAIT_BANNER = 'PORTRAIT_BANNER',
  MASTER = 'MASTER',
  // Adicione outros tipos conforme necessário
}

export enum Genre {
  ROLE_PLAYING_GAMES = 'ROLE_PLAYING_GAMES',
  // Adicione outros gêneros conforme necessário
}

export enum Category {
  PS4_GAME = 'ps4_game',
  // Adicione outras categorias conforme necessário
}

export enum Service {
  PS_PLUS = 'ps_plus',
  // Adicione outros serviços conforme necessário
}

// Interfaces principais
export interface MediaItem {
  url: string;
  format: MediaFormat;
  type: MediaType;
}

export interface MediaCollection {
  audios: MediaItem[];
  videos: MediaItem[];
  images: MediaItem[];
}

export interface LocalizedName {
  defaultLanguage: string;
  metadata: Record<string, string>; // Mapeia locale -> nome localizado
}

export interface Concept {
  id: number;
  titleIds: string[];
  name: string;
  media: MediaCollection;
  genres: Genre[];
  localizedName: LocalizedName;
  country: string;
  language: string;
}

export interface GameTitle {
  category: string;
  lastUpdatedDateTime: string;
  logoImage: string | undefined;
  heroImage: string | undefined;
  backgroundImage: string | undefined;
  titleId: string;
  name: string;
  localizedName: string;
  imageUrl: string;
  localizedImageUrl: string;
  service: Service;
  sortableName: string;
  playCount: number;
  concept: Concept;
  media: MediaCollection;
  firstPlayedDateTime: string; // ISO 8601 date-time string
  lastPlayedDateTime: string; // ISO 8601 date-time string
  playDuration: string; // ISO 8601 duration format (PT#H#M#S)
  trophyTitle: TrophyTitle;
  trophyGroups: TrophyGroup[];
  
  definedTrophies: DefinedTrophies;
  earnedTrophies: DefinedTrophies;
  platform: string;
  trophyCount: number;
  npServiceName: string;
  npCommunicationId: string;
  genre: string;
  timeToPlatinum: number;
  estimatedTimeToPlatinum: number;
  metacriticScore: number;
  difficulty: number;
  rarity: number;
  hasPlatinum: boolean;
  completionPercentage: number;
  isRare: boolean;
  isHighDifficulty: boolean;
  totalTrophies: number;
}