import { Request, Response } from 'express';
import { ListErrorLogsUseCase } from '../../../application/use-cases/index';

export class ErrorLogController {
  constructor(private listErrorLogsUseCase: ListErrorLogsUseCase) {}

  async getErrorLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.listErrorLogsUseCase.execute(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
