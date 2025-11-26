// lib/mongodb.ts
import { MongoClient, Db, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psn_analyser';
const MONGODB_DB = process.env.MONGODB_DB || 'psn_analyser';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log('🔗 Conectando ao MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    console.log('✅ Conectado ao MongoDB com sucesso');
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
  accountId: string;
  username: string;
  analysis: any;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
  trophySummary: any;
  games: any[];
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
export async function saveAnalysis(accountId: string, username: string, analysisData: any): Promise<string> {
  const { db } = await connectToDatabase();
  
  // A estrutura correta deve espalhar os dados da análise no nível raiz
  const document = {
    accountId,
    username,
    // Espalhar todos os dados da análise no nível raiz
    ...analysisData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + CACHE_DURATION),
    lastAccessed: new Date()
  };

  console.log('💾 Salvando documento no MongoDB:', {
    accountId,
    username,
    hasTrophySummary: !!analysisData.trophySummary,
    hasGames: !!analysisData.games,
    hasGotyStats: !!analysisData.gotyStats,
    hasAnalysis: !!analysisData.analysis,
    gamesCount: analysisData.games?.length || 0
  });

  const result = await db.collection('analyses').insertOne(document);
  return result.insertedId.toString();
}

export async function getAnalysis(analysisId: string): Promise<AnalysisData | null> {
  const { db } = await connectToDatabase();
  
  try {
    const objectId = new ObjectId(analysisId);
    const analysis = await db.collection('analyses').findOne({ 
      _id: objectId,
      expiresAt: { $gt: new Date() }
    });

    // Atualizar lastAccessed se a análise foi encontrada
    if (analysis) {
      await db.collection('analyses').updateOne(
        { _id: objectId },
        { $set: { lastAccessed: new Date() } }
      );
    }

    return analysis as AnalysisData | null;
  } catch (error) {
    console.error('❌ Erro ao buscar análise:', error);
    return null;
  }
}

export async function getRecentAnalysisByAccountId(accountId: string): Promise<AnalysisData | null> {
  const { db } = await connectToDatabase();
  
  try {
    const analysis = await db.collection('analyses').findOne({ 
      accountId,
      expiresAt: { $gt: new Date() }
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

  const now = new Date().getTime();
  const expiresAt = existingAnalysis.expiresAt.getTime();
  const timeRemaining = expiresAt - now;

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
    expiresAt: { $lt: new Date() }
  });

  return result.deletedCount;
}