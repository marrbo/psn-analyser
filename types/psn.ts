import { ObjectId } from "mongodb";

export interface Trophy {
  isEarned: boolean;
  earnedOn: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: string;
  earnedRate: number;
  trophyName: string;
  groupId: string;
}

export interface PSNUser {
  _id?: ObjectId;
  _cacheId: string;
  accountId: string;
  onlineId?: string;
  fullProfile?: SocialMetadata;
  lastAnalysisId?: string;
  userPresence?: UserProfile;
}

export interface UserPresence   {
  onlineStatus: string;
  platform: string,
  lastOnlineDate: Date
  error?: { reason: string }
}

export interface AvailabilityInfo {
  availability: string;
}

export interface PrimaryPlatformInfo {
  onlineStatus: string;
  platform: string;
  lastOnlineDate: string;
}

export interface ConceptIconUrl {
  conceptIconUrl: string;
}

export interface GameTitleInfo {
  npTitleId: string;
  titleName: string;
  format: string;
  launchPlatform: string;
}

export interface GameTitleInfoList {
  gameTitleInfoList: GameTitleInfo[];
}

export interface UserProfile {
  availabilityInfo: AvailabilityInfo;
  primaryPlatformInfo: PrimaryPlatformInfo;
  gameTitleInfoList: GameTitleInfoList;
}

export interface ProfilePictures {
  size: [ "s", "m", "l", "xl" ];
  url: string;
}

export interface PersonalDetail {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePictures: ProfilePictures[];
}

export interface ImageList {
  size: [ "s", "m", "l", "xl" ];
  url: string
}

export interface SocialMetadata {
  onlineId: string;
  personalDetail: PersonalDetail;
  aboutMe: string;
  avatars: [ImageList],
  languages: [string];
  isPlus: boolean;
  isOfficiallyVerified: boolean;
  isMe: boolean;
}

export interface Result {
    id: string;
    type: string;
    score: number;
    socialMetadata: SocialMetadata;
    relevancyScore: number;
}

export interface DomainResponse {
    domain: string;
    domainTitle: string;
    domainExpandedTitle: string;
    domainTitleMessageId: string;
    domainTitleHighlight: string[];
    zeroState: boolean;
    next: string;
    totalResultCount: number;
    results: Result[];
}

export interface ResponseData {
    prefix: string;
    domainResponses: DomainResponse[];
    responseStatus: Array<{
        status: string;
        statusMessage: string;
    }>;
    strandPaginationResponse: {
        pageSize: number;
        offset: number;
        lastPage: boolean;
    };
    fallbackQueried: boolean;
    queryFrequency: {
        searchDebounceMs: number;
        filterDebounceMs: number;
    };
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