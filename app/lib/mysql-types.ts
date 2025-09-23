// app/lib/mysql-types.ts
import { RowDataPacket } from 'mysql2/promise';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';

// Raw database types that extend RowDataPacket
export interface RevenueRow extends Revenue, RowDataPacket {}
export interface LatestInvoiceRawRow extends Omit<LatestInvoiceRaw, 'amount'>, RowDataPacket {
  amount: number; // Database returns number
}
export interface InvoiceFormRow extends InvoiceForm, RowDataPacket {}
export interface CustomerFieldRow extends CustomerField, RowDataPacket {}
export interface CustomersTableTypeRow extends Omit<CustomersTableType, 'total_pending' | 'total_paid'>, RowDataPacket {
  total_pending: number; // Database returns number
  total_paid: number;    // Database returns number
}
export interface InvoicesTableRow extends InvoicesTable, RowDataPacket {}
export interface CountResult extends RowDataPacket { count: number }
export interface AmountResult extends RowDataPacket { paid: number; pending: number }