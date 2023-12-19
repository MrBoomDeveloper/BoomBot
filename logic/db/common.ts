import { createConnection, createPool } from "mysql2/promise";

export async function useQuery(query: string, callback: () => void) {
    //await useDB(connection => connection.query(query));
}

export async function useDB(callback: (connection) => Promise<boolean>) {
    const connection = await createConnection(options);
    
    await callback(pool);
    await connection.end();
    
    return true;
}

const options = {
    host: process.env.TIDB_HOST || '127.0.0.1',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'test',
    ssl: process.env.TIDB_ENABLE_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        ca: process.env.TIDB_CA_PATH ? fs.readFileSync(process.env.TIDB_CA_PATH) : undefined
    } : null
}

const pool = createPool(options);



