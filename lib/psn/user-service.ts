import { PSNAuth } from './auth';
import { UserRepository } from '@/types/repository/user-repository';

export class PSNUserService {
  private readonly auth: PSNAuth;
  private readonly userRepository: UserRepository;

  constructor() {
    this.auth = new PSNAuth();
    this.userRepository = new UserRepository();
  }

  async convertPsnIdToAccountId(username: string): Promise<string | null> {
    try {
      const userCache = await this.userRepository.findOne({ onlineId: username });

      if (userCache) {
        const userPresence = await this.getUserPresence(userCache?.accountId);

        if (userPresence && userPresence.currentOnlineId) {
          userCache.userPresence = userPresence.basicPresence;
          await this.userRepository.updateById(userCache._id, userCache);
        }
        
        return userCache.accountId.toString();
      }

      const token = await this.auth.getAccessToken();
      const response = await fetch(
        `https://us-prof.np.community.playstation.net/userProfile/v1/users/${encodeURIComponent(username)}/profile2?fields=accountId,onlineId,currentOnlineId`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      data.profile._cacheId = data.profile.accountId;
      await this.userRepository.create(data.profile);

      if (data.profile.onlineId && data.profile.accountId !== '0') {
        return data.profile.accountId;
      } else {
        console.warn(`❌ Usuário não encontrado: ${username}`);
        return null;
      }
    } catch (error) {
      throw new Error(`💥 Erro ao converter username: ${error}`);
    }
  }

  async getUserPresence(accountId: number | string): Promise<any | null> {
    if (!accountId) {
      return null;
    }

    const token = await this.auth.getAccessToken();
      const response = await fetch(
        `https://m.np.playstation.com/api/userProfile/v1/internal/users/${encodeURIComponent(accountId)}/basicPresences?type=primary`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.basicPresence;

  }
}

export const UserService = new PSNUserService();