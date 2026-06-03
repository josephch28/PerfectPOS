import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';
import { Validators } from '../../../domain/utils/Validators';

export class CreateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(customerData: Customer) {
    // Validate ID (Cédula)
    if (!Validators.isValidCedula(customerData.id)) {
      throw new Error("La cédula/RUC debe tener exactamente 10 dígitos numéricos.");
    }
    if (!Validators.isValidName(customerData.name) || !Validators.isValidName(customerData.lastName)) {
      throw new Error("El nombre y apellido deben contener únicamente letras.");
    }
    if (customerData.phone && !Validators.isValidPhone(customerData.phone)) {
      throw new Error("El teléfono debe tener exactamente 10 dígitos numéricos.");
    }

    const existingCustomer = await this.customerRepo.findById(customerData.id);
    if (existingCustomer) {
      throw new Error("Ya existe un cliente con esta identificación.");
    }

    if (customerData.email) {
      if (!Validators.isValidEmail(customerData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
      const existingEmail = await this.customerRepo.findByEmail(customerData.email);
      if (existingEmail) {
        throw new Error("El correo electrónico ya está registrado por otro cliente.");
      }
    }

    return this.customerRepo.create(customerData);
  }
}
