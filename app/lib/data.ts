import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * Devuelve un array puro de Revenue, sin metadata de pg.
 */
export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    const result = await sql<Revenue[]>`SELECT * FROM revenue`;
    return Array.from(result);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

/**
 * Trae las últimas 5 facturas y formatea el amount como string.
 */
export async function fetchLatestInvoices(): Promise<
  (LatestInvoiceRaw & { amount: string })[]
> {
  try {
    const result = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5
    `;
    return result.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export interface CardData {
  numberOfInvoices: number;
  numberOfCustomers: number;
  totalPaidInvoices: string;
  totalPendingInvoices: string;
}

/**
 * Trae datos para las tarjetas: conteos y totales formateados.
 */
export async function fetchCardData(): Promise<CardData> {
  try {
    const [invoiceCount, customerCount, statusTotals] = await Promise.all([
      sql<{ count: string }[]>`SELECT COUNT(*) FROM invoices`,
      sql<{ count: string }[]>`SELECT COUNT(*) FROM customers`,
      sql<{ paid: number; pending: number }[]>`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
        FROM invoices
      `,
    ]);

    return {
      numberOfInvoices: Number(invoiceCount[0].count ?? '0'),
      numberOfCustomers: Number(customerCount[0].count ?? '0'),
      totalPaidInvoices: formatCurrency(statusTotals[0].paid ?? 0),
      totalPendingInvoices: formatCurrency(statusTotals[0].pending ?? 0),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// El resto de funciones (fetchFilteredInvoices, fetchInvoicesPages, etc.)
// puedes dejarlas tal cual estaban, pues no participan en el error de tipos.
