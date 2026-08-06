// lib/db/offline-db.ts
export class OfflineDatabase {
  private dbName = 'psn-analyser-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // User profiles
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: '_id' });
          userStore.createIndex('accountId', 'accountId', { unique: true });
          userStore.createIndex('onlineId', 'onlineId', { unique: true });
          userStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Game analysis data
        if (!db.objectStoreNames.contains('analyses')) {
          const analysisStore = db.createObjectStore('analyses', { keyPath: '_id' });
          analysisStore.createIndex('accountId', 'accountId');
          analysisStore.createIndex('createdAt', 'createdAt');
        }

        // Games with trophy data
        if (!db.objectStoreNames.contains('games')) {
          const gameStore = db.createObjectStore('games', { keyPath: 'npCommunicationId' });
          gameStore.createIndex('accountId', 'accountId');
          gameStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Trophy details
        if (!db.objectStoreNames.contains('trophies')) {
          const trophyStore = db.createObjectStore('trophies', { keyPath: 'trophyId' });
          trophyStore.createIndex('npCommunicationId', 'npCommunicationId');
        }

        // GOTY games database
        if (!db.objectStoreNames.contains('goty_games')) {
          const gotyStore = db.createObjectStore('goty_games', { keyPath: 'id' });
          gotyStore.createIndex('titulo', 'titulo');
        }

        // Cache metadata
        if (!db.objectStoreNames.contains('cache_metadata')) {
          db.createObjectStore('cache_metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async saveUser(user: PSNUser): Promise<void> {
    const store = this.getObjectStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ ...user, lastUpdated: new Date() });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUser(accountId: string): Promise<PSNUser | null> {
    const store = this.getObjectStore('users', 'readonly');
    const index = store.index('accountId');

    return new Promise((resolve, reject) => {
      const request = index.get(accountId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveAnalysis(analysisId: string, data: AnalysisData): Promise<void> {
    const store = this.getObjectStore('analyses', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ _id: analysisId, ...data, lastUpdated: new Date() });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAnalysis(analysisId: string): Promise<AnalysisData | null> {
    const store = this.getObjectStore('analyses', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(analysisId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveGames(games: GameTitle[]): Promise<void> {
    const store = this.getObjectStore('games', 'readwrite');
    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      games.forEach(game => {
        store.put({ ...game, lastUpdated: new Date() });
      });
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  async getGamesByAccountId(accountId: string): Promise<GameTitle[]> {
    const store = this.getObjectStore('games', 'readonly');
    const index = store.index('accountId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(accountId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private getObjectStore(name: string, mode: 'readonly' | 'readwrite'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  async clearAll(): Promise<void> {
    if (!this.db) return;
    const stores = Array.from(this.db.objectStoreNames);
    for (const storeName of stores) {
      const store = this.getObjectStore(storeName, 'readwrite');
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  }
}

export const offlineDb = new OfflineDatabase();