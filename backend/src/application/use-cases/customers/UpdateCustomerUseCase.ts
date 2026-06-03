import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';
import { Validators } from '../../../domain/utils/Validators';

export class UpdateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string, customerData: Partial<Customer>) {
    const existingCustomer = await this.customerRepo.findById(id);
    if (!existingCustomer) {
      throw new Error("Cliente no encontrado.");
    }

    if (customerData.name && !Validators.isValidName(customerData.name)) {
      throw new Error("El nombre debe contener únicamente letras.");
    }
    if (customerData.lastName && !Validators.isValidName(customerData.lastName)) {
      throw new Error("El apellido debe contener únicamente letras.");
    }
    if (customerData.phone && !Validators.isValidPhone(customerData.phone)) {
      throw new Error("El teléfono debe tener exactamente 10 dígitos numéricos.");
    }

    if (customerData.email && customerData.email !== existingCustomer.email) {
      if (!Validators.isValidEmail(customerData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
      const emailExists = await this.customerRepo.findByEmail(customerData.email);
      if (emailExists) {
        throw new Error("El correo electrónico ya está registrado por otro cliente.");
      }
    }

    return this.customerRepo.update(id, customerData);
  }
}
