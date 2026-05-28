import { IErrorLogRepository } from '../../../domain/repositories/index';
import { ErrorLog } from '../../../domain/entities/index';

export class LogErrorUseCase {
  constructor(private errorLogRepo: IErrorLogRepository) {}

  async execute(log: ErrorLog) {
    return this.errorLogRepo.create(log);
  }
}
