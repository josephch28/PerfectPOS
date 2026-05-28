import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/index';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await this.loginUseCase.execute(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}
