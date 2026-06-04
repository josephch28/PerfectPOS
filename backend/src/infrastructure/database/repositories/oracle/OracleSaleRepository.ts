import { Knex } from 'knex';
import { Sale, SaleStatus } from '../../../../domain/entities/index';
import { ISaleRepository } from '../../../../domain/repositories/index';

export class OracleSaleRepository implements ISaleRepository {
  constructor(private knex: Knex) {}

  async create(sale: Sale): Promise<Sale> {
    return this.knex.transaction(async (trx) => {
      // 1. Insert Sale
      await trx('Sales').insert({
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
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Oracle doesn't easily return the autoincremented ID from insert in the same way MySQL does without RETURNING clause,
      // but since we are inserting, we can query it by number
      const insertedSale = await trx('Sales').where({ number: sale.number }).first();
      const saleId = insertedSale.id;

      // 2. Insert Details
      for (const detail of sale.details) {
        await trx('SaleDetails').insert({
          id: detail.id || this.generateUUID(),
          saleId: saleId,
          productId: detail.productId,
          productName: detail.productName,
          productCode: detail.productCode,
          quantity: detail.quantity,
          price: detail.price,
          subtotal: detail.subtotal,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // 3. Handle Stock if Confirmed
      if (sale.status === SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await trx('Products').where({ id: detail.productId }).first();
          if (!product) throw new Error(`Product ${detail.productId} not found`);

          await trx('Products')
            .where({ id: detail.productId })
            .update({
              stock: product.stock - detail.quantity,
              updatedAt: new Date()
            });

          await trx('StockMovements').insert({
            id: this.generateUUID(),
            productId: detail.productId,
            type: 'OUT',
            quantity: detail.quantity,
            stockBefore: product.stock,
            stockAfter: product.stock - detail.quantity,
            userId: sale.userId,
            reference: `Sale #${sale.number}`,
            createdAt: new Date()
          });
        }
      }

      return await this.fetchFullSale(saleId, trx);
    });
  }

  async findById(id: number): Promise<Sale | null> {
    return this.fetchFullSale(id, this.knex);
  }

  async findAll(page: number, limit: number, search?: string, searchField?: string, sellerId?: string): Promise<{ data: Sale[]; total: number }> {
    const offset = (page - 1) * limit;

    let idsQuery = this.knex('Sales');
    let countQuery = this.knex('Sales');

    if (sellerId) {
      idsQuery = idsQuery.where('Sales.userId', sellerId);
      countQuery = countQuery.where('Sales.userId', sellerId);
    }

    if (search) {
      const searchFn = function(this: any) {
        if (searchField === 'number') {
          this.where('Sales.number', 'like', `${search}%`);
        } else if (searchField === 'customer') {
          this.where('Sales.customerName', 'like', `${search}%`)
              .orWhere('Sales.customerLastName', 'like', `${search}%`);
        } else {
          this.where('Sales.number', 'like', `${search}%`)
              .orWhere('Sales.customerName', 'like', `${search}%`)
              .orWhere('Sales.customerLastName', 'like', `${search}%`);
        }
      };
      idsQuery.andWhere(searchFn);
      countQuery.andWhere(searchFn);
    }
    
    countQuery = countQuery.count({ total: 'Sales.id' });
    
    const idsResult = await idsQuery.select('Sales.id').orderBy('Sales.date', 'desc').limit(limit).offset(offset);
    const saleIds = idsResult.map((row: any) => row.id);

    let data: any[] = [];
    if (saleIds.length > 0) {
      data = await this.knex('Sales')
        .leftJoin('PaymentMethods', 'Sales.paymentMethodId', 'PaymentMethods.id')
        .select('Sales.*', {
          paymentMethodName: 'PaymentMethods.name'
        })
        .whereIn('Sales.id', saleIds)
        .orderBy('Sales.date', 'desc');
    }

    const totalResult = await countQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;


    let allDetails: any[] = [];
    if (saleIds.length > 0) {
      allDetails = await this.knex('SaleDetails').whereIn('saleId', saleIds);
    }

    const mappedData = data.map(row => {
      const saleDetails = allDetails.filter(d => d.saleId === row.id);
      return {
        id: row.id,
        number: row.number,
        date: row.date,
        status: row.status,
        customerId: row.customerId,
        userId: row.userId,
        sellerName: row.sellerName,
        customerName: row.customerName,
        customerLastName: row.customerLastName,
        customerAddress: row.customerAddress,
        customerPhone: row.customerPhone,
        customerEmail: row.customerEmail,
        paymentMethodId: row.paymentMethodId,
        subtotal: row.subtotal,
        iva: row.iva,
        total: row.total,
        paymentMethod: { name: row.paymentMethodName } as any,
        details: saleDetails.map(d => ({
          id: d.id,
          productId: d.productId,
          productName: d.productName,
          productCode: d.productCode,
          quantity: d.quantity,
          price: d.price,
          subtotal: d.subtotal
        }))
      };
    });

    return { data: mappedData, total };
  }

  async getLastNumber(): Promise<number> {
    const last = await this.knex('Sales').orderBy('id', 'desc').first();
    return last ? parseInt(last.number) : 0;
  }

  async updateStatus(id: number, status: string): Promise<Sale> {
    return this.knex.transaction(async (trx) => {
      const sale = await this.fetchFullSale(id, trx);
      if (!sale) throw new Error("Sale not found");

      if (status === SaleStatus.Confirmed && sale.status !== SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await trx('Products').where({ id: detail.productId }).first();
          if (!product) throw new Error(`Product ${detail.productId} not found`);

          await trx('Products').where({ id: detail.productId }).update({
            stock: product.stock - detail.quantity,
            updatedAt: new Date()
          });

          await trx('StockMovements').insert({
            id: this.generateUUID(),
            productId: detail.productId,
            type: 'OUT',
            quantity: detail.quantity,
            stockBefore: product.stock,
            stockAfter: product.stock - detail.quantity,
            userId: sale.userId,
            reference: `Sale #${sale.number}`,
            createdAt: new Date()
          });
        }
      }

      if (status === SaleStatus.Cancelled && sale.status === SaleStatus.Confirmed) {
        for (const detail of sale.details) {
          const product = await trx('Products').where({ id: detail.productId }).first();
          if (!product) throw new Error(`Product ${detail.productId} not found`);

          await trx('Products').where({ id: detail.productId }).update({
            stock: product.stock + detail.quantity,
            updatedAt: new Date()
          });

          await trx('StockMovements').insert({
            id: this.generateUUID(),
            productId: detail.productId,
            type: 'IN',
            quantity: detail.quantity,
            stockBefore: product.stock,
            stockAfter: product.stock + detail.quantity,
            userId: sale.userId,
            reference: `Cancellation Sale #${sale.number}`,
            createdAt: new Date()
          });
        }
      }

      await trx('Sales').where({ id }).update({ status, updatedAt: new Date() });
      return await this.fetchFullSale(id, trx);
    });
  }

  private async fetchFullSale(id: number, knexClient: Knex): Promise<Sale> {
    const saleRow = await knexClient('Sales').where({ id }).first();
    if (!saleRow) return null as any;

    const details = await knexClient('SaleDetails').where({ saleId: id });
    const customer = await knexClient('Customers').where({ id: saleRow.customerId }).first();
    const user = await knexClient('Users').where({ id: saleRow.userId }).first();
    const paymentMethod = await knexClient('PaymentMethods').where({ id: saleRow.paymentMethodId }).first();

    return {
      id: saleRow.id,
      number: saleRow.number,
      date: saleRow.date,
      status: saleRow.status,
      customerId: saleRow.customerId,
      userId: saleRow.userId,
      sellerName: saleRow.sellerName,
      customerName: saleRow.customerName,
      customerLastName: saleRow.customerLastName,
      customerAddress: saleRow.customerAddress,
      customerPhone: saleRow.customerPhone,
      customerEmail: saleRow.customerEmail,
      paymentMethodId: saleRow.paymentMethodId,
      subtotal: saleRow.subtotal,
      iva: saleRow.iva,
      total: saleRow.total,
      details: details.map(d => ({
        id: d.id,
        productId: d.productId,
        productName: d.productName,
        productCode: d.productCode,
        quantity: d.quantity,
        price: d.price,
        subtotal: d.subtotal
      })),
      customer: customer ? { ...customer, isActive: Boolean(customer.isActive) } : undefined,
      user: user ? { ...user, isActive: Boolean(user.isActive), isLocked: Boolean(user.isLocked) } : undefined,
      paymentMethod: paymentMethod ? { ...paymentMethod, isActive: Boolean(paymentMethod.isActive) } : undefined
    };
  }

  private generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
