import { PrismaClient } from '@prisma/client';
import { User } from '../../../domain/entities/index';
import { IUserRepository } from '../../../domain/repositories/index';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToUser(dbUser: any): User {
    if (!dbUser) return null as any;
    return {
      id: dbUser.id,
      username: dbUser.username,
      firstName: dbUser.firstName,
      middleName: dbUser.middleName,
      firstLastName: dbUser.firstLastName,
      secondLastName: dbUser.secondLastName,
      cedula: dbUser.cedula,
      email: dbUser.email,
      password: dbUser.password,
      roleId: dbUser.roleId,
      role: dbUser.role ? {
        id: dbUser.role.id,
        name: dbUser.role.name,
        description: dbUser.role.description || undefined
      } : undefined,
      isActive: dbUser.isActive,
      loginAttempts: dbUser.loginAttempts,
      isLocked: dbUser.isLocked
    };
  }

  async findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      if (searchField === 'username') {
        where.username = { contains: search };
      } else if (searchField === 'email') {
        where.email = { contains: search };
      } else {
        where.OR = [
          { username: { contains: search } },
          { firstName: { contains: search } },
          { firstLastName: { contains: search } },
          { email: { contains: search } }
        ];
      }
    }

    const [idsResult, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true },
        where,
        orderBy: { username: 'asc' }
      }),
      this.prisma.user.count({ where })
    ]);

    let data: any[] = [];
    if (idsResult.length > 0) {
      const ids = idsResult.map(u => u.id);
      data = await this.prisma.user.findMany({
        where: { id: { in: ids } },
        include: { role: true },
        orderBy: { username: 'asc' }
      });
    }

    return { data: data.map(u => this.mapToUser(u)), total };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    return user ? this.mapToUser(user) : null;
  }

  async create(user: User) {
    const created = await this.prisma.user.create({
      data: {
        username: user.username,
        firstName: user.firstName,
        middleName: user.middleName,
        firstLastName: user.firstLastName,
        secondLastName: user.secondLastName,
        cedula: user.cedula,
        email: user.email,
        password: user.password!,
        roleId: user.roleId,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        isLocked: user.isLocked
      },
      include: { role: true }
    });
    return this.mapToUser(created);
  }

  async update(id: string, user: Partial<User>) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        username: user.username,
        firstName: user.firstName,
        middleName: user.middleName,
        firstLastName: user.firstLastName,
        secondLastName: user.secondLastName,
        cedula: user.cedula,
        email: user.email,
        password: user.password,
        roleId: user.roleId,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        isLocked: user.isLocked
      },
      include: { role: true }
    });
    return this.mapToUser(updated);
  }

  async delete(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async incrementLoginAttempts(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { loginAttempts: { increment: 1 } }
    });
  }

  async resetLoginAttempts(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { loginAttempts: 0 }
    });
  }

  async lockUser(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isLocked: true }
    });
  }

  async unlockUser(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isLocked: false, loginAttempts: 0 }
    });
  }
}
