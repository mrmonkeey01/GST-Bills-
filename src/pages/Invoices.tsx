import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Plus, Search, FileText, Download, Printer } from 'lucide-react';

export default function Invoices() {
  const { invoices, updateInvoiceStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((inv) =>
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    const headers = [
      'Invoice Number',
      'Date',
      'Client Name',
      'Client GSTIN',
      'State',
      'Subtotal',
      'CGST',
      'SGST',
      'IGST',
      'CESS',
      'Grand Total',
      'Status'
    ];

    const csvData = invoices.map(inv => [
      inv.invoiceNumber,
      format(new Date(inv.date), 'yyyy-MM-dd'),
      `"${inv.customerName}"`,
      inv.customerGstin || '',
      inv.customerState,
      inv.subtotal.toFixed(2),
      inv.totalCgst.toFixed(2),
      inv.totalSgst.toFixed(2),
      inv.totalIgst.toFixed(2),
      inv.totalCess.toFixed(2),
      inv.grandTotal.toFixed(2),
      inv.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your generated invoices and track payments.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Download className="-ml-0.5 mr-2 h-5 w-5 text-slate-400" aria-hidden="true" />
            Export
          </button>
          <Link
            to="/invoices/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Invoice No.</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                    <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{format(new Date(invoice.date), 'dd MMM yyyy')}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">{invoice.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium">₹{invoice.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      value={invoice.status}
                      onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as any)}
                      className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 ${
                        invoice.status === 'Paid' ? 'text-emerald-700 ring-emerald-600/20 bg-emerald-50 focus:ring-emerald-600' : 
                        invoice.status === 'Unpaid' ? 'text-rose-700 ring-rose-600/20 bg-rose-50 focus:ring-rose-600' : 
                        'text-slate-700 ring-slate-600/20 bg-slate-50 focus:ring-slate-600'
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/invoices/${invoice.id}`} className="text-slate-400 hover:text-indigo-600 transition-colors" title="View">
                        <FileText className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
