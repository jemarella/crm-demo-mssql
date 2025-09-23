// app/lib/mssql-types.ts
// Plain TypeScript interfaces for MSSQL compatibility

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';

// Raw database types - no more mysql2 dependencies
export interface RevenueRow extends Revenue {}
export interface LatestInvoiceRawRow extends Omit<LatestInvoiceRaw, 'amount'> {
  amount: number; // Database returns number
}
export interface InvoiceFormRow extends InvoiceForm {}
export interface CustomerFieldRow extends CustomerField {}
export interface CustomersTableTypeRow extends Omit<CustomersTableType, 'total_pending' | 'total_paid'> {
  total_pending: number; // Database returns number
  total_paid: number;    // Database returns number
}
export interface InvoicesTableRow extends InvoicesTable {}
export interface CountResult { count: number }
export interface AmountResult { paid: number; pending: number }

// Additional MSSQL-specific types if needed
export interface MSSQLResult<T = any> {
  recordset: T[];
  recordsets: T[][];
  output: { [key: string]: any };
  rowsAffected: number[];
}

export interface MSSQLParameter {
  name: string;
  type: any;
  value: any;
  options?: {
    precision?: number;
    scale?: number;
    length?: number;
  };
}