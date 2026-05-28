import { PrismaClient } from '@prisma/client';
import { StockMovement, StockMovementType } from '../../../domain/entities/index';
import { IStockMovementRepository } from '../../../domain/repositories/index';

export class PrismaStockMovementRepository implements IStockMovementRepository {
  constructor(private prisma: PrismaClient) {}

  async create(movement: StockMovement) {
    const result = await this.prisma.stockMovement.create({
      data: {
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        stockBefore: movement.stockBefore,
        stockAfter: movement.stockAfter,
        userId: movement.userId,
        reference: movement.reference
      }
    });
    return result as unknown as StockMovement;
  }

  async findByProduct(productId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.stockMovement.count({ where: { productId } })
    ]);
    return { data: data as unknown as StockMovement[], total };
  }
}
