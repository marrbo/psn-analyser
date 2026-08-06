// services/database/BaseRepository.ts
import { Collection, ObjectId, Filter, UpdateFilter, WithId, Document, OptionalUnlessRequiredId } from 'mongodb';
import { MongoDBConnection } from './mongodb-connection';

export interface RepositoryOptions {
  collectionName: string;
  databaseName?: string;
  createTimestamps?: boolean;
  updateTimestamps?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryOptions {
  projection?: Record<string, 0 | 1>;
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
}

export abstract class BaseRepository<T extends Document> {
  protected collectionName: string;
  protected databaseName?: string
  protected createTimestamps: boolean;
  protected updateTimestamps: boolean;
  private readonly connection: MongoDBConnection;

  constructor(options: RepositoryOptions) {
    this.collectionName = options.collectionName;
    this.databaseName = options.databaseName ?? process.env.MONGODB_DB;
    this.createTimestamps = options.createTimestamps ?? true;
    this.updateTimestamps = options.updateTimestamps ?? true;
    this.connection = MongoDBConnection.getInstance();
  }

  protected async getCollection(): Promise<Collection<T>> {
    const { db } = await this.connection.getConnection();
    const targetDb = this.databaseName ? db : db.collection(this.collectionName).db;
    return targetDb.collection<T>(this.collectionName);
  }

  protected prepareDocumentForInsert(document: Partial<T>): Partial<T> {
    const prepared = { ...document };
    
    if (this.createTimestamps && !prepared.createdAt) {
      (prepared as any).createdAt = new Date();
    }
    
    if (this.updateTimestamps && !prepared.updatedAt) {
      (prepared as any).updatedAt = new Date();
    }
    
    return prepared;
  }

  protected prepareDocumentForUpdate(updates: Partial<T>): Partial<T> {
    const prepared = { ...updates };
    
    if (this.updateTimestamps && !prepared.updatedAt) {
      (prepared as any).updatedAt = new Date();
    }
    
    return prepared;
  }

  // CRUD Operations
  public async create(document: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      const preparedDoc = this.prepareDocumentForInsert(document) as OptionalUnlessRequiredId<T>;
      const result = await collection.insertOne(preparedDoc);
      
      return {
        ...document,
        _id: result.insertedId,
      } as WithId<T>;
    } catch (error) {
      this.handleError('create', error);
    }
  }

  public async createMany(documents: OptionalUnlessRequiredId<T>[]): Promise<WithId<T>[]> {
    try {
      const collection = await this.getCollection();
      const preparedDocs = documents.map(doc => 
        this.prepareDocumentForInsert(doc) as OptionalUnlessRequiredId<T>
      );
      
      const result = await collection.insertMany(preparedDocs);
      
      return documents.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index],
      })) as WithId<T>[];
    } catch (error) {
      this.handleError('createMany', error);
    }
  }

  public async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      
      return await collection.findOne({ _id: objectId } as Filter<T>) as WithId<T> | null;
    } catch (error) {
      // Se for um ObjectId inválido, retorna null em vez de erro
      if (error instanceof Error && error.message.includes('ObjectId')) {
        return null;
      }
      this.handleError('findById', error);
    }
  }

  public async findOne(filter: Filter<T>, options?: QueryOptions): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      return await collection.findOne(filter, {
        projection: options?.projection,
        sort: options?.sort,
      }) as WithId<T> | null;
    } catch (error) {
      this.handleError('findOne', error);
    }
  }

  public async find(filter: Filter<T> = {}, options?: QueryOptions): Promise<WithId<T>[]> {
    try {
      const collection = await this.getCollection();
      const cursor = collection.find(filter, {
        projection: options?.projection,
        sort: options?.sort,
        skip: options?.skip,
        limit: options?.limit,
      });
      
      return await cursor.toArray() as WithId<T>[];
    } catch (error) {
      this.handleError('find', error);
    }
  }

  public async findByRegex(
    field: keyof T & string, 
    pattern: string, 
    options: 'i' | 'm' | 'x' | 's' = 'i'
  ): Promise<WithId<T>[]> {
    try {
      const collection = await this.getCollection();
      const regex = new RegExp(pattern, options);
      const filter = { [field]: { $regex: regex } } as Filter<T>;
      
      return await this.find(filter);
    } catch (error) {
      this.handleError('findByRegex', error);
    }
  }

  public async updateById(id: string | ObjectId, updates: Partial<T>): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      const preparedUpdates = this.prepareDocumentForUpdate(updates);
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId } as Filter<T>,
        { $set: preparedUpdates } as UpdateFilter<T>,
        { returnDocument: 'after' }
      );
      
      return result as WithId<T> | null;
    } catch (error) {
      this.handleError('updateById', error);
    }
  }

  public async updatePartial<U extends keyof T>(
    id: string | ObjectId,
    field: U,
    value: T[U]
  ): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      const updateDoc = { 
        [field]: value,
        ...(this.updateTimestamps && { updatedAt: new Date() })
      } as Partial<T>;
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId } as Filter<T>,
        { $set: updateDoc } as UpdateFilter<T>,
        { returnDocument: 'after' }
      );
      
      return result as WithId<T> | null;
    } catch (error) {
      this.handleError('updatePartial', error);
    }
  }

  public async updateMany(filter: Filter<T>, updates: Partial<T>): Promise<number> {
    try {
      const collection = await this.getCollection();
      const preparedUpdates = this.prepareDocumentForUpdate(updates);
      
      const result = await collection.updateMany(
        filter,
        { $set: preparedUpdates } as UpdateFilter<T>
      );
      
      return result.modifiedCount;
    } catch (error) {
      this.handleError('updateMany', error);
    }
  }

  public async deleteById(id: string | ObjectId): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      
      const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
      return result.deletedCount === 1;
    } catch (error) {
      this.handleError('deleteById', error);
    }
  }

  public async deleteMany(filter: Filter<T>): Promise<number> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      this.handleError('deleteMany', error);
    }
  }

  public async count(filter: Filter<T> = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      this.handleError('count', error);
    }
  }

  public async paginate(
    filter: Filter<T> = {},
    params: PaginationParams,
    options?: QueryOptions
  ): Promise<PaginatedResult<WithId<T>>> {
    try {
      const collection = await this.getCollection();
      const { page = 1, limit = 10, sort } = params;
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        collection
          .find(filter, {
            projection: options?.projection,
            sort: sort || options?.sort,
            skip,
            limit,
          })
          .toArray() as Promise<WithId<T>[]>,
        collection.countDocuments(filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.handleError('paginate', error);
    }
  }

  public async exists(filter: Filter<T>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const count = await collection.countDocuments(filter, { limit: 1 });
      return count > 0;
    } catch (error) {
      this.handleError('exists', error);
    }
  }

  // Transaction support
  public async withTransaction<U>(
    operation: (session: any) => Promise<U>
  ): Promise<U> {
    const { client } = await this.connection.getConnection();
    const session = client.startSession();
    
    try {
      let result: U;
      await session.withTransaction(async () => {
        result = await operation(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  // Bulk operations
  public async bulkWrite(operations: any[]): Promise<any> {
    try {
      const collection = await this.getCollection();
      return await collection.bulkWrite(operations);
    } catch (error) {
      this.handleError('bulkWrite', error);
    }
  }

  // Aggregation
  public async aggregate<U = any>(pipeline: any[]): Promise<U[]> {
    try {
      const collection = await this.getCollection();
      return await collection.aggregate<U>(pipeline).toArray();
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }

  // Error handling
  protected handleError(operation: string, error: unknown): never {
    console.error(`❌ Erro na operação ${operation}:`, error);
    
    // Verifica se é um erro de conexão
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        throw new Error(`Erro de conexão com o banco de dados durante ${operation}`);
      }
      
      // Verifica se é um erro de validação
      if (error.name === 'ValidationError' || error.message.includes('validation')) {
        throw new Error(`Erro de validação durante ${operation}: ${error.message}`);
      }
    }
    
    throw new Error(`Erro durante ${operation}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}