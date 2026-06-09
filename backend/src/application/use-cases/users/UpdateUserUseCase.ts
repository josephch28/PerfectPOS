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
      throw new Error("Los nombres no pueden contener espacios");
    }
    if (userData.firstLastName && spaceRegex.test(userData.firstLastName)) {
      throw new Error("Los nombres no pueden contener espacios");
    }
    if (userData.middleName && spaceRegex.test(userData.middleName)) {
      throw new Error("Los nombres no pueden contener espacios");
    }
    if (userData.secondLastName && spaceRegex.test(userData.secondLastName)) {
      throw new Error("Los nombres no pueden contener espacios");
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
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,10}$/;
      if (!passwordRegex.test(userData.password)) {
        throw new Error("La contraseña debe tener entre 8 y 10 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.");
      }
      updateData.password = await this.authService.hashPassword(userData.password);
    } else {
      delete updateData.password;
    }

    if (userData.isLocked === false) {
      updateData.loginAttempts = 0;
    }

    return this.userRepo.update(id, updateData);
  }
}
