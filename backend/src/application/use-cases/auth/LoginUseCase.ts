import { IUserRepository } from '../../../domain/repositories/index';
import { AuthService } from '../../../infrastructure/security/AuthService';

export class LoginUseCase {
  constructor(
    private userRepo: IUserRepository,
    private authService: AuthService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    if (user.isLocked) {
      throw new Error("Usuario bloqueado. Contacte al administrador.");
    }

    if (!user.isActive) {
      throw new Error("Usuario inactivo.");
    }

    const isValidPassword = await this.authService.comparePassword(password, user.password!);

    if (!isValidPassword) {
      await this.userRepo.incrementLoginAttempts(user.id);
      const updatedUser = await this.userRepo.findById(user.id);
      
      if (updatedUser && updatedUser.loginAttempts >= 3) {
        await this.userRepo.lockUser(user.id);
        throw new Error("Usuario bloqueado tras 3 intentos fallidos.");
      }

      throw new Error("Credenciales inválidas");
    }

    // Success
    await this.userRepo.resetLoginAttempts(user.id);
    
    const token = this.authService.generateToken({
      id: user.id,
      username: user.username,
      role: user.role?.name,
      name: `${user.name} ${user.lastName}`
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name
      }
    };
  }
}
