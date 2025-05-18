// filepath: src\repositories\product.repository.ts
// Repository for product-related database operations
// Extends the BaseRepository to include product-specific operations

import { BaseRepository } from './base.repository';
import { IProduct, IProductModel, ProductModel } from '../models/product.model';
import logger from '../config/logger';

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

  /**
   * Find products that contain a given name (case insensitive)
   * Simple debugging version to diagnose search issues
   * @param name Name to search for in product names
   * @returns Array of products matching the search criteria
   */
  async findByName(name: string): Promise<IProduct[]> {
    // Log the search query for debugging
    logger.debug(`Searching for products with name containing: "${name}"`);

    // First, check if there are any products at all
    const totalCount = await ProductModel.countDocuments();
    logger.info(`Total products in database: ${totalCount}`);

    if (totalCount === 0) {
      logger.warn('Product collection is empty. You may need to call the reset endpoint first.');
      return [];
    }

    try {
      // Get all products if the database has a small number of them
      if (totalCount <= 100) {
        logger.debug(`Getting all ${totalCount} products to search client-side`);
        const allProducts = await ProductModel.find({}, { __v: 0 }).lean();

        // Do the filtering in memory
        const filteredProducts = allProducts.filter((product) =>
          product.name.toLowerCase().includes(name.toLowerCase()),
        );

        logger.info(`Found ${filteredProducts.length} products matching "${name}" (client-side filtering)`);

        return filteredProducts.map((product) => {
          const { _id, ...rest } = product;
          return { id: _id.toString(), ...rest } as IProduct;
        });
      }

      // For larger databases, use the database search
      const products = await ProductModel.find({ name: { $regex: name, $options: 'i' } }, { __v: 0 }).lean();

      logger.info(`Found ${products.length} products matching "${name}" (database regex search)`);

      return products.map((product) => {
        const { _id, ...rest } = product;
        return { id: _id.toString(), ...rest } as IProduct;
      });
    } catch (error) {
      logger.error('Error while searching for products:', error);
      throw error;
    }
  }

  /**
   * Get the first 10 products sorted alphabetically by name
   * @returns Array of the first 10 products sorted by name
   */
  async findTopTenSortedByName(): Promise<IProduct[]> {
    const products = await ProductModel.find({}, { __v: 0 }, { sort: { name: 1 }, limit: 10 }).lean();

    return products.map((product) => {
      const { _id, ...rest } = product;
      return { id: _id.toString(), ...rest } as IProduct;
    });
  }
}

export default ProductRepository;
