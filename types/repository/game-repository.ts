import { BaseRepository } from "@/lib/mongodb-base-repository";
import { Filter } from "mongodb";
import { GameTitle } from "../trophies";

export class GameRepository<T extends GameTitle> extends BaseRepository<T> {
  constructor() {
    super({ collectionName: 'games' });
  }

  async findByNpCommunicationId(npCommunicationId: string) {
    const data = await this.findOne({ npCommunicationId } as Filter<T>);
    return data;
  }

  async getBackgroundImages(focusGame: GameTitle | null) {
    let backgroundImage: string | undefined;
    let heroImage: string | undefined;
    let logoImage: string | undefined;

    if (focusGame) {
      const gameImages = focusGame?.media?.images || focusGame?.concept?.media?.images;

      if (gameImages) {
        heroImage = gameImages.find((a) => a.type === "HERO_CHARACTER")?.url;
        logoImage = gameImages.find((a) => a.type === "LOGO")?.url;

        backgroundImage = (
          focusGame.backgroundImage || 
          gameImages.find(a => a.type === "BACKGROUND")?.url || 
          gameImages.find(a => a.type === "BACKGROUND_LAYER_ART")?.url ||
          gameImages.find(a => a.type === "FOUR_BY_THREE_BANNER")?.url || 
          gameImages[0]?.url ||
          focusGame.trophyTitle.trophyTitleIconUrl || 
          '/bg.jpg'
        );
      } else {
          backgroundImage = focusGame.backgroundImage || focusGame.trophyTitle.trophyTitleIconUrl || '/bg.jpg';
          logoImage = focusGame.logoImage || undefined;
          heroImage = focusGame.heroImage || undefined;
      }
    }

    return { backgroundImage, heroImage, logoImage };
  }
}

export const gameRepository = new GameRepository();