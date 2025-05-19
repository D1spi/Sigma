// filepath: src\repositories\order.repository.ts
// Repository for order-related database operations
// Extends the BaseRepository to include order-specific operations

import { BaseRepository } from './base.repository';
import { OrderModel, IOrder, IOrderModel } from '../models/order.model';
import logger from '../config/logger';
import mongoose from 'mongoose';

export class OrderRepository extends BaseRepository<IOrderModel> {
  constructor() {
    super(OrderModel);
  }

  /**
   * Create a new order
   * @param orderData Order data
   * @returns The newly created order
   */
  async createOrder(orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> {
    try {
      logger.debug(`Creating new order for user: ${orderData.user}`);
      const order = await OrderModel.create(orderData);

      logger.info(`Created new order for user ${orderData.user}`);

      const { _id, ...rest } = order.toObject();
      return { id: _id.toString(), ...rest } as unknown as IOrder;
    } catch (error) {
      logger.error(`Error creating order for user ${orderData.user}:`, error);
      throw error;
    }
  }

  /**
   * Find orders by user ID
   * @param userId ID of the user whose orders to find
   * @returns The user's orders
   */
  async findByUserId(userId: string): Promise<IOrder[]> {
    try {
      logger.debug(`Finding orders for user: ${userId}`);
      const orders = await OrderModel.find({ user: userId }).populate('items.product').lean();

      if (!orders.length) {
        logger.info(`No orders found for user: ${userId}`);
        return [];
      }

      return orders.map((order) => {
        const { _id, ...rest } = order;
        return {
          id: _id.toString(),
          ...rest,
          items: order.items.map((item) => {
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
        } as unknown as IOrder;
      });
    } catch (error) {
      logger.error(`Error finding orders for user ${userId}:`, error);
      throw error;
    }
  }
}

export default OrderRepository;
