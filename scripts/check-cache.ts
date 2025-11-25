// scripts/check-cache.ts
import { connectToDatabase } from '../lib/mongodb';

async function checkCache() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🔍 Verificando cache de análises...');
    
    const analyses = await db.collection('analyses')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📊 Total de análises no cache: ${analyses.length}`);
    
    const now = new Date();
    
    analyses.forEach((analysis: any) => {
      const createdAt = new Date(analysis.createdAt);
      const expiresAt = new Date(analysis.expiresAt);
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const minutesRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60)));
      
      const status = timeRemaining > 0 ? '✅ VÁLIDA' : '❌ EXPIRADA';
      
      console.log(`
👤 ${analysis.username} (${analysis.accountId})
🆔 ${analysis._id}
📅 Criada: ${createdAt.toLocaleString('pt-BR')}
⏰ Expira: ${expiresAt.toLocaleString('pt-BR')}
⏱️  Tempo restante: ${minutesRemaining} minutos
${status}
      `);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar cache:', error);
  }
}

checkCache();