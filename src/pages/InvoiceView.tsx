import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Download, Share2 } from 'lucide-react';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, businessDetails } = useStore();
  
  const invoice = invoices.find(i => i.id === id);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice?.invoiceNumber}`,
  });

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-slate-900">Invoice not found</h2>
        <button onClick={() => navigate('/invoices')} className="mt-4 text-indigo-600 hover:text-indigo-500">
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice {invoice.invoiceNumber}</h1>
            <p className="mt-1 text-sm text-slate-500">Generated on {format(new Date(invoice.date), 'dd MMM yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePrint()}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Printer className="-ml-0.5 mr-2 h-5 w-5 text-slate-400" aria-hidden="true" />
            Print
          </button>
          <button
            onClick={() => handlePrint()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Download className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div ref={printRef} className="p-8 sm:p-12 bg-white text-slate-900">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 gap-8">
            <div className="flex-1">
              {businessDetails.logoUrl ? (
                <img src={businessDetails.logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
              ) : (
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{businessDetails.name}</h2>
              )}
              <p className="text-sm text-slate-600 whitespace-pre-line">{businessDetails.address}</p>
              <p className="text-sm text-slate-600 mt-1">GSTIN: <span className="font-semibold">{businessDetails.gstin}</span></p>
              <p className="text-sm text-slate-600">Phone: {businessDetails.phone}</p>
              <p className="text-sm text-slate-600">Email: {businessDetails.email}</p>
            </div>
            <div className="text-left sm:text-right flex-1">
              <h1 className="text-4xl font-bold text-slate-200 uppercase tracking-widest mb-4">Tax Invoice</h1>
              <p className="text-sm text-slate-600"><span className="font-semibold">Invoice No:</span> {invoice.invoiceNumber}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Date:</span> {format(new Date(invoice.date), 'dd MMM yyyy')}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Place of Supply:</span> {invoice.placeOfSupply}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Reverse Charge:</span> {invoice.reverseCharge ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="py-8 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Bill To:</h3>
            <p className="text-lg font-bold text-slate-900">{invoice.customerName}</p>
            <p className="text-sm text-slate-600 mt-1">GSTIN: <span className="font-semibold">{invoice.customerGstin || 'N/A'}</span></p>
            <p className="text-sm text-slate-600">State: {invoice.customerState}</p>
          </div>

          {/* Items Table */}
          <div className="py-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3 text-left text-xs font-semibold text-slate-900 uppercase">S.No</th>
                  <th scope="col" className="py-3 text-left text-xs font-semibold text-slate-900 uppercase">Description</th>
                  <th scope="col" className="py-3 text-left text-xs font-semibold text-slate-900 uppercase">HSN/SAC</th>
                  <th scope="col" className="py-3 text-right text-xs font-semibold text-slate-900 uppercase">Qty</th>
                  <th scope="col" className="py-3 text-right text-xs font-semibold text-slate-900 uppercase">Rate</th>
                  <th scope="col" className="py-3 text-right text-xs font-semibold text-slate-900 uppercase">Taxable Val</th>
                  <th scope="col" className="py-3 text-right text-xs font-semibold text-slate-900 uppercase">GST %</th>
                  <th scope="col" className="py-3 text-right text-xs font-semibold text-slate-900 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="py-4 text-sm text-slate-600">{item.hsnSac}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">{item.quantity}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">₹{item.taxableValue.toFixed(2)}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">{item.taxRate}%</td>
                    <td className="py-4 text-sm font-medium text-slate-900 text-right">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-8 border-t border-slate-200">
            <div className="w-full sm:w-1/2 mb-8 sm:mb-0 pr-8">
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Amount in Words:</h4>
                <p className="text-sm text-slate-600 italic">{invoice.amountInWords}</p>
              </div>
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Bank Details:</h4>
                <p className="text-sm text-slate-600 whitespace-pre-line">{businessDetails.bankDetails}</p>
                {businessDetails.upiId && (
                  <p className="text-sm text-slate-600 mt-1">UPI ID: <span className="font-medium">{businessDetails.upiId}</span></p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Terms & Conditions:</h4>
                <p className="text-xs text-slate-500 whitespace-pre-line">{businessDetails.footerText}</p>
              </div>
            </div>
            
            <div className="w-full sm:w-1/3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Taxable Value</span>
                <span className="font-medium text-slate-900">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              
              {invoice.totalIgst > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">IGST</span>
                  <span className="font-medium text-slate-900">₹{invoice.totalIgst.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">CGST</span>
                    <span className="font-medium text-slate-900">₹{invoice.totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">SGST</span>
                    <span className="font-medium text-slate-900">₹{invoice.totalSgst.toFixed(2)}</span>
                  </div>
                </>
              )}

              {invoice.totalCess > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">CESS</span>
                  <span className="font-medium text-slate-900">₹{invoice.totalCess.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <span className="text-xl font-bold text-slate-900">₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
              
              <div className="pt-16 text-center">
                <div className="border-b border-slate-300 w-48 mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Authorized Signatory</p>
                <p className="text-xs font-medium text-slate-900 mt-1">For {businessDetails.name}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
