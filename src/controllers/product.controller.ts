// Controller for product-related endpoints
// Handles HTTP requests related to product operations

import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Resets the products collection with data from an external API
   * @route POST /api/products/reset
   */
  resetProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('ProductController: resetProducts called');
      const result = await this.productService.resetProducts();
      res.status(httpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('ProductController: Error in resetProducts', error);
      next(error);
    }
  };

  /**
   * Search for products by name
   * @route GET /api/products/search?name=:name
   */
  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.query;

      if (!name || typeof name !== 'string') {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Name parameter is required and must be a string',
        });
        return;
      }

      logger.info(`ProductController: searchProducts called with name: ${name}`);
      const products = await this.productService.searchProductsByName(name);

      res.status(httpStatus.OK).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      logger.error('ProductController: Error in searchProducts', error);
      next(error);
    }
  };

  /**
   * Get the top 10 products sorted by name
   * @route GET /api/products/top
   */
  getTopProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('ProductController: getTopProducts called');
      const products = await this.productService.getTopTenProducts();

      res.status(httpStatus.OK).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      logger.error('ProductController: Error in getTopProducts', error);
      next(error);
    }
  };

  /**
   * Get a product by its ID
   * @route GET /api/products/:id
   */
  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Product ID is required',
        });
        return;
      }

      logger.info(`ProductController: getProductById called with ID: ${id}`);
      const product = await this.productService.getProductById(id);

      res.status(httpStatus.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('ProductController: Error in getProductById', error);

      // Check if this is a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  };
}

export default ProductController;
