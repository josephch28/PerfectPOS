import { ICustomerRepository } from '../../../domain/repositories/index';
import { Customer } from '../../../domain/entities/index';
import { Validators } from '../../../domain/utils/Validators';

export class CreateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(customerData: Customer, adminId?: string) {
    if (!customerData.id) {
      throw new Error("El número de documento (Cédula/RUC) es obligatorio.");
    }

    if (!Validators.isValidCedula(customerData.id)) {
      throw new Error("La cédula/RUC debe tener 10 o 13 dígitos numéricos válidos.");
    }
    
    // Basic validations
    if (!customerData.firstName || !customerData.firstLastName) {
      throw new Error("El primer nombre y el primer apellido son obligatorios");
    }

    const spaceRegex = /\s/;
    if (spaceRegex.test(customerData.firstName) || spaceRegex.test(customerData.firstLastName)) {
      throw new Error("Los nombres no pueden contener espacios");
    }
    if (customerData.middleName && spaceRegex.test(customerData.middleName)) {
      throw new Error("Los nombres no pueden contener espacios");
    }
    if (customerData.secondLastName && spaceRegex.test(customerData.secondLastName)) {
      throw new Error("Los nombres no pueden contener espacios");
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

    if (adminId) {
      customerData.lastUpdatedById = adminId;
    }

    return this.customerRepo.create({
      ...customerData,
      isActive: true
    });
  }
}
