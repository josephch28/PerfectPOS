import { IProductRepository } from '../../../domain/repositories/index';

export class ListProductsUseCase {
  constructor(private productRepo: IProductRepository) {}
  async execute(page: number, limit: number, search?: string, searchField?: string, onlyActive = true) {
    return this.productRepo.findAll(page, limit, search, searchField, !onlyActive);
  }
}
