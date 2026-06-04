import { PrismaClient } from '@prisma/client';
import { Sale, SaleStatus } from '../../../domain/entities/index';
import { ISaleRepository } from '../../../domain/repositories/index';

export class PrismaSaleRepository implements ISaleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(sale: Sale) {
    return this.prisma.$transaction(async (tx) => {
      // Create the sale
      const result = await tx.sale.create({
        data: {
          number: sale.number,
          date: sale.date,
          status: sale.status,
          customerId: sale.customerId,
          userId: sale.userId,
          sellerName: sale.sellerName,
          customerName: sale.customerName,
          customerLastName: sale.customerLastName,
          customerAddress: sale.customerAddress,
          customerPhone: sale.customerPhone,
          customerEmail: sale.customerEmail,
          paymentMethodId: sale.paymentMethodId,
          subtotal: sale.subtotal,
          iva: sale.iva,
          total: sale.total,
          details: {
            create: sale.details.map(d => ({
              productId: d.productId,
              productName: d.productName,
              productCode: d.productCode,
              quantity: d.quantity,
              price: d.price,
              subtotal: d.subtotal
            }))
          }
        },
        include: {
          details: true,
          customer: true,
          user: true,
          paymentMethod: true
        }
      });

      // If Confirmed, stock should have been handled by Use Case or here?
      // PDF says: "El stock se descuenta únicamente cuando la venta pasa a Confirmed."
      // If we are creating it directly as Confirmed:
      if (sale.status === SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await tx.product.findUnique({ where: { id: detail.productId } });
          if (!product) throw new Error(`Product ${detail.productId} not found`);
          
          await tx.product.update({
            where: { id: detail.productId },
            data: { stock: { decrement: detail.quantity } }
          });

          // Register Stock Movement
          await tx.stockMovement.create({
            data: {
              productId: detail.productId,
              type: 'OUT',
              quantity: detail.quantity,
              stockBefore: product.stock,
              stockAfter: product.stock - detail.quantity,
              userId: sale.userId,
              reference: `Sale #${sale.number}`
            }
          });
        }
      }

      return result as unknown as Sale;
    });
  }

  async findById(id: number) {
    const result = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        details: {
          include: { product: true }
        },
        customer: true,
        user: { include: { role: true } },
        paymentMethod: true
      }
    });
    return result as unknown as Sale;
  }

  async findAll(page: number, limit: number, search?: string, searchField?: string, sellerId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (sellerId) {
      where.userId = sellerId;
    }

    if (search) {
      if (searchField === 'number') {
        where.number = { startsWith: search };
      } else if (searchField === 'customer') {
        where.OR = [
          { customerName: { startsWith: search } },
          { customerLastName: { startsWith: search } }
        ];
      } else {
        const isIdSearch = !isNaN(Number(search));
        if (isIdSearch) {
          where.id = Number(search);
        } else {
          where.OR = [
            { number: { startsWith: search } },
            { customerName: { startsWith: search } },
            { customerLastName: { startsWith: search } }
          ];
        }
      }
    }

    const [idsResult, total] = await Promise.all([
      this.prisma.sale.findMany({
        skip,
        take: limit,
        select: { id: true },
        where,
        orderBy: { date: 'desc' }
      }),
      this.prisma.sale.count({ where })
    ]);

    let data: any[] = [];
    if (idsResult.length > 0) {
      const ids = idsResult.map(s => s.id);
      data = await this.prisma.sale.findMany({
        where: { id: { in: ids } },
        include: {
          paymentMethod: { select: { id: true, name: true } },
          details: {
            select: { id: true, productId: true, productName: true, productCode: true, quantity: true, price: true, subtotal: true }
          }
        },
        orderBy: { date: 'desc' }
      });
    }

    return { data: data as unknown as Sale[], total };
  }

  async getLastNumber() {
    const last = await this.prisma.sale.findFirst({
      orderBy: { id: 'desc' }
    });
    return last ? parseInt(last.number) : 0;
  }

  async updateStatus(id: number, status: string, modifiedByName?: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { details: true }
      });

      if (!sale) throw new Error("Sale not found");

      // Handle stock if transitioning to Confirmed
      if (status === SaleStatus.Confirmed && sale.status !== SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await tx.product.findUnique({ where: { id: detail.productId } });
          if (!product) throw new Error(`Product ${detail.productId} not found`);
          
          await tx.product.update({
            where: { id: detail.productId },
            data: { stock: { decrement: detail.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: detail.productId,
              type: 'OUT',
              quantity: detail.quantity,
              stockBefore: product.stock,
              stockAfter: product.stock - detail.quantity,
              userId: sale.userId,
              reference: `Sale #${sale.number}`
            }
          });
        }
      }

      // Handle stock if transitioning from Confirmed to Cancelled
      if (status === SaleStatus.Cancelled && sale.status === SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await tx.product.findUnique({ where: { id: detail.productId } });
          if (!product) throw new Error(`Product ${detail.productId} not found`);

          await tx.product.update({
            where: { id: detail.productId },
            data: { stock: { increment: detail.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: detail.productId,
              type: 'IN',
              quantity: detail.quantity,
              stockBefore: product.stock,
              stockAfter: product.stock + detail.quantity,
              userId: sale.userId,
              reference: `Cancellation Sale #${sale.number}`
            }
          });
        }
      }

      return tx.sale.update({
        where: { id },
        data: { status, modifiedByName },
        include: {
          details: true,
          customer: true,
          user: true,
          paymentMethod: true
        }
      }) as unknown as Sale;
    });
  }
}
