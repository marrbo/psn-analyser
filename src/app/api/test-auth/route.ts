// src/app/api/test-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNAuth } from '@/lib/psn/auth';

export async function GET(request: NextRequest) {
  console.log('=== 🔐 TESTE AUTENTICAÇÃO POWER SHELL METHOD ===');
  
  try {
    const auth = new PSNAuth();
    console.log('🔄 Iniciando autenticação com método PowerShell...');
    
    const token = await auth.authenticate();
    
    if (token) {
        console.log('✅ ✅ ✅ AUTENTICAÇÃO BEM-SUCEDIDA!');
        
        return NextResponse.json({ 
        success: true,
        message: 'Autenticação PSN funcionando com método PowerShell!',
        tokenPreview: `${token.substring(0, 50)}...`,
        tokenLength: token.length,
        timestamp: new Date().toISOString()
        });
    }
    
  } catch (error) {
    console.error('❌ Falha na autenticação:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Falha na autenticação com método PowerShell',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}