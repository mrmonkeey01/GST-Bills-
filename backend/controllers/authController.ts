import { Request, Response } from 'express';
import prisma from '../prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, business_name, gstin } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a real app, hash this
        business_name,
        gstin
      }
    });
    res.status(201).json({ message: 'Registration successful', data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      res.json({ message: 'Login successful', token: 'dummy-token', user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    res.json({ message: 'User profile', data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
