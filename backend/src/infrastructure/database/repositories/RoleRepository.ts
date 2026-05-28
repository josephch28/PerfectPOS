import { PrismaClient } from '@prisma/client';
import { Role } from '../../../domain/entities/index';
import { IRoleRepository } from '../../../domain/repositories/index';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToRole(dbRole: any): Role {
    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || undefined
    };
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
    return roles.map(r => this.mapToRole(r));
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    return role ? this.mapToRole(role) : null;
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    return role ? this.mapToRole(role) : null;
  }
}
