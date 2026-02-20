import { BaseRepository } from "@/lib/mongodb-base-repository";
import { Filter } from "mongodb";
import { TrophySummary } from "../trophies";

export class TrophySumaryRepository<T extends TrophySummary> extends BaseRepository<T> {
  constructor() {
    super({ collectionName: 'trophy-summary' });
  }

  async findByAccountId(accountId: string) {
    const data = await this.findOne({ accountId } as Filter<T>);
    return data;
  }
}

export const trophySumaryRepository = new TrophySumaryRepository();