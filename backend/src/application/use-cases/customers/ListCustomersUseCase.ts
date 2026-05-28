import { ICustomerRepository } from '../../../domain/repositories/index';

export class ListCustomersUseCase {
  constructor(private customerRepo: ICustomerRepository) {}
  async execute(page: number, limit: number, search?: string, searchField?: string) {
    return this.customerRepo.findAll(page, limit, search, searchField);
  }
}
