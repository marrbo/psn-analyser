import axios from 'axios';
import * as cheerio from 'cheerio';
import { GameMetacritic, ScrapingOptions } from '@/types/metacritc';
import { getMetacritcGameData, saveMetacritc } from '@/lib/mongodb';
import { ObjectId, UpdateResult } from 'mongodb';
import { normalizeText } from './utils/text';

export interface ScrapMetacritcResult {
  gameMetacritic: GameMetacritic[];
  updateResult: UpdateResult;
}

// Definindo os tipos possíveis da ESRB para evitar erros de digitação
export type ESRBRating = 'E' | 'E10+' | 'T' | 'M' | 'AO' | 'RP';

export interface MetacriticUpdateResult { 
  modifiedCount: number, 
  matchedCount: number, 
  upsertedCount: number 
}

export class MetacriticScraper {
  private readonly baseUrl = 'https://www.metacritic.com';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeGames(options: ScrapingOptions = {}): Promise<GameMetacritic[]> {
    const {
      page = 600
    } = options;

    try {
      // const url = `${this.baseUrl}/browse/game/?platform=pc&platform=ps5&platform=ps3&platform=ps1&platform=ps2&platform=ps4&platform=psp&platform=ps-vita&page=${page}`;
      const url = `${this.baseUrl}/browse/game/all/all/current-year/metascore/?page=${page}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });

      return this.parseHTML(response.data);
    } catch (error) {
      console.error('Error scraping Metacritic:', error);
      throw new Error('Failed to scrape games data');
    }
  }

  private parseHTML(html: string): GameMetacritic[] {
    const $ = cheerio.load(html);
    const games: GameMetacritic[] = [];

    // Cada jogo está em uma div com classe c-finderProductCard
    $('.c-finderProductCard').each((index, element) => {
      try {
        const $element = $(element);

        // Nome do jogo
        const titleElement = $element.find('.c-finderProductCard_title').data();
        const name: string = (titleElement?.title || '') as string;

        // URL do jogo
        const relativeUrl = $element.children('a').attr('href');
        const url = relativeUrl ? `${this.baseUrl}${relativeUrl}` : '';

        // Nota Metacritic
        const metascoreText = $element.find('.c-siteReviewScore').text().trim();
        const metascore = Number.parseInt(metascoreText) || 0;

        const descriptionText = $element.find('.c-finderProductCard_description').text().trim();
        const description = descriptionText.replace(/<[^>]*>/g, '');

        const releaseDateText = $element.find('.c-finderProductCard_meta').text().trim().split('\n');
        const releaseDate = new Date(releaseDateText[0].trim());

        const ratedIn = releaseDateText.join(' ').toLowerCase().includes('rated');
        let rated = 'RP';

        if (ratedIn && releaseDateText.length === 4) {
          rated = releaseDateText[releaseDateText.length - 1].toLowerCase().replace(/rated /g, '').toUpperCase().trim();
        }

        if (name && url) {
          games.push({
            _id: new ObjectId(),
            name: name,
            url,
            metascore,
            description,
            releaseDate,
            rated,
            rated_br: this.getBrazilEquivalent(rated),
            normalizedName: normalizeText(name)
          });
        }
      } catch (error) {
        console.warn('Error parsing game element:', error);
      }
    });

    return games;
  }

  // Método para buscar múltiplas páginas
  async scrapeMultiplePagesParallel(
    startPage: number,
    endPage: number,
    batchSize: number = 10,
    options?: Omit<ScrapingOptions, 'page'>
  ): Promise<MetacriticUpdateResult> {
    // Cria arrays de ranges baseados no batchSize
    const ranges = this.createRanges(startPage, endPage, batchSize);

    // Cria um array de Promises para cada range
    const promises = ranges.map(range => this.scrapeRangeSequentially(range.start, range.end, options));

    // Executa todas as promises em paralelo
    const results = await Promise.all(promises);

    // Junta todos os resultados
    const resultMetacritic: MetacriticUpdateResult = results.reduce((acc, curr) => {
      acc.modifiedCount += curr.modifiedCount;
      acc.matchedCount += curr.matchedCount;
      acc.upsertedCount += curr.upsertedCount;
      return acc;
    }, { modifiedCount: 0, matchedCount: 0, upsertedCount: 0 });

    return resultMetacritic;
  }

  // Função auxiliar para criar ranges
  private createRanges(start: number, end: number, batchSize: number): Array<{ start: number, end: number }> {
    const ranges: Array<{ start: number, end: number }> = [];

    for (let i = start; i <= end; i += batchSize) {
      const rangeEnd = Math.min(i + batchSize - 1, end);
      ranges.push({
        start: i,
        end: rangeEnd
      });
    }

    return ranges;
  }

  // Função para buscar um range sequencialmente (mantém o delay entre páginas)
  private async scrapeRangeSequentially(
    start: number,
    end: number,
    options?: Omit<ScrapingOptions, 'page'>
  ): Promise<MetacriticUpdateResult> {
    const games: GameMetacritic[] = [];
    let returnData: MetacriticUpdateResult = { modifiedCount: 0, matchedCount: 0, upsertedCount: 0 };

    for (let page = start; page <= end; page++) {
      try {
        const pageGames = await this.scrapeGames({ ...options, page });
        
        games.push(...pageGames);

        returnData = await saveMetacritc(pageGames);
        
        // Delay para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping page ${page}:`, error);
        // Continua para próxima página mesmo se uma falhar
        continue;
      }
    }

    return returnData;
  }

  // Método original mantido para compatibilidade
  async scrapeMultiplePages(pages: number = 1, options?: Omit<ScrapingOptions, 'page'>): Promise<MetacriticUpdateResult> {
    return await this.scrapeMultiplePagesParallel(1, pages, 1, options);
  }

  async getMetacritcScore(gameTitle: string, npCommunicationId: string): Promise<number> {
    const metacriticGame = await this.getMetacritcGame(gameTitle, npCommunicationId);

    if (metacriticGame) {
      return metacriticGame.metascore;
    }

    return 0;
  }

  async getMetacritcGame(gameTitle: string, npCommunicationId: string): Promise<GameMetacritic | null> {
    const normalizedName = normalizeText(gameTitle);
    const metacriticGame = await getMetacritcGameData(normalizedName, npCommunicationId);

    if (metacriticGame) {
      metacriticGame.npCommunicationId = metacriticGame.npCommunicationId || npCommunicationId;
      metacriticGame.rated_br = this.getBrazilEquivalent(metacriticGame.rated);
      return metacriticGame;
    }

    return {
      name: gameTitle,
      url: `https://www.metacritic.com/search/${encodeURIComponent(normalizedName)}/`,
      metascore: 0, normalizedName: normalizedName,
      npCommunicationId: npCommunicationId,
      description: '',
      releaseDate: new Date(),
      rated: 'RP',
      rated_br: 'PE'
    };
  }

  

  // Dentro da sua classe...
  getBrazilEquivalent(esrbRating: string): string {
      const mapping: Record<string, string> = {
          'E': 'L',
          'E10+': '10',
          'T': '12',
          'M': '16',
          'AO': '18',
          'RP': 'PE'
      };

      // Retorna a equivalência ou 'L' como fallback de segurança
      return mapping[esrbRating] || 'L';
  }
}

export const metacriticScraper = new MetacriticScraper()