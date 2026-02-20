// types/playstation.ts
export interface PlayStationMedia {
  __typename: string;
  role: string;
  type: string;
  url: string;
}

export interface PlayStationGame {
  id: string;
  name: string;
  invariantName: string;
  platforms: string[];
  media: PlayStationMedia[];
  storeDisplayClassification: string | null;
  localizedStoreDisplayClassification: string | null;
  type: string;
  itemType: string;
  price: any;
  defaultProduct?: {
    id: string;
    name: string;
    platforms: string[];
    media: PlayStationMedia[];
  };
}

export interface SearchResultItem {
  __typename: string;
  id: string;
  highlight: {
    __typename: string;
    name: string[];
  };
  result: PlayStationGame;
}

export interface SearchDomainResult {
  __typename: string;
  domain: string;
  domainTitle: string;
  next: string;
  searchResults: SearchResultItem[];
  totalResultCount: number;
  zeroState: boolean;
}

export interface PlayStationSearchResponse {
  data: {
    universalContextSearch: {
      __typename: string;
      queryFrequency: {
        __typename: string;
        filterDebounceMs: number;
        searchDebounceMs: number;
      };
      results: SearchDomainResult[];
    };
  };
}

export interface ExtractedGameData {
  id: string;
  name: string;
  platforms: string[];
  media: {
    editionKeyArt?: string;
    fourByThreeBanner?: string;
    preview?: string;
    gamehubCoverArt?: string;
    logo?: string;
    portraitBanner?: string;
    master?: string;
  };
  highlight: string[];
  storeDisplayClassification: string | null;
  type: string;
}

export type MediaRole = 
  | 'EDITION_KEY_ART'
  | 'FOUR_BY_THREE_BANNER'
  | 'PREVIEW'
  | 'GAMEHUB_COVER_ART'
  | 'LOGO'
  | 'PORTRAIT_BANNER'
  | 'MASTER';

export interface SearchOptions {
  searchTerm: string;
  authorizationToken: string;
  pageSize?: number;
  locale?: string;
  searchContext?: string;
  searchDomain?: string;
}