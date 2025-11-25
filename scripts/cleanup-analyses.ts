// scripts/cleanup-analyses.ts
import { cleanupExpiredAnalyses } from '../lib/mongodb';

async function runCleanup() {
  try {
    console.log('🧹 Iniciando limpeza de análises expiradas...');
    const deletedCount = await cleanupExpiredAnalyses();
    console.log(`✅ ${deletedCount} análises expiradas removidas`);
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runCleanup();
}

export { runCleanup };