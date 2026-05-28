import { PrismaClient } from '@prisma/client';
import { PaymentMethod } from '../../../domain/entities/index';
import { IPaymentMethodRepository } from '../../../domain/repositories/index';

export class PrismaPaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return this.prisma.paymentMethod.findUnique({ where: { id } });
  }
}
