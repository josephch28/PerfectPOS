import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';
import { Validators } from '../../../domain/utils/Validators';

export class UpdateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string, customerData: Partial<Customer>, adminId?: string) {
    const spaceRegex = /\s/;
    
    if (customerData.firstName && spaceRegex.test(customerData.firstName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (customerData.firstLastName && spaceRegex.test(customerData.firstLastName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (customerData.middleName && spaceRegex.test(customerData.middleName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (customerData.secondLastName && spaceRegex.test(customerData.secondLastName)) {
      throw new Error("Names cannot contain spaces");
    }

    if (customerData.phone && !Validators.isValidPhone(customerData.phone)) {
      throw new Error("El teléfono debe tener exactamente 10 dígitos numéricos.");
    }

    if (customerData.email) {
      if (!Validators.isValidEmail(customerData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
      const existingEmail = await this.customerRepo.findByEmail(customerData.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("El correo electrónico ya está registrado por otro cliente.");
      }
    }

    if (adminId) {
      customerData.lastUpdatedById = adminId;
    }

    return this.customerRepo.update(id, customerData);
  }
}
