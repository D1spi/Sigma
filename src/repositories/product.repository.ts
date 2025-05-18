// filepath: src\repositories\product.repository.ts
// Repository for product-related database operations
// Extends the BaseRepository to include product-specific operations

import { BaseRepository } from './base.repository';
import { IProduct, IProductModel, ProductModel } from '../models/product.model';

export class ProductRepository extends BaseRepository<IProductModel> {
  constructor() {
    super(ProductModel);
  }

  /**
   * Delete all products from the database
   */
  async deleteAll(): Promise<void> {
    await ProductModel.deleteMany({});
  }

  /**
   * Create multiple products at once
   * @param products Array of product data to insert
   * @returns Array of created products
   */
  async createMany(products: IProduct[]): Promise<IProduct[]> {
    return (await ProductModel.insertMany(products)) as unknown as IProduct[];
  }
}

export default ProductRepository;
