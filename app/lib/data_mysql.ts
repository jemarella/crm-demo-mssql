// app/lib/data.ts
import { query } from '@/app/lib/database';
import { formatCurrency } from './utils';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import {
  RevenueRow,
  LatestInvoiceRawRow,
  InvoiceFormRow,
  CustomerFieldRow,
  CustomersTableTypeRow,
  InvoicesTableRow,
  CountResult,
  AmountResult
} from './mysql-types';

export async function fetchRevenue() {
  try {
    const [data] = await query<RevenueRow[]>('SELECT * FROM revenue');
    return data as Revenue[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// For fetchLatestInvoices
export async function fetchLatestInvoices() {
  try {
    const [data] = await query<LatestInvoiceRawRow[]>(`
      SELECT TOP 5 invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC`);

    return data.map((invoice) => ({
      id: invoice.id,
      name: invoice.name,
      image_url: invoice.image_url,
      email: invoice.email,
      amount: formatCurrency(invoice.amount), // Convert number to formatted string
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}


export async function fetchCardData() {
  try {
    const [invoiceCount] = await query<CountResult[]>('SELECT COUNT(*) as count FROM invoices');
    const [customerCount] = await query<CountResult[]>('SELECT COUNT(*) as count FROM customers');
    const [invoiceStatus] = await query<AmountResult[]>(`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
      FROM invoices`);

    return {
      numberOfInvoices: Number(invoiceCount[0].count ?? '0'),
      numberOfCustomers: Number(customerCount[0].count ?? '0'),
      totalPaidInvoices: formatCurrency(invoiceStatus[0].paid ?? '0'),
      totalPendingInvoices: formatCurrency(invoiceStatus[0].pending ?? '0'),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  queryParam: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const [invoices] = await query<InvoicesTableRow[]>(`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name LIKE ? OR
        customers.email LIKE ? OR
        CAST(invoices.amount AS CHAR) LIKE ? OR
        DATE_FORMAT(invoices.date, '%Y-%m-%d') LIKE ? OR
        invoices.status LIKE ?
      ORDER BY invoices.date DESC
      LIMIT ? OFFSET ?`,
      [
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        ITEMS_PER_PAGE,
        offset
      ]
    );

    return invoices as InvoicesTable[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(queryParam: string) {
  try {
    const [data] = await query<CountResult[]>(`
      SELECT COUNT(*) as count
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name LIKE ? OR
        customers.email LIKE ? OR
        CAST(invoices.amount AS CHAR) LIKE ? OR
        DATE_FORMAT(invoices.date, '%Y-%m-%d') LIKE ? OR
        invoices.status LIKE ?`,
      [
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`
      ]
    );

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const [data] = await query<InvoiceFormRow[]>(`
      SELECT
        id,
        customer_id,
        amount,
        status
      FROM invoices
      WHERE id = ?`,
      [id]
    );

    return data.length > 0 ? {
      ...data[0],
      amount: data[0].amount / 100 // Convert amount from cents to dollars
    } as InvoiceForm : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const [customers] = await query<CustomerFieldRow[]>(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC`
    );

    return customers as CustomerField[];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

// For fetchFilteredCustomers
export async function fetchFilteredCustomers(queryParam: string) {
  try {
    const [data] = await query<CustomersTableTypeRow[]>(`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name LIKE ? OR
        customers.email LIKE ?
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC`,
      [`%${queryParam}%`, `%${queryParam}%`]
    );

    return data.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      image_url: customer.image_url,
      total_invoices: customer.total_invoices,
      total_pending: customer.total_pending, // Keep as number for calculations
      total_paid: customer.total_paid,       // Keep as number for calculations
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}