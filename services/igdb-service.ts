// services/igdb-service.ts

interface IGDBGame {
    id: number;
    cover?: {
        id: number;
        image_id: string;
    };
    name: string;
}

interface IGDBTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class IGDBService {
    private static instance: IGDBService;
    private accessToken: string | null = null;
    private clientID: string | null = null;
    private clientSecret: string | null = null;
    private tokenExpiry: Date | null = null;

    private constructor() {}

    public static getInstance(): IGDBService {
        if (!IGDBService.instance) {
            IGDBService.instance = new IGDBService();
        }
        return IGDBService.instance;
    }

    private async authenticate(): Promise<void> {
        // if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        //     return;
        // }

        this.clientID = process.env.IGDB_CLIENT_ID || '8lhnxzys6e9dx3xiwguhos5jw49tw5';
        this.clientSecret = process.env.IGDB_CLIENT_SECRET || 'gc14kqchs0tjcg7fl63t0px5f6uzjf';

        const url = `https://id.twitch.tv/oauth2/token?client_id=${this.clientID}&client_secret=${this.clientSecret}&grant_type=client_credentials`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
            },
            body: '',
        });

        if (!response.ok) {
            throw new Error(`IGDB authentication failed: ${response.statusText}`);
        }

        const tokenData: IGDBTokenResponse = await response.json();
        this.accessToken = tokenData.access_token;
        this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));
    }

    private async makeIGDBRequest(endpoint: string, query: string): Promise<IGDBGame> {
        await this.authenticate();

        console.info(`IGDB API request: ${endpoint}, query: ${query}, access token: ${this.accessToken}`);
        const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': this.clientID!,
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'text/plain',
            },
            body: query,
        });

        if (!response.ok) {
            throw new Error(`IGDB API request failed: ${response.statusText}`);
        }

        console.info('IGDB API response:', response.statusText);

        return response.json();
    }

    public async searchGameCover(gameName: string): Promise<{ _id: any, cover: string} | null> {
        try {
            // IGDB API uses POST requests with body containing the query[citation:3][citation:10]
            const query = `fields name, cover.image_id; search "${gameName}"; limit 1;`;
            const game: IGDBGame = await this.makeIGDBRequest('games', query);

            if (game) {
                // Construct the image URL using the image_id[citation:10]
                return { _id: game.id, cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover?.image_id}.jpg`};
            }

            return null;
        } catch (error) {
            console.error(`Error searching cover for game ${gameName}:`, error);
            return null;
        }
    }

    public async getGameCoverByID(gameId: number): Promise<string | null> {
        try {
            const query = `fields name, cover.image_id; where id = ${gameId};`;

            const game: IGDBGame = await this.makeIGDBRequest('games', query);

            if (game) {
                return `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover?.image_id}.jpg`;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching cover for game ID ${gameId}:`, error);
            return null;
        }
    }
}