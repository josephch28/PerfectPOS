import { IUserRepository } from '../../../domain/repositories/index';
import { User } from '../../../domain/entities/index';
import { AuthService } from '../../../infrastructure/security/AuthService';
import { Validators } from '../../../domain/utils/Validators';

export class UpdateUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private authService: AuthService
  ) {}

  async execute(id: string, userData: Partial<User>) {
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new Error("Usuario no encontrado.");
    }

    if (userData.cedula && !Validators.isValidCedula(userData.cedula)) {
      throw new Error("La cédula/ID debe tener exactamente 10 dígitos numéricos.");
    }
    if (userData.name && !Validators.isValidName(userData.name)) {
      throw new Error("El nombre debe contener únicamente letras.");
    }
    if (userData.lastName && !Validators.isValidName(userData.lastName)) {
      throw new Error("El apellido debe contener únicamente letras.");
    }

    if (userData.email && userData.email !== existingUser.email) {
      if (!Validators.isValidEmail(userData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
      const emailExists = await this.userRepo.findByEmail(userData.email);
      if (emailExists) {
        throw new Error("El correo electrónico ya está registrado por otro usuario.");
      }
    }

    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await this.userRepo.findByUsername(userData.username);
      if (usernameExists) {
        throw new Error("El nombre de usuario ya está en uso por otro usuario.");
      }
    }

    if (userData.password) {
      if (!Validators.isValidPassword(userData.password)) {
        throw new Error("La clave debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      }
      userData.password = await this.authService.hashPassword(userData.password);
    }

    return this.userRepo.update(id, userData);
  }
}
