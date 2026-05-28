import { IProductRepository } from '../../../domain/repositories/index';

export class DeleteProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string) {
    const existingProduct = await this.productRepo.findById(id);
    if (!existingProduct) {
      throw new Error("Producto no encontrado.");
    }

    const hasSales = await this.productRepo.hasSales(id);
    if (hasSales) {
      // Logic for soft delete or deactivation is expected to be handled by repo.delete(id)
      return this.productRepo.delete(id);
    } else {
      return this.productRepo.delete(id);
    }
  }
}
