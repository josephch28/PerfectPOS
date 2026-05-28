import { IRoleRepository } from '../../../domain/repositories/index';

export class ListRolesUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute() {
    return this.roleRepo.findAll();
  }
}
