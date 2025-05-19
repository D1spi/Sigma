import { PrismaClient } from '@prisma/client';
import { IProduct, ProductModel } from '../models/product.model';

export class ProductRepositoryPrisma {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async deleteAll(): Promise<void> {
    await ProductModel.deleteMany({});
  }

  async createMany(products: IProduct[]): Promise<IProduct[]> {
    return await ProductModel.insertMany(products);
  }
}
