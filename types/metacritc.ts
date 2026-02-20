import { ObjectId } from "mongodb";

export interface GameMetacritic {
  _id?: ObjectId;
  name: string;
  url: string;
  description: string;
  metascore: number;
  platform?: string;
  normalizedName: string;
  npCommunicationId?: string;
  releaseDate: Date;
  rated: string;
  rated_br: string;
}

export interface ScrapingOptions {
  page?: number;
  platforms?: string[];
  yearMin?: number;
  yearMax?: number;
}