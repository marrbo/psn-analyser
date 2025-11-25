// lib/igdb.ts
/**
 * Biblioteca especializada para comunicação segura com a API IGDB.
 * Gerencia a obtenção e renovação do token de acesso automaticamente no servidor.
 */

import { FullGame, IGDBDetails } from '../types/psn';

// Variáveis de ambiente
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// Cache do token de acesso (para evitar reautenticações desnecessárias)
let accessToken = '';
let tokenExpiry = 0; // Timestamp em segundos

// Função para buscar o token de acesso (Server-Side Only!)
async function getAccessToken(): Promise<string> {
    // Retorna o token em cache se for válido (expiração em 24h, token dura 60 dias)
    if (accessToken && tokenExpiry > Date.now() / 1000 + 3600 * 24) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("IGDB_CLIENT_ID or IGDB_CLIENT_SECRET not configured.");
        throw new Error("IGDB credentials missing.");
    }

    const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;

    console.log("Fetching new IGDB Access Token...");
    const response = await fetch(authUrl, { method: 'POST' });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to get IGDB token:", response.status, errorText);
        throw new Error(`Failed to authenticate with IGDB/Twitch: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
        accessToken = data.access_token;
        tokenExpiry = Date.now() / 1000 + data.expires_in;
        return accessToken;
    }

    throw new Error('Failed to retrieve access token from IGDB/Twitch response.');
}

/**
 * Executa uma query na API IGDB (endpoint 'games').
 * @param gameName - Nome do jogo para busca (fuzzy match).
 * @returns - Detalhes do jogo enriquecidos (descrição, capa, etc.).
 */
export async function fetchGameDetails(gameName: string): Promise<IGDBDetails | null> {
    try {
        const token = await getAccessToken();
        const apiUrl = 'https://api.igdb.com/v4/games';

        // Consulta APICalypse: busca o jogo com o nome exato (ou similar)
        // e seleciona campos essenciais. Usa o campo "cover" e sua relação "url"
        const query = `
            fields name, summary, involved_companies.developer, genres.name, cover.url;
            search "${gameName}";
            limit 1;
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID!,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: query,
        });

        if (!response.ok) {
             const errorText = await response.text();
             console.error("IGDB Query failed:", response.status, errorText);
             return null;
        }

        const data: any[] = await response.json();

        if (data.length === 0) {
            return null;
        }
        
        const game = data[0];

        // Processa os dados brutos do IGDB
        const details: IGDBDetails = {
            description: game.summary || 'Descrição não disponível.',
            developer: game.involved_companies?.[0]?.developer?.name || 'Não informado.',
            genres: game.genres?.map((g: { name: string }) => g.name) || [],
            // Ajusta o tamanho da imagem de capa (igdb.com/cover/thumb) para HD (igdb.com/cover/hd)
            coverUrl: game.cover?.url ? game.cover.url.replace('thumb', 'cover_big') : 'https://placehold.co/264x372/3f3f46/ffffff?text=Capa+N/A',
        };

        return details;

    } catch (error) {
        console.error("Error fetching IGDB details:", error);
        return null;
    }
}