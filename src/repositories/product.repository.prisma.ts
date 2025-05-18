import { PrismaClient } from '@prisma/client';
import { BaseRepositoryPrisma } from './base.repository.prisma';
import { IProduct, ProductModel } from '../models/product.model';

export class ProductRepositoryPrisma extends BaseRepositoryPrisma<IProduct> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'product');
  }

  async deleteAll(): Promise<void> {
    await ProductModel.deleteMany({});
  }

  async createMany(products: IProduct[]): Promise<IProduct[]> {
    return await ProductModel.insertMany(products);
  }
}
