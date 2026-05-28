import { PrismaClient } from '@prisma/client';
import { ErrorLog } from '../../../domain/entities/index';
import { IErrorLogRepository } from '../../../domain/repositories/index';

export class PrismaErrorLogRepository implements IErrorLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(log: ErrorLog) {
    const result = await this.prisma.errorLog.create({
      data: {
        message: log.message,
        exceptionType: log.exceptionType,
        stackTrace: log.stackTrace,
        source: log.source,
        userId: log.userId
      }
    });
    return result as unknown as ErrorLog;
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.errorLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      }),
      this.prisma.errorLog.count()
    ]);
    return { data: data as unknown as ErrorLog[], total };
  }
}
