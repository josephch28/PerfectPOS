import { Knex } from 'knex';
import { Role } from '../../../../domain/entities/index';
import { IRoleRepository } from '../../../../domain/repositories/index';

export class OracleRoleRepository implements IRoleRepository {
  constructor(private knex: Knex) {}

  async findAll(): Promise<Role[]> {
    const roles = await this.knex('Roles').orderBy('name', 'asc');
    return roles.map(this.mapToRole);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.knex('Roles').where({ id }).first();
    return role ? this.mapToRole(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.knex('Roles').where({ name }).first();
    return role ? this.mapToRole(role) : null;
  }

  private mapToRole(dbRole: any): Role {
    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description
    };
  }
}
