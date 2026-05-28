import { IErrorLogRepository } from '../../../domain/repositories/index';

export class ListErrorLogsUseCase {
  constructor(private errorLogRepo: IErrorLogRepository) {}
  async execute(page: number, limit: number) {
    return this.errorLogRepo.findAll(page, limit);
  }
}
