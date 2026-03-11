import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  hsnSac: string;
  price: number;
  taxRate: number; // 0, 5, 12, 18, 28
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  phone: string;
  email: string;
  state: string; // Used for IGST vs CGST/SGST calculation
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerState: string;
  placeOfSupply: string;
  reverseCharge: boolean;
  items: InvoiceItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  grandTotal: number;
  amountInWords: string;
  status: 'Draft' | 'Paid' | 'Unpaid';
}

export interface BusinessDetails {
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  bankDetails: string;
  upiId: string;
  logoUrl: string;
  footerText: string;
}

interface AppState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  businessDetails: BusinessDetails;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  updateBusinessDetails: (details: Partial<BusinessDetails>) => void;
}

const defaultBusinessDetails: BusinessDetails = {
  name: 'My Business',
  gstin: '27AAAAA0000A1Z5',
  address: '123 Business Street, City, State, 123456',
  phone: '+91 9876543210',
  email: 'contact@mybusiness.com',
  state: 'Maharashtra',
  bankDetails: 'Bank: HDFC, A/C: 1234567890, IFSC: HDFC0001234',
  upiId: 'mybusiness@upi',
  logoUrl: '',
  footerText: 'Thank you for your business!',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      products: [
        { id: '1', name: 'Premium Widget', hsnSac: '8471', price: 1000, taxRate: 18, stock: 50 },
        { id: '2', name: 'Consulting Services', hsnSac: '9983', price: 5000, taxRate: 18, stock: 999 },
      ],
      customers: [
        { id: '1', name: 'Acme Corp', gstin: '27BBBBB0000B1Z5', billingAddress: '456 Corporate Ave, Mumbai', shippingAddress: '456 Corporate Ave, Mumbai', phone: '9876543211', email: 'billing@acme.com', state: 'Maharashtra' },
        { id: '2', name: 'Global Tech', gstin: '29CCCCC0000C1Z5', billingAddress: '789 Tech Park, Bangalore', shippingAddress: '789 Tech Park, Bangalore', phone: '9876543212', email: 'accounts@globaltech.com', state: 'Karnataka' },
      ],
      invoices: [],
      businessDetails: defaultBusinessDetails,
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
      })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? { ...c, ...customer } : c)),
      })),
      deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoiceStatus: (id, status) => set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
      })),
      updateBusinessDetails: (details) => set((state) => ({
        businessDetails: { ...state.businessDetails, ...details },
      })),
    }),
    {
      name: 'gst-bills-storage',
    }
  )
);
