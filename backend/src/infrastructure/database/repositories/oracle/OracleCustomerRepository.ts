import { Knex } from 'knex';
import { Customer } from '../../../../domain/entities/index';
import { ICustomerRepository } from '../../../../domain/repositories/index';

export class OracleCustomerRepository implements ICustomerRepository {
  constructor(private knex: Knex) {}

  async findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive = false) {
    const offset = (page - 1) * limit;
    
    let query = this.knex('Customers');
    let countQuery = this.knex('Customers').count('* as total');

    if (!includeInactive) {
      query = query.where('isActive', 1);
      countQuery = countQuery.where('isActive', 1);
    }

    if (search) {
      query.andWhere(function() {
        if (searchField === 'name') {
          this.where('name', 'like', `${search}%`);
        } else if (searchField === 'lastName') {
          this.where('lastName', 'like', `${search}%`);
        } else if (searchField === 'cedula') {
          this.where('id', 'like', `${search}%`);
        } else {
          this.where('id', 'like', `${search}%`)
              .orWhere('name', 'like', `${search}%`)
              .orWhere('lastName', 'like', `${search}%`)
              .orWhere('email', 'like', `${search}%`);
        }
      });
      
      countQuery.andWhere(function() {
        if (searchField === 'name') {
          this.where('name', 'like', `${search}%`);
        } else if (searchField === 'lastName') {
          this.where('lastName', 'like', `${search}%`);
        } else if (searchField === 'cedula') {
          this.where('id', 'like', `${search}%`);
        } else {
          this.where('id', 'like', `${search}%`)
              .orWhere('name', 'like', `${search}%`)
              .orWhere('lastName', 'like', `${search}%`)
              .orWhere('email', 'like', `${search}%`);
        }
      });
    }

    const data = await query.orderBy('lastName', 'asc').limit(limit).offset(offset);
    const totalResult = await countQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;

    return { 
      data: data.map(this.mapToCustomer), 
      total 
    };
  }

  async findById(id: string) {
    const customer = await this.knex('Customers').where({ id }).first();
    return customer ? this.mapToCustomer(customer) : null;
  }

  async findByEmail(email: string) {
    const customer = await this.knex('Customers').where({ email }).first();
    return customer ? this.mapToCustomer(customer) : null;
  }

  async create(customer: Customer) {
    await this.knex('Customers').insert({
      id: customer.id,
      name: customer.name,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
      isActive: customer.isActive ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return customer;
  }

  async update(id: string, customer: Partial<Customer>) {
    const updateData: any = { ...customer, updatedAt: new Date() };
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive ? 1 : 0;
    }
    
    await this.knex('Customers').where({ id }).update(updateData);
    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string) {
    const hasSales = await this.hasSales(id);
    if (hasSales) {
      await this.knex('Customers').where({ id }).update({ isActive: 0, updatedAt: new Date() });
    } else {
      await this.knex('Customers').where({ id }).delete();
    }
  }

  async hasSales(id: string) {
    const countResult = await this.knex('Sales').where({ customerId: id }).count('* as total').first();
    return (countResult ? Number(countResult.total) : 0) > 0;
  }

  private mapToCustomer(dbCustomer: any): Customer {
    return {
      id: dbCustomer.id,
      name: dbCustomer.name,
      lastName: dbCustomer.lastName,
      phone: dbCustomer.phone,
      address: dbCustomer.address,
      email: dbCustomer.email,
      isActive: Boolean(dbCustomer.isActive)
    };
  }
}
