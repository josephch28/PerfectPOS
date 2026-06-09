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
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;
    const result = await this.listUsers.execute(page, limit, search, searchField);
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
      const currentUserId = (req as any).user.id;
      const user = await this.updateUser.execute(req.params.id as string, req.body, currentUserId);
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
