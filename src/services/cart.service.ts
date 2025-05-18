// filepath: src\services\cart.service.ts
// Service layer for cart-related operations
// Contains business logic for managing shopping carts

import { ICart } from '../models/cart.model';
import CartRepository from '../repositories/cart.repository';
import ProductRepository from '../repositories/product.repository';
import logger from '../config/logger';
import { ApplicationError } from '../utils/application.error';
import { httpStatus } from '../config/httpStatusCodes';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Get a user's cart, or create one if it doesn't exist
   * @param userId ID of the user
   * @returns The user's cart
   */
  async getOrCreateCart(userId: string): Promise<ICart> {
    try {
      logger.info(`CartService: Getting or creating cart for user: ${userId}`);
      
      // Try to find an existing cart
      const existingCart = await this.cartRepository.findByUserId(userId);
      
      if (existingCart) {
        logger.info(`Found existing cart for user: ${userId}`);
        return existingCart;
      }
      
      // If no cart exists, create a new one
      logger.info(`No cart found for user: ${userId}, creating a new one`);
      return await this.cartRepository.createCart(userId);
    } catch (error) {
      logger.error(`Error getting or creating cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add a product to the user's cart
   * @param userId ID of the user
   * @param productId ID of the product to add
   * @param quantity Quantity to add (default: 1)
   * @returns The updated cart
   */
  async addProductToCart(userId: string, productId: string, quantity: number = 1): Promise<ICart> {
    try {
      logger.info(`CartService: Adding product ${productId} to cart for user ${userId}`);

      // Verify that the product exists
      const product = await this.productRepository.findById(productId);

      if (!product) {
        logger.error(`Product with ID ${productId} not found`);
        throw new ApplicationError(`Product with ID ${productId} not found`, httpStatus.NOT_FOUND);
      }

      // Check that the quantity is valid
      if (quantity <= 0) {
        logger.error(`Invalid quantity: ${quantity}. Quantity must be greater than 0.`);
        throw new ApplicationError('Quantity must be greater than 0', httpStatus.BAD_REQUEST);
      }

      // Check if the product has enough stock
      if (product.stockQuantity < quantity) {
        logger.error(
          `Not enough stock for product ${productId}. Requested: ${quantity}, Available: ${product.stockQuantity}`,
        );
        throw new ApplicationError(
          `Not enough stock available. Only ${product.stockQuantity} units available.`,
          httpStatus.BAD_REQUEST,
        );
      }

      // Add the product to the cart
      const updatedCart = await this.cartRepository.addProductToCart(userId, productId, quantity);

      if (!updatedCart) {
        logger.error(`Failed to update cart for user ${userId}`);
        throw new ApplicationError('Failed to update cart', httpStatus.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Successfully added product ${productId} to cart for user ${userId}`);
      return updatedCart;
    } catch (error) {
      logger.error(`Error adding product ${productId} to cart for user ${userId}:`, error);
      throw error;
    }
  }
}

export default CartService;
