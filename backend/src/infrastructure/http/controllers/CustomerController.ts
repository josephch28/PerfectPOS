import { Request, Response } from 'express';
import { ListCustomersUseCase, CreateCustomerUseCase, UpdateCustomerUseCase, DeleteCustomerUseCase } from '../../../application/use-cases/index';

export class CustomerController {
  constructor(
    private listCustomers: ListCustomersUseCase,
    private createCustomer: CreateCustomerUseCase,
    private updateCustomer: UpdateCustomerUseCase,
    private deleteCustomer: DeleteCustomerUseCase
  ) {}

  async getCustomers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;
    const result = await this.listCustomers.execute(page, limit, search, searchField);
    res.json(result);
  }

  async postCustomer(req: Request, res: Response) {
    try {
      const customer = await this.createCustomer.execute(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async putCustomer(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const customer = await this.updateCustomer.execute(req.params.id as string, req.body, userId);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteCustomerMethod(req: Request, res: Response) {
    try {
      await this.deleteCustomer.execute(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
