import { execute } from "@/app/lib/database";

// Simplified interface - no more mysql2 types
interface InvoiceRow {
  amount: number;
  name: string;
}

// Existing function to get single invoice (keeping for reference)
async function listInvoices() {
  try {
    const [rows] = await execute<InvoiceRow[]>(
      `SELECT invoices.amount, customers.name 
       FROM invoices
       JOIN customers ON invoices.customer_id = customers.id
       WHERE invoices.amount = 666`
    );
    
    if (rows.length === 0) return null;
    
    const invoice = rows[0];
    return {
      amount: invoice.amount,
      name: invoice.name,
    };
  } catch (error) {
    return {
      message: 'Database Error: Failed to get data.',
    };
  }
}

// New function to get all invoices
async function getAllInvoices() {
  try {
    const [rows] = await execute<InvoiceRow[]>(
      `SELECT invoices.amount, customers.name 
       FROM invoices
       JOIN customers ON invoices.customer_id = customers.id
       ORDER BY invoices.date DESC`
    );
    
    if (rows.length === 0) return [];
    
    // Return array of all invoices
    return rows.map(row => ({
      amount: row.amount,
      name: row.name
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all invoices.');
  }
}

export async function GET() {
  try {
    // To get all invoices:
    const invoices = await getAllInvoices();
    return Response.json(invoices);
    
    // Or to get specific invoice (existing functionality):
    // return Response.json(await listInvoices());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}