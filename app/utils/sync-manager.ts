// app/utils/sync-manager.ts
import { AnalysisData } from '@/lib/mongodb';

export class SyncManager {
  private static instance: SyncManager;
  private syncQueue: Map<string, any> = new Map();
  private isSyncing = false;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async queueAnalysis(accountId: string, analysisData: AnalysisData): Promise<void> {
    this.syncQueue.set(`analysis-${accountId}`, {
      type: 'analysis',
      accountId,
      data: analysisData,
      timestamp: new Date()
    });

    if ('sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(`sync-analysis-${accountId}`);
      } catch (error) {
        console.warn('Background Sync não disponível:', error);
        await this.syncNow();
      }
    } else {
      await this.syncNow();
    }
  }

  async syncNow(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    for (const [key, item] of this.syncQueue.entries()) {
      try {
        if (item.type === 'analysis') {
          await this.syncAnalysis(item.accountId, item.data);
          this.syncQueue.delete(key);
        }
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
      }
    }
    this.isSyncing = false;
  }

  private async syncAnalysis(accountId: string, data: AnalysisData): Promise<void> {
    const response = await fetch('/api/analyze/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, data })
    });

    if (!response.ok) throw new Error('Sync failed');
  }
}