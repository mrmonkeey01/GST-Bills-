import { Request, Response } from 'express';
import prisma from '../prisma';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany();
    const mapped = customers.map(c => ({
      ...c,
      billingAddress: c.address || '',
      shippingAddress: c.address || '',
      state: ''
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, gstin, phone, email, billingAddress, address } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        gstin,
        phone,
        email,
        address: billingAddress || address || '',
      }
    });
    res.status(201).json({
      ...customer,
      billingAddress: customer.address || '',
      shippingAddress: customer.address || '',
      state: ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (customer) {
      res.json({
        ...customer,
        billingAddress: customer.address || '',
        shippingAddress: customer.address || '',
        state: ''
      });
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, gstin, phone, email, billingAddress, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        gstin,
        phone,
        email,
        address: billingAddress || address || '',
      }
    });
    res.json({
      ...customer,
      billingAddress: customer.address || '',
      shippingAddress: customer.address || '',
      state: ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
