import { query } from '../database';

// Interface for reason records
interface ReasonRow {
  reason_code: number;
  reason_description: string;
}

export async function getReasons(): Promise<ReasonRow[]> {
  try {
    // Use query for SELECT operations
    const rows = await query<ReasonRow>(
      `SELECT reason_code, reason_description FROM rcodes ORDER BY reason_code`
    );
    
    return rows;
    
  } catch (error) {
    console.error('Error fetching reasons:', error);
    throw new Error('Failed to fetch reasons from database');
  }
}