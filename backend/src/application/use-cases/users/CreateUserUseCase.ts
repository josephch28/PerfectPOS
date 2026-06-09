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
    if (userData.cedula && !Validators.isValidCedula(userData.cedula)) {
      throw new Error("La cédula/RUC debe tener exactamente 10 dígitos numéricos.");
    }

    if (!userData.firstName || !userData.firstLastName) {
      throw new Error("firstName and firstLastName are required");
    }

    const spaceRegex = /\s/;
    if (spaceRegex.test(userData.firstName) || spaceRegex.test(userData.firstLastName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (userData.middleName && spaceRegex.test(userData.middleName)) {
      throw new Error("Names cannot contain spaces");
    }
    if (userData.secondLastName && spaceRegex.test(userData.secondLastName)) {
      throw new Error("Names cannot contain spaces");
    }

    if (!Validators.isValidEmail(userData.email)) {
      throw new Error("El formato del correo electrónico no es válido.");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,10}$/;
    if (!userData.password || !passwordRegex.test(userData.password)) {
      throw new Error("La contraseña debe tener entre 8 y 10 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.");
    }

    const existingUsername = await this.userRepo.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error("El nombre de usuario ya está en uso.");
    }

    const existingEmail = await this.userRepo.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("El correo electrónico ya está registrado.");
    }

    const role = await this.roleRepo.findById(userData.roleId);
    if (!role) {
      throw new Error("El rol seleccionado no existe.");
    }

    const hashedPassword = await this.authService.hashPassword(userData.password);

    return this.userRepo.create({
      ...userData,
      password: hashedPassword,
      loginAttempts: 0,
      isLocked: false,
      isActive: true
    });
  }
}
