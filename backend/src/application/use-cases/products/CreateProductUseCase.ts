import { IProductRepository } from '../../../domain/repositories/index';
import { Product } from '../../../domain/entities/index';

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(productData: Product, userId: string) {
    if (productData.price <= 0) {
      throw new Error("El precio del producto debe ser mayor a 0.");
    }
    if (productData.stock <= 0) {
      throw new Error("El stock inicial debe ser mayor a 0.");
    }

    const existingProductByCode = await this.productRepo.findByCode(productData.code);
    if (existingProductByCode) {
      throw new Error("Ya existe un producto con este código. Por favor asigne otro código.");
    }

    const existingProductByName = await this.productRepo.findByName(productData.name);
    if (existingProductByName) {
      throw new Error(JSON.stringify({ 
        type: 'DUPLICATE_PRODUCT_NAME', 
        existingProduct: { 
          id: existingProductByName.id, 
          name: existingProductByName.name, 
          stock: existingProductByName.stock 
        } 
      }));
    }

    return this.productRepo.create(productData, userId);
  }
}
