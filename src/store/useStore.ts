import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

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
  fetchData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
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
    (set, get) => ({
      products: [],
      customers: [],
      invoices: [],
      businessDetails: defaultBusinessDetails,
      fetchData: async () => {
        try {
          const [productsRes, customersRes, invoicesRes] = await Promise.all([
            api.get('/products'),
            api.get('/customers'),
            api.get('/invoices'),
          ]);
          set({
            products: productsRes.data,
            customers: customersRes.data,
            invoices: invoicesRes.data,
          });
        } catch (error) {
          console.error('Failed to fetch data', error);
        }
      },
      addProduct: async (product) => {
        try {
          const res = await api.post('/products', product);
          set((state) => ({ products: [...state.products, res.data] }));
        } catch (error) {
          console.error('Failed to add product', error);
        }
      },
      updateProduct: async (id, product) => {
        try {
          const res = await api.put(`/products/${id}`, product);
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, ...res.data } : p)),
          }));
        } catch (error) {
          console.error('Failed to update product', error);
        }
      },
      deleteProduct: async (id) => {
        try {
          await api.delete(`/products/${id}`);
          set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
        } catch (error) {
          console.error('Failed to delete product', error);
        }
      },
      addCustomer: async (customer) => {
        try {
          const res = await api.post('/customers', customer);
          set((state) => ({ customers: [...state.customers, res.data] }));
        } catch (error) {
          console.error('Failed to add customer', error);
        }
      },
      updateCustomer: async (id, customer) => {
        try {
          const res = await api.put(`/customers/${id}`, customer);
          set((state) => ({
            customers: state.customers.map((c) => (c.id === id ? { ...c, ...res.data } : c)),
          }));
        } catch (error) {
          console.error('Failed to update customer', error);
        }
      },
      deleteCustomer: async (id) => {
        try {
          await api.delete(`/customers/${id}`);
          set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
        } catch (error) {
          console.error('Failed to delete customer', error);
        }
      },
      addInvoice: async (invoice) => {
        try {
          const res = await api.post('/invoices', invoice);
          set((state) => ({ invoices: [...state.invoices, res.data] }));
        } catch (error) {
          console.error('Failed to add invoice', error);
        }
      },
      updateInvoiceStatus: async (id, status) => {
        try {
          await api.put(`/invoices/${id}`, { status });
          set((state) => ({
            invoices: state.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
          }));
        } catch (error) {
          console.error('Failed to update invoice status', error);
        }
      },
      updateBusinessDetails: (details) => set((state) => ({
        businessDetails: { ...state.businessDetails, ...details },
      })),
    }),
    {
      name: 'gst-bills-storage',
      partialize: (state) => ({ businessDetails: state.businessDetails }),
    }
  )
);
