import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';

export class CreateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(customerData: Customer) {
    // Validate ID (Cédula) - 10 digits
    if (!/^\d{10}$/.test(customerData.id)) {
      throw new Error("La cédula/ID debe tener exactamente 10 dígitos numéricos.");
    }

    const existingCustomer = await this.customerRepo.findById(customerData.id);
    if (existingCustomer) {
      throw new Error("Ya existe un cliente con esta identificación.");
    }

    if (customerData.email) {
      const existingEmail = await this.customerRepo.findByEmail(customerData.email);
      if (existingEmail) {
        throw new Error("El correo electrónico ya está registrado.");
      }
    }

    return this.customerRepo.create(customerData);
  }
}
