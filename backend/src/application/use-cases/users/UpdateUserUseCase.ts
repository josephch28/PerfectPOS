import { IUserRepository } from '../../../domain/repositories/index';
import { User } from '../../../domain/entities/index';
import { AuthService } from '../../../infrastructure/security/AuthService';
import { Validators } from '../../../domain/utils/Validators';

export class UpdateUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private authService: AuthService
  ) {}

  async execute(id: string, userData: Partial<User>, adminId?: string) {
    if (userData.cedula && !Validators.isValidCedula(userData.cedula)) {
      throw new Error("La cédula/RUC debe tener exactamente 10 dígitos numéricos.");
    }

    const spaceRegex = /\s/;
    if (userData.firstName && spaceRegex.test(userData.firstName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (userData.firstLastName && spaceRegex.test(userData.firstLastName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (userData.middleName && spaceRegex.test(userData.middleName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (userData.secondLastName && spaceRegex.test(userData.secondLastName)) {
      throw new Error("Names cannot contain spaces");
    }

    if (userData.email) {
      if (!Validators.isValidEmail(userData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
      const existingEmail = await this.userRepo.findByEmail(userData.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("El correo electrónico ya está registrado por otro usuario.");
      }
    }

    if (userData.username) {
      const existingUsername = await this.userRepo.findByUsername(userData.username);
      if (existingUsername && existingUsername.id !== id) {
        throw new Error("El nombre de usuario ya está en uso.");
      }
    }

    let updateData = { ...userData };

    if (userData.password) {
      if (userData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }
      updateData.password = await this.authService.hashPassword(userData.password);
    } else {
      delete updateData.password;
    }

    return this.userRepo.update(id, updateData);
  }
}
