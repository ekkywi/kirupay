import { formatCurrencyDisplay } from "@/lib/currency-format";

interface TopCustomer {
  displayName: string;
  customerEmail: string | null;
  buyerWallet: string | null;
  totalOrders: number;
  totalsByCurrency: Record<string, number>;
}

export function TopCustomersTable({ customers, selectedCurrency }: { customers: TopCustomer[]; selectedCurrency: string }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-medium text-slate-400 dark:border-white/10 dark:text-slate-500">
        No customer data available yet.
      </div>
    );
  }

  const renderTotalSpent = (customer: TopCustomer) => {
    if (selectedCurrency !== "ALL") {
      const value = customer.totalsByCurrency[selectedCurrency] ?? 0;
      return formatCurrencyDisplay(selectedCurrency, value);
    }

    const entries = Object.entries(customer.totalsByCurrency)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));

    if (entries.length === 0) return "-";

    return entries.map(([currency, amount]) => formatCurrencyDisplay(currency, amount)).join(" + ");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] border-b border-slate-100 dark:border-white/10">
            <th className="pb-4">Customer</th>
            <th className="pb-4 text-center">Orders</th>
            <th className="pb-4 text-right">Total Spent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {customers.map((customer, i) => (
            <tr key={i} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
              <td className="py-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-none">
                  {customer.displayName}
                </p>
                {!customer.customerEmail && customer.buyerWallet && (
                  <span className="inline-block mt-1 text-[9px] bg-slate-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">
                    Wallet Address
                  </span>
                )}
              </td>
              <td className="py-4 text-center">
                <span className="text-xs font-medium text-slate-500">{customer.totalOrders} txs</span>
              </td>
              <td className="py-4 text-right">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {renderTotalSpent(customer)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
