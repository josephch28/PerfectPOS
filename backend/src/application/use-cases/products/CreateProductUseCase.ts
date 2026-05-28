import { IProductRepository } from '../../../domain/repositories/index';
import { Product } from '../../../domain/entities/index';

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(productData: Product) {
    const existingProduct = await this.productRepo.findByCode(productData.code);
    if (existingProduct) {
      throw new Error("Ya existe un producto con este código.");
    }

    return this.productRepo.create(productData);
  }
}
