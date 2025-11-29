import { Request, Response, NextFunction } from 'express';
import { createCustomer, listCustomers } from '../services/customerService';

export const createCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

export const listCustomersHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await listCustomers();
    res.json(customers);
  } catch (err) {
    next(err);
  }
};
