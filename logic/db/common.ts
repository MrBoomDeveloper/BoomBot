import { Connection, Field, FieldPacket, createConnection, createPool } from "mysql2/promise";
import { ConnectionOptions } from "mysql2/typings/mysql/lib/Connection";
import { readFileSync } from "fs";

const options: ConnectionOptions = {
    host: process.env.TIDB_HOST || '127.0.0.1',
    port: (process.env.TIDB_PORT as any as number) || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'test',
    ssl: process.env.TIDB_ENABLE_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        ca: process.env.TIDB_CA_PATH ? readFileSync(process.env.TIDB_CA_PATH) : undefined
    } : null
}

export async function useQuery(query: string, args?: any[]) {
    return await useDB(async (connection) => await connection.query(query, args));
}

export async function useDB<T>(callback: (connection: Connection) => Promise<T>) {
    const connection = await createConnection(options);
    
    const result = await callback(connection);
    await connection.end();
    return result;
}




