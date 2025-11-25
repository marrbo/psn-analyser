// scripts/check-db.ts
import { connectToDatabase } from '../lib/mongodb';

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexão com o banco de dados...');
    
    const { db } = await connectToDatabase();
    
    // Verificar se consegue executar um comando
    await db.command({ ping: 1 });
    console.log('✅ MongoDB: Conexão estabelecida');
    
    // Verificar coleções
    const collections = await db.listCollections().toArray();
    console.log(`📊 Coleções no banco: ${collections.length}`);
    
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Verificar análises
    const analysesCount = await db.collection('analyses').countDocuments();
    console.log(`📈 Total de análises: ${analysesCount}`);
    
    // Mostrar algumas análises
    const recentAnalyses = await db.collection('analyses')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    console.log('🔍 Análises recentes:');
    recentAnalyses.forEach((analysis: any) => {
      console.log(`   - ${analysis.username} (${analysis.accountId}) - ${analysis._id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    process.exit(1);
  }
}

checkDatabase();