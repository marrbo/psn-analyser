// scripts/check-data-structure.ts
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

async function checkDataStructure(analysisId?: string) {
  try {
    const { db } = await connectToDatabase();
    
    let analyses;
    
    if (analysisId) {
      // Verificar análise específica
      analyses = await db.collection('analyses')
        .find({ _id: new ObjectId(analysisId) })
        .toArray();
    } else {
      // Verificar todas as análises
      analyses = await db.collection('analyses')
        .find({})
        .limit(5)
        .toArray();
    }
    
    console.log(`🔍 Verificando estrutura de ${analyses.length} análise(s)...`);
    
    analyses.forEach((analysis, index) => {
      console.log(`\n📊 Análise ${index + 1}: ${analysis.username} (${analysis._id})`);
      console.log('Estrutura:');
      console.log('- accountId:', analysis.accountId);
      console.log('- username:', analysis.username);
      console.log('- analysis:', analysis.analysis ? 'PRESENTE' : 'AUSENTE');
      
      if (analysis.analysis) {
        console.log('  - migueScore:', analysis.analysis.migueScore);
        console.log('  - platinumGames:', analysis.analysis.platinumGames);
        console.log('  - totalGames:', analysis.analysis.totalGames);
      }
      
      console.log('- trophySummary:', analysis.trophySummary ? 'PRESENTE' : 'AUSENTE');
      if (analysis.trophySummary) {
        console.log('  - trophyLevel:', analysis.trophySummary.trophyLevel);
        console.log('  - earnedTrophies:', analysis.trophySummary.earnedTrophies);
      }
      
      console.log('- games:', analysis.games ? `Array com ${analysis.games.length} itens` : 'AUSENTE');
      console.log('- gotyStats:', analysis.gotyStats ? 'PRESENTE' : 'AUSENTE');
      if (analysis.gotyStats) {
        console.log('  - totalGotyGames:', analysis.gotyStats.totalGotyGames);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
}

// Executar com ID específico se fornecido
const analysisId = process.argv[2];
checkDataStructure(analysisId);