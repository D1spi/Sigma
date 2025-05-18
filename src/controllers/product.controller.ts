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
}

export default ProductController;
