import { ICustomerRepository } from '../../../domain/repositories/index';

export class DeleteCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string) {
    const existingCustomer = await this.customerRepo.findById(id);
    if (!existingCustomer) {
      throw new Error("Cliente no encontrado.");
    }

    const hasSales = await this.customerRepo.hasSales(id);
    if (hasSales) {
      // If it has sales, we should probably do a soft delete or just deactivate.
      // The repository 'delete' method is expected to handle this logic as per requirements.
      return this.customerRepo.delete(id);
    } else {
      return this.customerRepo.delete(id);
    }
  }
}
