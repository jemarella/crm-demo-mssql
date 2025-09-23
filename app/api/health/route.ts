import pool from '@/app/lib/database';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT 1 AS health_check');
    return new Response(JSON.stringify({ status: 'healthy' }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: 'Database connection failed'
    }), {
      status: 500
    });
  }
}