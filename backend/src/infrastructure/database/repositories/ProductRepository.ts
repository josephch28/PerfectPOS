import { PrismaClient } from '@prisma/client';
import { Product } from '../../../domain/entities/index';
import { IProductRepository } from '../../../domain/repositories/index';

export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      code: dbProduct.code,
      name: dbProduct.name,
      price: dbProduct.price,
      stock: dbProduct.stock,
      appliesIva: dbProduct.appliesIva,
      isActive: dbProduct.isActive
    };
  }

  async findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      if (searchField === 'name') {
        where.name = { startsWith: search };
      } else if (searchField === 'code') {
        where.code = { startsWith: search };
      } else {
        where.OR = [
          { name: { startsWith: search } },
          { code: { startsWith: search } }
        ];
      }
    }

    const total = await this.prisma.product.count({ where });

    if (total === 0 || skip >= total) {
      return { data: [], total };
    }

    let actualSkip = skip;
    let actualTake = limit;
    let sortDir = 'asc';

    if (skip > total / 2) {
      actualTake = Math.min(limit, total - skip);
      actualSkip = total - skip - actualTake;
      sortDir = 'desc';
    }

    const idsResult = await this.prisma.product.findMany({
      skip: actualSkip,
      take: actualTake,
      select: { id: true },
      where,
      orderBy: { name: sortDir as any }
    });

    let data: any[] = [];
    if (idsResult.length > 0) {
      const ids = idsResult.map(p => p.id);
      data = await this.prisma.product.findMany({
        where: { id: { in: ids } },
        orderBy: { name: 'asc' }
      });
    }

    return { data: data.map(p => this.mapToProduct(p)), total };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? this.mapToProduct(product) : null;
  }

  async findByCode(code: string) {
    const product = await this.prisma.product.findUnique({ where: { code } });
    return product ? this.mapToProduct(product) : null;
  }

  async create(product: Product) {
    const created = await this.prisma.product.create({ data: product });
    return this.mapToProduct(created);
  }

  async update(id: string, product: Partial<Product>) {
    const updated = await this.prisma.product.update({
      where: { id },
      data: product
    });
    return this.mapToProduct(updated);
  }

  async delete(id: string) {
    const hasSales = await this.hasSales(id);
    if (hasSales) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
    } else {
      await this.prisma.product.delete({ where: { id } });
    }
  }

  async hasSales(id: string) {
    const count = await this.prisma.saleDetail.count({
      where: { productId: id }
    });
    return count > 0;
  }

  async updateStock(id: string, quantity: number) {
    await this.prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } }
    });
  }
}
