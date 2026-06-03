import { IProductRepository } from '../../../domain/repositories/index';
import { Product } from '../../../domain/entities/index';

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(productData: Product) {
    if (productData.price <= 0) {
      throw new Error("El precio del producto debe ser mayor a 0.");
    }
    if (productData.stock < 0) {
      throw new Error("El stock inicial no puede ser negativo.");
    }

    const existingProduct = await this.productRepo.findByCode(productData.code);
    if (existingProduct) {
      throw new Error("Ya existe un producto con este código. Por favor asigne otro código.");
    }

    return this.productRepo.create(productData);
  }
}
