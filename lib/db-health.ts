// lib/db-health.ts
import { connectToDatabase } from './mongodb';

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  error?: string;
  details?: any;
}> {
  try {
    const { db } = await connectToDatabase();
    
    // Testar conexão
    await db.command({ ping: 1 });
    
    // Verificar se a coleção existe
    const collections = await db.listCollections({ name: 'analyses' }).toArray();
    const analysesCollectionExists = collections.length > 0;
    
    return {
      healthy: true,
      details: {
        database: db.databaseName,
        analysesCollectionExists,
        server: 'MongoDB connection successful'
      }
    };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}