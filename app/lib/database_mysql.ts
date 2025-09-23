import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Initialize environment variables FIRST
dotenv.config();

// Database connection configuration type
interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: any;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
  namedPlaceholders?: boolean;
  typeCast?: (field: any, next: () => void) => any;
}

// Validate required environment variables
function validateEnv() {
  const requiredVars = ['DB_USE_CLOUD'];
  const useCloud = process.env.DB_USE_CLOUD === 'true';
  
  if (useCloud) {
    requiredVars.push('DB_CLOUD_HOST', 'DB_CLOUD_USER', 'DB_CLOUD_PASSWORD', 'DB_CLOUD_NAME');
  } else {
    if (process.env.NODE_ENV === 'development') {
      process.env.DB_LOCAL_HOST = process.env.DB_LOCAL_HOST || 'localhost'; 
      process.env.DB_LOCAL_USER = process.env.DB_LOCAL_USER || 'root';
      process.env.DB_LOCAL_PASSWORD = process.env.DB_LOCAL_PASSWORD || 'Desarrollo.16';
      process.env.DB_LOCAL_NAME = process.env.DB_LOCAL_NAME || 'crmtest';
    } else {
      requiredVars.push('DB_LOCAL_HOST', 'DB_LOCAL_USER', 'DB_LOCAL_PASSWORD', 'DB_LOCAL_NAME');
    }
  }

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing environment variables: ${missingVars.join(', ')}. Using defaults`);
    } else {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
}

// Determine configuration - now with validation
function getDbConfig(): DBConfig {
  validateEnv();
  
  const baseConfig = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    typeCast: (field: any, next: () => void) => {
      if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1';
      }
      return next();
    }
  };

  if (process.env.DB_USE_CLOUD === 'true') {
    return {
      ...baseConfig,
      host: process.env.DB_CLOUD_HOST!,
      port: parseInt(process.env.DB_CLOUD_PORT || '3306'),
      user: process.env.DB_CLOUD_USER!,
      password: process.env.DB_CLOUD_PASSWORD!,
      database: process.env.DB_CLOUD_NAME!,
      ssl: process.env.DB_CLOUD_CA_CERT ? {
        rejectUnauthorized: false,
        ca: process.env.DB_CLOUD_CA_CERT
      } : undefined
    };
  } else {
    return {
      ...baseConfig,
      host: process.env.DB_LOCAL_HOST!,
      port: parseInt(process.env.DB_LOCAL_PORT || '3306'),
      user: process.env.DB_LOCAL_USER!,
      password: process.env.DB_LOCAL_PASSWORD!,
      database: process.env.DB_LOCAL_NAME!
    };
  }
}

// Create a connection pool with retry logic
async function createPoolWithRetry(retries = 3, delay = 2000): Promise<mysql.Pool> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const config = getDbConfig();
      return await mysql.createPool(config);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Connection attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Failed to create database pool after ${retries} attempts: ${lastError?.message}`);
}

// Initialize the pool
let pool: mysql.Pool;

try {
  pool = await createPoolWithRetry();
  console.log('Database pool created successfully');
} catch (error) {
  console.error('FATAL: Failed to create database pool:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  // In development, you might want to continue with a mock pool
  throw error;
}

// Enhanced execute function with proper typing
async function execute<T extends mysql.RowDataPacket[] | mysql.ResultSetHeader>(
  sql: string, 
  values?: any
): Promise<[T, mysql.FieldPacket[]]> {
  return pool.execute(sql, values) as Promise<[T, mysql.FieldPacket[]]>;
}

// Query function for complex queries
async function query<T extends mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.ResultSetHeader | mysql.ResultSetHeader[]>(
  sql: string, 
  values?: any
): Promise<[T, mysql.FieldPacket[]]> {
  return pool.query(sql, values) as Promise<[T, mysql.FieldPacket[]]>;
}

// Graceful shutdown
const shutdown = async () => {
  if (pool) {
    await pool.end();
    console.log('Database pool has been closed');
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export {
  pool as default,
  execute,
  query,
  shutdown
};

export type { DBConfig };