import { BaseRepository } from "@/lib/mongodb-base-repository";
import { GOTYGame } from "../analysis.type";
import { Filter, Sort } from "mongodb";

export class GotyRepository extends BaseRepository<GOTYGame> {
  constructor(collectionName: string = 'goty_games') {
    super({ collectionName });
  }

  /**
   * Busca todos os jogos ordenados por ano de premiação (decrescente)
   */
  async getGOTYGames(): Promise<GOTYGame[]> {
    const data = await this.find({}, { sort: { ano_premiacao: -1 } });
    return data.toSorted((a, b) => b.ano_premiacao - a.ano_premiacao);
  }

  /**
   * Busca jogos que correspondam à query em qualquer um dos campos:
   * titulo, search_terms, alternative_titles (case-insensitive)
   */
  async searchGOTYGames(query: string): Promise<GOTYGame[]> {
    // Se a query estiver vazia, retorna todos os jogos ordenados
    if (!query || query.trim().length === 0) {
      return this.getGOTYGames();
    }

    const filter: Filter<GOTYGame> = {
      $or: [
        { titulo: { $regex: query, $options: 'i' } },
        { search_terms: { $regex: query, $options: 'i' } },
        { alternative_titles: { $regex: query, $options: 'i' } }
      ]
    };

    const sort: Sort = { ano_premiacao: -1 };

    return await this.find(filter, sort);
  }
}

// Instância singleton para uso em toda a aplicação
export const gotyRepository = new GotyRepository();