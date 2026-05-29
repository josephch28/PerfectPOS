import { Knex } from 'knex';
import { PaymentMethod } from '../../../../domain/entities/index';
import { IPaymentMethodRepository } from '../../../../domain/repositories/index';

export class OraclePaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private knex: Knex) {}

  async findAll(): Promise<PaymentMethod[]> {
    const methods = await this.knex('PaymentMethods').where({ isActive: 1 }).orderBy('name', 'asc');
    return methods.map(this.mapToPaymentMethod);
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const method = await this.knex('PaymentMethods').where({ id }).first();
    return method ? this.mapToPaymentMethod(method) : null;
  }

  private mapToPaymentMethod(dbMethod: any): PaymentMethod {
    return {
      id: dbMethod.id,
      name: dbMethod.name,
      isActive: Boolean(dbMethod.isActive)
    };
  }
}
