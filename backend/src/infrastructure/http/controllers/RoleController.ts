import { Request, Response } from 'express';
import { ListRolesUseCase } from '../../../application/use-cases/index';

export class RoleController {
  constructor(private listRoles: ListRolesUseCase) {}

  async getRoles(req: Request, res: Response) {
    try {
      const roles = await this.listRoles.execute();
      res.json(roles);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
