import { IUserRepository, IRoleRepository } from '../../../domain/repositories/index';
import { User } from '../../../domain/entities/index';
import { AuthService } from '../../../infrastructure/security/AuthService';

export class CreateUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private roleRepo: IRoleRepository,
    private authService: AuthService
  ) {}

  async execute(userData: User) {
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    if (!passwordRegex.test(userData.password!)) {
      throw new Error("La clave debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
    }

    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) throw new Error("Email ya registrado.");

    const hashedPassword = await this.authService.hashPassword(userData.password!);
    
    return this.userRepo.create({
      ...userData,
      password: hashedPassword
    });
  }
}
