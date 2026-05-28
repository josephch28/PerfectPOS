import { Knex } from 'knex';
import { Product } from '../../../../domain/entities/index';
import { IProductRepository } from '../../../../domain/repositories/index';

export class OracleProductRepository implements IProductRepository {
  constructor(private knex: Knex) {}

  async findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive = false) {
    const offset = (page - 1) * limit;
    
    let query = this.knex('Products');
    let countQuery = this.knex('Products').count('* as total');

    if (!includeInactive) {
      query = query.where('isActive', 1).andWhere('stock', '>', 0);
      countQuery = countQuery.where('isActive', 1).andWhere('stock', '>', 0);
    }

    if (search) {
      query.andWhere(function() {
        if (searchField === 'name') {
          this.where('name', 'like', `${search}%`);
        } else if (searchField === 'code') {
          this.where('code', 'like', `${search}%`);
        } else {
          this.where('name', 'like', `${search}%`)
              .orWhere('code', 'like', `${search}%`);
        }
      });
      
      countQuery.andWhere(function() {
        if (searchField === 'name') {
          this.where('name', 'like', `${search}%`);
        } else if (searchField === 'code') {
          this.where('code', 'like', `${search}%`);
        } else {
          this.where('name', 'like', `${search}%`)
              .orWhere('code', 'like', `${search}%`);
        }
      });
    }

    const data = await query.orderBy('name', 'asc').limit(limit).offset(offset);
    const totalResult = await countQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;

    return { 
      data: data.map(this.mapToProduct), 
      total 
    };
  }

  async findById(id: string) {
    const product = await this.knex('Products').where({ id }).first();
    return product ? this.mapToProduct(product) : null;
  }

  async findByCode(code: string) {
    const product = await this.knex('Products').where({ code }).first();
    return product ? this.mapToProduct(product) : null;
  }

  async create(product: Product) {
    await this.knex('Products').insert({
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      stock: product.stock,
      appliesIva: product.appliesIva ? 1 : 0,
      isActive: product.isActive ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return product;
  }

  async update(id: string, product: Partial<Product>) {
    const updateData: any = { ...product, updatedAt: new Date() };
    if (updateData.appliesIva !== undefined) {
      updateData.appliesIva = updateData.appliesIva ? 1 : 0;
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive ? 1 : 0;
    }
    
    await this.knex('Products').where({ id }).update(updateData);
    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string) {
    const hasSales = await this.hasSales(id);
    if (hasSales) {
      await this.knex('Products').where({ id }).update({ isActive: 0, updatedAt: new Date() });
    } else {
      await this.knex('Products').where({ id }).delete();
    }
  }

  async hasSales(id: string) {
    const countResult = await this.knex('SaleDetails').where({ productId: id }).count('* as total').first();
    return (countResult ? Number(countResult.total) : 0) > 0;
  }

  async updateStock(id: string, quantity: number) {
    await this.knex('Products').where({ id }).increment('stock', quantity);
  }

  private mapToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      code: dbProduct.code,
      name: dbProduct.name,
      price: dbProduct.price,
      stock: dbProduct.stock,
      appliesIva: Boolean(dbProduct.appliesIva),
      isActive: Boolean(dbProduct.isActive)
    };
  }
}
