import { PrismaClient } from '@prisma/client';
import { Customer } from '../../../domain/entities/index';
import { ICustomerRepository } from '../../../domain/repositories/index';

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToCustomer(dbCustomer: any): Customer {
    return {
      id: dbCustomer.id,
      name: dbCustomer.name,
      lastName: dbCustomer.lastName,
      phone: dbCustomer.phone,
      address: dbCustomer.address,
      email: dbCustomer.email,
      isActive: dbCustomer.isActive,
      lastModifiedByName: dbCustomer.lastModifiedByName
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
      } else if (searchField === 'lastName') {
        where.lastName = { startsWith: search };
      } else if (searchField === 'cedula') {
        where.id = { startsWith: search };
      } else {
        where.OR = [
          { id: { startsWith: search } },
          { name: { startsWith: search } },
          { lastName: { startsWith: search } },
          { email: { startsWith: search } }
        ];
      }
    }

    const total = await this.prisma.customer.count({ where });

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

    const idsResult = await this.prisma.customer.findMany({
      skip: actualSkip,
      take: actualTake,
      select: { id: true },
      where,
      orderBy: { lastName: sortDir as any }
    });

    let data: any[] = [];
    if (idsResult.length > 0) {
      const ids = idsResult.map(c => c.id);
      data = await this.prisma.customer.findMany({
        where: { id: { in: ids } },
        orderBy: { lastName: 'asc' }
      });
    }

    return { data: data.map(c => this.mapToCustomer(c)), total };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    return customer ? this.mapToCustomer(customer) : null;
  }

  async findByEmail(email: string) {
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    return customer ? this.mapToCustomer(customer) : null;
  }

  async create(customer: Customer) {
    const created = await this.prisma.customer.create({ data: customer });
    return this.mapToCustomer(created);
  }

  async update(id: string, customer: Partial<Customer>) {
    const updated = await this.prisma.customer.update({
      where: { id },
      data: customer
    });
    return this.mapToCustomer(updated);
  }

  async delete(id: string) {
    const hasSales = await this.hasSales(id);
    if (hasSales) {
      await this.prisma.customer.update({
        where: { id },
        data: { isActive: false }
      });
    } else {
      await this.prisma.customer.delete({ where: { id } });
    }
  }

  async hasSales(id: string) {
    const count = await this.prisma.sale.count({
      where: { customerId: id }
    });
    return count > 0;
  }
}
