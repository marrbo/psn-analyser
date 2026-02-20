// services/database/MongoDBConnection.ts
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionPromise: Promise<{ client: MongoClient; db: Db }> | null = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async getConnection(): Promise<{ client: MongoClient; db: Db }> {
    if (this.client && this.db) {
      return { client: this.client, db: this.db };
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.createConnection();
    
    try {
      const connection = await this.connectionPromise;
      this.isConnecting = false;
      return connection;
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  private async createConnection(): Promise<{ client: MongoClient; db: Db }> {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const MONGODB_DB = process.env.MONGODB_DB || 'psn_analyser';

    const options: MongoClientOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    };

    try {
      console.log('🔗 Conectando ao MongoDB...');
      const client = new MongoClient(MONGODB_URI, options);
      
      await client.connect();
      const db = client.db(MONGODB_DB);

      // Test connection
      await db.command({ ping: 1 });
      
      this.client = client;
      this.db = db;

      console.log('✅ Conectado ao MongoDB com sucesso');
      return { client, db };
    } catch (error) {
      console.error('❌ Erro ao conectar com MongoDB:', error);
      throw new Error(`Falha na conexão com MongoDB: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  public async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }

  public getDb(): Db | null {
    return this.db;
  }

  public isConnected(): boolean {
    return !!this.client && !!this.db;
  }
}



// // Exemplo de uso específico para uma entidade
// // interfaces/User.ts
// export interface User extends Document {
//   _id?: ObjectId;
//   name: string;
//   email: string;
//   age?: number;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // services/UserService.ts
// export class UserRepository extends BaseRepository<User> {
//   constructor() {
//     super({
//       collectionName: 'users',
//       createTimestamps: true,
//       updateTimestamps: true,
//     });
//   }

//   // Métodos específicos para User
//   public async findByEmail(email: string): Promise<WithId<User> | null> {
//     return await this.findOne({ email } as Filter<User>);
//   }

//   public async findByNameRegex(name: string): Promise<WithId<User>[]> {
//     return await this.findByRegex('name', name, 'i');
//   }

//   public async findAdults(minAge: number = 18): Promise<WithId<User>[]> {
//     return await this.find({ age: { $gte: minAge } } as Filter<User>);
//   }
// }

// Exemplo de uso no Next.js API Route
// app/api/users/route.ts
/*
import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/services/UserService';

export async function GET(request: NextRequest) {
  try {
    const userRepo = new UserRepository();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let filter = {};
    if (search) {
      filter = { name: { $regex: search, $options: 'i' } };
    }

    const result = await userRepo.paginate(filter, { page, limit, sort: { createdAt: -1 } });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRepo = new UserRepository();
    const body = await request.json();
    
    // Validação básica
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se email já existe
    const existingUser = await userRepo.findByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    const newUser = await userRepo.create(body);
    
    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
*/

// Hook personalizado para React
// hooks/useRepository.ts
/*
import { useState, useCallback, useEffect } from 'react';
import { MongoDBConnection } from '@/services/database/MongoDBConnection';

export function useRepository<T extends Document>(repository: BaseRepository<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await repository.find(filter);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: async (item: Partial<T>) => {
      const result = await repository.create(item as any);
      fetchData(); // Recarrega os dados
      return result;
    },
    update: async (id: string, updates: Partial<T>) => {
      const result = await repository.updateById(id, updates);
      fetchData();
      return result;
    },
    remove: async (id: string) => {
      const success = await repository.deleteById(id);
      if (success) fetchData();
      return success;
    },
  };
}
*/

// Middleware para conexão (opcional)
// middleware/database.ts
/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MongoDBConnection } from '@/services/database/MongoDBConnection';

export async function databaseMiddleware(request: NextRequest) {
  try {
    const connection = MongoDBConnection.getInstance();
    await connection.getConnection();
    
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Middleware: Erro de conexão com banco');
    return NextResponse.json(
      { error: 'Serviço de banco de dados indisponível' },
      { status: 503 }
    );
  }
}
*/