// app/dashboard/page.tsx

export const dynamic = 'force-dynamic';

import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
  type CardData,
} from '@/app/lib/data';
import type { ReactElement } from 'react';
import type { Revenue, LatestInvoiceRaw } from '@/app/lib/definitions';

export default async function Page(): Promise<ReactElement> {
  let revenue: Revenue[] = [];
  let latestInvoices: (LatestInvoiceRaw & { amount: string })[] = [];
  let numberOfInvoices = 0;
  let numberOfCustomers = 0;
  let totalPaidInvoices = '';
  let totalPendingInvoices = '';

  try {
    revenue = await fetchRevenue();
  } catch (error) {
    console.error('Error fetching revenue:', error);
  }

  try {
    latestInvoices = await fetchLatestInvoices();
  } catch (error) {
    console.error('Error fetching latest invoices:', error);
  }

  try {
    const cardStats: CardData = await fetchCardData();
    numberOfInvoices = cardStats.numberOfInvoices;
    numberOfCustomers = cardStats.numberOfCustomers;
    totalPaidInvoices = cardStats.totalPaidInvoices;
    totalPendingInvoices = cardStats.totalPendingInvoices;
  } catch (error) {
    console.error('Error fetching card data:', error);
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
