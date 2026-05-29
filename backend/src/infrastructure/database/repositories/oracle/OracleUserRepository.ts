import { Knex } from 'knex';
import { User } from '../../../../domain/entities/index';
import { IUserRepository } from '../../../../domain/repositories/index';

export class OracleUserRepository implements IUserRepository {
  constructor(private knex: Knex) {}

  async findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive = false) {
    const offset = (page - 1) * limit;

    let query = this.knex('Users').leftJoin('Roles', 'Users.roleId', 'Roles.id').select('Users.*', { roleName: 'Roles.name' });
    let countQuery = this.knex('Users').count({ total: 'Users.id' });

    if (!includeInactive) {
      query = query.where('Users.isActive', 1);
      countQuery = countQuery.where('Users.isActive', 1);
    }

    if (search) {
      const searchFn = function(this: any) {
        if (searchField === 'username') {
          this.where('Users.username', 'like', `${search}%`);
        } else if (searchField === 'email') {
          this.where('Users.email', 'like', `${search}%`);
        } else if (searchField === 'name') {
          this.where('Users.name', 'like', `${search}%`).orWhere('Users.lastName', 'like', `${search}%`);
        } else {
          this.where('Users.username', 'like', `${search}%`)
              .orWhere('Users.email', 'like', `${search}%`)
              .orWhere('Users.name', 'like', `${search}%`)
              .orWhere('Users.lastName', 'like', `${search}%`);
        }
      };
      query.andWhere(searchFn);
      countQuery.andWhere(searchFn);
    }

    const data = await query.orderBy('Users.createdAt', 'desc').limit(limit).offset(offset);
    const totalResult = await countQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;

    return {
      data: data.map(this.mapToUser),
      total
    };
  }

  async findById(id: string) {
    const user = await this.knex('Users').leftJoin('Roles', 'Users.roleId', 'Roles.id').select('Users.*', { roleName: 'Roles.name' }).where({ 'Users.id': id }).first();
    return user ? this.mapToUser(user) : null;
  }

  async findByUsername(username: string) {
    const user = await this.knex('Users').leftJoin('Roles', 'Users.roleId', 'Roles.id').select('Users.*', { roleName: 'Roles.name' }).where({ 'Users.username': username }).first();
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.knex('Users').leftJoin('Roles', 'Users.roleId', 'Roles.id').select('Users.*', { roleName: 'Roles.name' }).where({ 'Users.email': email }).first();
    return user ? this.mapToUser(user) : null;
  }

  async create(user: User) {
    await this.knex('Users').insert({
      id: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      cedula: user.cedula,
      email: user.email,
      password: user.password,
      roleId: user.roleId,
      isActive: user.isActive ? 1 : 0,
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return user;
  }

  async update(id: string, user: Partial<User>) {
    const updateData: any = { ...user, updatedAt: new Date() };
    delete updateData.role; // don't update relation obj
    
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive ? 1 : 0;
    }
    if (updateData.isLocked !== undefined) {
      updateData.isLocked = updateData.isLocked ? 1 : 0;
    }

    await this.knex('Users').where({ id }).update(updateData);
    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string) {
    await this.knex('Users').where({ id }).update({ isActive: 0, updatedAt: new Date() });
  }

  async incrementLoginAttempts(id: string) {
    await this.knex('Users').where({ id }).increment('loginAttempts', 1).update({ updatedAt: new Date() });
  }

  async resetLoginAttempts(id: string) {
    await this.knex('Users').where({ id }).update({ loginAttempts: 0, updatedAt: new Date() });
  }

  async lockUser(id: string) {
    await this.knex('Users').where({ id }).update({ isLocked: 1, updatedAt: new Date() });
  }

  async unlockUser(id: string) {
    await this.knex('Users').where({ id }).update({ isLocked: 0, loginAttempts: 0, updatedAt: new Date() });
  }

  private mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.name,
      lastName: dbUser.lastName,
      cedula: dbUser.cedula,
      email: dbUser.email,
      password: dbUser.password,
      roleId: dbUser.roleId,
      isActive: Boolean(dbUser.isActive),
      loginAttempts: dbUser.loginAttempts,
      isLocked: Boolean(dbUser.isLocked),
      role: dbUser.roleName ? { id: dbUser.roleId, name: dbUser.roleName } as any : undefined
    };
  }
}
