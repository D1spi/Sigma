// filepath: src\repositories\cart.repository.ts
// Repository for cart-related database operations
// Extends the BaseRepository to include cart-specific operations

import { BaseRepository } from './base.repository';
import { CartModel, ICart, ICartModel } from '../models/cart.model';
import logger from '../config/logger';
import mongoose from 'mongoose';

export class CartRepository extends BaseRepository<ICartModel> {
  constructor() {
    super(CartModel);
  }

  /**
   * Find a cart by user ID
   * @param userId ID of the user whose cart to find
   * @returns The user's cart or null if not found
   */
  async findByUserId(userId: string): Promise<ICart | null> {
    try {
      logger.debug(`Finding cart for user: ${userId}`);
      const cart = await CartModel.findOne({ user: userId }).populate('items.product').lean();

      if (!cart) {
        logger.info(`No cart found for user: ${userId}`);
        return null;
      }

      // Transform _id to id for consistent API responses
      const { _id, ...rest } = cart;
      return {
        id: _id.toString(),
        ...rest,
        items: cart.items.map((item) => {
          const product = item.product as any;
          if (product && product._id) {
            return {
              ...item,
              product: {
                id: product._id.toString(),
                ...(product as any),
                _id: undefined,
              },
            };
          }
          return item;
        }),
      } as unknown as ICart;
    } catch (error) {
      logger.error(`Error finding cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new cart for a user
   * @param userId ID of the user to create the cart for
   * @returns The newly created cart
   */
  async createCart(userId: string): Promise<ICart> {
    try {
      logger.debug(`Creating new cart for user: ${userId}`);
      const cart = await CartModel.create({
        user: userId,
        items: [],
      });

      logger.info(`Created new cart for user ${userId}`);

      const { _id, ...rest } = cart.toObject();
      return { id: _id.toString(), ...rest } as unknown as ICart;
    } catch (error) {
      logger.error(`Error creating cart for user ${userId}:`, error);
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
  async addProductToCart(userId: string, productId: string, quantity: number = 1): Promise<ICart | null> {
    try {
      logger.debug(`Adding product ${productId} to cart for user ${userId}`);

      // First try to find the cart and update an existing item
      const existingCart = await CartModel.findOne({ user: userId });

      if (!existingCart) {
        logger.info(`No cart found for user ${userId}, will create a new one`);

        // Create a new cart with the product
        const newCart = await CartModel.create({
          user: userId,
          items: [
            {
              product: productId,
              quantity,
              selected: true,
            },
          ],
        });

        logger.info(`Created new cart for user ${userId} with product ${productId}`);
        const populatedCart = await newCart.populate('items.product');

        const { _id, ...rest } = populatedCart.toObject();
        return { id: _id.toString(), ...rest } as unknown as ICart;
      }

      // Check if the product is already in the cart
      const existingItemIndex = existingCart.items.findIndex((item) => item.product.toString() === productId);

      if (existingItemIndex > -1) {
        // If the product is already in the cart, increase the quantity
        logger.debug(`Product ${productId} already in cart, increasing quantity by ${quantity}`);
        existingCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Otherwise, add a new item
        logger.debug(`Adding new product ${productId} to cart`);
        existingCart.items.push({
          product: new mongoose.Types.ObjectId(productId),
          quantity,
          selected: true,
        });
      }

      // Save the cart
      await existingCart.save();
      logger.info(`Updated cart for user ${userId} with product ${productId}`);

      // Retrieve the populated cart to return complete product details
      const updatedCart = await CartModel.findOne({ user: userId }).populate('items.product').lean();

      if (!updatedCart) {
        logger.error(`Could not find updated cart for user ${userId} after saving`);
        return null;
      }

      // Transform _id to id for consistent API responses
      const { _id, ...rest } = updatedCart;
      return {
        id: _id.toString(),
        ...rest,
        items: updatedCart.items.map((item) => {
          const product = item.product as any;
          if (product && product._id) {
            return {
              ...item,
              product: {
                id: product._id.toString(),
                ...(product as any),
                _id: undefined,
              },
            };
          }
          return item;
        }),
      } as unknown as ICart;
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
  async removeProductFromCart(userId: string, productId: string): Promise<ICart | null> {
    try {
      logger.debug(`Removing product ${productId} from cart for user ${userId}`);

      // Find the cart for the user
      const cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        logger.warn(`No cart found for user ${userId}`);
        return null;
      }

      // Check if the product is in the cart
      const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

      if (existingItemIndex === -1) {
        logger.warn(`Product ${productId} not found in cart for user ${userId}`);
        return null;
      }

      // Remove the product from the cart
      cart.items.splice(existingItemIndex, 1);

      // Save the updated cart
      await cart.save();
      logger.info(`Removed product ${productId} from cart for user ${userId}`);

      // Retrieve the populated cart to return complete product details
      const updatedCart = await CartModel.findOne({ user: userId }).populate('items.product').lean();

      if (!updatedCart) {
        logger.error(`Could not find updated cart for user ${userId} after saving`);
        return null;
      }

      // Transform _id to id for consistent API responses
      const { _id, ...rest } = updatedCart;
      return {
        id: _id.toString(),
        ...rest,
        items: updatedCart.items.map((item) => {
          const product = item.product as any;
          if (product && product._id) {
            return {
              ...item,
              product: {
                id: product._id.toString(),
                ...(product as any),
                _id: undefined,
              },
            };
          }
          return item;
        }),
      } as unknown as ICart;
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
  async updateProductQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    try {
      logger.debug(`Updating quantity of product ${productId} to ${quantity} for user ${userId}`);

      // Find the cart for the user
      const cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        logger.warn(`No cart found for user ${userId}`);
        return null;
      }

      // Check if the product is in the cart
      const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

      if (existingItemIndex === -1) {
        logger.warn(`Product ${productId} not found in cart for user ${userId}`);
        return null;
      }

      // Update the quantity
      cart.items[existingItemIndex].quantity = quantity;

      // Save the updated cart
      await cart.save();
      logger.info(`Updated quantity of product ${productId} to ${quantity} for user ${userId}`);

      // Retrieve the populated cart to return complete product details
      const updatedCart = await CartModel.findOne({ user: userId }).populate('items.product').lean();

      if (!updatedCart) {
        logger.error(`Could not find updated cart for user ${userId} after saving`);
        return null;
      }

      // Transform _id to id for consistent API responses
      const { _id, ...rest } = updatedCart;
      return {
        id: _id.toString(),
        ...rest,
        items: updatedCart.items.map((item) => {
          const product = item.product as any;
          if (product && product._id) {
            return {
              ...item,
              product: {
                id: product._id.toString(),
                ...(product as any),
                _id: undefined,
              },
            };
          }
          return item;
        }),
      } as unknown as ICart;
    } catch (error) {
      logger.error(`Error updating quantity for product ${productId} in cart for user ${userId}:`, error);
      throw error;
    }
  }
}

export default CartRepository;
