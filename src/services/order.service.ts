// filepath: src\services\order.service.ts
// Service layer for order-related operations
// Contains business logic for managing orders

import { IOrder } from '../models/order.model';
import OrderRepository from '../repositories/order.repository';
import CartRepository from '../repositories/cart.repository';
import { UserRepository } from '../repositories/user.repository';
import logger from '../config/logger';
import { ApplicationError } from '../utils/application.error';
import { httpStatus } from '../config/httpStatusCodes';
import { ICart } from '../models/cart.model';
import { IUser } from '../interfaces/user.interface';
import mongoose from 'mongoose';

export class OrderService {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;
  private userRepository: UserRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Confirm the purchase of selected products in the user's cart
   * @param userId ID of the user making the purchase
   * @returns The created order
   */
  async confirmPurchase(userId: string): Promise<IOrder> {
    try {
      logger.info(`OrderService: Confirming purchase for user: ${userId}`);

      // Get the user's cart
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart || !cart.items || cart.items.length === 0) {
        logger.error(`No cart or empty cart found for user ${userId}`);
        throw new ApplicationError('No items in cart to purchase', httpStatus.BAD_REQUEST);
      } // Get the selected items from the cart
      const selectedItems = cart.items.filter((item) => item.selected);

      if (selectedItems.length === 0) {
        logger.error(`No selected items found in cart for user ${userId}`);
        throw new ApplicationError('No selected items to purchase', httpStatus.BAD_REQUEST);
      }

      // Get user information for the order
      const user = (await this.userRepository.getById(userId, {})) as IUser;

      if (!user) {
        logger.error(`User with ID ${userId} not found`);
        throw new ApplicationError(`User not found`, httpStatus.NOT_FOUND);
      }

      if (!user.name || !user.lastname || !user.address) {
        logger.error(`User ${userId} is missing required information for order (name, lastname, or address)`);
        throw new ApplicationError(
          'Missing user information (name, lastname, or address) required for order',
          httpStatus.BAD_REQUEST,
        );
      } // Calculate the total price of the order
      let totalPrice = 0;
      const orderItems = selectedItems.map((item) => {
        const product = item.product as unknown as {
          id?: string;
          _id?: string | mongoose.Types.ObjectId;
          name: string;
          price: number;
        };
        const itemPrice = product.price * item.quantity;
        totalPrice += itemPrice;

        return {
          product: new mongoose.Types.ObjectId(product.id || product._id?.toString() || ''),
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });

      // Create the order
      const orderData = {
        user: userId,
        userName: user.name,
        userLastName: user.lastname,
        userAddress: user.address || '',
        items: orderItems,
        totalPrice,
        orderDate: new Date(),
      };

      const order = await this.orderRepository.createOrder(orderData);

      // Remove the selected items from the cart
      await this.removeSelectedItemsFromCart(cart, userId);

      logger.info(`Successfully created order with ID ${order.id} for user ${userId}`);
      return order;
    } catch (error) {
      logger.error(`Error confirming purchase for user ${userId}:`, error);
      throw error;
    }
  } /**
   * Remove selected items from user's cart
   * @param cart User's cart
   * @param userId User ID
   */
  private async removeSelectedItemsFromCart(cart: ICart, userId: string): Promise<void> {
    try {
      logger.debug(`Removing selected items from cart for user ${userId}`);

      // Filter the cart to keep only unselected items
      const remainingItems = cart.items.filter((item) => !item.selected);

      // Use CartModel directly to update the cart (imported at the top)
      // We'll need to import it first
      const CartModel = (await import('../models/cart.model')).CartModel;

      const updatedCart = await CartModel.findOneAndUpdate({ user: userId }, { items: remainingItems }, { new: true });

      if (!updatedCart) {
        logger.warn(`Could not update cart after purchase for user ${userId}`);
      } else {
        logger.info(`Successfully removed selected items from cart for user ${userId}`);
      }
    } catch (error) {
      logger.error(`Error removing selected items from cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get orders for a user
   * @param userId ID of the user
   * @returns The user's orders
   */
  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    try {
      logger.info(`OrderService: Getting orders for user: ${userId}`);
      return await this.orderRepository.findByUserId(userId);
    } catch (error) {
      logger.error(`Error getting orders for user ${userId}:`, error);
      throw error;
    }
  }
}

export default OrderService;
