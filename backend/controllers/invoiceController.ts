import { Request, Response } from 'express';
import prisma from '../prisma';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true }
    });
    const mapped = invoices.map(inv => {
      const metadata = inv.metadata ? JSON.parse(inv.metadata) : {};
      return {
        ...inv,
        invoiceNumber: inv.invoice_number,
        date: inv.invoice_date.toISOString(),
        customerId: inv.customer_id,
        ...metadata,
        items: inv.items.map((item: any) => {
          const itemMeta = item.metadata ? JSON.parse(item.metadata) : {};
          return {
            ...item,
            productId: item.product_id,
            taxRate: item.gst_rate,
            unitPrice: item.price,
            ...itemMeta
          };
        })
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Extract main fields
    const { 
      invoiceNumber, date, customerId, subtotal, grandTotal, items, status,
      ...metadata 
    } = data;

    const gst_total = (data.totalCgst || 0) + (data.totalSgst || 0) + (data.totalIgst || 0) + (data.totalCess || 0);

    const invoice = await prisma.invoice.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        invoice_date: new Date(date),
        subtotal,
        gst_total,
        grand_total: grandTotal,
        status: status || 'Draft',
        metadata: JSON.stringify(metadata),
        items: {
          create: items.map((item: any) => {
            const { productId, quantity, unitPrice, taxRate, total, ...itemMeta } = item;
            return {
              product_id: productId,
              quantity,
              price: unitPrice,
              gst_rate: taxRate,
              total,
              metadata: JSON.stringify(itemMeta)
            };
          })
        }
      },
      include: { items: true }
    });

    res.status(201).json({ id: invoice.id, ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const inv = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (inv) {
      const metadata = inv.metadata ? JSON.parse(inv.metadata) : {};
      res.json({
        ...inv,
        invoiceNumber: inv.invoice_number,
        date: inv.invoice_date.toISOString(),
        customerId: inv.customer_id,
        ...metadata,
        items: inv.items.map((item: any) => {
          const itemMeta = item.metadata ? JSON.parse(item.metadata) : {};
          return {
            ...item,
            productId: item.product_id,
            taxRate: item.gst_rate,
            unitPrice: item.price,
            ...itemMeta
          };
        })
      });
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // If only updating status
    if (data.status && Object.keys(data).length === 1) {
      const invoice = await prisma.invoice.update({
        where: { id: req.params.id },
        data: { status: data.status }
      });
      res.json(invoice);
      return;
    }

    const { 
      invoiceNumber, date, customerId, subtotal, grandTotal, items, status,
      ...metadata 
    } = data;

    const gst_total = (data.totalCgst || 0) + (data.totalSgst || 0) + (data.totalIgst || 0) + (data.totalCess || 0);

    // Delete existing items and recreate
    await prisma.invoiceItem.deleteMany({
      where: { invoice_id: req.params.id }
    });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        invoice_date: new Date(date),
        subtotal,
        gst_total,
        grand_total: grandTotal,
        status: status || 'Draft',
        metadata: JSON.stringify(metadata),
        items: {
          create: items.map((item: any) => {
            const { productId, quantity, unitPrice, taxRate, total, ...itemMeta } = item;
            return {
              product_id: productId,
              quantity,
              price: unitPrice,
              gst_rate: taxRate,
              total,
              metadata: JSON.stringify(itemMeta)
            };
          })
        }
      },
      include: { items: true }
    });

    res.json({ id: req.params.id, ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
