import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { IndianRupee, FileText, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { invoices, products } = useStore();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.date).toDateString() === today.toDateString()
  );

  const monthInvoices = invoices.filter(
    (inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
  );

  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalGst = monthInvoices.reduce(
    (sum, inv) => sum + inv.totalCgst + inv.totalSgst + inv.totalIgst + inv.totalCess,
    0
  );

  const pendingPayments = invoices
    .filter((inv) => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const lowStockProducts = products.filter((p) => p.stock < 10);

  const stats = [
    { name: "Today's Sales", value: `₹${todaySales.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Monthly Revenue', value: `₹${monthSales.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'GST Collected (Month)', value: `₹${totalGst.toLocaleString('en-IN')}`, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Pending Payments', value: `₹${pendingPayments.toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your business performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Invoices</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {invoices.slice(-5).reverse().map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{invoice.customerName}</p>
                  <p className="text-xs text-slate-500">{invoice.invoiceNumber} • {format(new Date(invoice.date), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{invoice.grandTotal.toLocaleString('en-IN')}</p>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                    invoice.status === 'Unpaid' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                    'bg-slate-50 text-slate-700 ring-slate-600/20'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-500">No invoices yet.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Low Stock Alerts</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">HSN/SAC: {product.hsnSac}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rose-600">{product.stock} left</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-500">All products are well stocked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
