import { IUserRepository } from '../../../domain/repositories/index';
import { User } from '../../../domain/entities/index';
import { AuthService } from '../../../infrastructure/security/AuthService';

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

    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepo.findByEmail(userData.email);
      if (emailExists) {
        throw new Error("El email ya está registrado por otro usuario.");
      }
    }

    if (userData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
      if (!passwordRegex.test(userData.password)) {
        throw new Error("La clave debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      }
      userData.password = await this.authService.hashPassword(userData.password);
    }

    return this.userRepo.update(id, userData);
  }
}
