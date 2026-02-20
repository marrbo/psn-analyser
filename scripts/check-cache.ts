// scripts/check-cache.ts
import { connectToDatabase } from '../lib/mongodb';

async function checkCache() {
  try {
    const { db } = await connectToDatabase();
    
    const analyses = await db.collection('analyses')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    const now = new Date();
    
    analyses.forEach((analysis: any) => {
      const createdAt = new Date(analysis.createdAt);
      const renewAt = new Date(analysis.renewAt);
      const timeRemaining = renewAt.getTime() - now.getTime();
      const minutesRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60)));
      
      const status = timeRemaining > 0 ? '✅ VÁLIDA' : '❌ EXPIRADA';
      
      console.log(`
👤 ${analysis.username} (${analysis.accountId})
🆔 ${analysis._id}
📅 Criada: ${createdAt.toLocaleString('pt-BR')}
⏰ Renova: ${renewAt.toLocaleString('pt-BR')}
⏱️ Tempo restante: ${minutesRemaining} minutos
${status}
      `);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar cache:', error);
  }
}

checkCache();