// app/components/ui/ConnectionStatus.tsx
'use client';

import { useOnlineStatus } from '@/app/hooks/useOnlineStatus';

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 alert alert-warning shadow-lg z-50">
      <span>📡 Você está offline - Dados podem estar desatualizados</span>
    </div>
  );
}