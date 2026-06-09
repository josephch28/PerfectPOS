import { Request, Response } from 'express';
import { ListProductsUseCase, CreateProductUseCase, UpdateProductUseCase, DeleteProductUseCase } from '../../../application/use-cases/index';

export class ProductController {
  constructor(
    private listProducts: ListProductsUseCase,
    private createProduct: CreateProductUseCase,
    private updateProduct: UpdateProductUseCase,
    private deleteProduct: DeleteProductUseCase
  ) {}

  async getProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;
    const includeInactive = req.query.includeInactive === 'true';
    const result = await this.listProducts.execute(page, limit, search, searchField, !includeInactive);
    res.json(result);
  }

  async postProduct(req: Request, res: Response) {
    try {
      const product = await this.createProduct.execute(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async putProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const product = await this.updateProduct.execute(req.params.id as string, req.body, userId);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProductMethod(req: Request, res: Response) {
    try {
      await this.deleteProduct.execute(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
