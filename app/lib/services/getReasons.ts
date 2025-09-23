import { execute } from '../database';

// Simplified interface - no more mysql2 types
interface ReasonRow {
  reason_code: number;
  reason_description: string;
}

export async function getReasons(): Promise<{reason_code: number, reason_description: string}[]> {
  try {
    // Use the MSSQL-compatible execute function
    const [rows] = await execute<ReasonRow[]>(
      `SELECT reason_code, reason_description FROM rcodes ORDER BY reason_code`
    );
    
    // Map to ensure correct structure (same as before)
    return rows.map(row => ({
      reason_code: row.reason_code,
      reason_description: row.reason_description
    }));
    
  } catch (error) {
    console.error('Error fetching reasons:', error);
    throw error;
  }
}