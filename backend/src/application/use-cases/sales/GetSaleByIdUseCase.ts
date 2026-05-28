import { ISaleRepository } from '../../../domain/repositories/index';

export class GetSaleByIdUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(id: number) {
    return this.saleRepo.findById(id);
  }
}
