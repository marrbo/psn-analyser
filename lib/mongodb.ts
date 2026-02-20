// lib/mongodb.ts
import { ScoreBreakdown } from '@/types/analysis.type';
import { GameMetacritic } from '@/types/metacritc';
import { PSNUser } from '@/types/psn';
import { GotyStats, TrophySummary, TrophyTitle } from '@/types/trophies';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { normalizeText } from './utils/text';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psn_analyser';
const MONGODB_DB = process.env.MONGODB_DB || 'psn_analyser';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error);
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

export interface AnalysisData {
  _id?: ObjectId;
  _cacheId?: string;
  accountId: string;
  npCommunicationId?: string;
  completionRate: number;
  migueScore: ScoreBreakdown;
  totalGames: number;
  username?: string;
  psnUser?: PSNUser;
  createdAt: Date;
  renewAt: Date;
  lastAccessed: Date;
  trophySummary: TrophySummary;
  games: TrophyTitle[];
  gotyStats: GotyStats;
}

// lib/mongodb.ts - Adicione estas coleções
export interface Game {
  _id?: ObjectId;
  npCommunicationId: string;
  trophySetVersion: string;
  title: string;
  iconUrl: string;
  platform: string;
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  genres: string[];
  firstReleased: Date | null;
  lastUpdated: Date;
}

export interface Trophy {
  _id?: ObjectId;
  npCommunicationId: string;
  trophyId: number;
  trophyGroup: string;
  name: string;
  detail: string;
  iconUrl: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: number; // Percentual de jogadores que conquistaram (0-100)
  earnedRate: number;
  hidden: boolean;
  trophyRare: number; // 0-5 scale da PSN
  lastUpdated: Date;
}

export interface UserTrophy {
  _id?: ObjectId;
  accountId: string;
  npCommunicationId: string;
  trophyId: number;
  earned: boolean;
  earnedDateTime: Date | null;
  progress: number; // Para troféus progressivos
  lastUpdated: Date;
}

// Cache de 60 minutos
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutos em milissegundos

// lib/mongodb.ts - Atualize a função saveAnalysis
export async function saveAnalysis(accountId: string, username: string, analysisData: AnalysisData): Promise<string> {
  const { db } = await connectToDatabase();
  
  const renewAt = analysisData.renewAt.getDate() <= Date.now() ? analysisData.renewAt : new Date(Date.now() + CACHE_DURATION);

  // A estrutura correta deve espalhar os dados da análise no nível raiz
  const document = {
    // Espalhar todos os dados da análise no nível raiz
    ...analysisData,
    createdAt: new Date(),
    renewAt: renewAt,
    lastAccessed: new Date()
  };
  
  const existsAnalyse = await db.collection('analyses').findOne({ accountId: accountId });

  if (existsAnalyse) {
    await db.collection('analyses').updateOne({ accountId: accountId }, { $set: document });
    return existsAnalyse._id.toString();
  } else {
    const result = await db.collection('analyses').insertOne(document);
    return result.insertedId.toString();
  }
}

export async function saveMetacritc(gamesData: GameMetacritic[]): Promise<number> {
  const { db } = await connectToDatabase();

  const updateResult = await db.collection<GameMetacritic>('metacritc').insertMany(gamesData, { ordered: false })

  return updateResult.insertedCount;
}

export async function updateNormalizedTextMetacritc(): Promise<void> {
  const { db } = await connectToDatabase();

  // temporário para atualizar com coluna normalized Texto (mais velocidade na busca)
  const games = await db.collection<GameMetacritic>('metacritc').find({}).toArray();

  for (const game of games) {
    const normalizedName = normalizeText(game.name);

    await db.collection<GameMetacritic>('metacritc').updateOne(
      { _id: game._id },
      { $set: { normalizedName: normalizedName } }
    );
  }
}

export async function getMetacritcGameData(title: string, npCommunicationId: string): Promise<GameMetacritic | null> {
  const { db } = await connectToDatabase();
  const normalizedName = normalizeText(title);

  const game = await db.collection<GameMetacritic>('metacritc').findOne({
              normalizedName: { $eq: normalizedName }
          });

    if (game) {
      await db.collection<GameMetacritic>('metacritc').updateOne(
        { _id: game._id },
        { $set: { npCommunicationId, normalizedName } }
      );
  }

  if (!game) {
    return null;
  } 

  return game;
}

export async function getAnalysis(analysisId: string): Promise<AnalysisData | null> {
  const { db } = await connectToDatabase();
  
  try {
    const objectId = new ObjectId(analysisId);
    const analysis = await db.collection<AnalysisData>('analyses').findOne({ 
      _id: objectId
    });
    
    // Atualizar lastAccessed se a análise foi encontrada
    if (analysis) {
      await db.collection('analyses').updateOne(
        { _id: objectId },
        { $set: { 
          lastAccessed: Date.now(),
          } 
        }
      );
    }

    return analysis;
  } catch (error) {
    console.error('❌ Erro ao buscar análise:', error);
    return null;
  }
}

export async function getRecentAnalysisByAccountId(accountId: string): Promise<AnalysisData | null> {
  const { db } = await connectToDatabase();
  
  try {
    const analysis = await db.collection('analyses').findOne({ 
      accountId
    });

    // Atualizar lastAccessed se a análise foi encontrada
    if (analysis) {
      await db.collection('analyses').updateOne(
        { _id: analysis._id },
        { $set: { lastAccessed: new Date() } }
      );
    }

    return analysis as AnalysisData | null;
  } catch (error) {
    console.error('❌ Erro ao buscar análise por accountId:', error);
    return null;
  }
}

export async function canCreateNewAnalysis(accountId: string): Promise<{
  canCreate: boolean;
  existingAnalysis?: AnalysisData;
  timeRemaining?: number;
}> {
  const existingAnalysis = await getRecentAnalysisByAccountId(accountId);
  
  if (!existingAnalysis) {
    return { canCreate: true };
  }

  const now = Date.now();
  const renewAt = existingAnalysis.renewAt?.getTime() || Date.now() + 60 * 60 * 1000;
  const timeRemaining = renewAt - now;

  return {
    canCreate: false,
    existingAnalysis,
    timeRemaining: Math.max(0, timeRemaining)
  };
}

// Função para formatar o tempo restante em formato legível
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

// Função para limpar análises expiradas
export async function cleanupExpiredAnalyses(): Promise<number> {
  const { db } = await connectToDatabase();

  const result = await db.collection('analyses').deleteMany({
    renewAt: { $lt: new Date() }
  });

  return result.deletedCount;
}