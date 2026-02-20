import { BaseRepository } from "@/lib/mongodb-base-repository";
import { AnalysisData } from "@/lib/mongodb";

export class AnalyseRepository extends BaseRepository<AnalysisData> {
  
  constructor() {
    super({ collectionName: 'analyses' });
  }
}

export const analyseRepository = new AnalyseRepository();