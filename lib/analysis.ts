// lib/analysis.ts
/**
 * Lógica de Negócios de alto nível para gerenciar o ciclo de vida da Análise.
 * Implementa a regra de negócio da recuperação e do cache de 60 minutos.
 */
import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { PSNAnalysis, GameData, TrophyCount, TrophyType } from '../types/psn';

// Simula a integração real com a API PSN (ESTA FUNÇÃO SERIA A INTEGRAÇÃO COM A PSN REAL)
// Aqui, criamos um mock de dados, mas na produção seria onde a chamada à API externa aconteceria.
function mockFetchPsnData(psnId: string): PSNAnalysis {
    const gamesCount = 250;
    const profileTrophies: TrophyCount = {
        platinum: 40,
        gold: 150,
        silver: 300,
        bronze: 800,
        total: 1290,
        progressPercent: 100 // Ignorado para o total da conta
    };

    const mockGames: GameData[] = Array.from({ length: gamesCount }, (_, i) => {
        const bronze = Math.floor(Math.random() * 50);
        const silver = Math.floor(Math.random() * 30);
        const gold = Math.floor(Math.random() * 15);
        const platinum = Math.random() > 0.85 ? 1 : 0; // 15% de chance de platina

        const totalGameTrophies = bronze + silver + gold + platinum + 5; // Total real de troféus (incluindo não conquistados)
        const conquered = bronze + silver + gold + platinum;

        return {
            id: `game-${1000 + i}`,
            name: `Jogo ${i + 1} de Ação e Aventura`,
            platform: i % 2 === 0 ? 'PS5' : 'PS4',
            iconUrl: `https://placehold.co/60x60/374151/ffffff?text=G${i+1}`,
            lastPlayed: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) * (i < 5 ? 0.1 : 1), // Top 5 mais recentes
            trophyCount: {
                bronze: bronze,
                silver: silver,
                gold: gold,
                platinum: platinum,
                total: totalGameTrophies,
                progressPercent: Math.round((conquered / totalGameTrophies) * 100)
            },
            isCompleted: (conquered / totalGameTrophies) === 1,
            isPlatined: platinum === 1,
            slug: `jogo-${i + 1}-de-acao-e-aventura`.toLowerCase().replace(/\s+/g, '-'),
        };
    }).sort((a, b) => b.lastPlayed - a.lastPlayed); // Ordena por mais recente

    // Retorna a estrutura completa da análise
    return {
        _id: new ObjectId().toHexString(), // ID provisório, será gerado pelo Mongo
        psnId: psnId,
        analyzedAt: Date.now(),
        profileName: 'AyslanJohnson',
        profileImageUrl: 'https://placehold.co/128x128/3f3f46/ffffff?text=AJ',
        psnLevel: 50,
        totalTrophies: profileTrophies,
        games: mockGames,
    };
}

/**
 * Salva uma nova análise no MongoDB.
 * @param analysisData - O objeto de análise PSN.
 * @returns O documento de análise salvo.
 */
async function saveAnalysis(analysisData: PSNAnalysis): Promise<PSNAnalysis> {
    const { db } = await connectToDatabase();
    // A rota segura é /artifacts/{appId}/public/data/psn_analysis
    const collection = db.collection('psn_analysis');
    
    // Remove o _id mock, deixando o Mongo gerá-lo
    const { _id, ...dataToInsert } = analysisData; 
    
    const result = await collection.insertOne(dataToInsert);
    
    // Retorna a análise com o ID gerado pelo Mongo
    return { ...analysisData, _id: result.insertedId.toHexString() };
}

/**
 * Busca a análise mais recente para um dado PSN ID.
 * @param psnId - O ID do perfil PSN.
 * @returns A análise PSN mais recente ou null.
 */
async function getLatestAnalysis(psnId: string): Promise<PSNAnalysis | null> {
    const { db } = await connectToDatabase();
    const collection = db.collection('psn_analysis');
    
    // Busca a análise mais recente
    const latest = await collection.findOne<PSNAnalysis>(
        { psnId },
        { sort: { analyzedAt: -1 } }
    );
    
    if (latest) {
        // Certifica-se de que o _id é uma string (caso o tipo MongoDB seja preservado)
        return { ...latest, _id: latest._id.toString() };
    }
    
    return null;
}

/**
 * Serviço principal: Busca a análise, considerando a regra de cache de 60 minutos.
 * @param psnId - O ID do perfil PSN a ser analisado.
 * @returns A análise (cacheada ou nova) e um booleano indicando se foi uma nova análise.
 */
export async function getPsnAnalysis(psnId: string): Promise<{ analysis: PSNAnalysis, isNewAnalysis: boolean }> {
    const analysis = await getLatestAnalysis(psnId);
    
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const currentTime = Date.now();
    
    // Checagem 1: Existe análise e ela é recente (menos de 60 minutos)?
    if (analysis && (currentTime - analysis.analyzedAt < ONE_HOUR_MS)) {
        console.log(`[Analysis Service] Cache hit for ${psnId}. Returning cached analysis.`);
        return { analysis, isNewAnalysis: false };
    }
    
    // Checagem 2: Análise existe, mas está obsoleta (mais de 60 minutos),
    // OU o usuário está em uma rota de Dashboard/Library (não é a primeira análise).
    // Premissa: "caso ele acesse o dashboard com link direto ou outra página diferente da inicial/análise
    // irá retornar a última análise feita mesmo se tiver passado os 60 minutos, permitindo atualizar a análise."
    // A regra de cache de 60 minutos se aplica *apenas* se o usuário tentar iniciar uma *nova* análise.
    // Para as rotas de visualização, sempre tentamos retornar a última, mesmo que obsoleta, para garantir UX.
    if (analysis && (currentTime - analysis.analyzedAt >= ONE_HOUR_MS)) {
        // Aqui, o frontend deve perguntar se o usuário deseja atualizar (opcional, mas a análise obsoleta é retornada)
        console.log(`[Analysis Service] Analysis for ${psnId} is outdated but returned for viewing.`);
        // Note: Neste ponto, na API Route, eu retornaria a análise e o frontend teria um botão "Atualizar Agora".
        return { analysis, isNewAnalysis: false };
    }
    
    // Checagem 3: Não existe análise recente (primeiro acesso ou cache expirou há muito tempo)
    console.log(`[Analysis Service] No recent cache for ${psnId}. Performing new analysis.`);
    
    // **********************************************
    // * CHAMA A API EXTERNA PSN AQUI (MOCKADA ABAIXO) *
    // **********************************************
    const newAnalysisData = mockFetchPsnData(psnId);
    const savedAnalysis = await saveAnalysis(newAnalysisData);
    
    console.log(`[Analysis Service] New analysis saved with ID: ${savedAnalysis._id}`);
    
    return { analysis: savedAnalysis, isNewAnalysis: true };
}

/**
 * Busca uma análise específica pelo seu ID (MongoDB _id).
 * @param analysisId - O ID da análise (string).
 * @returns A análise PSN ou null.
 */
export async function getAnalysisById(analysisId: string): Promise<PSNAnalysis | null> {
    const { db } = await connectToDatabase();
    const collection = db.collection('psn_analysis');
    
    try {
        const objectId = new ObjectId(analysisId);
        const analysis = await collection.findOne<PSNAnalysis>({ _id: objectId });

        if (analysis) {
             return { ...analysis, _id: analysis._id.toString() };
        }
    } catch (e) {
        console.error("Invalid analysisId format:", analysisId);
    }
    
    return null;
}