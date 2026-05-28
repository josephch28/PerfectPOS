import { Request, Response } from 'express';
import { ListUsersUseCase, CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '../../../application/use-cases/index';

export class UserController {
  constructor(
    private listUsers: ListUsersUseCase,
    private createUser: CreateUserUseCase,
    private updateUser: UpdateUserUseCase,
    private deleteUser: DeleteUserUseCase
  ) {}

  async getUsers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await this.listUsers.execute(page, limit);
    res.json(result);
  }

  async postUser(req: Request, res: Response) {
    try {
      const user = await this.createUser.execute(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async putUser(req: Request, res: Response) {
    try {
      const user = await this.updateUser.execute(req.params.id as string, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUserMethod(req: Request, res: Response) {
    try {
      await this.deleteUser.execute(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
