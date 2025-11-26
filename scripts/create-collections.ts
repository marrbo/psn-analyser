// scripts/create-collections.ts
import { connectToDatabase } from '../lib/mongodb';

async function createCollections() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🗄️ Criando coleções do banco de dados...');

    // Coleção de jogos
    await db.createCollection('games');
    await db.collection('games').createIndex({ npCommunicationId: 1 }, { unique: true });
    await db.collection('games').createIndex({ title: 1 });
    await db.collection('games').createIndex({ platform: 1 });

    // Coleção de troféus
    await db.createCollection('trophies');
    await db.collection('trophies').createIndex(
      { npCommunicationId: 1, trophyId: 1 }, 
      { unique: true }
    );
    await db.collection('trophies').createIndex({ npCommunicationId: 1 });
    await db.collection('trophies').createIndex({ trophyRare: 1 });
    await db.collection('trophies').createIndex({ trophyEarnedRate: 1 });

    // Coleção de troféus do usuário
    await db.createCollection('user_trophies');
    await db.collection('user_trophies').createIndex(
      { accountId: 1, npCommunicationId: 1, trophyId: 1 }, 
      { unique: true }
    );
    await db.collection('user_trophies').createIndex({ accountId: 1 });
    await db.collection('user_trophies').createIndex({ npCommunicationId: 1 });
    await db.collection('user_trophies').createIndex({ earned: 1 });

    console.log('✅ Coleções criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar coleções:', error);
  }
}

createCollections();