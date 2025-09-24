// app/lib/database.ts
import sql from 'mssql';

const dbConfig: sql.config = {
  user: process.env.MSSQL_USER!,
  password: process.env.MSSQL_PASSWORD!,
  server: process.env.MSSQL_SERVER!,
  database: process.env.MSSQL_DATABASE!,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnectionPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to MSSQL database');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Replace ? placeholders with @p0, @p1, etc. and bind parameters
 */
function processQueryWithParameters(queryText: string, params: any[]): { processedQuery: string, request: sql.Request } {
  const request = new sql.Request();
  
  let paramIndex = 0;
  const processedQuery = queryText.replace(/\?/g, () => {
    const paramName = `p${paramIndex}`;
    paramIndex++;
    return `@${paramName}`;
  });
  
  // Bind parameters to the request
  params.forEach((param, index) => {
    request.input(`p${index}`, param);
  });
  
  return { processedQuery, request };
}

/**
 * Execute a SELECT query and return results
 * Handles MySQL-style ? parameter replacement for MSSQL compatibility
 */
export async function query<T = any>(
  queryText: string, 
  params: any[] = []
): Promise<T[]> {
  const connectionPool = await getConnectionPool();
  
  try {
    const { processedQuery, request } = processQueryWithParameters(queryText, params);
    
    // Use the connection pool with the request
    const result = await request.query(processedQuery);
    return result.recordset as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Original query:', queryText);
    console.error('Processed query:', queryText.replace(/\?/g, (_, i) => `@p${i}`));
    console.error('Parameters:', params);
    throw error;
  }
}

/**
 * Execute stored procedures, INSERT, UPDATE, DELETE operations
 * Returns affected rows and optional output parameters
 */
export async function execute<T = any>(
  procedureName: string,
  inputs: Record<string, any> = {},
  outputs: Record<string, any> = {}
): Promise<{
  recordsets: T[][];
  rowsAffected: number[];
  output: Record<string, any>;
  returnValue?: any;
}> {
  const pool = await getConnectionPool();
  
  try {
    const request = pool.request();
    
    // Add input parameters
    Object.entries(inputs).forEach(([name, value]) => {
      request.input(name, value);
    });
    
    // Add output parameters
    Object.entries(outputs).forEach(([name, type]) => {
      request.output(name, type);
    });
    
    const result = await request.execute(procedureName);
    return {
      recordsets: result.recordsets as T[][],
      rowsAffected: result.rowsAffected,
      output: result.output,
      returnValue: result.returnValue
    };
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Execute non-query operations (INSERT, UPDATE, DELETE)
 * Returns number of affected rows
 */
export async function executeNonQuery(
  commandText: string,
  params: any[] = []
): Promise<number> {
  const pool = await getConnectionPool();
  
  try {
    const { processedQuery, request } = processQueryWithParameters(commandText, params);
    
    const result = await request.query(processedQuery);
    return result.rowsAffected[0] || 0;
  } catch (error) {
    console.error('Database non-query error:', error);
    throw error;
  }
}

// Close connection pool (for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

// Utility function for testing connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = await getConnectionPool();
    const result = await pool.request().query('SELECT 1 as test');
    return result.recordset.length > 0;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}