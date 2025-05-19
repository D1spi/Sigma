// src/repositories/user.repository.prisma.ts
import { Prisma, PrismaClient, User } from '@prisma/client';
import { BaseRepositoryPrisma, IRepositoryDelegate } from './base.repository.prisma';
import { ApplicationError } from '../utils/application.error';
import { IUser } from '../interfaces/user.interface';

const prisma = new PrismaClient();

export class UserRepository {
  private readonly baseRepository: BaseRepositoryPrisma<User, Prisma.UserCreateInput, IRepositoryDelegate<User>>;

  constructor() {
    this.baseRepository = new BaseRepositoryPrisma(prisma.user as unknown as IRepositoryDelegate<User>);
  }

  private transformId(user: User | null): IUser | null {
    if (!user) {
      return null;
    }
    const { id, name, email, password, birthday, isBlocked, createdAt, updatedAt } = user;

    return {
      id: id.toString(),
      name,
      lastname: '', // campo obligatorio en IUser pero no existe en Prisma
      email,
      password,
      address: '', // idem
      birthday,
      isBlocked,
      authToken: undefined, // opcional en IUser → usamos undefined
      refreshToken: undefined, // opcional en IUser → usamos undefined
      tokensValid: false, // opcional en IUser pero boolean → false por defecto
      createdAt,
      updatedAt,
    };
  }

  public getById = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      throw new ApplicationError('Invalid ID', 400);
    }
    const user = await this.baseRepository.getById(idNumber, projection);
    return this.transformId(user);
  };

  public find = async (
    filters: Record<string, unknown> = {},
    projection: Record<string, boolean> = {},
    pagination: { skip: number; limit: number } = { skip: 0, limit: 0 },
  ): Promise<(IUser | null)[]> => {
    const users = await this.baseRepository.find(filters, projection, pagination);
    return users.map((u) => this.transformId(u));
  };

  public create = async (
    data: Prisma.UserCreateInput | Record<string, unknown>,
    projection: Record<string, boolean>,
  ): Promise<IUser | null> => {
    const created = await this.baseRepository.create(data as Prisma.UserCreateInput, projection);
    return this.transformId(created);
  };

  public getByEmail = async (email: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const user = await this.baseRepository.findOne({ email }, projection);
    return this.transformId(user);
  };

  public update = async (id: string, data: IUser, projection: Record<string, boolean>): Promise<IUser | null> => {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      throw new ApplicationError('Invalid ID', 400);
    }
    data.updatedAt = new Date();
    const updated = await this.baseRepository.update(idNumber, data as unknown as User, projection);
    return this.transformId(updated);
  };

  public delete = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      throw new ApplicationError('Invalid ID', 400);
    }
    const deleted = await this.baseRepository.delete(idNumber, projection);
    return this.transformId(deleted);
  };
}
