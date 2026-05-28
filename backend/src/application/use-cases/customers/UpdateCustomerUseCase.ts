import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';

export class UpdateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string, customerData: Partial<Customer>) {
    const existingCustomer = await this.customerRepo.findById(id);
    if (!existingCustomer) {
      throw new Error("Cliente no encontrado.");
    }

    if (customerData.email && customerData.email !== existingCustomer.email) {
      const emailExists = await this.customerRepo.findByEmail(customerData.email);
      if (emailExists) {
        throw new Error("El correo electrónico ya está registrado por otro cliente.");
      }
    }

    return this.customerRepo.update(id, customerData);
  }
}
