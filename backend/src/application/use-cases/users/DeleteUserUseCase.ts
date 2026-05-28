import { IUserRepository } from '../../../domain/repositories/index';

export class DeleteUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string) {
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new Error("Usuario no encontrado.");
    }

    return this.userRepo.delete(id);
  }
}
