import { PrismaClient } from '@prisma/client';
<<<<<<< HEAD
import { IProduct, ProductModel } from '../models/product.model';

export class ProductRepositoryPrisma {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
=======
import { BaseRepositoryPrisma } from './base.repository.prisma';
import { IProduct, ProductModel } from '../models/product.model';

export class ProductRepositoryPrisma extends BaseRepositoryPrisma<IProduct> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'product');
>>>>>>> 5dc0d7b9b172e43b94c1d730967e1be908062443
  }

  async deleteAll(): Promise<void> {
    await ProductModel.deleteMany({});
  }

  async createMany(products: IProduct[]): Promise<IProduct[]> {
    return await ProductModel.insertMany(products);
  }
}
