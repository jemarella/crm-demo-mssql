import pool from '../database';
import { RowDataPacket } from 'mysql2';

// Correct interface to match your table structure
interface ReasonRow extends RowDataPacket {
  reason_code: number;  // Must match column name exactly
  reason_description: string;  // Must match column name exactly
}

export async function getReasons(): Promise<{reason_code: number, reason_description: string}[]> {
  try {
    const [rows] = await pool.execute<ReasonRow[]>(
      `SELECT reason_code, reason_description FROM rcodes ORDER BY reason_code`
    );
    
    // Map to ensure correct structure
    return rows.map(row => ({
      reason_code: row.reason_code,
      reason_description: row.reason_description
    }));
    
  } catch (error) {
    console.error('Error fetching reasons:', error);
    throw error; // Re-throw to handle in calling code
  }
}