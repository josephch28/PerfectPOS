import { Knex } from 'knex';
import { ErrorLog } from '../../../../domain/entities/index';
import { IErrorLogRepository } from '../../../../domain/repositories/index';

export class OracleErrorLogRepository implements IErrorLogRepository {
  constructor(private knex: Knex) {}

  async create(log: ErrorLog): Promise<ErrorLog> {
    const id = this.generateUUID();
    await this.knex('ErrorLogs').insert({
      id,
      message: log.message,
      exceptionType: log.exceptionType,
      stackTrace: log.stackTrace,
      source: log.source,
      userId: log.userId,
      createdAt: new Date()
    });
    return { ...log, id, createdAt: new Date() };
  }

  async findAll(page: number, limit: number): Promise<{ data: ErrorLog[]; total: number; }> {
    const offset = (page - 1) * limit;
    
    const query = this.knex('ErrorLogs').leftJoin('Users', 'ErrorLogs.userId', 'Users.id').select('ErrorLogs.*', 'Users.username as userUsername');
    const countQuery = this.knex('ErrorLogs').count('* as total');

    const data = await query.orderBy('ErrorLogs.createdAt', 'desc').limit(limit).offset(offset);
    const totalResult = await countQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;

    return {
      data: data.map(d => ({
        id: d.id,
        message: d.message,
        exceptionType: d.exceptionType,
        stackTrace: d.stackTrace,
        source: d.source,
        userId: d.userId,
        createdAt: d.createdAt,
        user: d.userUsername ? { username: d.userUsername } as any : undefined
      })),
      total
    };
  }

  private generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
