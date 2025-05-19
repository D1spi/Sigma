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

  /**
   * Remove a product from the user's cart
   * @param userId ID of the user
   * @param productId ID of the product to remove
   * @returns The updated cart
   */
  async removeProductFromCart(userId: string, productId: string): Promise<ICart> {
    try {
      logger.info(`CartService: Removing product ${productId} from cart for user ${userId}`);

      // Check if the cart and product exist
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new ApplicationError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Verify that the product exists in the cart
      const productInCart = cart.items.some((item) => {
        const itemProductId =
          typeof item.product === 'string'
            ? item.product
            : (item.product as any).id || (item.product as any)._id?.toString();
        return itemProductId === productId;
      });

      if (!productInCart) {
        logger.error(`Product ${productId} not found in cart for user ${userId}`);
        throw new ApplicationError('Product not found in cart', httpStatus.NOT_FOUND);
      }

      // Remove the product from the cart
      const updatedCart = await this.cartRepository.removeProductFromCart(userId, productId);

      if (!updatedCart) {
        logger.error(`Failed to update cart for user ${userId}`);
        throw new ApplicationError('Failed to update cart', httpStatus.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Successfully removed product ${productId} from cart for user ${userId}`);
      return updatedCart;
    } catch (error) {
      logger.error(`Error removing product ${productId} from cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update the quantity of a product in the user's cart
   * @param userId ID of the user
   * @param productId ID of the product to update
   * @param quantity New quantity for the product
   * @returns The updated cart
   */
  async updateProductQuantity(userId: string, productId: string, quantity: number): Promise<ICart> {
    try {
      logger.info(`CartService: Updating quantity of product ${productId} to ${quantity} for user ${userId}`);

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

      // Check if the cart and product exist
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new ApplicationError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Verify that the product exists in the cart
      const productInCart = cart.items.some((item) => {
        const itemProductId =
          typeof item.product === 'string'
            ? item.product
            : (item.product as any).id || (item.product as any)._id?.toString();
        return itemProductId === productId;
      });

      if (!productInCart) {
        logger.error(`Product ${productId} not found in cart for user ${userId}`);
        throw new ApplicationError('Product not found in cart', httpStatus.NOT_FOUND);
      }

      // Update the quantity
      const updatedCart = await this.cartRepository.updateProductQuantity(userId, productId, quantity);

      if (!updatedCart) {
        logger.error(`Failed to update cart for user ${userId}`);
        throw new ApplicationError('Failed to update cart', httpStatus.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Successfully updated quantity of product ${productId} to ${quantity} for user ${userId}`);
      return updatedCart;
    } catch (error) {
      logger.error(`Error updating quantity for product ${productId} in cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update the selected status of a product in the user's cart
   * @param userId ID of the user
   * @param productId ID of the product to update
   * @param selected New selected status for the product
   * @returns The updated cart
   */
  async updateProductSelectedStatus(userId: string, productId: string, selected: boolean): Promise<ICart> {
    try {
      logger.info(`CartService: Updating selected status of product ${productId} to ${selected} for user ${userId}`);

      // Check if the cart and product exist
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new ApplicationError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Verify that the product exists in the cart
      const productInCart = cart.items.some((item) => {
        const itemProductId =
          typeof item.product === 'string'
            ? item.product
            : (item.product as any).id || (item.product as any)._id?.toString();
        return itemProductId === productId;
      });

      if (!productInCart) {
        logger.error(`Product ${productId} not found in cart for user ${userId}`);
        throw new ApplicationError('Product not found in cart', httpStatus.NOT_FOUND);
      }

      // Update the product selected status
      const updatedCart = await this.cartRepository.updateProductSelectedStatus(userId, productId, selected);

      if (!updatedCart) {
        logger.error(`Failed to update cart for user ${userId}`);
        throw new ApplicationError('Failed to update cart', httpStatus.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Successfully updated selected status of product ${productId} to ${selected} for user ${userId}`);
      return updatedCart;
    } catch (error) {
      logger.error(`Error updating selected status for product ${productId} in cart for user ${userId}:`, error);
      throw error;
    }
  }
}

export default CartService;
