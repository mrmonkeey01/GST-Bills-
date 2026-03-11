export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  hsn: string;
  taxRate: number;
}

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  productId: number;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  customerId: number;
  date: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: string;
  items?: InvoiceItem[];
}
