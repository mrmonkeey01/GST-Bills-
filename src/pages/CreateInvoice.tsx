import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, InvoiceItem, Customer, Product } from '../store/useStore';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toWords } from 'number-to-words';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { customers, products, businessDetails, addInvoice, invoices } = useStore();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: Date.now().toString(), productId: '', quantity: 1, discount: 0 }
  ]);
  const [reverseCharge, setReverseCharge] = useState(false);

  // Generate sequential invoice number
  const nextInvoiceNumber = useMemo(() => {
    const count = invoices.length + 1;
    return `INV-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
  }, [invoices]);

  const customer = customers.find(c => c.id === selectedCustomer);
  const isInterState = customer?.state.toLowerCase() !== businessDetails.state.toLowerCase();

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productId = product.id;
        item.name = product.name;
        item.hsnSac = product.hsnSac;
        item.unitPrice = product.price;
        item.taxRate = product.taxRate;
      } else {
        item.productId = '';
        item.name = '';
        item.hsnSac = '';
        item.unitPrice = 0;
        item.taxRate = 0;
      }
    } else {
      (item as any)[field] = value;
    }

    // Recalculate item totals
    if (item.productId && item.quantity && item.unitPrice !== undefined) {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const baseValue = qty * price;
      const discountValue = (baseValue * disc) / 100;
      const taxableValue = baseValue - discountValue;
      
      item.taxableValue = taxableValue;
      
      if (isInterState) {
        item.igst = (taxableValue * taxRate) / 100;
        item.cgst = 0;
        item.sgst = 0;
      } else {
        item.igst = 0;
        item.cgst = (taxableValue * (taxRate / 2)) / 100;
        item.sgst = (taxableValue * (taxRate / 2)) / 100;
      }
      
      item.cess = 0; // Optional cess logic can be added here
      item.total = taxableValue + (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0) + (item.cess || 0);
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', quantity: 1, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalCess = 0;

    items.forEach(item => {
      subtotal += item.taxableValue || 0;
      totalCgst += item.cgst || 0;
      totalSgst += item.sgst || 0;
      totalIgst += item.igst || 0;
      totalCess += item.cess || 0;
    });

    const grandTotal = subtotal + totalCgst + totalSgst + totalIgst + totalCess;
    
    // Capitalize first letter of words
    const words = toWords(Math.round(grandTotal)).replace(/\b\w/g, l => l.toUpperCase()) + ' Rupees Only';

    return { subtotal, totalCgst, totalSgst, totalIgst, totalCess, grandTotal, amountInWords: words };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (!selectedCustomer) {
      alert('Please select a client');
      return;
    }
    
    const validItems = items.filter(i => i.productId && i.quantity && i.unitPrice) as InvoiceItem[];
    if (validItems.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: nextInvoiceNumber,
      date: invoiceDate,
      customerId: customer!.id,
      customerName: customer!.name,
      customerGstin: customer!.gstin,
      customerState: customer!.state,
      placeOfSupply: customer!.state,
      reverseCharge,
      items: validItems,
      ...totals,
      status: 'Unpaid' as const,
    };

    addInvoice(newInvoice);
    navigate(`/invoices/${newInvoice.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Invoice</h1>
            <p className="mt-1 text-sm text-slate-500">Generate a new GST compliant invoice.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <Save className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
          Save Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer & Invoice Details */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Client</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a client...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>
                  ))}
                </select>
                {customer && (
                  <div className="mt-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p>{customer.billingAddress}</p>
                    <p>GSTIN: <span className="font-mono">{customer.gstin || 'N/A'}</span></p>
                    <p>State: {customer.state}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Invoice Number</label>
                  <input
                    type="text"
                    disabled
                    value={nextInvoiceNumber}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Products / Services</h3>
              <button
                onClick={addItem}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-x-auto">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex-1 w-full min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="block w-full rounded-xl border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      className="block w-full rounded-xl border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      className="block w-full rounded-xl border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Disc (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount || 0}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                      className="block w-full rounded-xl border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tax (%)</label>
                    <input
                      type="number"
                      disabled
                      value={item.taxRate || 0}
                      className="block w-full rounded-xl border-0 py-2 bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Total (₹)</label>
                    <input
                      type="text"
                      disabled
                      value={item.total?.toFixed(2) || '0.00'}
                      className="block w-full rounded-xl border-0 py-2 bg-slate-50 text-slate-900 font-medium ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-8">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden sticky top-8">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Invoice Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taxable Amount</span>
                <span className="font-medium text-slate-900">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              
              {isInterState ? (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IGST</span>
                  <span className="font-medium text-slate-900">₹{totals.totalIgst.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">CGST</span>
                    <span className="font-medium text-slate-900">₹{totals.totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">SGST</span>
                    <span className="font-medium text-slate-900">₹{totals.totalSgst.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              {totals.totalCess > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">CESS</span>
                  <span className="font-medium text-slate-900">₹{totals.totalCess.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500 font-medium">Total GST Amount</span>
                <span className="font-medium text-slate-900">₹{(totals.totalCgst + totals.totalSgst + totals.totalIgst).toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{totals.grandTotal.toFixed(2)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 text-right italic">{totals.amountInWords}</p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reverseCharge}
                    onChange={(e) => setReverseCharge(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Reverse Charge Applicable</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
