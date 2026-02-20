import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';
import { PSNUser } from '@/types/psn';

// Serviço de cache
export class CacheService {

    private readonly cacheId: string;
    private readonly collection: string;

    constructor(checheId: string, collection: string) {
        this.cacheId = checheId;
        this.collection = collection;
    }

    public async getItem<T = PSNUser>(): Promise<T> {
        const { db } = await connectToDatabase();
        const _cacheId = this.cacheId;
        const cacheItem = await db.collection(this.collection).findOne({ _cacheId: _cacheId });
        return cacheItem as T;
    }

    public async setItem<T>(data: T): Promise<void> {
        const { db } = await connectToDatabase();
        const _cacheId = this.cacheId;
        await db.collection(this.collection).updateOne(
            { _cacheId },
            {
                $set: {
                    ...data,
                    lastUpdated: new Date()
                }
            },
            { upsert: true }
        );
    }

    public async getItemById<T>(itemId: string): Promise<T> {
        const _id = new ObjectId(itemId);
        const { db } = await connectToDatabase();
        const result = await db.collection(this.collection)
        .findOne({ _id: _id })
        .then((item) => item)
        .catch(() => console.error('getItemById -> Erro ao buscar:', itemId));

        return result as T;
    }

    async removeItem(idemId: string): Promise<number> {
        const { db } = await connectToDatabase();
        const deleteResult = await db.collection(this.collection)
        .deleteOne({ _cacheId: idemId });

        deleteResult.deletedCount > 0 ? console.log(`🗑️ Deletado com sucesso!`) : console.log(`🗑️ Nenhum item foi deletado!`);

        return deleteResult.deletedCount;
    }

    public async cacheTrophies(trophies: any[]): Promise<void> {
        const { db } = await connectToDatabase();

        for (const trophy of trophies) {
            await db.collection('trophies').updateOne(
                {
                    npCommunicationId: trophy.npCommunicationId,
                    trophyId: trophy.trophyId
                },
                {
                    $set: {
                        ...trophy,
                        lastUpdated: new Date()
                    }
                },
                { upsert: true }
            );
        }
    }

    public async cacheUserTrophies(userTrophies: any[]): Promise<void> {
        const { db } = await connectToDatabase();

        for (const userTrophy of userTrophies) {
            await db.collection('user_trophies').updateOne(
                {
                    accountId: userTrophy.accountId,
                    npCommunicationId: userTrophy.npCommunicationId,
                    trophyId: userTrophy.trophyId
                },
                {
                    $set: {
                        ...userTrophy,
                        lastUpdated: new Date()
                    }
                },
                { upsert: true }
            );
        }
    }

    public async getUserTrophies(accountId: string, npCommunicationId: string): Promise<any[]> {
        const { db } = await connectToDatabase();
        return await db.collection('user_trophies')
            .find({
                accountId,
                npCommunicationId
            })
            .toArray();
    }
}
