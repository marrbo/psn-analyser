import { makeUniversalSearch, getUserTitles, getTitleTrophies, getUserTrophiesEarnedForTitle } from 'psn-api';
import { Game, PlayerProfile, Trophy } from '../types/psn';
import { AnalysisService } from './analysis';

export class TrophyService {
  constructor(private readonly authorization: any) {}

  async getCompleteProfile(username: string = "me"): Promise<PlayerProfile> {
    const accountId = await this.getAccountId(username);
    const games = await this.getAllGamesWithTrophies(accountId);
    
    return AnalysisService.analyzeProfile(games, accountId);
  }

  private async getAccountId(username: string): Promise<string> {
    try {
      const searchResults = await makeUniversalSearch(
        this.authorization,
        username,
        "SocialAllAccounts"
      );
      
      return searchResults.domainResponses[0].results[0].socialMetadata.accountId;
    } catch (error) {
      throw new Error(`Não foi possível encontrar o usuário: ${username}`);
    }
  }

  private async getAllGamesWithTrophies(accountId: string): Promise<Game[]> {
    const { trophyTitles } = await getUserTitles(this.authorization, accountId);
    const games: Game[] = [];

    for (const title of trophyTitles) {
      try {
        // Verifica se o jogo tem troféus definidos
        if (this.hasNoTrophies(title)) {
          console.log(`Pulando ${title.trophyTitleName} - sem troféus`);
          continue;
        }

        const [titleTrophies, earnedTrophies] = await Promise.all([
          this.getTitleTrophies(title).catch(error => {
            console.warn(`Erro ao buscar troféus do título ${title.trophyTitleName}:`, error.message);
            return { trophies: [] };
          }),
          this.getUserEarnedTrophies(accountId, title).catch(error => {
            console.warn(`Erro ao buscar troféus conquistados ${title.trophyTitleName}:`, error.message);
            return { trophies: [] };
          })
        ]);

        // Garante que temos arrays válidos
        const safeTitleTrophies = Array.isArray(titleTrophies?.trophies) ? titleTrophies.trophies : [];
        const safeEarnedTrophies = Array.isArray(earnedTrophies?.trophies) ? earnedTrophies.trophies : [];

        const mergedTrophies = this.mergeTrophyLists(safeTitleTrophies, safeEarnedTrophies);
        
        games.push({
          gameName: title.trophyTitleName,
          platform: title.trophyTitlePlatform,
          trophyTypeCounts: title.definedTrophies,
          earnedCounts: title.earnedTrophies,
          trophyList: mergedTrophies,
          completionPercentage: this.calculateCompletion(title.earnedTrophies, title.definedTrophies)
        });
      } catch (error) {
        console.error(`Erro crítico ao processar ${title.trophyTitleName}:`, error);
        continue;
      }
    }

    return games;
  }

  private hasNoTrophies(title: any): boolean {
    const defined = title.definedTrophies;
    return !defined || 
           (defined.bronze === 0 && 
            defined.silver === 0 && 
            defined.gold === 0 && 
            defined.platinum === 0);
  }

  private mergeTrophyLists(
    titleTrophies: any[] = [], 
    earnedTrophies: any[] = []
  ): Trophy[] {
    const safeTitleTrophies = Array.isArray(titleTrophies) ? titleTrophies : [];
    const safeEarnedTrophies = Array.isArray(earnedTrophies) ? earnedTrophies : [];

    const mergedTrophies: Trophy[] = [];

    for (const earnedTrophy of safeEarnedTrophies) {
      try {
        const foundTitleTrophy = safeTitleTrophies.find(
          (t: any) => t.trophyId === earnedTrophy.trophyId
        );

        mergedTrophies.push(
          this.normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
        );
      } catch (error) {
        console.warn('Erro ao mesclar troféu:', error);
        continue;
      }
    }

    return mergedTrophies;
  }

  private normalizeTrophy(trophy: any): Trophy {
    try {
      return {
        isEarned: trophy.earned ?? false,
        earnedOn: trophy.earned ? trophy.earnedDateTime : 'unearned',
        type: trophy.trophyType || 'bronze',
        rarity: this.getRarityString(trophy.trophyRare ?? 0),
        earnedRate: Number(trophy.trophyEarnedRate) || 0,
        trophyName: trophy.trophyName || 'Unknown Trophy',
        groupId: trophy.trophyGroupId || 'default'
      };
    } catch (error) {
      console.warn('Erro ao normalizar troféu, retornando padrão:', error);
      return {
        isEarned: false,
        earnedOn: 'unearned',
        type: 'bronze',
        rarity: 'Common',
        earnedRate: 0,
        trophyName: 'Errored Trophy',
        groupId: 'error'
      };
    }
  }

  private getRarityString(rarity: number): string {
    const rarityMap = ['Very Rare', 'Ultra Rare', 'Rare', 'Common'];
    return rarityMap[rarity] || 'Common';
  }

  private calculateCompletion(earned: any, defined: any): number {
    const totalEarned = earned.bronze + earned.silver + earned.gold + earned.platinum;
    const totalDefined = defined.bronze + defined.silver + defined.gold + defined.platinum;
    return totalDefined > 0 ? (totalEarned / totalDefined) * 100 : 0;
  }

  private async getTitleTrophies(title: any) {
    return getTitleTrophies(
      this.authorization,
      title.npCommunicationId,
      'all',
      {
        npServiceName: title.trophyTitlePlatform.includes('PS5') ? undefined : 'trophy'
      }
    );
  }

  private async getUserEarnedTrophies(accountId: string, title: any) {
    return getUserTrophiesEarnedForTitle(
      this.authorization,
      accountId,
      title.npCommunicationId,
      'all',
      {
        npServiceName: title.trophyTitlePlatform.includes('PS5') ? undefined : 'trophy'
      }
    );
  }
}