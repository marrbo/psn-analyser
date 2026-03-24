import axios from 'axios';
import * as cheerio from 'cheerio';
import { GameMetacritic, ScrapingOptions } from '@/types/metacritc';
import { getMetacritcGameData, saveMetacritc } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { normalizeText } from './utils/text';

// Interfaces de resultado
export interface ScrapMetacritcResult {
  gameMetacritic: GameMetacritic[];
  updateResult: UpdateResult;
}

export type ESRBRating = 'E' | 'E10+' | 'T' | 'M' | 'AO' | 'RP';

export interface MetacriticUpdateResult {
  modifiedCount: number;
  matchedCount: number;
  upsertedCount: number;
}

interface UpdateResult {
  modifiedCount: number;
  matchedCount: number;
  upsertedCount: number;
}

export class MetacriticScraper {
  private readonly baseUrl = 'https://www.metacritic.com';
  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrapeGames(options: ScrapingOptions = {}): Promise<GameMetacritic[]> {
    const { page = 600 } = options;

    try {
      const url = `${this.baseUrl}/browse/game/all/all/metascore/?page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
      });

      return this.parseHTML(response.data);
    } catch (error) {
      console.error('Erro ao raspar página do Metacritic:', error);
      throw new Error('Falha ao raspar dados dos jogos');
    }
  }

  private parseHTML(html: string): GameMetacritic[] {
    const $ = cheerio.load(html);
    const games: GameMetacritic[] = [];

    // Container principal de cada card
    const gameCards = $('[data-testid="filter-results"]');

    if (gameCards.length === 0) {
      console.warn('Nenhum card de jogo encontrado com data-testid="filter-results".');
      return games;
    }

    gameCards.each((_, element) => {
      try {
        const $card = $(element);

        // ----- URL do jogo (link principal) -----
        const link = $card.find('a[href*="/game/"]').first();
        const relativeUrl = link.attr('href');
        if (!relativeUrl) {
          console.warn('URL não encontrada no card, ignorando.');
          return;
        }
        const url = relativeUrl.startsWith('http') ? relativeUrl : `${this.baseUrl}${relativeUrl}`;

        // ----- Nome do jogo (data-testid="product-title") -----
        const titleElement = $card.find('[data-testid="product-title"]');
        let name = '';
        if (titleElement.length) {
          // O nome real está no segundo span (após o número)
          const spans = titleElement.find('span');
          if (spans.length >= 2) {
            name = $(spans[1]).text().trim();
          } else {
            // Fallback: remover número inicial (ex: "1. ")
            const fullText = titleElement.text().trim();
            name = fullText.replace(/^\d+\.\s*/, '');
          }
        }

        if (!name) {
          console.warn('Nome não encontrado, ignorando card.');
          return;
        }

        // ----- Metascore (classe .c-siteReviewScore) -----
        let metascore = 0;
        const scoreElement = $card.find('.c-siteReviewScore').first();
        if (scoreElement.length) {
          const scoreText = scoreElement.text().trim();
          metascore = Number.parseInt(scoreText, 10) || 0;
        }

        // ----- Descrição (div com line-clamp-2) -----
        let description = '';
        const descElement = $card.find('div.line-clamp-2').first();
        if (descElement.length) {
          description = descElement.text().trim();
        }

        // ----- Data de lançamento e classificação ESRB -----
        let releaseDate: Date | undefined;
        let rated: ESRBRating = 'RP';

        // Div que contém data e rating (classes observadas)
        const metaDiv = $card.find('div.overflow-hidden.text-ellipsis.line-clamp-1').first();
        if (metaDiv.length) {
          const metaText = metaDiv.text().trim();
          // Exemplo: "Nov 23, 1998   •   Rated E"
          const parts = metaText.split('•').map(p => p.trim());
          if (parts.length >= 2) {
            // Data
            const dateStr = parts[0];
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              releaseDate = parsedDate;
            }

            // ESRB
            const ratingPart = parts[1];
            const ratingMatch = ratingPart.match(/\b(E10?\+?|T|M|AO|RP)\b/);
            if (ratingMatch) {
              rated = ratingMatch[0] as ESRBRating;
            }
          } else {
            // Fallback via regex
            const dateMatch = metaText.match(/([A-Za-z]{3}\s\d{1,2},\s\d{4})/);
            if (dateMatch) {
              const parsed = new Date(dateMatch[0]);
              if (!isNaN(parsed.getTime())) {
                releaseDate = parsed;
              }
            }
            const ratingMatch = metaText.match(/\b(E10?\+?|T|M|AO|RP)\b/);
            if (ratingMatch) {
              rated = ratingMatch[0] as ESRBRating;
            }
          }
        }

        // Se não encontrou data, usa a data atual como fallback
        if (!releaseDate) {
          releaseDate = new Date();
        }

        games.push({
          _id: new ObjectId(),
          name,
          url,
          metascore,
          description,
          releaseDate,
          rated,
          rated_br: this.getBrazilEquivalent(rated),
          normalizedName: normalizeText(name),
        });
      } catch (error) {
        console.warn('Erro ao processar card de jogo:', error);
      }
    });

    return games;
  }

  // ----- Métodos para múltiplas páginas (mantidos da versão anterior) -----

  async scrapeMultiplePagesParallel(
    startPage: number,
    endPage: number,
    batchSize: number = 10,
    options?: Omit<ScrapingOptions, 'page'>
  ): Promise<MetacriticUpdateResult> {
    const ranges = this.createRanges(startPage, endPage, batchSize);
    const promises = ranges.map((range) =>
      this.scrapeRangeSequentially(range.start, range.end, options)
    );
    const results = await Promise.all(promises);

    const finalResult = results.reduce(
      (acc, curr) => {
        acc.modifiedCount += curr.modifiedCount;
        acc.matchedCount += curr.matchedCount;
        acc.upsertedCount += curr.upsertedCount;
        return acc;
      },
      { modifiedCount: 0, matchedCount: 0, upsertedCount: 0 }
    );

    return finalResult;
  }

  private createRanges(
    start: number,
    end: number,
    batchSize: number
  ): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    for (let i = start; i <= end; i += batchSize) {
      const rangeEnd = Math.min(i + batchSize - 1, end);
      ranges.push({ start: i, end: rangeEnd });
    }
    return ranges;
  }

  private async scrapeRangeSequentially(
    start: number,
    end: number,
    options?: Omit<ScrapingOptions, 'page'>
  ): Promise<MetacriticUpdateResult> {
    let totalModified = 0;
    let totalMatched = 0;
    let totalUpserted = 0;

    for (let page = start; page <= end; page++) {
      try {
        const pageGames = await this.scrapeGames({ ...options, page });
        if (pageGames.length > 0) {
          const result = await saveMetacritc(pageGames);
          totalModified += result.modifiedCount || 0;
          totalMatched += result.matchedCount || 0;
          totalUpserted += result.upsertedCount || 0;
          console.log(`Página ${page}: ${pageGames.length} jogos salvos`);
        } else {
          console.log(`Nenhum jogo encontrado na página ${page}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Erro ao raspar página ${page}:`, error);
      }
    }

    return {
      modifiedCount: totalModified,
      matchedCount: totalMatched,
      upsertedCount: totalUpserted,
    };
  }

  async scrapeMultiplePages(
    pages: number = 1,
    options?: Omit<ScrapingOptions, 'page'>
  ): Promise<MetacriticUpdateResult> {
    return this.scrapeRangeSequentially(1, pages, options);
  }

  async getMetacritcScore(gameTitle: string, npCommunicationId: string): Promise<number> {
    const game = await this.getMetacritcGame(gameTitle, npCommunicationId);
    return game?.metascore ?? 0;
  }

  async getMetacritcGame(
    gameTitle: string,
    npCommunicationId: string
  ): Promise<GameMetacritic> {
    const normalizedName = normalizeText(gameTitle);
    const existing = await getMetacritcGameData(normalizedName, npCommunicationId);

    if (existing) {
      existing.npCommunicationId = existing.npCommunicationId || npCommunicationId;
      existing.rated_br = this.getBrazilEquivalent(existing.rated);
      return existing;
    }

    return {
      _id: new ObjectId(),
      name: gameTitle,
      url: `${this.baseUrl}/search/${encodeURIComponent(normalizedName)}/`,
      metascore: 0,
      normalizedName,
      npCommunicationId,
      description: '',
      releaseDate: new Date(),
      rated: 'RP',
      rated_br: 'PE',
    } as GameMetacritic;
  }

  getBrazilEquivalent(esrbRating: string): string {
    const mapping: Record<string, string> = {
      E: 'L',
      'E10+': '10',
      T: '12',
      M: '16',
      AO: '18',
      RP: 'PE',
    };
    return mapping[esrbRating] || 'L';
  }
}

export const metacriticScraper = new MetacriticScraper();