import { BaseRepository } from "@/lib/mongodb-base-repository";
import { PSNUser } from "../psn";
import { Filter } from "mongodb";

export class UserRepository extends BaseRepository<PSNUser> {
  constructor() {
    super({ collectionName: 'users' });
  }
  
  async findByLastAnalysisId(lastAnalysisId: string) {
    return this.findOne({ lastAnalysisId: lastAnalysisId } as Filter<PSNUser>);
  }

  async findByAccountId(accountId: string) {
    const data = await this.findOne({ accountId } as Filter<PSNUser>);
    return data;
  }
}

export const userRepository = new UserRepository();