import sql from 'mssql';
import dotenv from 'dotenv';

// Initialize environment variables FIRST
dotenv.config();

// Database connection configuration type for MSSQL
interface DBConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
    connectTimeout: number;
  };
  pool?: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
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
      process.env.DB_LOCAL_USER = process.env.DB_LOCAL_USER || 'sa';
      process.env.DB_LOCAL_PASSWORD = process.env.DB_LOCAL_PASSWORD || 'YourPassword';
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

// MSSQL configuration with optimized settings for memory stability
function getDbConfig(): DBConfig {
  validateEnv();
  
  const baseConfig = {
    options: {
      encrypt: process.env.DB_USE_CLOUD === 'true',
      trustServerCertificate: true,
      enableArithAbort: true,
      connectTimeout: 30000    // 30 seconds connection timeout
    },
    pool: {
      max: 5,                   // REDUCED from 10 to prevent memory issues
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000 // 30 seconds to acquire connection
    }
  };

  if (process.env.DB_USE_CLOUD === 'true') {
    return {
      ...baseConfig,
      server: process.env.DB_CLOUD_HOST!,
      port: parseInt(process.env.DB_CLOUD_PORT || '1433'),
      user: process.env.DB_CLOUD_USER!,
      password: process.env.DB_CLOUD_PASSWORD!,
      database: process.env.DB_CLOUD_NAME!,
    };
  } else {
    return {
      ...baseConfig,
      server: process.env.DB_LOCAL_HOST!,
      port: parseInt(process.env.DB_LOCAL_PORT || '1433'),
      user: process.env.DB_LOCAL_USER!,
      password: process.env.DB_LOCAL_PASSWORD!,
      database: process.env.DB_LOCAL_NAME!
    };
  }
}

// Connection monitoring
let activeConnections = 0;
let totalConnections = 0;
const MAX_CONNECTIONS = 100; // Safety limit
const CONNECTION_WARNING_THRESHOLD = 30;

// Monitor connection usage
function trackConnection(operation: 'acquire' | 'release') {
  if (operation === 'acquire') {
    activeConnections++;
    totalConnections++;
  } else {
    activeConnections = Math.max(0, activeConnections - 1);
  }

  // Log warning if connections are high
  if (activeConnections > CONNECTION_WARNING_THRESHOLD) {
    console.warn(`High active connections: ${activeConnections}. Possible connection leak.`);
  }

  // Safety limit - should never hit this in normal operation
  if (totalConnections > MAX_CONNECTIONS) {
    console.error(`CRITICAL: Total connections exceeded safety limit: ${totalConnections}`);
  }
}

// Create a connection pool with retry logic and better error handling
async function createPoolWithRetry(retries = 3, delay = 2000): Promise<sql.ConnectionPool> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const config = getDbConfig();
      const pool = new sql.ConnectionPool(config);
      
      // Add pool event listeners for better monitoring
      pool.on('error', err => {
        console.error('Database pool error:', err);
      });
      
      await pool.connect();
      console.log(`Database pool created successfully (attempt ${i + 1})`);
      return pool;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Connection attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      
      // Increase delay with each retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error(`Failed to create database pool after ${retries} attempts: ${lastError?.message}`);
}

// Initialize the pool
let pool: sql.ConnectionPool;

try {
  pool = await createPoolWithRetry();
  console.log('MSSQL database pool created successfully');
} catch (error) {
  console.error('FATAL: Failed to create MSSQL database pool:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  throw error;
}

// Enhanced execute function with memory protection and timeouts
async function execute<T = any>(
  sqlQuery: string, 
  params?: any[]
): Promise<[T[], any]> {
  // Validate input to prevent memory issues
  if (sqlQuery.length > 10000) {
    throw new Error('Query too long - possible memory issue');
  }

  if (params && params.length > 100) {
    throw new Error('Too many parameters - possible memory issue');
  }

  const startTime = Date.now();

  try {
    const request = pool.request();
    
    // Set query timeout (15 seconds)
    //request.timeout(15000);
    
    // Convert MySQL-style ? parameters to MSSQL named parameters
    if (params && params.length > 0) {
      params.forEach((value, index) => {
        // Limit parameter size to prevent memory issues
        if (value && typeof value === 'string' && value.length > 1000) {
          console.warn(`Large parameter detected (${value.length} chars) at index ${index}`);
        }
        request.input(`param${index}`, value);
      });
      
      // Replace ? with @param0, @param1, etc.
      let paramIndex = 0;
      sqlQuery = sqlQuery.replace(/\?/g, () => `@param${paramIndex++}`);
    }

    const result = await request.query<T>(sqlQuery);
    const duration = Date.now() - startTime;
    
    // Log slow queries
    if (duration > 5000) {
      console.warn(`Slow query (${duration}ms): ${sqlQuery.substring(0, 200)}...`);
    }

    return [result.recordset, []];
  } catch (error) {
    console.error('Database execute error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: sqlQuery.substring(0, 200), // Log first 200 chars only
      paramsCount: params?.length || 0,
      duration: Date.now() - startTime
    });
    throw error;
  }
}

// MySQL-compatible query function
async function query<T = any>(
  sqlQuery: string, 
  params?: any[]
): Promise<[T[], any]> {
  return execute<T>(sqlQuery, params);
}

// MSSQL-specific execute function (for named parameters)
async function executeNamed<T = any>(
  sqlQuery: string, 
  params?: Record<string, any>
): Promise<sql.IResult<T>> {
  const request = pool.request();
  //request.timeout(15000);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }
  
  return request.query<T>(sqlQuery);
}

// Stored procedure execution
async function executeProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<sql.IResult<T>> {
  const request = pool.request();
  //request.timeout(15000);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }
  
  return request.execute<T>(procedureName);
}

// Health check function
async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  activeConnections: number;
  totalConnections: number;
  error?: string;
}> {
  try {
    const [result] = await execute<{test: number}[]>('SELECT 1 as test');
    return {
      healthy: result.length > 0 && result[0].test === 1,
      activeConnections,
      totalConnections
    };
  } catch (error) {
    return {
      healthy: false,
      activeConnections,
      totalConnections,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Graceful shutdown with better cleanup
const shutdown = async (signal?: string) => {
  if (signal) {
    console.log(`Received ${signal}, shutting down gracefully...`);
  }
  
  if (pool) {
    try {
      console.log('Closing database pool...');
      await pool.close();
      console.log('Database pool closed successfully');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
};

// Handle various shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('beforeExit', () => shutdown('beforeExit'));

// Memory usage monitoring
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const used = process.memoryUsage();
    const memoryUsage = {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(used.external / 1024 / 1024)} MB`
    };

    // Log if memory usage is high
    if (used.heapUsed > 200 * 1024 * 1024) { // 200MB threshold
      console.warn('High memory usage detected:', memoryUsage);
    }

    // Log connection stats periodically
    console.log('Database connections - Active:', activeConnections, 'Total:', totalConnections);
  }, 60000); // Check every minute
}

// Single export statement at the end to avoid duplicates
export {
  pool as default,
  execute,
  query,
  executeNamed,
  executeProcedure,
  shutdown,
  checkDatabaseHealth
};

export type { DBConfig };

// Export MSSQL types for compatibility
export { sql };