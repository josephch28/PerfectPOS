import { ISaleRepository } from '../../../domain/repositories/index';

export class ListSalesUseCase {
  constructor(private saleRepo: ISaleRepository) {}
  async execute(page: number, limit: number, search?: string, searchField?: string, sellerId?: string) {
    return this.saleRepo.findAll(page, limit, search, searchField, sellerId);
  }
}
