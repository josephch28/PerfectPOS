import { IUserRepository, IRoleRepository } from '../../../domain/repositories/index';
import { User } from '../../../domain/entities/index';
import { AuthService } from '../../../infrastructure/security/AuthService';
import { Validators } from '../../../domain/utils/Validators';

export class CreateUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private roleRepo: IRoleRepository,
    private authService: AuthService
  ) {}

  async execute(userData: User) {
    if (!Validators.isValidCedula(userData.cedula)) {
      throw new Error("La cédula/ID debe tener exactamente 10 dígitos numéricos.");
    }
    if (!Validators.isValidName(userData.name) || !Validators.isValidName(userData.lastName)) {
      throw new Error("El nombre y apellido deben contener únicamente letras.");
    }
    if (!Validators.isValidEmail(userData.email)) {
      throw new Error("El formato del correo electrónico no es válido.");
    }

    // Validate password
    if (!Validators.isValidPassword(userData.password!)) {
      throw new Error("La clave debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
    }

    const existingEmail = await this.userRepo.findByEmail(userData.email);
    if (existingEmail) throw new Error("Este correo electrónico ya se encuentra registrado.");

    const existingUsername = await this.userRepo.findByUsername(userData.username);
    if (existingUsername) throw new Error("El nombre de usuario ya está en uso. Por favor elija otro.");

    const hashedPassword = await this.authService.hashPassword(userData.password!);
    
    return this.userRepo.create({
      ...userData,
      password: hashedPassword
    });
  }
}
