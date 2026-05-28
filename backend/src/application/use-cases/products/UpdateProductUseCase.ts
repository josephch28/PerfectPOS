import { IProductRepository } from '../../../domain/repositories/index';
import { Product } from '../../../domain/entities/index';

export class UpdateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string, productData: Partial<Product>) {
    const existingProduct = await this.productRepo.findById(id);
    if (!existingProduct) {
      throw new Error("Producto no encontrado.");
    }

    if (productData.code && productData.code !== existingProduct.code) {
      const codeExists = await this.productRepo.findByCode(productData.code);
      if (codeExists) {
        throw new Error("El código ya está en uso por otro producto.");
      }
    }

    return this.productRepo.update(id, productData);
  }
}
