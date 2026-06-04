import { IUserRepository } from '../../../domain/repositories/index';

export class ListUsersUseCase {
  constructor(private userRepo: IUserRepository) {}
  async execute(page: number, limit: number, search?: string, searchField?: string) {
    return this.userRepo.findAll(page, limit, search, searchField);
  }
}
