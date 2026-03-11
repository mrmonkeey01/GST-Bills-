import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    const mapped = products.map(p => ({
      ...p,
      hsnSac: p.hsn_code || '',
      taxRate: p.gst_rate,
    }));
    res.json(mapped);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: String(error) });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, hsnSac, hsn_code, taxRate, gst_rate, price, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        hsn_code: hsnSac || hsn_code || '',
        gst_rate: taxRate !== undefined ? taxRate : gst_rate,
        price,
        stock: stock || 0,
      }
    });
    res.status(201).json({
      ...product,
      hsnSac: product.hsn_code || '',
      taxRate: product.gst_rate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (product) {
      res.json({
        ...product,
        hsnSac: product.hsn_code || '',
        taxRate: product.gst_rate,
      });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, hsnSac, hsn_code, taxRate, gst_rate, price, stock } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        hsn_code: hsnSac || hsn_code || '',
        gst_rate: taxRate !== undefined ? taxRate : gst_rate,
        price,
        stock: stock || 0,
      }
    });
    res.json({
      ...product,
      hsnSac: product.hsn_code || '',
      taxRate: product.gst_rate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
