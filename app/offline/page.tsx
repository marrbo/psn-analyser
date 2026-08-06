// app/offline/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { offlineDb } from '@/lib/db/offline-db';

export default function OfflinePage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);

   async function loadLocalAnalyses() {
    try {
      await offlineDb.init();
      // Buscar todas as análises do IndexedDB
      const store = offlineDb.getObjectStore('analyses', 'readonly');
      // Implementar carregamento
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    loadLocalAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">📱 Modo Offline</h1>

        <div className={`alert ${isOnline ? 'alert-success' : 'alert-warning'} mb-6`}>
          {isOnline ? '✅ Você está online' : '⚠️ Você está offline'}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Análises Disponíveis Offline</h2>
          {analyses.length > 0 ? (
            analyses.map((analysis) => (
              <Link
                key={analysis._id}
                href={`/dashboard/${analysis._id}?offline=true`}
                className="block p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
              >
                <h3 className="font-semibold">{analysis.username}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">Nenhuma análise disponível para offline</p>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500">
          <h3 className="font-semibold mb-2">💡 Dicas para Offline</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Suas análises são salvas automaticamente</li>
            <li>Novas análises são sincronizadas quando online</li>
            <li>Imagens são cacheadas para visualização offline</li>
          </ul>
        </div>

        {isOnline && (
          <Link
            href="/"
            className="btn btn-primary w-full mt-6"
          >
            ← Voltar para Análise
          </Link>
        )}
      </div>
    </div>
  );
}