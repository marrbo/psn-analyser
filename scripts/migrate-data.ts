// scripts/migrate-data.ts
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

async function migrateData() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🔄 Migrando dados existentes...');
    
    const analyses = await db.collection('analyses')
      .find({})
      .toArray();
    
    console.log(`📊 Encontradas ${analyses.length} análises para migrar`);
    
    let migratedCount = 0;
    
    for (const analysis of analyses) {
      console.log(`\n🔄 Migrando análise: ${analysis.username} (${analysis._id})`);
      
      // Se os dados estão aninhados em analysis.analysis, precisamos corrigir
      if (analysis.analysis && typeof analysis.analysis === 'object') {
        const nestedData = analysis.analysis;
        
        // Atualizar o documento para ter estrutura plana
        const updateResult = await db.collection('analyses').updateOne(
          { _id: analysis._id },
          {
            $set: {
              // Manter os campos existentes
              accountId: analysis.accountId,
              username: analysis.username,
              createdAt: analysis.createdAt,
              expiresAt: analysis.expiresAt,
              lastAccessed: analysis.lastAccessed,
              // Adicionar campos da análise no nível raiz
              trophySummary: nestedData.trophySummary,
              games: nestedData.games,
              gotyStats: nestedData.gotyStats,
              analysis: nestedData.analysis // Este é o objeto com migueScore, etc
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          migratedCount++;
          console.log(`✅ Análise migrada: ${analysis.username}`);
        }
      } else {
        console.log(`⏭️  Análise já migrada: ${analysis.username}`);
      }
    }
    
    console.log(`\n🎉 Migração concluída: ${migratedCount} análises migradas`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrateData();